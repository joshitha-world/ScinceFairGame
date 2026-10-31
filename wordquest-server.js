// Word Quest accounts: passkey (WebAuthn) sign-in and progress storage, with no dependencies.
//
// Learners sign in with a passkey (fingerprint, face or screen lock), so there is no password
// to remember or leak. Each learner also gets a one-time backup code for a new device.
// Everything is kept in data/wordquest.json (mount data/ as a volume so it survives rebuilds).
//
// Routes (all JSON, under /api/wq):
//   POST register/options, register/verify   create a learner with a passkey
//   POST login/options, login/verify         sign in with a passkey
//   POST recover                             sign in with a backup code
//   GET  me   PUT me                         read / save profile and progress   (signed in)
//   POST passkey/options, passkey/verify     add a passkey on another device     (signed in)
//   POST backup-code                         make a new backup code              (signed in)
//   POST logout, POST delete                                                     (signed in)

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { mergeProgress, mergeProfile, cleanProfile, cleanProgress } = require('./js/wordquest-merge.js');

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'wordquest.json');
const SESSION_DAYS = 120;
const CHALLENGE_MS = 5 * 60 * 1000;
const MAX_BODY = 512 * 1024;
const ALGS = { '-7': 'ES256', '-8': 'EdDSA', '-257': 'RS256' };

const b64u = (buf) => Buffer.from(buf).toString('base64url');
const fromB64u = (s) => Buffer.from(String(s || ''), 'base64url');
const sha256 = (data) => crypto.createHash('sha256').update(data).digest();
const hashToken = (t) => sha256(String(t)).toString('hex');

// ---------------------------------------------------------------------------
// Storage: one JSON file, written atomically (temp file + rename)
// ---------------------------------------------------------------------------
let db = { learners: {}, sessions: {} };
try {
  if (fs.existsSync(DB_FILE)) db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  db.learners = db.learners || {};
  db.sessions = db.sessions || {};
} catch (err) {
  console.error('[WordQuest] Could not read database, starting empty:', err.message);
}

function save() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db), 'utf-8');
  fs.renameSync(tmp, DB_FILE);
}

const challenges = new Map();
function newChallenge(data) {
  const now = Date.now();
  for (const [id, c] of challenges) if (c.exp < now) challenges.delete(id);
  const id = b64u(crypto.randomBytes(16));
  const challenge = b64u(crypto.randomBytes(32));
  challenges.set(id, { ...data, challenge, exp: now + CHALLENGE_MS });
  return { challengeId: id, challenge };
}
function takeChallenge(id, type) {
  const c = challenges.get(id);
  challenges.delete(id);
  if (!c || c.type !== type || c.exp < Date.now()) throw httpError(400, 'This sign-in request expired. Please try again.');
  return c;
}

function newSession(learnerId) {
  const token = b64u(crypto.randomBytes(32));
  const now = Date.now();
  Object.keys(db.sessions).forEach(k => { if (db.sessions[k].exp < now) delete db.sessions[k]; });
  db.sessions[hashToken(token)] = { uid: learnerId, exp: now + SESSION_DAYS * 864e5 };
  return token;
}

