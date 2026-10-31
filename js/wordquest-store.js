// Word Quest storage: learners on this device, passkey accounts and server sync.
//
// Every learner's profile and progress are kept on the device first, so Word Quest works fully
// offline. Learners saved with a passkey also sync to the server (data/wordquest.json), which
// keeps their words and stickers safe and lets them carry on from any device.

const WQ_API = 'api/wq/';

const wqB64uToBuf = (s) => {
  s = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
};
const wqBufToB64u = (buf) => {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

class WQApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status; // 0 = server not reachable
  }
}

async function wqApi(path, { method = 'POST', body, token } = {}) {
  let res;
  try {
    res = await fetch(WQ_API + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (e) {
    throw new WQApiError('offline', 0);
  }
  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new WQApiError('offline', 0); // static hosting without the Node server
  }
  if (data && data.offline) throw new WQApiError('offline', 0); // service worker's offline reply
  if (!res.ok) throw new WQApiError(data.error || 'Something went wrong.', res.status);
  return data;
}

// Passkeys: the device's fingerprint / face / screen lock signs in, no password needed
const WQPasskey = {
  supported() {
    return Boolean(window.isSecureContext && window.PublicKeyCredential && navigator.credentials
      && window.AuthenticatorAttestationResponse && AuthenticatorAttestationResponse.prototype.getPublicKey);
  },

  friendlyError(err) {
    if (err instanceof WQApiError) {
      return err.status === 0 ? 'Can\'t reach the Word Quest server right now. Check the internet and try again.' : err.message;
    }
    if (err && err.name === 'NotAllowedError') return 'Passkey was cancelled or timed out.';
    if (err && err.name === 'InvalidStateError') return 'This device already has a passkey for this learner.';
    return 'The passkey didn\'t work on this device. Please try again.';
  },

  async create(opts) {
    const cred = await navigator.credentials.create({
      publicKey: {
        challenge: wqB64uToBuf(opts.challenge),
        rp: opts.rp,
        user: { id: wqB64uToBuf(opts.user.id), name: opts.user.name, displayName: opts.user.displayName },
        pubKeyCredParams: [-7, -8, -257].map(alg => ({ type: 'public-key', alg })),
        authenticatorSelection: { residentKey: 'required', requireResidentKey: true, userVerification: 'preferred' },
        excludeCredentials: (opts.exclude || []).map(c => ({ type: 'public-key', id: wqB64uToBuf(c.id), transports: c.transports })),
        attestation: 'none',
        timeout: 120000
      }
    });
    const r = cred.response;
    return {
      id: cred.id,
      clientDataJSON: wqBufToB64u(r.clientDataJSON),
      authenticatorData: wqBufToB64u(r.getAuthenticatorData()),
      publicKey: wqBufToB64u(r.getPublicKey()),
      alg: r.getPublicKeyAlgorithm(),
      transports: r.getTransports ? r.getTransports() : []
    };
  },

  async get(opts) {
    const cred = await navigator.credentials.get({
      publicKey: { challenge: wqB64uToBuf(opts.challenge), rpId: opts.rpId, userVerification: 'preferred', timeout: 120000 }
    });
    const r = cred.response;
    return {
      id: cred.id,
      clientDataJSON: wqBufToB64u(r.clientDataJSON),
      authenticatorData: wqBufToB64u(r.authenticatorData),
      signature: wqBufToB64u(r.signature),
      userHandle: r.userHandle ? wqBufToB64u(r.userHandle) : null
    };
  }
};

const wqEmptyProgress = () => ({ days: {}, quizzes: {}, stickers: {}, robo: { lessons: {}, tests: {} } });

class WQStore {
  constructor(onChange) {
    // Word Quest and Robo Academy share learners; each screen adds a listener
    this.listeners = onChange ? [onChange] : [];
    this.onChange = () => this.listeners.forEach(fn => fn());
    this.entries = this.read('wq_learners', []);
    if (!Array.isArray(this.entries)) this.entries = [];
    this.currentKey = localStorage.getItem('wq_current');
    if (!this.entry(this.currentKey)) this.currentKey = null;
    this.data = this.currentKey ? this.loadData(this.currentKey) : null;
    this.status = 'local'; // local | saving | synced | offline | signin
    this.syncTimer = null;
    window.addEventListener('online', () => this.sync());
  }

  read(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }

  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('[WordQuest] Could not save on this device:', e);
    }
  }

  entry(key) {
    return this.entries.find(e => e.key === key) || null;
  }

  get current() {
    return this.entry(this.currentKey);
  }

  get profile() {
    return this.data && this.data.profile;
  }

  get progress() {
    return this.data && this.data.progress;
  }

  loadData(key) {
    const d = this.read(`wq_data_${key}`, null) || {};
    return {
      profile: WQMerge.cleanProfile(d.profile),
      progress: WQMerge.cleanProgress(d.progress || wqEmptyProgress()),
      dirty: Boolean(d.dirty)
    };
  }

  saveEntries() {
    this.write('wq_learners', this.entries);
  }

  persist() {
    if (!this.currentKey || !this.data) return;
    this.write(`wq_data_${this.currentKey}`, this.data);
    const e = this.current;
    if (e) {
      e.name = this.data.profile.name;
      e.avatar = this.data.profile.avatar;
      this.saveEntries();
    }
  }

  select(key) {
    if (!this.entry(key)) return;
    this.currentKey = key;
    localStorage.setItem('wq_current', key);
    this.data = this.loadData(key);
    this.status = this.current.kind === 'account' ? 'saving' : 'local';
    this.onChange();
    this.refresh();
  }

  deselect() {
    this.currentKey = null;
    this.data = null;
    localStorage.removeItem('wq_current');
  }

  newKey() {
    return `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  createGuest(profile) {
    const key = this.newKey();
    this.entries.push({ key, kind: 'guest', name: profile.name, avatar: profile.avatar });
    this.saveEntries();
    this.write(`wq_data_${key}`, { profile: WQMerge.cleanProfile(profile), progress: wqEmptyProgress(), dirty: false });
    this.select(key);
    return key;
  }

  // After a passkey sign-up / sign-in: remember the account on this device (or update it)
  addAccount({ token, learner }, convertKey) {
    let e = this.entries.find(x => x.kind === 'account' && x.id === learner.id) || (convertKey && this.entry(convertKey));
    if (!e) {
      e = { key: this.newKey() };
      this.entries.push(e);
    }
    Object.assign(e, { kind: 'account', id: learner.id, token, name: learner.profile.name, avatar: learner.profile.avatar, passkeys: learner.passkeys });
    this.saveEntries();
    const local = e.key === this.currentKey && this.data ? this.data : this.loadData(e.key);
    this.write(`wq_data_${e.key}`, {
      profile: WQMerge.mergeProfile(local.profile, learner.profile),
      progress: WQMerge.mergeProgress(local.progress, learner.progress),
      dirty: true
    });
    this.select(e.key);
    return e.key;
  }

  // Change the current learner's profile/progress; mutator edits {profile, progress} in place
  update(mutator, { profileChanged = false } = {}) {
    if (!this.data) return;
    mutator(this.data);
    if (profileChanged) this.data.profile.updatedAt = Date.now();
    this.data.dirty = true;
    this.persist();
    this.scheduleSync();
  }

  scheduleSync() {
    if (!this.current || this.current.kind !== 'account') return;
    clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => this.sync(), 800);
  }

  setStatus(s) {
    this.status = s;
    this.onChange();
  }

  // Send local changes and take the server's merged copy back
  async sync() {
    const e = this.current;
    if (!e || e.kind !== 'account' || !e.token || !this.data) return;
    const key = e.key;
    this.setStatus('saving');
    try {
      const res = await wqApi('me', { method: 'PUT', token: e.token, body: { profile: this.data.profile, progress: this.data.progress } });
      if (key !== this.currentKey) return;
      this.data.profile = WQMerge.mergeProfile(this.data.profile, res.learner.profile);
      this.data.progress = WQMerge.mergeProgress(this.data.progress, res.learner.progress);
      e.passkeys = res.learner.passkeys;
      this.data.dirty = false;
      this.persist();
      this.setStatus('synced');
    } catch (err) {
      if (key !== this.currentKey) return;
      this.setStatus(err.status === 401 ? 'signin' : 'offline');
    }
  }

  async refresh() {
    await this.sync();
  }

  async signOut(key) {
    const e = this.entry(key);
    if (!e) return;
    if (e.kind === 'account' && e.token) {
      if (key === this.currentKey && this.data && this.data.dirty) await this.sync();
      wqApi('logout', { token: e.token }).catch(() => {});
    }
    this.forget(key);
  }

  forget(key) {
    this.entries = this.entries.filter(x => x.key !== key);
    this.saveEntries();
    localStorage.removeItem(`wq_data_${key}`);
    if (key === this.currentKey) this.deselect();
  }

  // --- Account actions (each returns the server reply) ---
  async registerPasskey(profile, progress) {
    const opts = await wqApi('register/options', { body: { name: profile.name } });
    const credential = await WQPasskey.create(opts);
    return wqApi('register/verify', { body: { challengeId: opts.challengeId, credential, profile, progress } });
  }

  async loginPasskey() {
    const opts = await wqApi('login/options');
    const cred = await WQPasskey.get(opts);
    return wqApi('login/verify', { body: { challengeId: opts.challengeId, ...cred } });
  }

  async recover(code) {
    return wqApi('recover', { body: { code } });
  }

  async addPasskey() {
    const e = this.current;
    const opts = await wqApi('passkey/options', { token: e.token });
    const credential = await WQPasskey.create(opts);
    const res = await wqApi('passkey/verify', { token: e.token, body: { challengeId: opts.challengeId, credential } });
    e.passkeys = res.learner.passkeys;
    this.saveEntries();
    return res;
  }

  async newBackupCode() {
    return wqApi('backup-code', { token: this.current.token });
  }

  async deleteAccount() {
    const e = this.current;
    await wqApi('delete', { token: e.token });
    this.forget(e.key);
  }
}