// Backup codes look like WQ-7KQ4-M2PX-9RTA (no 0/O/1/I to avoid mix-ups)
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function newBackupCode() {
  const bytes = crypto.randomBytes(12);
  const chars = Array.from(bytes, b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');
  return `WQ-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}
const normalizeCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^WQ/, '');
const hashCode = (c) => sha256(`wq-backup:${normalizeCode(c)}`).toString('hex');

function publicLearner(l) {
  return {
    id: l.id,
    profile: l.profile,
    progress: l.progress,
    passkeys: l.credentials.length,
    createdAt: l.createdAt
  };
}

// ---------------------------------------------------------------------------
// WebAuthn checks
// ---------------------------------------------------------------------------
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// The relying party is the site's own host name (works for localhost and the real domain)
function rpIdFor(req) {
  if (process.env.WQ_RP_ID) return process.env.WQ_RP_ID;
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost').split(',')[0].trim();
  return host.replace(/^\[|\](:\d+)?$/g, '').replace(/:\d+$/, '').toLowerCase();
}

function checkClientData(b64, type, challenge, rpId) {
  let data;
  try {
    data = JSON.parse(fromB64u(b64).toString('utf-8'));
  } catch (e) {
    throw httpError(400, 'Bad passkey response.');
  }
  if (data.type !== type) throw httpError(400, 'Wrong passkey response type.');
  if (data.challenge !== challenge) throw httpError(400, 'Passkey challenge did not match.');
  let origin;
  try { origin = new URL(data.origin); } catch (e) { throw httpError(400, 'Bad origin.'); }
  const host = origin.hostname.toLowerCase();
  const secure = origin.protocol === 'https:' || host === 'localhost' || host === '127.0.0.1';
  if (!secure || (host !== rpId && !host.endsWith(`.${rpId}`))) throw httpError(400, 'Passkey came from a different website.');
}

// authenticatorData: rpIdHash(32) | flags(1) | signCount(4) | ...
function checkAuthData(authData, rpId) {
  if (authData.length < 37) throw httpError(400, 'Bad authenticator data.');
  if (!authData.subarray(0, 32).equals(sha256(rpId))) throw httpError(400, 'Passkey is for a different website.');
  if (!(authData[32] & 0x01)) throw httpError(400, 'Please touch your device to confirm.');
  return authData.readUInt32BE(33);
}

function verifySignature(cred, authData, clientDataB64, signature) {
  const key = crypto.createPublicKey({ key: fromB64u(cred.publicKey), format: 'der', type: 'spki' });
  const signed = Buffer.concat([authData, sha256(fromB64u(clientDataB64))]);
  const hash = cred.alg === -8 ? null : 'sha256';
  return crypto.verify(hash, signed, key, signature);
}

function credentialFromRegistration(body, challenge, rpId) {
  const c = body.credential || {};
  checkClientData(c.clientDataJSON, 'webauthn.create', challenge, rpId);
  const counter = checkAuthData(fromB64u(c.authenticatorData), rpId);
  const alg = Number(c.alg);
  if (!ALGS[String(alg)] || !c.publicKey || !c.id) throw httpError(400, 'This device made an unsupported passkey.');
  try {
    crypto.createPublicKey({ key: fromB64u(c.publicKey), format: 'der', type: 'spki' });
  } catch (e) {
    throw httpError(400, 'Could not read the passkey.');
  }
  return {
    id: String(c.id).slice(0, 512),
    publicKey: String(c.publicKey),
    alg,
    counter,
    transports: Array.isArray(c.transports) ? c.transports.slice(0, 6).map(String) : [],
    createdAt: Date.now()
  };
}

function findCredential(credId) {
  for (const l of Object.values(db.learners)) {
    const cred = l.credentials.find(c => c.id === credId);
    if (cred) return { learner: l, cred };
  }
  return null;
}

// Simple brute-force guard for backup codes: 10 tries per IP per 15 minutes
const recoverTries = new Map();
function allowRecover(ip) {
  const now = Date.now();
  const entry = recoverTries.get(ip) || { n: 0, reset: now + 15 * 60 * 1000 };
  if (entry.reset < now) { entry.n = 0; entry.reset = now + 15 * 60 * 1000; }
  entry.n++;
  recoverTries.set(ip, entry);
  return entry.n <= 10;
}

// ---------------------------------------------------------------------------
// HTTP plumbing
// ---------------------------------------------------------------------------
function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > MAX_BODY) { reject(httpError(413, 'Too much data.')); req.destroy(); }
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(httpError(400, 'Bad JSON.')); }
    });
    req.on('error', reject);
  });
}

function send(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

function signedInLearner(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  const session = m && db.sessions[hashToken(m[1])];
  if (!session || session.exp < Date.now()) throw httpError(401, 'Please sign in again.');
  const learner = db.learners[session.uid];
  if (!learner) throw httpError(401, 'Please sign in again.');
  return { learner, tokenHash: hashToken(m[1]) };
}

const routes = {
  'POST register/options': async (req, body) => {
    const name = cleanProfile({ name: body.name }).name;
    const userId = b64u(crypto.randomBytes(16));
    const rpId = rpIdFor(req);
    const { challengeId, challenge } = newChallenge({ type: 'create', userId, rpId });
    return { challengeId, challenge, rp: { id: rpId, name: 'Word Quest' }, user: { id: userId, name: `${name} (Word Quest)`, displayName: name } };
  },

  'POST register/verify': async (req, body) => {
    const ch = takeChallenge(body.challengeId, 'create');
    const cred = credentialFromRegistration(body, ch.challenge, ch.rpId);
    if (findCredential(cred.id)) throw httpError(409, 'This passkey is already saved.');
    const backupCode = newBackupCode();
    const now = Date.now();
    const learner = {
      id: ch.userId,
      profile: cleanProfile({ ...body.profile, updatedAt: now }),
      progress: cleanProgress(body.progress),
      credentials: [cred],
      backup: hashCode(backupCode),
      createdAt: now
    };
    db.learners[learner.id] = learner;
    const token = newSession(learner.id);
    save();
    return { token, backupCode, learner: publicLearner(learner) };
  },

  'POST login/options': async (req) => {
    const rpId = rpIdFor(req);
    const { challengeId, challenge } = newChallenge({ type: 'get', rpId });
    return { challengeId, challenge, rpId };
  },

  'POST login/verify': async (req, body) => {
    const ch = takeChallenge(body.challengeId, 'get');
    const found = findCredential(String(body.id || ''));
    if (!found) throw httpError(404, 'This passkey is not linked to a Word Quest learner. It may have been deleted.');
    const { learner, cred } = found;
    if (body.userHandle && body.userHandle !== learner.id) throw httpError(400, 'Passkey does not match this learner.');
    checkClientData(body.clientDataJSON, 'webauthn.get', ch.challenge, ch.rpId);
    const authData = fromB64u(body.authenticatorData);
    const counter = checkAuthData(authData, ch.rpId);
    if (!verifySignature(cred, authData, body.clientDataJSON, fromB64u(body.signature))) {
      throw httpError(401, 'Passkey check failed.');
    }
    // Synced passkeys report 0; a counter going backwards means a cloned authenticator
    if (counter && cred.counter && counter <= cred.counter) throw httpError(401, 'Passkey check failed.');
    cred.counter = counter;
    cred.lastUsed = Date.now();
    const token = newSession(learner.id);
    save();
    return { token, learner: publicLearner(learner) };
  },

  'POST recover': async (req, body) => {
    const ip = req.socket.remoteAddress || 'unknown';
    if (!allowRecover(ip)) throw httpError(429, 'Too many tries. Please wait 15 minutes.');
    const hash = hashCode(body.code);
    const learner = normalizeCode(body.code).length === 12 && Object.values(db.learners).find(l => l.backup === hash);
    if (!learner) throw httpError(404, 'That backup code is not right. Check the letters and try again.');
    const token = newSession(learner.id);
    save();
    return { token, learner: publicLearner(learner) };
  },

  'GET me': async (req) => ({ learner: publicLearner(signedInLearner(req).learner) }),

  'PUT me': async (req, body) => {
    const { learner } = signedInLearner(req);
    if (body.profile) learner.profile = mergeProfile(learner.profile, body.profile);
    if (body.progress) learner.progress = mergeProgress(learner.progress, body.progress);
    save();
    return { learner: publicLearner(learner) };
  },

  'POST passkey/options': async (req) => {
    const { learner } = signedInLearner(req);
    const rpId = rpIdFor(req);
    const { challengeId, challenge } = newChallenge({ type: 'add', userId: learner.id, rpId });
    return {
      challengeId, challenge,
      rp: { id: rpId, name: 'Word Quest' },
      user: { id: learner.id, name: `${learner.profile.name} (Word Quest)`, displayName: learner.profile.name },
      exclude: learner.credentials.map(c => ({ id: c.id, transports: c.transports }))
    };
  },

  'POST passkey/verify': async (req, body) => {
    const { learner } = signedInLearner(req);
    const ch = takeChallenge(body.challengeId, 'add');
    if (ch.userId !== learner.id) throw httpError(400, 'Wrong learner.');
    const cred = credentialFromRegistration(body, ch.challenge, ch.rpId);
    if (findCredential(cred.id)) throw httpError(409, 'This passkey is already saved.');
    learner.credentials.push(cred);
    save();
    return { learner: publicLearner(learner) };
  },

  'POST backup-code': async (req) => {
    const { learner } = signedInLearner(req);
    const backupCode = newBackupCode();
    learner.backup = hashCode(backupCode);
    save();
    return { backupCode };
  },

  'POST logout': async (req) => {
    const { tokenHash } = signedInLearner(req);
    delete db.sessions[tokenHash];
    save();
    return { ok: true };
  },

  'POST delete': async (req) => {
    const { learner } = signedInLearner(req);
    delete db.learners[learner.id];
    Object.keys(db.sessions).forEach(k => { if (db.sessions[k].uid === learner.id) delete db.sessions[k]; });
    save();
    return { ok: true };
  }
};

// Returns true when the request was a Word Quest API call (and has been answered)
function handleWordQuest(req, res) {
  const url = req.url.split('?')[0];
  if (!url.startsWith('/api/wq/')) return false;
  const route = routes[`${req.method} ${url.slice('/api/wq/'.length)}`];
  if (!route) {
    send(res, 404, { error: 'Not found' });
    return true;
  }
  (async () => {
    const body = req.method === 'GET' ? {} : await readJson(req);
    return route(req, body);
  })().then(
    result => send(res, 200, result),
    err => {
      if (!err.status) console.error('[WordQuest]', err);
      send(res, err.status || 500, { error: err.status ? err.message : 'Something went wrong on the server.' });
    }
  );
  return true;
}

module.exports = { handleWordQuest };
