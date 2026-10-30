'use strict';

/* ==========================================================================
   Carto Process — accompagnement d'une immersion sur un poste
   Phase 1 Immersion → 2 Réflexion → 3 Validation → 4 Restitution
   - 100 % hors ligne : ouvrir index.html dans le navigateur.
   - Données enregistrées dans le navigateur (localStorage), export/import JSON.
   ========================================================================== */

const STORE_KEY = 'cartoProcess.v3';
const OLD_KEY = 'cartoProcess.v2';   // version à une seule immersion, reprise automatiquement
const NA = 'Non renseigné';

const PHASES = [
  { n: 1, titre: 'Immersion', quand: 'Avec la personne, sur le moment', but: 'Relever chaque tâche, une par une : ce qui est fait, qui intervient, combien de temps, ce qui coince.' },
  { n: 2, titre: 'Réflexion', quand: 'Seul, au calme', but: 'Pour chaque étape qui coince, proposer une solution (outil, modèle, automatisation…). Sans mettre de temps.' },
  { n: 3, titre: 'Validation', quand: 'Avec la personne', but: 'Présenter chaque solution. C\'est la personne qui estime le nouveau temps : le gain se calcule tout seul.' },
  { n: 4, titre: 'Restitution', quand: 'Pour ta hiérarchie', but: 'Le dossier final : temps gagné, tâches simplifiées, risque « personne clé » réduit.' }
];
const PERIODES = {
  jour:    { label: 'par jour',    mult: 220 },
  semaine: { label: 'par semaine', mult: 47 },
  mois:    { label: 'par mois',    mult: 12 },
  an:      { label: 'par an',      mult: 1 }
};
const FLAGS = [
  { key: 'ressaisie', label: 'Je ressaisis une info', nom: 'Ressaisie', short: 'R', color: '#c8372d' },
  { key: 'manuel',    label: 'Je fais à la main',     nom: 'Travail manuel', short: 'M', color: '#d9730d' },
  { key: 'suivi',     label: 'Je dois relancer / suivre', nom: 'Suivi difficile', short: 'S', color: '#8a4baf' }
];
const LEVIERS = {
  supprimer:   'Supprimer l\'étape',
  automatiser: 'Automatiser',
  outiller:    'Outil / fonctionnalité',
  modele:      'Modèle ou règle commune',
  organiser:   'Réorganiser'
};
// Idées de solutions proposées selon ce qui coince
const IDEES = {
  ressaisie: [
    ['outiller', 'Formulaire en ligne (Microsoft Forms) qui alimente directement le suivi'],
    ['outiller', 'Une seule liste partagée (SharePoint / Excel en ligne) au lieu de plusieurs fichiers'],
    ['automatiser', 'Copie automatique d\'un outil à l\'autre (Power Automate)']
  ],
  manuel: [
    ['modele', 'Modèle prérempli (Word / Excel) avec la mise en forme déjà faite'],
    ['automatiser', 'Calculs automatiques dans Excel (formules, tableau croisé dynamique)'],
    ['automatiser', 'Rapport automatique (Power BI) au lieu de consolider à la main']
  ],
  suivi: [
    ['outiller', 'Tableau de suivi partagé avec statuts (Planner / liste SharePoint)'],
    ['automatiser', 'Relance automatique au bout de X jours (Power Automate)'],
    ['organiser', 'Boîte mail partagée avec catégories par sujet']
  ],
  general: [
    ['supprimer', 'Supprimer l\'étape : est-elle vraiment utile ?'],
    ['modele', 'Mode opératoire écrit pour qu\'une autre personne puisse la faire'],
    ['organiser', 'Regrouper avec une autre étape ou la faire en une seule fois']
  ]
};
const QUI_SAIT = { personne: 'Personne d\'autre', une: 'Une autre personne', plusieurs: 'Plusieurs personnes' };
const MODE_OP = { non: 'Non, rien d\'écrit', partiel: 'En partie / pas à jour', oui: 'Oui, à jour' };
const AVIS = { ok: 'D\'accord', discuter: 'À discuter', non: 'Pas convaincu(e)' };
const RISQUES = { 3: 'Élevé', 2: 'Moyen', 1: 'Faible' };
const EFFORTS = { 1: 'Faible', 2: 'Moyen', 3: 'Fort' };
const STATUTS_ACTION = { afaire: 'À lancer', encours: 'En cours', fait: 'En place' };
const QUADRANTS = {
  quickwin: 'Gain rapide', planifier: 'À planifier', structurant: 'Projet structurant',
  petit: 'Petit plus', arbitrer: 'À arbitrer', ecarter: 'À reconsidérer', aevaluer: 'Effort à évaluer'
};
const FIN = '__fin';   // cible « fin du processus » d'un choix

/* ---------- Utilitaires ---------- */
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : 0; };
const fmtInt = n => Math.round(n).toLocaleString('fr-FR');
const fmtDec = (n, d = 1) => n.toLocaleString('fr-FR', { maximumFractionDigits: d });
const slug = s => String(s || 'export').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
const plural = (n, w, ws) => `${fmtInt(n)} ${n > 1 ? (ws || w + 's') : w}`;

function fmtDur(min) {
  const neg = min < 0;
  min = Math.abs(min);
  let out;
  if (min < 60) out = fmtDec(min) + ' min';
  else { const h = min / 60; out = (h < 10 ? fmtDec(h) : fmtInt(h)) + ' h'; }
  return (neg ? '+' : '') + out;
}
function fmtEtp(min) {
  const etp = min / 60 / (num(db.settings.heuresEtp) || 1607);
  return etp.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ETP';
}
const fmtJours = j => j ? fmtDec(j) + (j >= 2 ? ' jours' : ' jour') : '—';
const pct = (a, b) => b ? Math.round(a / b * 100) + ' %' : '—';
const who = () => (state.mission.personne || '').trim() || 'la personne';

/* ---------- Modèle ---------- */
function newStep(o) {
  return Object.assign({
    id: uid(), quoi: '', qui: '', outil: '', duree: '', taux: '100',
    ressaisie: false, manuel: false, suivi: false, precision: '',
    donnees: '', attente: '',               // attente : jours avant l'étape suivante
    controle: false, retour: '', labelSuite: 'Oui', labelAutre: 'Non',
    // Phase 2
    solOpen: false, sol: '', levier: '', tracabilite: false, securise: false,
    // Phase 3 (estimations données par la personne)
    nouveauTemps: '', manipsEvitees: '', nouvelleAttente: '', avis: '',
    // Plan d'action et suivi après mise en place
    effort: '', porteur: '', echeance: '', statutAction: '', tempsReel: '', dateMesure: '',
    coutJours: '', coutEuros: ''          // coût de mise en place : charge interne (jours) + achats (€)
  }, o);
}
function newTask(o) {
  return Object.assign({
    id: uid(), nom: '', description: '', freqQty: '', freqPer: 'mois', origine: '', resultat: '',
    quiSait: '', modeOp: '', notes: '',
    quiSaitApres: '', modeOpApres: '', notesValidation: '',
    cartoValidee: false, cartoValideeLe: '',
    penibilite: '', penibiliteApres: '',  // ressenti de 1 (pas pénible) à 5 (très pénible)
    erreurs: '', erreursApres: '',        // erreurs ou reprises par mois
    p1Done: false, p2Done: false, p3Done: false,
    steps: []
  }, o);
}
function newImm(o) {
  return Object.assign({
    id: uid(), createdAt: new Date().toISOString().slice(0, 10),
    mission: { service: '', personne: '', poste: '', analyste: '', debut: '', fin: '', contexte: '' },
    taches: []
  }, o);
}
function emptyDb() {
  return { version: 3, isDemo: false, activeId: null, lastExport: '', settings: { heuresEtp: '1607', seuilGain: '20', coutHoraire: '40', anonyme: false }, immersions: [] };
}

/* ---------- Calculs ---------- */
const volume = t => num(t.freqQty) * (PERIODES[t.freqPer]?.mult ?? 1);
const taux = s => (s.taux === '' || s.taux == null) ? 100 : num(s.taux);
const stepOcc = (t, s) => volume(t) * taux(s) / 100;
const attente = s => num(s.attente);
const isIrritant = s => FLAGS.some(f => s[f.key]) || !!String(s.precision || '').trim() || attente(s) >= 1;
const hasSol = s => !!(String(s.sol || '').trim() || s.levier);
// Un gain ne compte que si la personne a donné son estimation et n'a pas rejeté la solution
const isValidated = s => hasSol(s) && String(s.nouveauTemps ?? '') !== '' && s.avis !== 'non';
const newDuree = s => isValidated(s) ? num(s.nouveauTemps) : num(s.duree);
const delayValidated = s => hasSol(s) && String(s.nouvelleAttente ?? '') !== '' && s.avis !== 'non';
const newAttente = s => delayValidated(s) ? num(s.nouvelleAttente) : attente(s);
const stepGain = (t, s) => (num(s.duree) - newDuree(s)) * stepOcc(t, s);           // minutes / an
const stepManips = (t, s) => isValidated(s) ? num(s.manipsEvitees) * stepOcc(t, s) : 0;
const isMeasured = s => isValidated(s) && s.statutAction === 'fait' && String(s.tempsReel ?? '') !== '';
// Priorité d'une solution : gain annuel (seuil réglable) croisé avec l'effort
function quadrant(t, s) {
  const e = num(s.effort);
  if (!e) return 'aevaluer';
  const high = stepGain(t, s) / 60 >= (num(db.settings.seuilGain) || 20);
  if (high) return e <= 1 ? 'quickwin' : e === 2 ? 'planifier' : 'structurant';
  return e <= 1 ? 'petit' : e === 2 ? 'arbitrer' : 'ecarter';
}
const coutH = () => num(db.settings.coutHoraire);
const eur = min => min / 60 * coutH();
const fmtEur = n => Math.round(n).toLocaleString('fr-FR') + ' €';
const invest = s => num(s.coutJours) * 7 * coutH() + num(s.coutEuros);
// Nombre de mois pour que le gain rembourse le coût de mise en place
const payback = (inv, gainMin) => inv > 0 && gainMin > 0 ? inv / (eur(gainMin) / 12) : null;
const fmtMois = m => m == null ? '—' : m < 1 ? 'moins d\'1 mois' : Math.ceil(m) + ' mois';
const DEMO_IDS = ['imm-sophie', 'imm-credits', 'imm-successions', 'imm-assistance', 'imm-habilitations'];
const QUAD_ORDER = ['quickwin', 'planifier', 'structurant', 'petit', 'arbitrer', 'ecarter', 'aevaluer'];

function riskScore(qs, mo) {
  if (!qs || !mo) return 0;
  const pts = { personne: 2, une: 1, plusieurs: 0 }[qs] + { non: 2, partiel: 1, oui: 0 }[mo];
  return pts >= 3 ? 3 : pts === 2 ? 2 : 1;
}

function taskStats(t) {
  const r = {
    avant: 0, apres: 0, irrit: 0, parFois: 0, nbIrr: 0, solutions: 0, validees: 0, supprimees: 0,
    tracab: 0, controles: 0, manips: 0, delaiAvant: 0, delaiApres: 0,
    actions: 0, actionsFaites: 0, mesures: 0, gainReel: 0, gainEstimeMesure: 0, invest: 0, flagsAvant: { ressaisie: 0, manuel: 0, suivi: 0 }, flagsLeves: { ressaisie: 0, manuel: 0, suivi: 0 }
  };
  t.steps.forEach(s => {
    const occ = stepOcc(t, s);
    const v = isValidated(s);
    r.avant += num(s.duree) * occ;
    r.apres += newDuree(s) * occ;
    r.parFois += num(s.duree) * taux(s) / 100;
    r.delaiAvant += attente(s) * taux(s) / 100;
    r.delaiApres += newAttente(s) * taux(s) / 100;
    r.manips += stepManips(t, s);
    if (isIrritant(s)) { r.nbIrr++; r.irrit += num(s.duree) * occ; }
    if (hasSol(s)) r.solutions++;
    FLAGS.forEach(f => { if (s[f.key]) { r.flagsAvant[f.key]++; if (v) r.flagsLeves[f.key]++; } });
    if (v) {
      r.validees++;
      if (s.levier === 'supprimer') r.supprimees++;
      if (s.tracabilite) r.tracab++;
      if (s.securise) r.controles++;
      r.actions++;
      r.invest += invest(s);
      if (s.statutAction === 'fait') r.actionsFaites++;
      if (isMeasured(s)) {
        r.mesures++;
        r.gainReel += (num(s.duree) - num(s.tempsReel)) * occ;
        r.gainEstimeMesure += (num(s.duree) - num(s.nouveauTemps)) * occ;
      }
    }
  });
  r.gain = r.avant - r.apres;
  r.penAvant = num(t.penibilite);
  r.penApres = t.penibiliteApres !== '' ? num(t.penibiliteApres) : r.penAvant;
  r.erreursEvitees = t.erreursApres !== '' ? Math.max(0, num(t.erreurs) - num(t.erreursApres)) * 12 : 0;
  r.riskAvant = riskScore(t.quiSait, t.modeOp);
  r.riskApres = riskScore(t.quiSaitApres || t.quiSait, t.modeOpApres || t.modeOp);
  return r;
}
function globalStats(imm = state) {
  const g = { avant: 0, apres: 0, gain: 0, irrit: 0, solutions: 0, validees: 0, supprimees: 0, tracab: 0, controles: 0,
    manips: 0, actions: 0, actionsFaites: 0, mesures: 0, gainReel: 0, gainEstimeMesure: 0,
    invest: 0, erreursEvitees: 0, penN: 0, penAvant: 0, penApres: 0,
    flagsAvant: { ressaisie: 0, manuel: 0, suivi: 0 }, flagsLeves: { ressaisie: 0, manuel: 0, suivi: 0 },
    simplifiees: 0, riskHautAvant: 0, riskHautApres: 0, riskBaisse: 0 };
  imm.taches.forEach(t => {
    const s = taskStats(t);
    ['avant', 'apres', 'gain', 'irrit', 'solutions', 'validees', 'supprimees', 'tracab', 'controles',
      'manips', 'actions', 'actionsFaites', 'mesures', 'gainReel', 'gainEstimeMesure', 'invest', 'erreursEvitees'].forEach(k => { g[k] += s[k]; });
    if (s.penAvant) { g.penN++; g.penAvant += s.penAvant; g.penApres += s.penApres; }
    FLAGS.forEach(f => { g.flagsAvant[f.key] += s.flagsAvant[f.key]; g.flagsLeves[f.key] += s.flagsLeves[f.key]; });
    if (s.gain > 0.0001) g.simplifiees++;
    if (s.riskAvant === 3) g.riskHautAvant++;
    if (s.riskApres === 3) g.riskHautApres++;
    if (s.riskAvant && s.riskApres < s.riskAvant) g.riskBaisse++;
  });
  g.penMoyAvant = g.penN ? g.penAvant / g.penN : 0;
  g.penMoyApres = g.penN ? g.penApres / g.penN : 0;
  return g;
}
const fmtPen = p => p ? fmtDec(p) + ' / 5' : '—';
const PENIBILITE = { 1: '1 · pas du tout', 2: '2', 3: '3 · moyen', 4: '4', 5: '5 · très pénible' };

// Version « vitrine » : le prénom de la personne et les remarques personnelles sont retirés
function anonClone(imm) {
  const name = (imm.mission.personne || '').trim();
  let json = JSON.stringify(imm);
  if (name) json = json.replace(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), 'Titulaire');
  const c = JSON.parse(json);
  c.mission.personne = '';
  c.taches.forEach(t => { t.notes = ''; t.notesValidation = ''; });
  return c;
}
// Exécute fn avec l'immersion ouverte anonymisée si le mode vitrine est actif
function asShown(fn) {
  if (!db.settings.anonyme || !state) return fn();
  const real = state;
  state = anonClone(real);
  try { return fn(); } finally { state = real; }
}

/* ---------- Persistance ---------- */
// db : toutes les immersions ; state : l'immersion ouverte (mission + tâches)
let db = loadDb();
let state = db.immersions.find(i => i.id === db.activeId) || null;
let lastSaved = null;

function loadDb() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return normalizeDb(JSON.parse(raw));
    const old = localStorage.getItem(OLD_KEY);
    if (old) {
      const d = emptyDb();
      const imm = normalizeImm(JSON.parse(old));
      d.immersions.push(imm);
      d.activeId = imm.id;
      return d;
    }
  } catch (e) { /* stockage indisponible : on repart de la démo */ }
  return demoDb();
}
function normalizeImm(s) {
  const out = newImm({ id: s.id || uid(), createdAt: s.createdAt || new Date().toISOString().slice(0, 10) });
  if (s.dossier) out.dossier = s.dossier;
  if (s.updatedAt) out.updatedAt = s.updatedAt;
  out.mission = Object.assign(newImm().mission, s.mission);
  out.taches = (s.taches || []).map(t => {
    const nt = newTask(t);
    nt.steps = (t.steps || []).map(newStep);
    return nt;
  });
  return out;
}
function normalizeDb(s) {
  const out = Object.assign(emptyDb(), s);
  out.settings = Object.assign(emptyDb().settings, s.settings);
  out.immersions = (s.immersions || []).map(normalizeImm);
  return out;
}
function setActive(imm) {
  state = imm;
  db.activeId = imm ? imm.id : null;
}
function save(touch = true) {
  if (touch && state) state.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(db));
    lastSaved = new Date();
  } catch (e) {
    if (dirStatus !== 'ok') toast('Enregistrement impossible dans ce navigateur : pense à exporter une sauvegarde.');
  }
  scheduleDiskWrite();
  const el = document.getElementById('savedAt');
  if (el) el.outerHTML = savedBadge();
}
const hhmm = d => d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
function savedBadge() {
  if (dirStatus === 'ok') return `<span class="saved ok" id="savedAt" title="Enregistrement automatique dans le dossier de données">💾 ${esc(dirHandle.name)} · ${dirSaved ? hhmm(dirSaved) : 'connecté'}</span>`;
  if (dirStatus === 'needs-permission') return `<button class="saved warn" id="savedAt" data-action="reconnect-dir">🔒 Ouvrir le dossier de données</button>`;
  if (dirStatus === 'error') return `<button class="saved warn" id="savedAt" data-action="reconnect-dir" title="${esc(dirError)}">⚠ Dossier inaccessible · réessayer</button>`;
  return `<a class="saved" id="savedAt" href="#/immersions">${lastSaved ? '✓ Navigateur · ' + hhmm(lastSaved) : 'Enregistrement automatique'}${FS_OK ? ' · dossier non connecté' : ''}</a>`;
}

/* ---------- Dossier « données de production » ----------
   On choisit une fois le dossier (ex : V:\…\carto-process\donnees-production).
   Chaque immersion y a son sous-dossier avec immersion.json, enregistré automatiquement,
   et les exports (PowerPoint, schémas, CSV) y sont déposés. Au démarrage, le dossier est relu. */
const FS_OK = 'showDirectoryPicker' in window;
let dirHandle = null;
let dirStatus = 'none';          // none | needs-permission | ok | error
let dirSaved = null;
let dirError = '';
let diskTimer = null;
const written = new Map();       // dernier contenu écrit, par fichier

function idbCall(mode, fn) {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('cartoProcess', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('kv');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const tx = open.result.transaction('kv', mode);
      const req = fn(tx.objectStore('kv'));
      tx.oncomplete = () => resolve(req && req.result);
      tx.onerror = () => reject(tx.error);
    };
  });
}
const idbGet = k => idbCall('readonly', st => st.get(k));
const idbSet = (k, v) => idbCall('readwrite', st => st.put(v, k));

const cleanName = str => String(str).replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90);
// Nom du sous-dossier d'une immersion : « 2026-11 - Poste - Prénom » (fixé à la première écriture)
function folderName(imm) {
  const m = imm.mission;
  const label = m.poste || m.service;
  if (!label) return '';
  return cleanName(`${(m.debut || imm.createdAt || '').slice(0, 7)} - ${label}${m.personne ? ' - ' + m.personne : ''}`);
}
async function writeText(dir, name, text) {
  const fh = await dir.getFileHandle(name, { create: true });
  const w = await fh.createWritable();
  await w.write(text);
  await w.close();
}
function scheduleDiskWrite() {
  if (dirStatus !== 'ok') return;
  clearTimeout(diskTimer);
  diskTimer = setTimeout(writeDirty, 600);
}
// Une seule écriture à la fois : sur un lecteur réseau lent, deux écritures simultanées
// pouvaient créer deux sous-dossiers pour la même immersion
let writing = Promise.resolve();
function writeDirty() {
  writing = writing.then(writeDirtyNow, writeDirtyNow);
  return writing;
}
const exists = name => dirHandle.getDirectoryHandle(name).then(() => true, () => false);
const baseOf = name => String(name || '').replace(/ \(\d+\)$/, '');
async function freeName(base) {
  let name = base, k = 2;
  while (await exists(name)) name = `${base} (${k++})`;
  return name;
}
// Renomme le sous-dossier (copie des fichiers puis suppression de l'ancien)
async function moveFolder(imm, newName) {
  const dst = await dirHandle.getDirectoryHandle(newName, { create: true });
  const src = await dirHandle.getDirectoryHandle(imm.dossier).catch(() => null);
  if (src) {
    for await (const [n, e] of src.entries()) {
      if (e.kind !== 'file') continue;
      const fh = await dst.getFileHandle(n, { create: true });
      const w = await fh.createWritable();
      await w.write(await e.getFile());
      await w.close();
    }
    await dirHandle.removeEntry(imm.dossier, { recursive: true });
  }
  written.delete(imm.dossier + '/immersion.json');
  imm.dossier = newName;
}
async function writeDirtyNow() {
  if (dirStatus !== 'ok' || db.isDemo) return;          // la démo n'est jamais écrite dans le dossier
  try {
    const settings = JSON.stringify(db.settings, null, 2);
    if (written.get('parametres.json') !== settings) { await writeText(dirHandle, 'parametres.json', settings); written.set('parametres.json', settings); }
    for (const imm of db.immersions) {
      const want = folderName(imm);
      if (!want) continue;                              // pas encore de poste ni de service : on attend
      // Pendant la saisie de la mission, on ne fige pas le nom du dossier (évite « 2026-10 - C »)
      const editing = imm === state && route().page === 'accueil';
      if (!imm.dossier) {
        if (editing) continue;
        imm.dossier = await freeName(want);
      } else if (baseOf(imm.dossier) !== want && !editing) {
        await moveFolder(imm, await freeName(want));
      }
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
      const json = JSON.stringify(imm, null, 2);
      const key = imm.dossier + '/immersion.json';
      if (written.get(key) === json) continue;
      const dir = await dirHandle.getDirectoryHandle(imm.dossier, { create: true });
      await writeText(dir, 'immersion.json', json);
      written.set(key, json);
    }
    dirSaved = new Date();
  } catch (e) {
    dirStatus = 'error';
    dirError = e.message;
    toast('Écriture impossible dans le dossier de données : ' + e.message);
  }
  const el = document.getElementById('savedAt');
  if (el) el.outerHTML = savedBadge();
}
// Relit le dossier et le fusionne avec ce que le navigateur connaît (la version la plus récente gagne)
async function loadFromDir() {
  const disk = [];
  for await (const [name, entry] of dirHandle.entries()) {
    if (entry.kind !== 'directory' || name.startsWith('_') || name.startsWith('.')) continue;
    try {
      const file = await (await entry.getFileHandle('immersion.json')).getFile();
      const text = await file.text();
      const imm = normalizeImm(JSON.parse(text));
      imm.dossier = name;
      const twin = disk.find(d => d.id === imm.id);
      if (!twin) disk.push(imm);
      else if ((imm.updatedAt || '') > (twin.updatedAt || '')) disk.splice(disk.indexOf(twin), 1, imm);
      if (twin) console.warn('Même immersion dans deux dossiers :', twin.dossier, '/', name);
    } catch (e) { /* sous-dossier sans immersion.json : ignoré */ }
  }
  try {
    const p = await (await dirHandle.getFileHandle('parametres.json')).getFile();
    db.settings = Object.assign(emptyDb().settings, db.settings, JSON.parse(await p.text()));
  } catch (e) { /* pas encore de paramètres enregistrés */ }
  // La démo n'est jamais copiée dans le dossier, mais une immersion créée pendant la démo est gardée
  const local = db.isDemo ? db.immersions.filter(i => !DEMO_IDS.includes(i.id)) : db.immersions;
  const byId = new Map(disk.map(i => [i.id, i]));
  local.forEach(i => {
    const d = byId.get(i.id);
    if (!d) byId.set(i.id, i);
    else if ((i.updatedAt || '') > (d.updatedAt || '')) { i.dossier = d.dossier; byId.set(i.id, i); }
  });
  const activeId = db.activeId;
  db.immersions = [...byId.values()];
  if (db.isDemo) { db.isDemo = false; portfolioYear = String(new Date().getFullYear()); }
  setActive(db.immersions.find(i => i.id === activeId) || null);
  dirStatus = 'ok';
  dirError = '';
  save(false);
  await writeDirty();
}
async function connectDir() {
  try {
    const h = await window.showDirectoryPicker({ id: 'carto-process-donnees', mode: 'readwrite' });
    if (db.isDemo && !confirm(`Utiliser « ${h.name} » comme dossier de données ?\nLes données de démonstration ne seront pas copiées dedans.`)) return;
    dirHandle = h;
    await idbSet('dir', h);
    await loadFromDir();
    toast(`Dossier « ${h.name} » connecté : tout s'y enregistre automatiquement.`);
    go('#/immersions');
    render();
  } catch (e) {
    if (e.name !== 'AbortError') toast('Impossible d\'utiliser ce dossier : ' + e.message);
  }
}
async function reconnectDir() {
  if (!dirHandle) return connectDir();
  try {
    if (await dirHandle.requestPermission({ mode: 'readwrite' }) !== 'granted') { toast('Accès au dossier refusé.'); return; }
    await loadFromDir();
    toast(`Dossier « ${dirHandle.name} » rechargé.`);
    render();
  } catch (e) {
    dirStatus = 'error'; dirError = e.message;
    toast('Dossier inaccessible : ' + e.message + '. Choisis-le à nouveau.');
    render();
  }
}
// Au démarrage : on retrouve le dossier choisi la dernière fois et on le recharge
async function initDir() {
  if (!FS_OK) return;
  try {
    const h = await idbGet('dir');
    if (!h) { render(); return; }
    dirHandle = h;
    if (await h.queryPermission({ mode: 'readwrite' }) === 'granted') await loadFromDir();
    else dirStatus = 'needs-permission';
  } catch (e) {
    dirStatus = 'error'; dirError = e.message;
  }
  render();
}
// Dépose un fichier dans le dossier de l'immersion ouverte, sinon téléchargement classique
async function saveFile(blob, name) {
  if (dirStatus === 'ok' && state && state.dossier) {
    try {
      const dir = await dirHandle.getDirectoryHandle(state.dossier, { create: true });
      const fh = await dir.getFileHandle(name, { create: true });
      const w = await fh.createWritable();
      await w.write(blob);
      await w.close();
      toast(`Enregistré dans « ${state.dossier} » : ${name}`);
      return;
    } catch (e) { toast('Écriture dans le dossier impossible, téléchargement à la place.'); }
  }
  download(blob, name);
}

/* ---------- Navigation ---------- */
function route() {
  const parts = (location.hash || '#/immersions').replace(/^#\/?/, '').split('/');
  const phase = Number(parts[0]);
  return { page: parts[0] || 'immersions', phase: phase >= 1 && phase <= 4 ? phase : 0, id: parts[1] || null };
}
function currentTask() {
  const r = route();
  return r.id && state ? state.taches.find(t => t.id === r.id) : null;
}
const go = hash => { location.hash = hash; };

/* ---------- Rendu ---------- */
const $top = document.getElementById('topbar');
const $main = document.getElementById('main');
let renderPending = false;
let flashId = null;
let mapSeq = 0;
let fitMaps = false;        // « Vue d'ensemble » : le schéma tient dans la largeur
const openDetails = new Set();

function scheduleRender() {
  if (renderPending) return;
  renderPending = true;
  setTimeout(() => { renderPending = false; render(); }, 0);
}

function render() {
  // Conserve focus, sélection et défilements entre deux rendus
  const a = document.activeElement;
  const key = a && a.dataset ? a.dataset.bind : null;
  let selStart = null, selEnd = null;
  try { selStart = a.selectionStart; selEnd = a.selectionEnd; } catch (e) { /* champ sans sélection */ }
  const scrollY = window.scrollY;
  const hScroll = {};
  document.querySelectorAll('[data-scroll-key]').forEach(el => { hScroll[el.dataset.scrollKey] = el.scrollLeft; });

  mapSeq = 0;
  $top.innerHTML = viewTopbar();
  $main.innerHTML = viewMain();

  document.querySelectorAll('[data-scroll-key]').forEach(el => {
    if (hScroll[el.dataset.scrollKey] != null) el.scrollLeft = hScroll[el.dataset.scrollKey];
  });
  window.scrollTo(0, scrollY);
  if (key) {
    const el = document.querySelector(`[data-bind="${CSS.escape(key)}"]`);
    if (el) {
      el.focus({ preventScroll: true });
      try { if (selStart != null) el.setSelectionRange(selStart, selEnd); } catch (e) { /* idem */ }
    }
  }
  if (flashId) {
    const el = document.getElementById(flashId);
    if (el) {
      el.scrollIntoView({ block: 'center' });
      el.classList.add('flash');
      const input = el.querySelector('input, textarea');
      if (input && el.dataset.autofocus) input.focus({ preventScroll: true });
    }
    flashId = null;
  }
}

// Les données ne vivent que dans le navigateur : on rappelle d'exporter tous les 3 jours
function backupReminder() {
  if (dirStatus === 'needs-permission') return `<div class="banner no-print"><span><b>Dossier de données « ${esc(dirHandle.name)} ».</b> Le navigateur demande ton accord pour le rouvrir.</span>
    <button class="btn sm primary" data-action="reconnect-dir">🔒 Ouvrir le dossier</button></div>`;
  if (dirStatus === 'ok') return '';
  if (FS_OK && dirStatus === 'none' && !db.isDemo) return `<div class="banner no-print"><span><b>Enregistrement automatique sur disque :</b> choisis une fois le dossier « donnees-production » (à côté de index.html).</span>
    <button class="btn sm primary" data-action="connect-dir">📁 Choisir le dossier</button></div>`;
  if (!db.immersions.some(i => i.taches.length)) return '';
  const days = db.lastExport ? Math.floor((Date.now() - new Date(db.lastExport)) / 86400000) : null;
  if (days !== null && days < 3) return '';
  return `<div class="banner no-print"><span><b>Pense à sauvegarder.</b> ${days === null ? 'Aucune sauvegarde exportée pour l\'instant.' : `Dernière sauvegarde il y a ${days} jours.`}
    Les données ne sont stockées que dans ce navigateur.</span><button class="btn sm primary" data-action="export-json">⭳ Exporter maintenant</button></div>`;
}

function viewMain() {
  const r = route();
  const banner = db.isDemo ? `
    <div class="banner no-print"><span><b>Données de démonstration (fictives).</b> Explore librement, puis repars de zéro pour tes missions.</span>
    <button class="btn sm" data-action="reset-all">Repartir de zéro</button></div>` : backupReminder();
  let body;
  if (r.page === 'immersions' || !state) body = viewPortfolio();
  else if (!r.phase) body = viewAccueil();
  else if (r.phase === 4) body = r.id === 'plan' ? viewPlan() : viewRestitution();
  else if (r.id) {
    const t = currentTask();
    body = !t ? `<div class="empty">Tâche introuvable.<br><a class="btn" href="#/${r.phase}">Retour à la liste</a></div>`
      : r.phase === 1 ? viewFiche1(t) : r.phase === 2 ? viewFiche2(t) : viewFiche3(t);
  } else body = viewPhaseList(r.phase);
  return banner + body;
}

/* ---------- Barre du haut : les 4 phases ---------- */
function phaseProgress(n) {
  const ts = state.taches;
  const releves = ts.filter(t => t.p1Done);
  if (n === 1) return { done: ts.length > 0 && releves.length === ts.length, txt: ts.length ? `${releves.length} / ${plural(ts.length, 'tâche')} relevée${releves.length > 1 ? 's' : ''}` : 'À commencer' };
  if (n === 2) { const d = releves.filter(t => t.p2Done).length; return { done: releves.length > 0 && d === releves.length, txt: releves.length ? `${d} / ${releves.length} analysée${d > 1 ? 's' : ''}` : 'Après l\'immersion' }; }
  if (n === 3) { const a = ts.filter(t => t.p2Done); const d = a.filter(t => t.p3Done).length; return { done: a.length > 0 && d === a.length, txt: a.length ? `${d} / ${a.length} validée${d > 1 ? 's' : ''}` : 'Après la réflexion' }; }
  const g = globalStats();
  return { done: false, txt: g.gain > 0 ? `${fmtDur(g.gain)} gagnées / an` : 'Le dossier final' };
}
function viewTopbar() {
  const r = route();
  const inImm = state && r.page !== 'immersions';
  const brand = `<a class="brand" href="#/immersions" title="Toutes mes immersions"><span class="logo">CP</span><span><strong>Carto Process</strong><small>${inImm ? '← Mes immersions' : 'Mes immersions'}</small></span></a>`;
  if (!inImm) return `${brand}<div class="top-title">Tableau de bord de mes immersions</div>${savedBadge()}`;
  return `${brand}
    <a class="imm-name${r.page === 'accueil' ? ' active' : ''}" href="#/accueil" title="La mission de cette immersion">${esc(immLabel(state))}</a>
    <nav class="stepper">${PHASES.map(p => {
      const pr = phaseProgress(p.n);
      return `<a class="phase-step${r.phase === p.n ? ' active' : ''}${pr.done ? ' done' : ''}" href="#/${p.n}">
        <span class="n">${pr.done ? '✓' : p.n}</span><span class="txt"><b>${p.titre}</b><small>${pr.txt}</small></span></a>`;
    }).join('<span class="sep">›</span>')}</nav>
    ${savedBadge()}`;
}
// Deux immersions sont des doublons si elles ont même service, poste, personne et date de début
const immKey = imm => {
  const m = imm.mission;
  return (m.service || m.poste || m.personne) ? [m.service, m.poste, m.personne, m.debut].map(x => String(x || '').trim().toLowerCase()).join('|') : '';
};
const isEmptyImm = imm => !imm.taches.length && !['service', 'poste', 'personne', 'contexte'].some(k => String(imm.mission[k] || '').trim());
function duplicateGroups() {
  const groups = {};
  db.immersions.forEach(i => { const k = immKey(i); if (k) (groups[k] = groups[k] || []).push(i); });
  return Object.values(groups).filter(g => g.length > 1);
}
// Garde, dans chaque groupe, l'immersion la plus complète puis la plus récente
const immWeight = i => i.taches.reduce((a, t) => a + 1 + t.steps.length, 0);
function keeperOf(group) {
  return group.slice().sort((a, b) => immWeight(b) - immWeight(a) || String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')))[0];
}
const immLabel = imm => [imm.mission.service, imm.mission.personne].filter(Boolean).join(' · ') || 'Nouvelle immersion';

/* ---------- Champs liés ---------- */
const bindAttr = (scope, field) => `data-bind="${esc(scope + '|' + field)}"`;
const inp = (scope, field, val, attrs = '') => `<input ${bindAttr(scope, field)} value="${esc(val)}" ${attrs}>`;
const numInp = (scope, field, val, attrs = '') => `<input type="number" min="0" step="any" inputmode="decimal" ${bindAttr(scope, field)} value="${esc(val)}" ${attrs}>`;
const area = (scope, field, val, attrs = '') => `<textarea ${bindAttr(scope, field)} ${attrs}>${esc(val)}</textarea>`;
function sel(scope, field, val, options, attrs = '') {
  const opts = Array.isArray(options) ? options : Object.entries(options);
  return `<select ${bindAttr(scope, field)} ${attrs}>${opts.map(([v, l]) =>
    `<option value="${esc(v)}"${String(v) === String(val) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
}
const chk = (scope, field, val, label) =>
  `<label class="check"><input type="checkbox" ${bindAttr(scope, field)}${val ? ' checked' : ''}> ${label}</label>`;
function chips(scope, field, val, options, cls = '') {
  return `<div class="chips ${cls}">${Object.entries(options).map(([v, l]) =>
    `<button type="button" class="chip${String(val) === String(v) ? ' on' : ''}" data-action="chip" data-scope="${esc(scope)}" data-field="${esc(field)}" data-value="${esc(v)}">${esc(l)}</button>`).join('')}</div>`;
}
const toggle = (scope, field, val, label, cls = '') =>
  `<button type="button" class="chip toggle ${cls}${val ? ' on' : ''}" data-action="toggle" data-scope="${esc(scope)}" data-field="${esc(field)}">${label}</button>`;
const field = (label, control, cls = '') => `<label class="field ${cls}"><span>${label}</span>${control}</label>`;

// Une question du guide : numéro, intitulé, exemple, réponse
function question(n, titre, hint, control, cls = '') {
  return `<div class="q ${cls}">
    <div class="q-head"><span class="q-n">${n}</span><div><div class="q-title">${titre}</div>${hint ? `<div class="q-hint">${hint}</div>` : ''}</div></div>
    <div class="q-body">${control}</div></div>`;
}

function resolveScope(scope) {
  if (scope === 'mission') return state && state.mission;
  if (scope === 'settings') return db.settings;
  const t = currentTask();
  if (scope === 't') return t;
  const [k, id] = scope.split(':');
  if (k === 's' && t) return t.steps.find(s => s.id === id);
  if (k === 'ts' && state) {
    const tt = state.taches.find(x => x.id === id);
    return tt ? tt.steps.find(s => s.id === scope.split(':')[2]) : null;
  }
  return null;
}
function applyBinding(el) {
  const [scope, f] = el.dataset.bind.split('|');
  const obj = resolveScope(scope);
  if (obj) obj[f] = el.type === 'checkbox' ? el.checked : el.value;
}

/* ---------- Tableau de bord de toutes les immersions ---------- */
const MOIS = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'];
let portfolioYear = String(new Date().getFullYear());
const immDate = imm => imm.mission.debut || imm.createdAt || '';
const immYear = imm => immDate(imm).slice(0, 4) || '—';

function immStatus(imm) {
  const ts = imm.taches;
  if (!ts.length) return { label: 'À démarrer', cls: '', pct: 0 };
  const pct = Math.round(ts.reduce((a, t) => a + (t.p1Done ? 1 : 0) + (t.p2Done ? 1 : 0) + (t.p3Done ? 1 : 0), 0) / (ts.length * 3) * 100);
  if (ts.every(t => t.p3Done)) return { label: 'Terminée', cls: 'ok', pct: 100 };
  if (ts.some(t => t.p2Done)) return { label: 'Phase 3 · Validation', cls: 'warn', pct };
  if (ts.some(t => t.p1Done)) return { label: 'Phase 2 · Réflexion', cls: 'warn', pct };
  return { label: 'Phase 1 · Immersion', cls: 'warn', pct };
}

function viewPortfolio() {
  const all = db.immersions;
  const years = [...new Set(all.map(immYear))].sort().reverse();
  if (portfolioYear !== 'all' && !years.includes(portfolioYear)) portfolioYear = years[0] || String(new Date().getFullYear());
  const list = all.filter(i => portfolioYear === 'all' || immYear(i) === portfolioYear)
    .slice().sort((a, b) => immDate(b).localeCompare(immDate(a)));
  const rows = list.map(i => ({ i: db.settings.anonyme ? anonClone(i) : i, g: globalStats(i), st: immStatus(i) }));
  const T = rows.reduce((a, { g }) => {
    ['avant', 'apres', 'gain', 'simplifiees', 'validees', 'supprimees', 'riskHautAvant', 'riskHautApres', 'riskBaisse',
      'manips', 'actions', 'actionsFaites', 'mesures', 'gainReel', 'gainEstimeMesure', 'invest', 'penN', 'penAvant', 'penApres'].forEach(k => { a[k] += g[k]; });
    FLAGS.forEach(f => { a.leves += g.flagsLeves[f.key]; a.flags += g.flagsAvant[f.key]; });
    return a;
  }, { avant: 0, apres: 0, gain: 0, simplifiees: 0, validees: 0, supprimees: 0, riskHautAvant: 0, riskHautApres: 0, riskBaisse: 0, leves: 0, flags: 0,
    manips: 0, actions: 0, actionsFaites: 0, mesures: 0, gainReel: 0, gainEstimeMesure: 0, invest: 0, penN: 0, penAvant: 0, penApres: 0 });
  const ameliores = rows.filter(r => r.g.gain > 0.0001).length;
  const nbTaches = rows.reduce((a, r) => a + r.i.taches.length, 0);

  const dups = duplicateGroups();
  const dupBanner = dups.length ? `<div class="tip warn no-print"><b>⚠ ${plural(dups.length, 'immersion en double', 'immersions en double')} :</b>
      ${dups.map(g => `« ${esc(immLabel(g[0]))} » ×${g.length}`).join(', ')}.
      <button class="btn sm primary" data-action="dedupe">Nettoyer : garder la version la plus complète</button></div>` : '';
  const header = dupBanner + `<header class="phase-head">
      <div><div class="eyebrow">Prendre de la hauteur</div><h1>Mes immersions</h1>
        <p class="sub">Toutes les immersions menées, le temps gagné par service et les postes améliorés. Ouvre une immersion pour la continuer, ou crées-en une nouvelle.</p></div>
      <div class="actions no-print">${toggle('settings', 'anonyme', db.settings.anonyme, db.settings.anonyme ? '🕶 Version anonyme' : '🕶 Anonymiser', 'anon')}<button class="btn lg" data-action="print">🖶 Imprimer le bilan</button><button class="btn primary lg" data-action="new-imm">+ Nouvelle immersion</button></div>
    </header>`;
  if (!all.length) {
    return `${header}<div class="empty">Aucune immersion pour l'instant.<br><button class="btn primary lg" data-action="new-imm">+ Créer ma première immersion</button>
      <button class="btn" data-action="load-demo">Voir la démo</button></div>${dataCard()}`;
  }

  // Temps gagné par service
  const bySvc = {};
  rows.forEach(({ i, g }) => {
    const k = i.mission.service || 'Service non renseigné';
    bySvc[k] = bySvc[k] || { gain: 0, avant: 0, n: 0 };
    bySvc[k].gain += Math.max(0, g.gain); bySvc[k].avant += g.avant; bySvc[k].n++;
  });
  const svc = Object.entries(bySvc).sort((a, b) => b[1].gain - a[1].gain);
  const maxSvc = Math.max(1, ...svc.map(([, v]) => v.gain));

  // Temps gagné par mois (ou par année si toutes les années)
  const cols = portfolioYear === 'all'
    ? years.slice().reverse().map(y => [y, all.filter(i => immYear(i) === y).reduce((a, i) => a + Math.max(0, globalStats(i).gain), 0)])
    : MOIS.map((m, k) => [m, rows.filter(r => Number(immDate(r.i).slice(5, 7)) === k + 1).reduce((a, r) => a + Math.max(0, r.g.gain), 0)]);
  const maxCol = Math.max(1, ...cols.map(c => c[1]));
  const maxPoste = Math.max(1, ...rows.map(r => r.g.avant));

  return `${header}
    <div class="year-bar no-print"><span class="lbl">Année :</span>
      ${[...years, 'all'].map(y => `<button class="chip${portfolioYear === y ? ' on' : ''}" data-action="year" data-value="${y}">${y === 'all' ? 'Toutes' : y}</button>`).join('')}</div>

    <div class="kpis">
      ${kpi('Temps gagné', fmtDur(Math.max(0, T.gain)) + ' / an', `${fmtEtp(Math.max(0, T.gain))} · ≈ ${fmtEur(eur(Math.max(0, T.gain)))} / an · ${pct(Math.max(0, T.gain), T.avant)} du temps analysé`, 'good')}
      ${kpi('Pénibilité moyenne', T.penN ? `${fmtDec(T.penAvant / T.penN)} → ${fmtDec(T.penApres / T.penN)}` : '—', `sur 5 · investissement ${T.invest ? fmtEur(T.invest) : 'non chiffré'}`, T.penApres < T.penAvant ? 'good' : '')}
      ${kpi('Immersions menées', rows.length, `${plural(ameliores, 'poste amélioré', 'postes améliorés')}`)}
      ${kpi('Manipulations évitées', fmtInt(T.manips), 'par an', 'good')}
      ${kpi('Tâches simplifiées', `${T.simplifiees} / ${nbTaches}`, `${T.leves} / ${T.flags} irritants levés`)}
      ${kpi('Actions en place', `${T.actionsFaites} / ${T.actions}`, T.mesures ? `gain mesuré ${fmtDur(T.gainReel)} / an (estimé ${fmtDur(T.gainEstimeMesure)})` : 'aucune mesure pour l\'instant', T.mesures ? 'good' : '')}
      ${kpi('Risque personne clé', `${T.riskHautAvant} → ${T.riskHautApres}`, `tâches à risque élevé · ${T.riskBaisse} en baisse`, T.riskHautApres < T.riskHautAvant ? 'good' : '')}
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-head"><div><h2>Temps gagné par service</h2><p class="muted small">Heures gagnées par an, cumulées sur les immersions du service.</p></div></div>
        <div class="hbars">${svc.map(([k, v]) => `
          <div class="hbar-row"><div class="hbar-label" title="${esc(k)}">${esc(k)}<small>${plural(v.n, 'immersion')} · ${pct(v.gain, v.avant)} du temps</small></div>
            <div class="bar-track lg"><div class="bar gain" style="width:${v.gain / maxSvc * 100}%"></div></div>
            <div class="hbar-val">${fmtDur(v.gain)}</div></div>`).join('')}</div>
      </div>
      <div class="card">
        <div class="card-head"><div><h2>Temps gagné ${portfolioYear === 'all' ? 'par année' : 'par mois'}</h2><p class="muted small">Selon le mois de début de chaque immersion.</p></div></div>
        <div class="cols">${cols.map(([l, v]) => `
          <div class="col" title="${esc(l)} : ${fmtDur(v)} gagnées / an"><div class="col-area"><span class="col-val">${v ? fmtDur(v) : ''}</span><div class="col-bar" style="height:${v / maxCol * 100}%"></div></div><div class="col-lbl">${esc(l)}</div></div>`).join('')}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-head"><div><h2>Avant / après, poste par poste</h2><p class="muted small">Temps annuel des tâches analysées : aujourd'hui (gris) et demain (bleu).</p></div></div>
      <div class="hbars">${rows.map(({ i, g }) => `
        <div class="hbar-row"><div class="hbar-label">${esc(i.mission.poste || 'Poste non renseigné')}<small>${esc(immLabel(i))}</small></div>
          <div><div class="bar-track"><div class="bar" style="width:${g.avant / maxPoste * 100}%"></div></div>
            <div class="bar-track mt"><div class="bar after" style="width:${g.apres / maxPoste * 100}%"></div></div></div>
          <div class="hbar-val">${g.gain > 0 ? `<b class="good">−${fmtDur(g.gain)}</b>` : '—'}<small>${fmtDur(g.avant)} → ${fmtDur(g.apres)}</small></div></div>`).join('')}</div>
    </div>

    <div class="card">
      <div class="card-head"><div><h2>Toutes les immersions${portfolioYear === 'all' ? '' : ' ' + esc(portfolioYear)}</h2></div>
        <button class="btn primary no-print" data-action="new-imm">+ Nouvelle immersion</button></div>
      <div class="table-wrap"><table class="imm-table">
        <thead><tr><th>Période</th><th>Service</th><th>Poste · personne</th><th>Avancement</th><th class="right">Tâches</th><th class="right">Temps analysé</th><th class="right">Gain / an</th><th>Personne clé*</th><th class="no-print"></th></tr></thead>
        <tbody>${rows.map(({ i, g, st }) => `<tr${state && i.id === state.id ? ' class="current"' : ''}>
          <td class="small">${i.mission.debut ? new Date(i.mission.debut).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '—'}</td>
          <td><b>${esc(i.mission.service || '—')}</b></td>
          <td>${esc(i.mission.poste || '—')}<div class="small muted">${esc(i.mission.personne)}</div></td>
          <td><span class="badge ${st.cls}">${st.label}</span><div class="progress"><div style="width:${st.pct}%"></div></div></td>
          <td class="right num">${i.taches.length}</td>
          <td class="right num">${fmtDur(g.avant)}</td>
          <td class="right num good"><b>${g.gain > 0 ? '−' + fmtDur(g.gain) : '—'}</b></td>
          <td class="small">${g.riskHautAvant} → ${g.riskHautApres}</td>
          <td class="actions-cell no-print"><button class="btn sm primary" data-action="open-imm" data-id="${i.id}">Ouvrir</button>
            <button class="btn sm" data-action="open-imm" data-id="${i.id}" data-to="#/4">Dossier</button>
            <button class="icon-btn danger" title="Supprimer" data-action="del-imm" data-id="${i.id}">✕</button></td></tr>`).join('')}
          <tr class="total"><td colspan="5"><b>Total</b></td><td class="right num"><b>${fmtDur(T.avant)}</b></td><td class="right num good"><b>−${fmtDur(Math.max(0, T.gain))}</b></td><td class="small">${T.riskHautAvant} → ${T.riskHautApres}</td><td class="no-print"></td></tr>
        </tbody></table></div>
      <p class="muted small" style="margin-top:8px">* Nombre de tâches à risque « personne clé » élevé, avant → après. Les gains ne comptent que les temps estimés par les personnes en phase 3.</p>
    </div>
    ${dataCard()}`;
}
function dataCard() {
  const folder = !FS_OK
    ? `<p class="muted">Ce navigateur ne permet pas l'enregistrement direct dans un dossier : utilise <b>Edge</b> ou <b>Chrome</b>. En attendant, exporte une sauvegarde chaque jour.</p>`
    : dirStatus === 'ok'
      ? `<p>✅ Connecté au dossier <b>« ${esc(dirHandle.name)} »</b>. Chaque immersion y a son sous-dossier avec <code>immersion.json</code> ; les PowerPoint, schémas et CSV y sont aussi déposés. Au prochain démarrage, le dossier est rechargé automatiquement.</p>
         <div class="actions"><button class="btn" data-action="connect-dir">Changer de dossier</button></div>`
      : dirStatus === 'needs-permission'
        ? `<p>Le dossier <b>« ${esc(dirHandle.name)} »</b> est mémorisé. Le navigateur demande ton accord pour le rouvrir.</p><div class="actions"><button class="btn primary" data-action="reconnect-dir">🔒 Ouvrir le dossier</button></div>`
        : `<p>Choisis <b>une seule fois</b> le dossier <code>donnees-production</code> situé à côté de <code>index.html</code> (par exemple sur le lecteur V:). Ensuite tout s'y enregistre automatiquement, un sous-dossier par poste, et il est rechargé à chaque démarrage.</p>
           ${dirStatus === 'error' ? `<p class="bad small">Dernière erreur : ${esc(dirError)}</p>` : ''}
           <div class="actions"><button class="btn primary" data-action="connect-dir">📁 Choisir le dossier de données</button></div>`;
  return `<div class="card no-print">
    <div class="card-head"><div><h2>Dossier de données</h2></div></div>
    ${folder}
  </div>
  <div class="card no-print">
    <div class="card-head"><div><h2>Sauvegarde</h2><p class="muted">Tout s'enregistre automatiquement dans ce navigateur, sur ce poste uniquement. Exporte une sauvegarde complète à la fin de chaque journée.</p></div></div>
    <div class="actions">
      <button class="btn${dirStatus === 'ok' ? '' : ' primary'}" data-action="export-json">⭳ Exporter la sauvegarde complète</button>
      <button class="btn" data-action="import-json">⭱ Importer (sauvegarde ou immersion)</button>
      <button class="btn" data-action="load-demo">Recharger la démo</button>
      <button class="btn danger" data-action="reset-all">Tout effacer</button>
    </div></div>`;
}

/* ---------- Accueil ---------- */
function viewAccueil() {
  const m = state.mission;
  return `
    <section class="hero">
      <h1>Accompagner une immersion, de la première tâche au dossier final</h1>
      <p>Le logiciel te guide en quatre temps. Pas besoin de connaître une méthode : réponds simplement aux questions, dans l'ordre.</p>
    </section>
    <div class="phase-cards">${PHASES.map(p => `
      <a class="phase-card" href="#/${p.n}">
        <div class="pc-n">${p.n}</div><h3>${p.titre}</h3>
        <div class="pc-when">${p.quand}</div><p>${p.but}</p></a>`).join('')}</div>

    <div class="card">
      <div class="card-head"><div><h2>Avant de commencer : la mission</h2><p class="muted">Quelques informations pour personnaliser les questions et le dossier final.</p></div></div>
      <div class="form-grid">
        ${field('Service', inp('mission', 'service', m.service, 'placeholder="ex : Gestion de la connaissance"'))}
        ${field('Prénom de la personne accompagnée', inp('mission', 'personne', m.personne, 'placeholder="ex : Sophie"'))}
        ${field('Son poste', inp('mission', 'poste', m.poste, 'placeholder="ex : Chargée de gestion de la connaissance"'))}
        ${field('Toi (qui mènes la mission)', inp('mission', 'analyste', m.analyste, 'placeholder="Ton nom"'))}
        ${field('Début de l\'immersion', inp('mission', 'debut', m.debut, 'type="date"'))}
        ${field('Fin de l\'immersion', inp('mission', 'fin', m.fin, 'type="date"'))}
        ${field('Contexte (pourquoi cette mission ?)', area('mission', 'contexte', m.contexte, 'rows="3" placeholder="ex : Reprise du poste, objectif : comprendre le travail actuel et identifier ce qui peut être simplifié."'), 'wide')}
      </div>
      <div class="actions" style="margin-top:16px"><a class="btn primary lg" href="#/1">Commencer l'immersion →</a></div>
    </div>

    <div class="card">
      <div class="card-head"><div><h2>Cette immersion</h2><p class="muted">Tout s'enregistre automatiquement dans ce navigateur. La sauvegarde complète (toutes les immersions) se fait depuis <a href="#/immersions">Mes immersions</a>.</p></div></div>
      <div class="actions">
        <button class="btn" data-action="export-imm">⭳ Exporter cette immersion seule</button>
        <button class="btn danger" data-action="del-imm" data-id="${state.id}">Supprimer cette immersion</button>
      </div>
      <p class="muted small" style="margin-top:12px">Calcul : temps par an = minutes par fois × nombre de fois par an (1 jour = 220 jours ouvrés, 1 semaine = 47, 1 mois = 12).
        Un ETP = ${numInp('settings', 'heuresEtp', db.settings.heuresEtp, 'class="tiny"')} heures par an. Coût horaire chargé : ${numInp('settings', 'coutHoraire', db.settings.coutHoraire, 'class="tiny"')} € / h.</p>
    </div>`;
}

/* ---------- Listes de tâches par phase ---------- */
function phaseHead(n, extra = '') {
  const p = PHASES[n - 1];
  return `<header class="phase-head">
    <div><div class="eyebrow">Phase ${n} · ${p.quand.replace('la personne', esc(who()))}</div><h1>${p.titre}</h1><p class="sub">${p.but.replace('la personne', esc(who()))}</p></div>
    ${extra ? `<div class="actions no-print">${extra}</div>` : ''}</header>`;
}
function statusBadge(t, phase) {
  if (phase === 1) return t.p1Done ? '<span class="badge ok">✓ Relevée</span>' : (t.steps.length || t.nom ? '<span class="badge warn">En cours</span>' : '<span class="badge">À relever</span>');
  if (phase === 2) return !t.p1Done ? '<span class="badge">Pas encore relevée</span>' : t.p2Done ? '<span class="badge ok">✓ Analysée</span>' : '<span class="badge warn">À analyser</span>';
  return !t.p2Done ? '<span class="badge">Pas encore analysée</span>' : t.p3Done ? '<span class="badge ok">✓ Validée</span>' : '<span class="badge warn">À valider</span>';
}

function viewPhaseList(n) {
  const ts = state.taches;
  const name = esc(who());
  const tips = {
    1: `<b>Comment faire :</b> demande à ${name} de te montrer son travail sur un cas réel. Crée une fiche par tâche et remplis-la de haut en bas, au fil de la démonstration.
        Une tâche finie ? Clique sur « Tâche relevée » et passe à la suivante.`,
    2: `<b>Comment faire :</b> reprends les tâches une par une. Le schéma montre où ça coince ; pour chaque étape en rouge, choisis une idée ou écris ta solution.
        <b>Ne mets pas de temps</b> : c'est ${name} qui les donnera en phase 3.`,
    3: `<b>Comment faire :</b> avec ${name}, présente chaque solution puis demande : « Avec ça, combien de temps ça te prendrait ? ».
        Note la réponse telle quelle. Termine par les questions sur les absences.`
  }[n];
  const eligible = t => n === 1 || (n === 2 ? t.p1Done : t.p2Done);
  const cards = ts.map((t, i) => {
    const s = taskStats(t);
    const ok = eligible(t);
    const meta = n === 1
      ? [t.freqQty ? `${esc(t.freqQty)} ${esc(PERIODES[t.freqPer].label)}` : 'Fréquence ?', plural(t.steps.length, 'étape'), s.avant ? fmtDur(s.avant) + ' / an' : '']
      : n === 2
        ? [plural(s.nbIrr, 'étape qui coince', 'étapes qui coincent'), plural(s.solutions, 'solution'), s.avant ? fmtDur(s.avant) + ' / an' : '']
        : [plural(s.solutions, 'solution'), `${s.validees} estimée${s.validees > 1 ? 's' : ''}`, s.gain > 0 ? `<b class="good">−${fmtDur(s.gain)} / an</b>` : ''];
    return `<a class="task-card${ok ? '' : ' disabled'}" href="${ok ? `#/${n}/${t.id}` : `#/${n === 2 ? 1 : 2}/${t.id}`}">
      <div class="tc-n">${i + 1}</div>
      <div class="tc-body"><div class="tc-title">${esc(t.nom || 'Tâche sans nom')}</div>
        ${t.description ? `<div class="tc-desc">${esc(t.description)}</div>` : ''}
        <div class="tc-meta">${meta.filter(Boolean).join(' · ')}</div></div>
      <div class="tc-side">${statusBadge(t, n)}<span class="tc-go">${ok ? 'Ouvrir →' : 'Terminer la phase précédente'}</span></div></a>`;
  }).join('');

  const next = {
    1: ts.length && ts.every(t => t.p1Done) ? `<a class="btn primary lg" href="#/2">Toutes les tâches sont relevées : passer à la réflexion →</a>` : '',
    2: ts.some(t => t.p1Done) && ts.filter(t => t.p1Done).every(t => t.p2Done) ? `<a class="btn primary lg" href="#/3">Toutes les tâches sont analysées : passer à la validation →</a>` : '',
    3: ts.some(t => t.p2Done) && ts.filter(t => t.p2Done).every(t => t.p3Done) ? `<a class="btn primary lg" href="#/4">Tout est validé : voir le dossier final →</a>` : ''
  }[n];

  return `
    ${phaseHead(n, n === 1 ? '<button class="btn primary lg" data-action="add-task">+ Nouvelle tâche</button>' : '')}
    <div class="tip">${tips}</div>
    ${ts.length ? `<div class="task-list">${cards}</div>`
      : `<div class="empty">Aucune tâche pour l'instant.<br>${n === 1 ? '<button class="btn primary lg" data-action="add-task">+ Relever une première tâche</button>' : '<a class="btn" href="#/1">Commencer par l\'immersion</a>'}</div>`}
    ${n === 1 && ts.length ? '<button class="add-big" data-action="add-task">+ Nouvelle tâche</button>' : ''}
    ${next ? `<div class="next-bar">${next}</div>` : ''}`;
}

/* ---------- Phase 1 : fiche d'immersion ---------- */
function peopleList() {
  const set = new Set();
  if (state.mission.personne) set.add(state.mission.personne);
  state.taches.forEach(t => t.steps.forEach(s => { if (s.qui) set.add(s.qui.trim()); }));
  return [...set];
}
function toolList() {
  const set = new Set();
  state.taches.forEach(t => t.steps.forEach(s => { if (s.outil) set.add(s.outil.trim()); }));
  return [...set];
}
function datalists() {
  return `<datalist id="dl-qui">${peopleList().map(a => `<option value="${esc(a)}">`).join('')}</datalist>
    <datalist id="dl-outils">${toolList().map(a => `<option value="${esc(a)}">`).join('')}</datalist>`;
}
function taskNav(t, n) {
  const i = state.taches.indexOf(t);
  return `<div class="crumbs no-print"><a href="#/${n}">← Toutes les tâches</a><span>Tâche ${i + 1} sur ${state.taches.length}</span></div>`;
}
function flagChips(s) {
  const c = FLAGS.filter(f => s[f.key]).map(f => `<span class="flag-chip ${f.short}" title="${f.nom}">${f.short}</span>`);
  if (attente(s) >= 1) c.push(`<span class="flag-chip A" title="Attente avant la suite">⏳ ${fmtDec(attente(s))} j</span>`);
  if (!c.length && String(s.precision || '').trim()) c.push('<span class="flag-chip X" title="Ça coince">!</span>');
  return c.join(' ');
}
function riskBadge(r) {
  return r ? `<span class="badge risk${r}">${RISQUES[r]}</span>` : '<span class="badge">À évaluer</span>';
}

function viewFiche1(t) {
  const s = taskStats(t);
  const name = esc(who());
  const steps = t.steps.map((st, i) => stepEditor(t, st, i)).join('');
  return `
    ${datalists()}
    ${taskNav(t, 1)}
    <div class="fiche">
      <div class="fiche-main">
        <h1 class="fiche-title">${esc(t.nom || 'Nouvelle tâche')}</h1>
        <p class="sub">Pose les questions dans l'ordre, en t'appuyant sur un cas réel que ${name} traite devant toi.</p>

        <section class="block">
          <h2 class="block-title"><span>A</span> La tâche</h2>
          ${question(1, 'Comment s\'appelle cette tâche ?', 'Un verbe + un objet. Exemple : « Mettre à jour une fiche procédure », « Répondre aux questions des agences ».',
            inp('t', 'nom', t.nom, 'class="big" placeholder="ex : Mettre à jour une fiche procédure"'))}
          ${question(2, 'En quoi consiste-t-elle ? À quoi sert-elle ?', 'Une ou deux phrases, avec les mots de ' + name + '.',
            area('t', 'description', t.description, 'rows="2" placeholder="ex : Quand une procédure change, je modifie la fiche, je la fais valider par l\'expert puis je la publie pour les agences."'))}
          ${question(3, 'Combien de fois la fais-tu ?', 'Une moyenne suffit. Exemple : 40 par mois, 10 par jour.',
            `<div class="inline">${numInp('t', 'freqQty', t.freqQty, 'class="w-num" placeholder="ex : 40"')}${chips('t', 'freqPer', t.freqPer, Object.fromEntries(Object.entries(PERIODES).map(([k, v]) => [k, v.label])))}</div>`)}
          ${question(4, 'Qu\'est-ce qui la déclenche ?', 'D\'où vient la demande. Exemple : « Un mail d\'une agence », « Le 1er du mois ».',
            inp('t', 'origine', t.origine, 'placeholder="ex : Une demande de mise à jour reçue par mail"'))}
          ${question(5, 'Qu\'est-ce que tu produis à la fin, et pour qui ?', 'Le résultat. Exemple : « La fiche publiée, pour les conseillers ».',
            inp('t', 'resultat', t.resultat, 'placeholder="ex : La fiche publiée et le demandeur prévenu"'))}
        </section>

        <section class="block">
          <h2 class="block-title"><span>B</span> Le déroulé, étape par étape</h2>
          <div class="tip">Demande : <b>« Que fais-tu en premier ? »</b> puis <b>« Et ensuite ? »</b> jusqu'au résultat.
            Pour chaque étape : qui la fait, avec quel outil, combien de minutes (sans compter l'attente), et ce qui coince.
            <span class="muted">Astuce : la touche Entrée dans une étape crée la suivante.</span></div>
          ${steps || `<div class="empty small">Aucune étape. Point de départ : « ${esc(t.origine || 'que se passe-t-il en premier ?')} ». Que fais-tu ensuite ?</div>`}
          <button class="add-big" data-action="add-step">+ ${t.steps.length ? 'Et ensuite ?' : 'Première étape'}</button>
        </section>

        <section class="block">
          <h2 class="block-title"><span>C</span> Ressenti, erreurs et absences</h2>
          ${question(6, 'Sur 5, à quel point cette tâche est-elle pénible pour toi ?', 'Le ressenti de ' + name + ' : répétitif, stressant, fastidieux…', chips('t', 'penibilite', t.penibilite, PENIBILITE))}
          ${question(7, 'Combien d\'erreurs ou de reprises par mois, environ ?', 'Dossiers à refaire, oublis, corrections demandées. 0 si aucune.',
            `<div class="inline nowrap">${numInp('t', 'erreurs', t.erreurs, 'class="w-num" placeholder="ex : 3"')}<span>par mois</span></div>`)}
          ${question(8, `En cas d'absence de ${name}, qui d'autre sait faire cette tâche ?`, 'Pour mesurer le risque « personne clé ».', chips('t', 'quiSait', t.quiSait, QUI_SAIT))}
          ${question(9, 'Existe-t-il un mode opératoire écrit ?', 'Une procédure, une fiche, une checklist qu\'un remplaçant pourrait suivre.', chips('t', 'modeOp', t.modeOp, MODE_OP))}
        </section>

        <section class="block">
          <h2 class="block-title"><span>D</span> Notes libres</h2>
          ${area('t', 'notes', t.notes, 'rows="3" placeholder="Ce qui a été dit, les cas particuliers, les idées qui te viennent…"')}
        </section>

        ${t.steps.length ? `<section class="block">
          <h2 class="block-title"><span>✓</span> Le schéma de la tâche</h2>
          <p class="muted small">Généré automatiquement. Montre-le à ${name} pour vérifier qu'il ne manque rien.</p>
          ${mapBlock(t, false, 'p1')}
          <div class="carto-ok${t.cartoValidee ? ' on' : ''}">
            ${toggle('t', 'cartoValidee', t.cartoValidee, t.cartoValidee ? `✓ Schéma validé avec ${name}` : `Faire valider le schéma par ${name}`)}
            ${t.cartoValidee ? `<label class="inline">le ${inp('t', 'cartoValideeLe', t.cartoValideeLe, 'type="date" class="w-date"')}</label>` : '<span class="muted small">Une fois le déroulé relu ensemble, clique ici.</span>'}
          </div>
        </section>` : ''}

        <div class="finish no-print">
          ${t.p1Done
            ? `<span class="badge ok">✓ Tâche relevée</span><button class="btn" data-action="undone" data-phase="1">Rouvrir</button><button class="btn primary lg" data-action="add-task">+ Tâche suivante</button>`
            : `<button class="btn primary lg" data-action="done" data-phase="1" data-next="new">✓ Tâche relevée — tâche suivante</button>
               <button class="btn lg" data-action="done" data-phase="1" data-next="list">✓ Tâche relevée — retour à la liste</button>`}
          <button class="btn ghost danger" data-action="del-task">Supprimer cette tâche</button>
        </div>
      </div>

      <aside class="recap">
        <h3>En résumé</h3>
        <div class="recap-row"><span>Une fois</span><b>${fmtDur(s.parFois)}</b></div>
        <div class="recap-row"><span>Fréquence</span><b>${fmtInt(volume(t))} / an</b></div>
        <div class="recap-row big"><span>Par an</span><b>${fmtDur(s.avant)}</b></div>
        <div class="recap-row"><span>Soit</span><b>${fmtEtp(s.avant)}</b></div>
        <div class="recap-row"><span>Étapes</span><b>${t.steps.length}</b></div>
        <div class="recap-row"><span>Qui coincent</span><b class="${s.nbIrr ? 'bad' : ''}">${s.nbIrr}</b></div>
        <div class="recap-row"><span>Temps qui coince</span><b class="${s.irrit ? 'bad' : ''}">${fmtDur(s.irrit)} / an</b></div>
        <div class="recap-row"><span>Attentes cumulées</span><b>${fmtJours(s.delaiAvant)}</b></div>
        <div class="recap-row"><span>Pénibilité</span><b>${fmtPen(s.penAvant)}</b></div>
        <div class="recap-row"><span>Erreurs</span><b>${t.erreurs !== '' ? fmtDec(num(t.erreurs)) + ' / mois' : '—'}</b></div>
        <div class="recap-row"><span>Personne clé</span>${riskBadge(s.riskAvant)}</div>
        <div class="recap-row"><span>Schéma validé</span>${t.cartoValidee ? '<span class="badge ok">✓ Oui</span>' : '<span class="badge">Pas encore</span>'}</div>
      </aside>
    </div>`;
}

function stepEditor(t, s, i) {
  const sc = 's:' + s.id;
  const others = t.steps.filter(x => x.id !== s.id).map(x => [x.id, `${t.steps.indexOf(x) + 1}. ${x.quoi || 'Sans nom'}`]);
  const open = openDetails.has(s.id) || taux(s) < 100 || s.controle;
  // les autres étapes, cibles possibles d'un choix
  return `
    <div class="step${isIrritant(s) ? ' irritant' : ''}" id="step-${s.id}" data-autofocus="1">
      <div class="step-n">${i + 1}</div>
      <div class="step-main">
        ${inp(sc, 'quoi', s.quoi, `class="big" placeholder="${i === 0 ? 'Que fais-tu en premier ? ex : Je lis la demande reçue par mail' : 'Et ensuite ? ex : Je recopie la demande dans le fichier Excel'}"`)}
        <div class="step-meta">
          <label>Qui ? ${inp(sc, 'qui', s.qui, `list="dl-qui" placeholder="ex : ${esc(state.mission.personne || 'Sophie')}, l'expert…"`)}</label>
          <label>Avec quoi ? ${inp(sc, 'outil', s.outil, 'list="dl-outils" placeholder="ex : Outlook, Excel…"')}</label>
          <label class="dur">Combien de temps ? <span class="inline nowrap">${numInp(sc, 'duree', s.duree, 'placeholder="0"')}<span>min</span></span></label>
        </div>
        <div class="step-meta two">
          <label>Quelles données ? <small>(facultatif)</small> ${inp(sc, 'donnees', s.donnees, 'placeholder="ex : nom du client, n° de dossier, montant…"')}</label>
          <label class="dur" title="Temps où le dossier attend (validation, retour d'un tiers…) avant l'étape suivante">Puis attente avant la suite ? <span class="inline nowrap">${numInp(sc, 'attente', s.attente, 'placeholder="0"')}<span>jours</span></span></label>
        </div>
        <div class="step-pb">
          <span class="lbl">Ce qui coince :</span>
          ${FLAGS.map(f => toggle(sc, f.key, s[f.key], `<span class="flag-chip ${f.short}">${f.short}</span> ${f.label}`, 'flag')).join('')}
        </div>
        ${inp(sc, 'precision', s.precision, 'class="soft" placeholder="Précise ce qui coince (facultatif) : ex : je recopie l\'objet et le demandeur déjà présents dans le mail"')}
        <details class="step-more" data-detail="${s.id}"${open ? ' open' : ''}>
          <summary>Cas particuliers</summary>
          <div class="more-row">Cette étape n'a lieu que dans ${numInp(sc, 'taux', s.taux, 'class="w-num" max="100"')} % des cas</div>
          <div class="more-row">${chk(sc, 'controle', s.controle, 'C\'est un choix ou une vérification : la suite dépend de la réponse')}</div>
          ${s.controle ? `<div class="more-row branch">
            Si ${inp(sc, 'labelSuite', s.labelSuite, 'class="w-lbl"')} → on continue à l'étape suivante ;
            si ${inp(sc, 'labelAutre', s.labelAutre, 'class="w-lbl"')} → on va à ${sel(sc, 'retour', s.retour, [['', '— choisir —'], ...others, [FIN, 'Fin de la tâche']])}
          </div>` : ''}
        </details>
      </div>
      <div class="step-act">
        <button class="icon-btn" title="Monter" data-action="move-step" data-id="${s.id}" data-dir="-1"${i === 0 ? ' disabled' : ''}>↑</button>
        <button class="icon-btn" title="Descendre" data-action="move-step" data-id="${s.id}" data-dir="1"${i === t.steps.length - 1 ? ' disabled' : ''}>↓</button>
        <button class="icon-btn" title="Insérer une étape juste après" data-action="add-step" data-after="${s.id}">+</button>
        <button class="icon-btn danger" title="Supprimer l'étape" data-action="del-step" data-id="${s.id}">✕</button>
      </div>
    </div>`;
}

/* ---------- Phase 2 : réflexion ---------- */
function ideasFor(s) {
  const list = [];
  FLAGS.forEach(f => { if (s[f.key]) list.push(...IDEES[f.key]); });
  if (attente(s) >= 1 && !s.suivi) list.push(...IDEES.suivi);
  list.push(...IDEES.general);
  return list;
}
function viewFiche2(t) {
  const s = taskStats(t);
  const irr = t.steps.filter(isIrritant);
  const others = t.steps.filter(x => !isIrritant(x));
  return `
    ${taskNav(t, 2)}
    <h1 class="fiche-title">${esc(t.nom || 'Tâche sans nom')}</h1>
    <p class="sub">${esc(t.description)}</p>
    <div class="strip">
      <div>Fréquence<b>${fmtInt(volume(t))} / an</b></div><div>Temps par an<b>${fmtDur(s.avant)}</b></div>
      <div>Étapes qui coincent<b class="bad">${s.nbIrr} · ${fmtDur(s.irrit)} / an</b></div>
      <div>Solutions proposées<b>${s.solutions}</b></div><div>Personne clé<span>${riskBadge(s.riskAvant)}</span></div>
    </div>
    <section class="block">
      <h2 class="block-title"><span>1</span> Le déroulé aujourd'hui</h2>
      ${mapBlock(t, false, 'p2', true)}
      ${t.notes ? `<div class="note"><b>Notes d'immersion :</b> ${esc(t.notes)}</div>` : ''}
    </section>
    <section class="block">
      <h2 class="block-title"><span>2</span> Les étapes qui coincent</h2>
      <p class="muted small">Pour chacune : clique sur une idée (elle remplit la solution) ou écris la tienne. Pas de temps ici : ${esc(who())} les estimera en phase 3.</p>
      ${irr.length ? irr.map(st => solEditor(t, st, true)).join('') : '<div class="empty small">Aucune étape signalée comme bloquante. Tu peux quand même améliorer les autres étapes ci-dessous.</div>'}
    </section>
    ${others.length ? `<section class="block">
      <h2 class="block-title"><span>3</span> Les autres étapes</h2>
      <p class="muted small">Elles ne coincent pas, mais une simplification reste possible.</p>
      ${others.map(st => solEditor(t, st, false)).join('')}
    </section>` : ''}
    <div class="finish no-print">
      ${t.p2Done
        ? `<span class="badge ok">✓ Analyse terminée</span><button class="btn" data-action="undone" data-phase="2">Rouvrir</button>${nextLink(2, t)}`
        : `<button class="btn primary lg" data-action="done" data-phase="2" data-next="next">✓ Analyse terminée — tâche suivante</button>`}
    </div>`;
}
function solEditor(t, s, irritant) {
  const sc = 's:' + s.id;
  const i = t.steps.indexOf(s) + 1;
  const head = `<div class="sol-head">
      <div><span class="step-n sm">${i}</span> <b>${esc(s.quoi || 'Étape sans nom')}</b> ${flagChips(s)}
        <div class="muted small">${esc(s.qui || NA)}${s.outil ? ' · ' + esc(s.outil) : ''} · ${fmtDec(num(s.duree))} min${taux(s) < 100 ? ` (${fmtDec(taux(s))} % des cas)` : ''} · <b>${fmtDur(num(s.duree) * stepOcc(t, s))} / an</b>${attente(s) ? ` · attente ${fmtJours(attente(s))}` : ''}</div>
        ${s.donnees ? `<div class="muted small">Données : ${esc(s.donnees)}</div>` : ''}
        ${s.precision ? `<div class="pb-text">« ${esc(s.precision)} »</div>` : ''}</div></div>`;
  if (!irritant && !hasSol(s) && !s.solOpen) {
    return `<div class="sol-card compact" id="sol-${s.id}">${head}<button class="btn sm" data-action="open-sol" data-id="${s.id}">+ Proposer une amélioration</button></div>`;
  }
  return `<div class="sol-card${irritant ? ' irritant' : ''}${hasSol(s) ? ' has' : ''}" id="sol-${s.id}">
    ${head}
    <div class="ideas"><span class="lbl">Idées :</span>${ideasFor(s).map(([, txt], k) =>
      `<button type="button" class="idea" data-action="idea" data-id="${s.id}" data-k="${k}">${esc(txt)}</button>`).join('')}</div>
    <label class="field"><span>Ta solution</span>${area(sc, 'sol', s.sol, 'rows="2" placeholder="ex : Un formulaire en ligne remplace le mail ; la demande arrive directement dans la liste de suivi."')}</label>
    <div class="sol-foot">
      <div class="lev"><span class="lbl">Type de solution :</span>${chips(sc, 'levier', s.levier, LEVIERS, 'small')}</div>
      <div class="flags">${chk(sc, 'tracabilite', s.tracabilite, 'Améliore la traçabilité')}${chk(sc, 'securise', s.securise, 'Sécurise un contrôle')}</div>
    </div>
  </div>`;
}
function nextLink(phase, t) {
  const n = nextTask(phase, t.id);
  return n ? `<a class="btn primary lg" href="#/${phase}/${n.id}">Tâche suivante : ${esc(n.nom || 'sans nom')} →</a>`
    : `<a class="btn primary lg" href="#/${phase + 1}">Passer à la phase ${phase + 1} →</a>`;
}

/* ---------- Phase 3 : validation ---------- */
function viewFiche3(t) {
  const s = taskStats(t);
  const name = esc(who());
  const sols = t.steps.filter(hasSol);
  const cards = sols.map(st => {
    const sc = 's:' + st.id;
    const i = t.steps.indexOf(st) + 1;
    const v = isValidated(st);
    const g = num(st.duree) - num(st.nouveauTemps);
    const sup = st.levier === 'supprimer';
    return `<div class="val-card${v ? ' ok' : ''}${st.avis === 'non' ? ' rejected' : ''}" id="val-${st.id}">
      <div class="val-step"><span class="step-n sm">${i}</span> <b>${esc(st.quoi)}</b> ${flagChips(st)}</div>
      <div class="val-grid">
        <div class="val-today"><div class="lbl">Aujourd'hui</div><div class="big-num">${fmtDec(num(st.duree))}<small> min</small></div></div>
        <div class="val-sol"><div class="lbl">Solution proposée${st.levier ? ' · ' + esc(LEVIERS[st.levier]) : ''}</div><div class="pre">${esc(st.sol || LEVIERS[st.levier])}</div></div>
        <div class="val-ask">
          <div class="ask-row"><div class="lbl">« Avec cette solution, combien de temps ça te prendrait ? »</div>
            <div class="inline nowrap">${numInp(sc, 'nouveauTemps', st.nouveauTemps, `class="w-num big" placeholder="${sup ? '0' : '?'}"`)}<span>min</span></div></div>
          ${sup ? '<div class="muted small">Étape supprimée : indique 0 si la suppression est confirmée.</div>' : ''}
          <div class="ask-row"><div class="lbl">« Combien de saisies, copier-coller ou clics en moins, à chaque fois ? »</div>
            <div class="inline nowrap">${numInp(sc, 'manipsEvitees', st.manipsEvitees, 'class="w-num" placeholder="?"')}<span>en moins</span></div></div>
          ${attente(st) ? `<div class="ask-row"><div class="lbl">« Et l'attente avant la suite ? » (aujourd'hui ${fmtJours(attente(st))})</div>
            <div class="inline nowrap">${numInp(sc, 'nouvelleAttente', st.nouvelleAttente, 'class="w-num" placeholder="?"')}<span>jours</span></div></div>` : ''}
        </div>
      </div>
      <div class="val-foot">
        <div><span class="lbl">Son avis :</span>${chips(sc, 'avis', st.avis, AVIS, 'small')}</div>
        <div class="val-gain">${String(st.nouveauTemps) === '' ? '<span class="muted">En attente de son estimation</span>'
          : st.avis === 'non' ? '<span class="muted">Non retenue : pas comptée dans les gains</span>'
          : `Gain : <b class="${g >= 0 ? 'good' : 'bad'}">${g >= 0 ? '−' : '+'}${fmtDec(Math.abs(g))} min par fois · ${g >= 0 ? '−' : '+'}${fmtDur(Math.abs(g) * stepOcc(t, st))} / an</b>${
            num(st.manipsEvitees) ? ` · <b>${fmtInt(stepManips(t, st))}</b> manipulations évitées / an` : ''}${
            delayValidated(st) && attente(st) ? ` · attente ${fmtJours(attente(st))} → <b>${fmtJours(num(st.nouvelleAttente))}</b>` : ''}`}</div>
      </div>
    </div>`;
  }).join('');

  return `
    ${taskNav(t, 3)}
    <h1 class="fiche-title">${esc(t.nom || 'Tâche sans nom')}</h1>
    <p class="sub">Présente chaque solution à ${name}. <b>C'est son estimation qui compte</b> : note le temps annoncé, sans le corriger.</p>
    <div class="fiche">
      <div class="fiche-main">
        <section class="block">
          <h2 class="block-title"><span>A</span> Les solutions, une par une</h2>
          ${cards || `<div class="empty small">Aucune solution proposée pour cette tâche.<br><a class="btn" href="#/2/${t.id}">Retour à la réflexion</a></div>`}
        </section>
        <section class="block">
          <h2 class="block-title"><span>B</span> Demain : ressenti, erreurs, absences</h2>
          <p class="muted small">Aujourd'hui : pénibilité ${fmtPen(num(t.penibilite))} · ${t.erreurs !== '' ? fmtDec(num(t.erreurs)) + ' erreurs / mois' : 'erreurs non renseignées'} · ${esc(QUI_SAIT[t.quiSait] || 'remplaçant non renseigné')} · mode opératoire : ${esc(MODE_OP[t.modeOp] || 'non renseigné')}.</p>
          ${question(1, 'Avec ces changements, la tâche serait pénible à combien sur 5 ?', 'Son ressenti, comme pour le temps.', chips('t', 'penibiliteApres', t.penibiliteApres, PENIBILITE))}
          ${question(2, 'Et combien d\'erreurs ou de reprises par mois ?', '',
            `<div class="inline nowrap">${numInp('t', 'erreursApres', t.erreursApres, 'class="w-num" placeholder="?"')}<span>par mois</span></div>`)}
          ${question(3, 'Avec ces changements, qui d\'autre pourrait faire cette tâche ?', 'Par exemple si le travail est mieux outillé ou documenté.', chips('t', 'quiSaitApres', t.quiSaitApres, QUI_SAIT))}
          ${question(4, 'Y aura-t-il un mode opératoire écrit ?', 'S\'il est prévu dans les solutions, réponds « Oui, à jour ».', chips('t', 'modeOpApres', t.modeOpApres, MODE_OP))}
          ${question(5, 'Remarques de ' + name, '', area('t', 'notesValidation', t.notesValidation, 'rows="2" placeholder="Son avis sur les solutions, ses conditions, ses craintes…"'))}
        </section>
        ${sols.length ? `<section class="block">
          <h2 class="block-title"><span>C</span> Le déroulé demain</h2>
          <p class="muted small">Seules les solutions estimées et non rejetées sont prises en compte.</p>
          ${mapBlock(t, true, 'p3')}
        </section>` : ''}
        <div class="finish no-print">
          ${t.p3Done
            ? `<span class="badge ok">✓ Validée avec ${name}</span><button class="btn" data-action="undone" data-phase="3">Rouvrir</button>${nextLink(3, t)}`
            : `<button class="btn primary lg" data-action="done" data-phase="3" data-next="next">✓ Validée avec ${name} — tâche suivante</button>`}
        </div>
      </div>
      <aside class="recap">
        <h3>Avant / après</h3>
        <div class="recap-row"><span>Aujourd'hui</span><b>${fmtDur(s.avant)} / an</b></div>
        <div class="recap-row"><span>Demain</span><b>${fmtDur(s.apres)} / an</b></div>
        <div class="recap-row big"><span>Temps gagné</span><b class="${s.gain >= 0 ? 'good' : 'bad'}">${s.gain >= 0 ? '−' : ''}${fmtDur(s.gain)}</b></div>
        <div class="recap-row"><span>Soit</span><b>${fmtEtp(Math.max(0, s.gain))}</b></div>
        <div class="recap-row"><span>Manipulations évitées</span><b>${fmtInt(s.manips)} / an</b></div>
        ${s.delaiAvant ? `<div class="recap-row"><span>Attentes cumulées</span><b>${fmtJours(s.delaiAvant)} → ${fmtJours(s.delaiApres)}</b></div>` : ''}
        <div class="recap-row"><span>Solutions estimées</span><b>${s.validees} / ${s.solutions}</b></div>
        <div class="recap-row"><span>Étapes supprimées</span><b>${s.supprimees}</b></div>
        <div class="recap-row"><span>Pénibilité</span><b>${fmtPen(s.penAvant)} → ${fmtPen(s.penApres)}</b></div>
        <div class="recap-row"><span>Erreurs évitées</span><b>${s.erreursEvitees ? fmtInt(s.erreursEvitees) + ' / an' : '—'}</b></div>
        <div class="recap-row"><span>Personne clé</span><span>${riskBadge(s.riskAvant)} → ${riskBadge(s.riskApres)}</span></div>
      </aside>
    </div>`;
}

/* ---------- Phase 4 : plan d'action et restitution ---------- */
// Toutes les solutions validées de l'immersion, triées par priorité puis par gain
function allActions(imm = state) {
  const list = [];
  imm.taches.forEach(t => t.steps.forEach(s => { if (isValidated(s)) list.push({ t, s, q: quadrant(t, s), g: stepGain(t, s) }); }));
  list.sort((a, b) => QUAD_ORDER.indexOf(a.q) - QUAD_ORDER.indexOf(b.q) || b.g - a.g);
  list.forEach((x, i) => { x.n = i + 1; });
  return list;
}
function phase4Tabs(active) {
  return `<div class="subtabs no-print">
    <a class="${active === 'plan' ? 'active' : ''}" href="#/4/plan">1. Plan d'action</a>
    <a class="${active === 'dossier' ? 'active' : ''}" href="#/4">2. Dossier de restitution</a></div>`;
}

function viewPlan() {
  const acts = allActions();
  const g = globalStats();
  const rows = acts.map(({ t, s, q, g: gain, n }) => {
    const sc = `ts:${t.id}:${s.id}`;
    const fait = s.statutAction === 'fait';
    const reel = isMeasured(s) ? (num(s.duree) - num(s.tempsReel)) * stepOcc(t, s) : null;
    return `<div class="act-card q-${q}" id="act-${s.id}">
      <div class="act-n">${n}</div>
      <div class="act-body">
        <div class="act-top">
          <div><b>${esc(s.sol || LEVIERS[s.levier] || 'Solution')}</b>
            <div class="muted small">${esc(t.nom)} · étape ${t.steps.indexOf(s) + 1} « ${esc(s.quoi)} » · ${esc(LEVIERS[s.levier] || '')}</div></div>
          <div class="act-gain"><span class="badge ${q}">${QUADRANTS[q]}</span><b class="good">−${fmtDur(gain)} / an</b></div>
        </div>
        <div class="act-fields">
          <div><span class="lbl">Effort</span>${chips(sc, 'effort', s.effort, EFFORTS, 'small')}</div>
          <label><span class="lbl">Qui porte ?</span>${inp(sc, 'porteur', s.porteur, 'placeholder="ex : DSI, équipe, manager…"')}</label>
          <label><span class="lbl">Pour quand ?</span>${inp(sc, 'echeance', s.echeance, 'type="date"')}</label>
          <div><span class="lbl">Statut</span>${chips(sc, 'statutAction', s.statutAction, STATUTS_ACTION, 'small')}</div>
        </div>
        <div class="act-cost">
          <label><span class="lbl">Charge interne</span><span class="inline nowrap">${numInp(sc, 'coutJours', s.coutJours, 'class="w-num" placeholder="0"')}<span>jours</span></span></label>
          <label><span class="lbl">Achats, licences, prestataire</span><span class="inline nowrap">${numInp(sc, 'coutEuros', s.coutEuros, 'class="w-num" placeholder="0"')}<span>€</span></span></label>
          <div class="cost-sum">${invest(s) ? `Coût ≈ <b>${fmtEur(invest(s))}</b> · gain ≈ <b>${fmtEur(eur(gain))} / an</b> · rentabilisé en <b>${fmtMois(payback(invest(s), gain))}</b>`
            : `Gain ≈ <b>${fmtEur(eur(gain))} / an</b> · indique le coût pour calculer le retour sur investissement`}</div>
        </div>
        ${fait ? `<div class="act-follow">
          <span class="lbl">Suivi après mise en place :</span> temps réel mesuré
          ${numInp(sc, 'tempsReel', s.tempsReel, 'class="w-num" placeholder="?"')} min (estimé : ${fmtDec(num(s.nouveauTemps))} min, avant : ${fmtDec(num(s.duree))} min)
          le ${inp(sc, 'dateMesure', s.dateMesure, 'type="date" class="w-date"')}
          ${reel != null ? `<span class="${reel >= gain ? 'good' : 'warn-text'}">→ gain réel <b>${fmtDur(reel)} / an</b> (${reel >= gain ? 'objectif atteint' : 'en dessous de l\'estimation'})</span>` : ''}
        </div>` : ''}
      </div></div>`;
  }).join('');
  return `
    ${phaseHead(4, `<a class="btn lg" href="#/4">Voir le dossier →</a>`)}
    ${phase4Tabs('plan')}
    <div class="tip"><b>Comment faire :</b> pour chaque solution validée, indique l'effort de mise en place, qui la porte et pour quand.
      La priorité se calcule toute seule (gain fort = au moins ${numInp('settings', 'seuilGain', db.settings.seuilGain, 'class="tiny"')} h par an).
      Coût horaire chargé utilisé pour les euros : ${numInp('settings', 'coutHoraire', db.settings.coutHoraire, 'class="tiny"')} € / h (1 jour = 7 h).
      Quand une solution est en place, passe-la en « En place » et note le <b>temps réel mesuré</b> quelques semaines plus tard : le dossier comparera estimé et réel.</div>
    <div class="kpis">
      ${kpi('Actions', `${g.actionsFaites} / ${acts.length}`, 'en place')}
      ${kpi('Gains rapides', acts.filter(a => a.q === 'quickwin').length, 'effort faible, gain fort', 'good')}
      ${kpi('Gain estimé', fmtDur(Math.max(0, g.gain)) + ' / an', `${fmtEtp(Math.max(0, g.gain))} · ≈ ${fmtEur(eur(Math.max(0, g.gain)))} / an`)}
      ${kpi('Investissement', g.invest ? fmtEur(g.invest) : '—', g.invest ? `rentabilisé en ${fmtMois(payback(g.invest, g.gain))}` : 'renseigne le coût des actions')}
      ${kpi('Gain mesuré', g.mesures ? fmtDur(g.gainReel) + ' / an' : '—', g.mesures ? `sur ${plural(g.mesures, 'action mesurée', 'actions mesurées')} (estimé : ${fmtDur(g.gainEstimeMesure)})` : 'aucune mesure pour l\'instant', g.mesures ? 'good' : '')}
    </div>
    ${acts.length ? `<div class="card"><div class="card-head"><div><h2>Matrice effort / gain</h2><p class="muted small">Les numéros renvoient aux actions ci-dessous. Commence par les gains rapides.</p></div></div>${matrixHtml(acts)}</div>
      <section class="block"><h2 class="block-title"><span>✓</span> Les actions</h2>${rows}</section>`
      : `<div class="empty">Aucune solution validée pour l'instant.<br><a class="btn" href="#/3">Aller à la validation</a></div>`}`;
}

function matrixHtml(acts) {
  const cell = (q, title) => `<div class="mcell ${q}"><h4>${title}</h4><div class="bubbles">${acts.filter(a => a.q === q).map(a =>
    `<a class="bubble" href="#/4/plan" title="${esc((a.s.sol || '') + ' — ' + fmtDur(a.g) + ' / an')}">${a.n}</a>`).join('')}</div></div>`;
  const todo = acts.filter(a => a.q === 'aevaluer');
  return `<div class="matrix">
    <div class="axis-y">Gain annuel ↑</div>
    ${cell('quickwin', 'Gains rapides')}${cell('planifier', 'À planifier')}${cell('structurant', 'Projets structurants')}
    ${cell('petit', 'Petits plus')}${cell('arbitrer', 'À arbitrer')}${cell('ecarter', 'À reconsidérer')}
    <div></div><div class="axis-x"><span>Effort faible</span><span>Effort moyen</span><span>Effort fort</span></div>
  </div>${todo.length ? `<p class="muted small" style="margin-top:8px">Effort à évaluer : ${todo.map(a => '#' + a.n).join(', ')}</p>` : ''}`;
}

function viewRestitution() { return asShown(restitutionHtml); }
function restitutionHtml() {
  const m = state.mission;
  const g = globalStats();
  const ts = state.taches;
  const acts = allActions();
  const pending = ts.filter(t => t.p1Done && !t.p3Done).length;
  const period = [m.debut, m.fin].filter(Boolean).map(d => new Date(d).toLocaleDateString('fr-FR')).join(' → ');
  const leves = FLAGS.reduce((a, f) => a + g.flagsLeves[f.key], 0);
  const avantFlags = FLAGS.reduce((a, f) => a + g.flagsAvant[f.key], 0);
  const max = Math.max(1, ...ts.map(t => taskStats(t).avant));
  const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '';

  const details = ts.filter(t => t.steps.length).map((t, k) => {
    const s = taskStats(t);
    const sols = t.steps.filter(hasSol);
    return `<section class="report-task">
      <div class="card">
        <div class="eyebrow">Tâche ${k + 1} · ${fmtInt(volume(t))} fois par an ${t.cartoValidee ? `<span class="badge ok">✓ Schéma validé par ${esc(who())}${t.cartoValideeLe ? ' le ' + fmtDate(t.cartoValideeLe) : ''}</span>` : '<span class="badge">Schéma non validé</span>'}</div>
        <h2>${esc(t.nom)}</h2>
        ${t.description ? `<p class="muted">${esc(t.description)}</p>` : ''}
        <div class="strip">
          <div>Aujourd'hui<b>${fmtDur(s.avant)} / an</b></div><div>Demain<b>${fmtDur(s.apres)} / an</b></div>
          <div>Temps gagné<b class="good">${fmtDur(Math.max(0, s.gain))} · ${pct(Math.max(0, s.gain), s.avant)}</b></div>
          <div>Manipulations évitées<b>${fmtInt(s.manips)} / an</b></div>
          ${s.delaiAvant ? `<div>Attentes cumulées<b>${fmtJours(s.delaiAvant)} → ${fmtJours(s.delaiApres)}</b></div>` : ''}
          ${s.penAvant ? `<div>Pénibilité<b>${fmtPen(s.penAvant)} → ${fmtPen(s.penApres)}</b></div>` : ''}
          ${t.erreurs !== '' ? `<div>Erreurs / mois<b>${fmtDec(num(t.erreurs))} → ${t.erreursApres !== '' ? fmtDec(num(t.erreursApres)) : '?'}</b></div>` : ''}
          <div>Étapes<b>${t.steps.length} → ${t.steps.length - s.supprimees}</b></div>
          <div>Personne clé<span>${riskBadge(s.riskAvant)} → ${riskBadge(s.riskApres)}</span></div>
        </div>
        <h3 class="h-sub">Aujourd'hui</h3>
        ${mapBlock(t, false, 'r' + k, false, true)}
        ${dataTable(t)}
        ${sols.length ? `<h3 class="h-sub">Ce qu'on change</h3>
        <div class="table-wrap"><table>
          <thead><tr><th>Étape</th><th>Ce qui coince</th><th>Solution</th><th class="right">Avant</th><th class="right">Après*</th><th class="right">Manip. évitées</th><th>Avis</th></tr></thead>
          <tbody>${sols.map(st => `<tr${st.avis === 'non' ? ' class="rejected"' : ''}>
            <td><b>${t.steps.indexOf(st) + 1}. ${esc(st.quoi)}</b></td>
            <td class="small">${flagChips(st)} ${esc(st.precision)}</td>
            <td class="small">${esc(st.sol || LEVIERS[st.levier])}${st.levier ? `<div class="muted">${esc(LEVIERS[st.levier])}${st.tracabilite ? ' · traçabilité' : ''}${st.securise ? ' · contrôle sécurisé' : ''}</div>` : ''}</td>
            <td class="right num">${fmtDec(num(st.duree))} min${attente(st) ? `<div class="small muted">+ ${fmtJours(attente(st))}</div>` : ''}</td>
            <td class="right num">${String(st.nouveauTemps) === '' ? '<span class="muted">à estimer</span>' : fmtDec(num(st.nouveauTemps)) + ' min'}${delayValidated(st) && attente(st) ? `<div class="small muted">+ ${fmtJours(num(st.nouvelleAttente))}</div>` : ''}</td>
            <td class="right num">${num(st.manipsEvitees) ? fmtDec(num(st.manipsEvitees)) + ' / fois' : '—'}</td>
            <td class="small">${esc(AVIS[st.avis] || '—')}</td></tr>`).join('')}</tbody>
        </table></div>
        <h3 class="h-sub">Demain</h3>
        ${mapBlock(t, true, 'rt' + k, false, true)}` : ''}
        ${t.notesValidation ? `<div class="note"><b>Remarques de ${esc(who())} :</b> ${esc(t.notesValidation)}</div>` : ''}
      </div></section>`;
  }).join('');

  return `
    <div class="report">
      ${phaseHead(4, `${toggle('settings', 'anonyme', db.settings.anonyme, db.settings.anonyme ? '🕶 Version anonyme' : '🕶 Anonymiser', 'anon')}<button class="btn lg" data-action="export-pptx">⭳ PowerPoint</button><button class="btn primary lg" data-action="print">🖶 Imprimer / PDF</button>`)}
      ${phase4Tabs('dossier')}
      ${db.settings.anonyme ? '<div class="tip no-print"><b>Version anonyme (vitrine) :</b> le prénom est remplacé par « Titulaire » et les remarques personnelles sont masquées, à l\'écran, à l\'impression et dans le PowerPoint.</div>' : ''}
      ${pending ? `<div class="tip warn no-print">${pending > 1 ? `${pending} tâches relevées ne sont pas encore validées` : '1 tâche relevée n\'est pas encore validée'} : seules les solutions déjà estimées comptent dans les gains.</div>` : ''}
      <div class="report-cover card">
        <div class="eyebrow">${esc(m.service || 'Diagnostic de poste')}${period ? ' · ' + esc(period) : ''}</div>
        <h2 class="cover-title">${esc(m.poste || 'Poste analysé')}${m.personne ? ' — ' + esc(m.personne) : ''}</h2>
        ${m.contexte ? `<p style="white-space:pre-line">${esc(m.contexte)}</p>` : ''}
        ${m.analyste ? `<p class="muted small">Mission menée par ${esc(m.analyste)}.</p>` : ''}
      </div>

      <div class="kpis">
        ${kpi('Temps gagné', fmtDur(Math.max(0, g.gain)) + ' / an', `${fmtEtp(Math.max(0, g.gain))} · ≈ ${fmtEur(eur(Math.max(0, g.gain)))} / an · ${pct(Math.max(0, g.gain), g.avant)} du temps`, 'good')}
        ${kpi('Manipulations évitées', fmtInt(g.manips), 'saisies, copier-coller, clics en moins par an', 'good')}
        ${kpi('Erreurs évitées', g.erreursEvitees ? fmtInt(g.erreursEvitees) : '—', 'erreurs ou reprises en moins par an', g.erreursEvitees ? 'good' : '')}
        ${kpi('Pénibilité moyenne', g.penN ? `${fmtDec(g.penMoyAvant)} → ${fmtDec(g.penMoyApres)}` : '—', 'sur 5, ressenti de la personne', g.penMoyApres < g.penMoyAvant ? 'good' : '')}
        ${kpi('Investissement', g.invest ? fmtEur(g.invest) : '—', g.invest ? `rentabilisé en ${fmtMois(payback(g.invest, g.gain))}` : 'coût des actions non renseigné')}
        ${kpi('Traçabilité / contrôles', `${g.tracab} / ${g.controles}`, 'solutions qui tracent · qui sécurisent un contrôle')}
        ${kpi('Irritants levés', `${leves} / ${avantFlags}`, FLAGS.map(f => `${g.flagsLeves[f.key]} ${f.nom.toLowerCase()}`).join(' · '))}
        ${kpi('Tâches simplifiées', `${g.simplifiees} / ${ts.length}`, `${plural(g.validees, 'solution validée', 'solutions validées')} · ${plural(g.supprimees, 'étape supprimée', 'étapes supprimées')}`)}
        ${kpi('Risque personne clé', `${g.riskHautAvant} → ${g.riskHautApres}`, `tâches à risque élevé · ${g.riskBaisse} en baisse`, g.riskHautApres < g.riskHautAvant ? 'good' : '')}
        ${g.mesures ? kpi('Gain mesuré', fmtDur(g.gainReel) + ' / an', `après mise en place · estimé : ${fmtDur(g.gainEstimeMesure)}`, 'good') : ''}
      </div>

      <div class="card">
        <div class="card-head"><div><h2>Vue d'ensemble des tâches</h2><p class="muted small">Temps annuel aujourd'hui (gris) et demain (bleu).</p></div></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Tâche</th><th class="right">Fréquence</th><th style="width:26%">Aujourd'hui → demain</th><th class="right">Avant</th><th class="right">Après</th><th class="right">Gain</th><th class="right">Manip. évitées</th><th>Personne clé</th></tr></thead>
          <tbody>${ts.map(t => { const s = taskStats(t); return `<tr>
            <td><b>${esc(t.nom || 'Sans nom')}</b>${t.p3Done ? '' : ' <span class="badge">non validée</span>'}</td>
            <td class="right num">${fmtInt(volume(t))} / an</td>
            <td><div class="bar-track"><div class="bar" style="width:${s.avant / max * 100}%"></div></div>
                <div class="bar-track mt"><div class="bar after" style="width:${s.apres / max * 100}%"></div></div></td>
            <td class="right num">${fmtDur(s.avant)}</td><td class="right num">${fmtDur(s.apres)}</td>
            <td class="right num good">${s.gain > 0 ? '−' + fmtDur(s.gain) : '—'}</td>
            <td class="right num">${s.manips ? fmtInt(s.manips) : '—'}</td>
            <td>${riskBadge(s.riskAvant)} → ${riskBadge(s.riskApres)}</td></tr>`; }).join('')}
            <tr class="total"><td><b>Total</b></td><td></td><td></td><td class="right num"><b>${fmtDur(g.avant)}</b></td><td class="right num"><b>${fmtDur(g.apres)}</b></td><td class="right num good"><b>−${fmtDur(Math.max(0, g.gain))}</b></td><td class="right num"><b>${fmtInt(g.manips)}</b></td><td></td></tr>
          </tbody></table></div>
        <p class="muted small" style="margin-top:10px">* Les temps « après » et les manipulations évitées ont été estimés par ${esc(who())}, lors de l'entretien de validation.</p>
      </div>

      ${acts.length ? `<div class="card">
        <div class="card-head"><div><h2>Plan d'action</h2><p class="muted small">Solutions validées, par priorité. <a class="no-print" href="#/4/plan">Modifier le plan</a></p></div></div>
        ${matrixHtml(acts)}
        <div class="table-wrap" style="margin-top:14px"><table>
          <thead><tr><th>#</th><th>Solution</th><th>Tâche</th><th>Priorité</th><th>Effort</th><th>Porteur</th><th>Échéance</th><th>Statut</th><th class="right">Coût</th><th class="right">Retour</th><th class="right">Gain estimé</th><th class="right">Gain mesuré</th></tr></thead>
          <tbody>${acts.map(({ t, s, q, g: gain, n }) => `<tr>
            <td class="num">${n}</td><td><b>${esc(s.sol || LEVIERS[s.levier])}</b></td><td class="small">${esc(t.nom)}</td>
            <td><span class="badge ${q}">${QUADRANTS[q]}</span></td><td class="small">${esc(EFFORTS[s.effort] || '—')}</td>
            <td class="small">${esc(s.porteur || '—')}</td><td class="small">${fmtDate(s.echeance) || '—'}</td>
            <td class="small">${esc(STATUTS_ACTION[s.statutAction] || 'À lancer')}</td>
            <td class="right num">${invest(s) ? fmtEur(invest(s)) : '—'}</td><td class="right num small">${fmtMois(payback(invest(s), gain))}</td>
            <td class="right num good">${fmtDur(gain)}</td>
            <td class="right num">${isMeasured(s) ? fmtDur((num(s.duree) - num(s.tempsReel)) * stepOcc(t, s)) : '—'}</td></tr>`).join('')}</tbody>
        </table></div>
      </div>` : ''}
      ${details}
    </div>`;
}
// Données manipulées et outils, étape par étape (demande explicite du cadrage)
function dataTable(t) {
  const rows = t.steps.filter(s => s.donnees || s.outil);
  if (!rows.length) return '';
  return `<details class="data-table" open><summary class="h-sub">Données et outils utilisés</summary>
    <div class="table-wrap"><table><thead><tr><th>Étape</th><th>Qui</th><th>Outil</th><th>Données</th><th class="right">Durée</th><th class="right">Attente</th></tr></thead>
    <tbody>${t.steps.map((s, i) => `<tr><td>${i + 1}. ${esc(s.quoi)}</td><td class="small">${esc(s.qui)}</td><td class="small">${esc(s.outil || '—')}</td>
      <td class="small">${esc(s.donnees || '—')}</td><td class="right num">${fmtDec(num(s.duree))} min</td><td class="right num">${attente(s) ? fmtJours(attente(s)) : '—'}</td></tr>`).join('')}</tbody></table></div></details>`;
}
function kpi(label, value, hint, cls = '') {
  return `<div class="kpi ${cls}"><div class="label">${label}</div><div class="value">${value}</div><div class="hint">${hint}</div></div>`;
}

/* ---------- Bloc schéma (diagramme + boutons) ---------- */
function mapBlock(t, tobe, key, withCsv = false, report = false) {
  const steps = mapSteps(t, tobe);
  if (!steps.length) return '<div class="empty small">Aucune étape à afficher.</div>';
  const svg = renderMap(t, steps);
  if (report) return `<div class="map-wrap fit">${svg}</div>`;
  return `<div class="map-tools no-print">
      <button class="btn sm" data-action="toggle-fit">${fitMaps ? '⤢ Taille réelle' : '⤡ Vue d\'ensemble'}</button>
      <button class="btn sm" data-action="export-png" data-tobe="${tobe ? 1 : ''}">⭳ Image PNG</button>
      <button class="btn sm" data-action="export-svg" data-tobe="${tobe ? 1 : ''}">⭳ SVG</button>
      ${withCsv ? '<button class="btn sm" data-action="export-csv" title="Ouvrir dans Excel, puis Visio › Data Visualizer">⭳ CSV pour Visio</button>' : ''}
    </div>
    <div class="map-wrap${fitMaps ? ' fit' : ''}" data-scroll-key="${key}">${svg}</div>
    ${mapLegend(tobe)}`;
}
function mapLegend(tobe) {
  return `<div class="map-legend">
    <span>${miniSvg('start')} Début</span><span>${miniSvg('end')} Fin</span><span>${miniSvg('tache')} Étape</span>
    <span>${miniSvg('decision')} Choix / vérification</span><span class="lg-wait">⏳ Attente (jours)</span>${tobe ? `<span>${miniSvg('auto')} Automatisée</span>` : ''}
    ${FLAGS.map(f => `<span><span class="flag-chip ${f.short}">${f.short}</span> ${f.nom}</span>`).join('')}
    ${tobe ? '<span><span class="flag-chip ok">✓</span> Étape améliorée</span>' : ''}
    <span class="muted">Un couloir = une personne. Clique sur une étape pour la retrouver.</span>
  </div>`;
}

/* ==========================================================================
   Schéma BPMN simplifié en couloirs (SVG autonome, exportable)
   ========================================================================== */
const C = {
  ink: '#1d2433', muted: '#5b6578', line: '#4a5568', laneHead: '#e9eef6', laneA: '#ffffff', laneB: '#f7f9fc', laneLine: '#d5dbe5',
  irrFill: '#fdeceb', irr: '#c8372d', okFill: '#e8f6ee', ok: '#1d8a5a', autoFill: '#eaf1fd', auto: '#2457c5',
  decFill: '#fff6e5', dec: '#b45309', start: '#1d8a5a', alt: '#b45309'
};

// Étapes à dessiner : actuelles, ou cible (solutions validées appliquées)
function mapSteps(t, tobe) {
  const out = [];
  t.steps.forEach((s, i) => {
    const v = tobe && isValidated(s);
    if (v && s.levier === 'supprimer') return;
    const duree = v ? num(s.nouveauTemps) : num(s.duree);
    out.push({
      id: s.id, n: i + 1, nom: s.quoi, acteur: s.qui, outil: s.outil, donnees: s.donnees,
      duree, taux: taux(s), annual: duree * stepOcc(t, s),
      attente: tobe ? newAttente(s) : attente(s), attenteAvant: attente(s),
      labelSuite: s.labelSuite || 'Oui', labelAutre: s.labelAutre || 'Non',
      type: s.controle ? 'decision' : (v && s.levier === 'automatiser') ? 'auto' : 'tache',
      ressaisie: !v && s.ressaisie, manuel: !v && s.manuel, suivi: !v && s.suivi, precision: v ? '' : s.precision,
      improved: v, gain: v ? num(s.duree) - num(s.nouveauTemps) : 0, sol: v ? s.sol : '',
      cible: s.controle ? s.retour : ''
    });
  });
  const kept = new Set(out.map(s => s.id));
  out.forEach(c => {
    if (c.cible && c.cible !== FIN && !kept.has(c.cible)) {
      const idx = t.steps.findIndex(s => s.id === c.cible);
      const next = t.steps.slice(idx + 1).find(s => kept.has(s.id));
      c.cible = next ? next.id : '';
    }
  });
  return out;
}

function wrapText(txt, max, maxLines) {
  const words = String(txt || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  words.forEach(w => {
    if (!cur) cur = w;
    else if ((cur + ' ' + w).length <= max) cur += ' ' + w;
    else { lines.push(cur); cur = w; }
  });
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const out = lines.slice(0, maxLines);
    out[maxLines - 1] = out[maxLines - 1].slice(0, max - 1) + '…';
    return out;
  }
  return lines;
}
function svgLines(x, y, lines, o = {}) {
  const lh = o.lh || 13;
  const y0 = o.center ? y - (lines.length - 1) * lh / 2 : y;
  return `<text x="${x}" y="${y0}" text-anchor="${o.anchor || 'middle'}" font-size="${o.size || 11.5}" fill="${o.fill || C.ink}"${o.weight ? ` font-weight="${o.weight}"` : ''}>${lines.map((l, i) =>
    `<tspan x="${x}" dy="${i ? lh : 0}">${esc(l)}</tspan>`).join('')}</text>`;
}
function shapeIcon(type, x, y) {
  if (type === 'auto') {
    return `<g fill="none" stroke="${C.auto}"><circle cx="${x}" cy="${y}" r="4.6" stroke-width="2.6" stroke-dasharray="2 1.6"/><circle cx="${x}" cy="${y}" r="1.6" stroke-width="1.2"/></g>`;
  }
  return `<g fill="none" stroke="${C.muted}" stroke-width="1.3"><circle cx="${x}" cy="${y - 2.5}" r="2.6"/><path d="M${x - 4.5} ${y + 5} a4.5 4.5 0 0 1 9 0"/></g>`;
}

function renderMap(t, steps) {
  const id = 'mk' + (++mapSeq);
  const lanes = [];
  steps.forEach(s => { const a = (s.acteur || '').trim() || NA; if (!lanes.includes(a)) lanes.push(a); });
  const HEAD = 132, COL = 152, LANE = 132, BW = 122, BH = 58, DR = 28, ER = 17;
  const n = steps.length;
  const loops = [];
  steps.forEach((s, i) => {
    if (s.type !== 'decision' || !s.cible) return;
    const k = s.cible === FIN ? n : steps.findIndex(x => x.id === s.cible);
    if (k >= 0 && k !== i + 1) loops.push({ i, t: k });
  });
  const LH = lanes.length * LANE;
  const H = LH + (loops.length ? 16 + loops.length * 14 : 0);
  const W = HEAD + (n + 2) * COL;
  const li = a => Math.max(0, lanes.indexOf((a || '').trim() || NA));
  const X = c => HEAD + c * COL + COL / 2;
  const Y = l => l * LANE + LANE / 2;

  const nodes = [
    { k: 'start', x: X(0), y: Y(li(steps[0].acteur)) },
    ...steps.map((s, i) => ({ k: s.type, s, i, x: X(i + 1), y: Y(li(s.acteur)) })),
    { k: 'end', x: X(n + 1), y: Y(li(steps[n - 1].acteur)) }
  ];
  const round = k => k === 'start' || k === 'end';
  const hw = nd => nd.k === 'decision' ? DR : round(nd.k) ? ER : BW / 2;
  const hh = nd => nd.k === 'decision' ? DR : round(nd.k) ? ER : BH / 2;

  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Roboto, Arial, sans-serif">`);
  o.push(`<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C.line}"/></marker>
    <marker id="${id}b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C.alt}"/></marker></defs>`);
  o.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>`);

  // Couloirs : une ligne par personne
  lanes.forEach((name, l) => {
    o.push(`<rect x="0" y="${l * LANE}" width="${W}" height="${LANE}" fill="${l % 2 ? C.laneB : C.laneA}" stroke="${C.laneLine}"/>`);
    o.push(`<rect x="0" y="${l * LANE}" width="${HEAD - 12}" height="${LANE}" fill="${C.laneHead}" stroke="${C.laneLine}"/>`);
    o.push(svgLines((HEAD - 12) / 2, Y(l) + 4, wrapText(name, 15, 3), { center: true, weight: 600, size: 12 }));
  });

  // Enchaînement des étapes
  for (let k = 0; k < nodes.length - 1; k++) {
    const a = nodes[k], b = nodes[k + 1];
    const x1 = a.x + hw(a), y1 = a.y, x2 = b.x - hw(b), y2 = b.y;
    const d = y1 === y2 ? `M${x1} ${y1} H${x2}` : `M${x1} ${y1} H${(x1 + x2) / 2} V${y2} H${x2}`;
    o.push(`<path d="${d}" fill="none" stroke="${C.line}" stroke-width="1.4" marker-end="url(#${id})"/>`);
    if (a.k === 'decision') o.push(`<text x="${x1 + 5}" y="${y1 - 6}" font-size="10.5" fill="${C.muted}">${esc(a.s.labelSuite)}</text>`);
    // Attente avant l'étape suivante, affichée sur la flèche
    if (a.s && a.s.attente > 0) {
      const red = a.s.attente < a.s.attenteAvant ? ` (−${fmtDec(a.s.attenteAvant - a.s.attente)})` : '';
      const lx = y1 === y2 ? (x1 + x2) / 2 : (x1 + x2) / 2 + 4;
      o.push(`<text x="${lx}" y="${y1 === y2 ? y1 + 15 : y1 + 15}" text-anchor="${y1 === y2 ? 'middle' : 'start'}" font-size="10" font-weight="600" fill="${C.alt}">⏳ ${fmtDec(a.s.attente)} j${red}</text>`);
    }
  }
  // Retours des vérifications (passent sous les couloirs)
  loops.forEach((lp, k) => {
    const a = nodes[lp.i + 1], tg = nodes[lp.t + 1];
    const gy = LH + 10 + k * 14;
    const tx = tg.k === 'decision' ? tg.x : tg.x + BW / 2 - 12;
    o.push(`<path d="M${a.x} ${a.y + DR} V${gy} H${tx} V${tg.y + hh(tg)}" fill="none" stroke="${C.alt}" stroke-width="1.4" stroke-dasharray="5 3" marker-end="url(#${id}b)"/>`);
    o.push(`<text x="${a.x + 6}" y="${a.y + DR + 26}" font-size="10.5" fill="${C.alt}" font-weight="600">${esc(a.s.labelAutre)}</text>`);
  });

  nodes.forEach(nd => {
    if (round(nd.k)) {
      const isStart = nd.k === 'start';
      o.push(`<circle cx="${nd.x}" cy="${nd.y}" r="${ER}" fill="#fff" stroke="${isStart ? C.start : C.ink}" stroke-width="${isStart ? 2 : 4}"/>`);
      o.push(svgLines(nd.x, nd.y + ER + 15, wrapText((isStart ? t.origine : t.resultat) || (isStart ? 'Début' : 'Fin'), 20, 3), { size: 10.5, fill: C.muted }));
      return;
    }
    const s = nd.s;
    const irr = isIrritant(s);
    const tip = [`${s.n}. ${s.nom}`, `Qui : ${s.acteur || NA}`, s.outil && `Outil : ${s.outil}`, s.donnees && `Données : ${s.donnees}`,
      s.attente && `Puis attente : ${fmtDec(s.attente)} j`,
      `Durée : ${fmtDec(s.duree)} min${s.taux < 100 ? ` (${fmtDec(s.taux)} % des cas)` : ''} · ${fmtDur(s.annual)} / an`,
      s.precision && `Ce qui coince : ${s.precision}`, s.sol && `Solution : ${s.sol}`].filter(Boolean).join('\n');
    const g = [`<g data-step="${s.id}" style="cursor:pointer"><title>${esc(tip)}</title>`];
    const durTxt = `${fmtDec(s.duree)} min${s.taux < 100 ? ` · ${fmtDec(s.taux)} %` : ''}`;
    const top = nd.y - BH / 2;

    if (nd.k === 'decision') {
      g.push(`<polygon points="${nd.x},${nd.y - DR} ${nd.x + DR},${nd.y} ${nd.x},${nd.y + DR} ${nd.x - DR},${nd.y}" fill="${irr ? C.irrFill : C.decFill}" stroke="${irr ? C.irr : C.dec}" stroke-width="1.6"/>`);
      g.push(`<text x="${nd.x}" y="${nd.y + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="${C.dec}">?</text>`);
      const lines = wrapText(s.nom, 22, 2);
      g.push(svgLines(nd.x, nd.y - DR - 7 - (lines.length - 1) * 13, lines, { size: 10.5, weight: 600 }));
      if (s.duree > 0) g.push(`<text x="${nd.x + DR + 4}" y="${nd.y + 16}" font-size="10" fill="${C.muted}">${esc(durTxt)}</text>`);
    } else {
      const x0 = nd.x - BW / 2, y0 = top;
      let fill = '#fff', stroke = C.muted;
      if (s.improved) { fill = C.okFill; stroke = C.ok; }
      else if (irr) { fill = C.irrFill; stroke = C.irr; }
      if (nd.k === 'auto') { fill = C.autoFill; stroke = C.auto; }
      g.push(`<rect x="${x0}" y="${y0}" width="${BW}" height="${BH}" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`);
      g.push(shapeIcon(nd.k, x0 + 11, y0 + 11));
      g.push(`<text x="${x0 + BW - 7}" y="${y0 + 13}" text-anchor="end" font-size="9.5" fill="${C.muted}">${s.n}</text>`);
      g.push(svgLines(nd.x, nd.y + 8, wrapText(s.nom, 18, 3), { center: true, size: 11.2 }));
      const gainTxt = s.gain > 0 ? ` (−${fmtDec(s.gain)})` : '';
      g.push(`<text x="${nd.x}" y="${y0 + BH + 13}" text-anchor="middle" font-size="10.5" fill="${s.gain > 0 ? C.ok : C.ink}" font-weight="600">${esc(durTxt + gainTxt)}</text>`);
      if (s.outil) g.push(`<text x="${nd.x}" y="${y0 + BH + 25}" text-anchor="middle" font-size="10" fill="${C.muted}">${esc(wrapText(s.outil, 24, 1)[0] || '')}</text>`);
    }

    // Pastilles au-dessus de la forme : ce qui coince / amélioré
    const marks = FLAGS.filter(f => s[f.key]).map(f => ({ t: f.short, c: f.color }));
    if (!marks.length && String(s.precision || '').trim()) marks.push({ t: '!', c: C.irr });
    if (s.improved) marks.push({ t: '✓', c: C.ok });
    if (marks.length) {
      const cw = 17, gap = 3, total = marks.length * cw + (marks.length - 1) * gap;
      // Vérification : pastilles à gauche du losange (le libellé occupe le dessus)
      let cx = nd.k === 'decision' ? nd.x - DR - total - 4 : nd.x - total / 2;
      const cy = nd.k === 'decision' ? nd.y - 24 : top - 18;
      marks.forEach(ch => {
        g.push(`<rect x="${cx}" y="${cy}" width="${cw}" height="14" rx="3" fill="${ch.c}"/><text x="${cx + cw / 2}" y="${cy + 10.5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff">${ch.t}</text>`);
        cx += cw + gap;
      });
    }
    g.push('</g>');
    o.push(g.join(''));
  });
  o.push('</svg>');
  return o.join('');
}

function miniSvg(kind, size = 22) {
  const s = size, c = s / 2;
  let body;
  switch (kind) {
    case 'start': body = `<circle cx="${c}" cy="${c}" r="${s * .36}" fill="#fff" stroke="${C.start}" stroke-width="2"/>`; break;
    case 'end': body = `<circle cx="${c}" cy="${c}" r="${s * .34}" fill="#fff" stroke="${C.ink}" stroke-width="3.2"/>`; break;
    case 'decision': body = `<polygon points="${c},2 ${s - 2},${c} ${c},${s - 2} 2,${c}" fill="${C.decFill}" stroke="${C.dec}" stroke-width="1.5"/>`; break;
    default: {
      const stroke = kind === 'auto' ? C.auto : C.muted, fill = kind === 'auto' ? C.autoFill : '#fff';
      body = `<rect x="1.5" y="${s * .2}" width="${s - 3}" height="${s * .6}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`;
    }
  }
  return `<svg width="${s}" height="${s}" viewBox="0 0 ${s} ${s}" aria-hidden="true">${body}</svg>`;
}

/* ==========================================================================
   Exports
   ========================================================================== */
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
const mapFileName = (t, tobe, ext) => `${slug(t.nom)}-${tobe ? 'demain' : 'aujourd-hui'}.${ext}`;
function exportSvg(t, tobe) {
  const svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + renderMap(t, mapSteps(t, tobe));
  saveFile(new Blob([svg], { type: 'image/svg+xml' }), mapFileName(t, tobe, 'svg'));
}
function svgToPng(svg) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      resolve({ canvas, data: canvas.toDataURL('image/png'), w: img.width, h: img.height });
    };
    img.onerror = reject;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}
function exportPng(t, tobe) {
  svgToPng(renderMap(t, mapSteps(t, tobe)))
    .then(({ canvas }) => canvas.toBlob(b => {
      if (b) saveFile(b, mapFileName(t, tobe, 'png'));
      else toast('Export image impossible dans ce navigateur : utilise le SVG.');
    }, 'image/png'))
    .catch(() => toast('Export image impossible : utilise le SVG.'));
}

// Dossier de restitution au format PowerPoint (bibliothèque locale lib/pptxgen.bundle.js)
async function exportPptx() {
  if (typeof PptxGenJS === 'undefined') {
    toast('Module PowerPoint introuvable : garde le dossier « lib » à côté de index.html.');
    return;
  }
  toast('Préparation du PowerPoint…');
  const real = state;
  if (db.settings.anonyme) state = anonClone(real);
  try { await buildPptx(); } finally { state = real; }
}
async function buildPptx() {
  const m = state.mission, g = globalStats(), ts = state.taches.filter(t => t.steps.length), acts = allActions();
  const F = 'Segoe UI', INK = '1D2433', MUTED = '5B6578', OK = '1D8A5A', DARK = '16203A', LINE = 'E1E6EE', W = 13.33;
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = 'Restitution — ' + immLabel(state);
  const period = [m.debut, m.fin].filter(Boolean).map(d => new Date(d).toLocaleDateString('fr-FR')).join(' → ');
  const base = { fontFace: F, color: INK };
  const head = (sl, txt, sub) => {
    sl.addText(txt, { ...base, x: 0.5, y: 0.3, w: W - 1, h: 0.6, fontSize: 24, bold: true });
    if (sub) sl.addText(sub, { ...base, x: 0.5, y: 0.88, w: W - 1, h: 0.45, fontSize: 13, color: MUTED, fit: 'shrink' });
    sl.addText(`${m.service || ''}${m.poste ? ' · ' + m.poste : ''}`, { ...base, x: 0.5, y: 7.05, w: W - 1, h: 0.3, fontSize: 9, color: '8A93A5' });
  };
  const th = txt => ({ text: txt, options: { bold: true, color: 'FFFFFF', fill: { color: DARK } } });
  const tableOpts = (colW, y = 1.4) => ({ ...base, x: 0.5, y, w: W - 1, colW, fontSize: 11, valign: 'middle',
    border: { type: 'solid', pt: 0.5, color: LINE }, autoPage: true, autoPageRepeatHeader: true, autoPageSlideStartY: 0.6 });
  const addImage = (sl, img, y, maxH) => {
    const ratio = img.w / img.h;
    let w = W - 1, h = w / ratio;
    if (h > maxH) { h = maxH; w = h * ratio; }
    sl.addImage({ data: img.data, x: (W - w) / 2, y, w, h });
  };

  // 1. Couverture
  let sl = pptx.addSlide();
  sl.background = { color: DARK };
  sl.addText(m.service || 'Diagnostic de poste', { fontFace: F, x: 0.8, y: 1.9, w: 11.7, h: 0.5, fontSize: 16, color: '93A0BB' });
  sl.addText(`${m.poste || 'Poste analysé'}${m.personne ? ' — ' + m.personne : ''}`, { fontFace: F, x: 0.8, y: 2.4, w: 11.7, h: 1.3, fontSize: 34, bold: true, color: 'FFFFFF' });
  sl.addText('Immersion, cartographie des tâches et pistes d\'amélioration', { fontFace: F, x: 0.8, y: 3.7, w: 11.7, h: 0.5, fontSize: 18, color: 'C4CDE0' });
  sl.addText([period, m.analyste && 'Mission menée par ' + m.analyste].filter(Boolean).join('   ·   '), { fontFace: F, x: 0.8, y: 5.9, w: 11.7, h: 0.4, fontSize: 12, color: '93A0BB' });

  // 2. Chiffres clés
  sl = pptx.addSlide();
  head(sl, 'Ce que l\'immersion apporte', m.contexte ? (c => c.length > 130 ? c.slice(0, 129) + '…' : c)(m.contexte.split('\n')[0]) : '');
  const leves = FLAGS.reduce((a, f) => a + g.flagsLeves[f.key], 0), avantFlags = FLAGS.reduce((a, f) => a + g.flagsAvant[f.key], 0);
  [
    ['Temps gagné', fmtDur(Math.max(0, g.gain)) + ' / an', `${fmtEtp(Math.max(0, g.gain))} · ≈ ${fmtEur(eur(Math.max(0, g.gain)))} / an · ${pct(Math.max(0, g.gain), g.avant)} du temps`, OK],
    ['Manipulations évitées', fmtInt(g.manips), `par an · ${g.erreursEvitees ? fmtInt(g.erreursEvitees) + ' erreurs évitées / an' : 'saisies, copier-coller, clics en moins'}`, OK],
    ['Irritants levés', `${leves} / ${avantFlags}`, FLAGS.map(f => `${g.flagsLeves[f.key]} ${f.nom.toLowerCase()}`).join(' · '), INK],
    ['Pénibilité moyenne', g.penN ? `${fmtDec(g.penMoyAvant)} → ${fmtDec(g.penMoyApres)}` : '—', 'sur 5, ressenti de la personne', g.penMoyApres < g.penMoyAvant ? OK : INK],
    ['Investissement', g.invest ? fmtEur(g.invest) : '—', g.invest ? `rentabilisé en ${fmtMois(payback(g.invest, g.gain))}` : 'coût des actions non renseigné', INK],
    ['Risque personne clé', `${g.riskHautAvant} → ${g.riskHautApres}`, 'tâches à risque élevé, avant → après', g.riskHautApres < g.riskHautAvant ? OK : INK]
  ].forEach(([label, value, hint, color], i) => {
    const x = 0.5 + (i % 3) * 4.15, y = 1.6 + Math.floor(i / 3) * 2.6;
    sl.addShape(pptx.ShapeType.roundRect, { x, y, w: 3.95, h: 2.3, fill: { color: 'F4F6F9' }, line: { color: LINE }, rectRadius: 0.08 });
    sl.addText(label.toUpperCase(), { ...base, x: x + 0.25, y: y + 0.2, w: 3.5, h: 0.35, fontSize: 11, bold: true, color: MUTED });
    sl.addText(value, { ...base, x: x + 0.25, y: y + 0.6, w: 3.5, h: 0.9, fontSize: 30, bold: true, color });
    sl.addText(hint, { ...base, x: x + 0.25, y: y + 1.5, w: 3.5, h: 0.6, fontSize: 11, color: MUTED });
  });

  // 3. Vue d'ensemble
  sl = pptx.addSlide();
  head(sl, 'Vue d\'ensemble des tâches', `Temps « après » estimés par ${who()} lors de l'entretien de validation.`);
  sl.addTable([
    ['Tâche', 'Fréquence', 'Avant / an', 'Après / an', 'Gain / an', 'Manip. évitées', 'Personne clé'].map(th),
    ...state.taches.map(t => { const s = taskStats(t); return [t.nom || 'Sans nom', `${fmtInt(volume(t))} / an`, fmtDur(s.avant), fmtDur(s.apres),
      s.gain > 0 ? '−' + fmtDur(s.gain) : '—', s.manips ? fmtInt(s.manips) : '—', `${RISQUES[s.riskAvant] || '—'} → ${RISQUES[s.riskApres] || '—'}`]; }),
    ['Total', '', fmtDur(g.avant), fmtDur(g.apres), '−' + fmtDur(Math.max(0, g.gain)), fmtInt(g.manips), ''].map(v => ({ text: v, options: { bold: true, fill: { color: 'F4F6F9' } } }))
  ], tableOpts([4.13, 1.4, 1.4, 1.4, 1.4, 1.5, 1.1]));

  // 4. Une série de diapositives par tâche
  for (const t of ts) {
    const s = taskStats(t);
    sl = pptx.addSlide();
    head(sl, t.nom, `Aujourd'hui · ${fmtInt(volume(t))} fois par an · ${fmtDur(s.avant)} par an${s.delaiAvant ? ' · ' + fmtJours(s.delaiAvant) + ' d\'attente' : ''}${t.cartoValidee ? ' · schéma validé par ' + who() : ''}`);
    addImage(sl, await svgToPng(renderMap(t, mapSteps(t, false))), 1.4, 3.7);
    const irr = t.steps.filter(isIrritant).slice(0, 6);
    if (irr.length) {
      sl.addText(irr.map(st => ({ text: `${t.steps.indexOf(st) + 1}. ${st.quoi}${st.precision ? ' — ' + st.precision : ''}`, options: { bullet: true } })),
        { ...base, x: 0.5, y: 5.25, w: W - 1, h: 1.7, fontSize: 12, valign: 'top' });
    }
    const sols = t.steps.filter(hasSol);
    if (!sols.length) continue;
    sl = pptx.addSlide();
    head(sl, t.nom + ' — ce qu\'on change', `Temps « après » et manipulations estimés par ${who()}.`);
    sl.addTable([
      ['Étape', 'Ce qui coince', 'Solution', 'Avant', 'Après', 'Manip. évitées', 'Avis'].map(th),
      ...sols.map(st => [`${t.steps.indexOf(st) + 1}. ${st.quoi}`, st.precision || FLAGS.filter(f => st[f.key]).map(f => f.nom).join(', '),
        st.sol || LEVIERS[st.levier] || '', `${fmtDec(num(st.duree))} min`,
        String(st.nouveauTemps) === '' ? 'à estimer' : fmtDec(num(st.nouveauTemps)) + ' min',
        num(st.manipsEvitees) ? fmtDec(num(st.manipsEvitees)) + ' / fois' : '—', AVIS[st.avis] || '—'])
    ], tableOpts([2.5, 2.7, 3.4, 0.8, 0.9, 1.05, 0.98]));
    sl = pptx.addSlide();
    head(sl, t.nom + ' — demain', `${fmtDur(s.apres)} par an · gain ${fmtDur(Math.max(0, s.gain))} (${pct(Math.max(0, s.gain), s.avant)}) · ${fmtInt(s.manips)} manipulations évitées${s.delaiAvant ? ' · attentes ' + fmtJours(s.delaiAvant) + ' → ' + fmtJours(s.delaiApres) : ''}`);
    addImage(sl, await svgToPng(renderMap(t, mapSteps(t, true))), 1.4, 5.4);
  }

  // 5. Plan d'action
  if (acts.length) {
    sl = pptx.addSlide();
    head(sl, 'Plan d\'action', `Gains rapides en premier · investissement ${g.invest ? '≈ ' + fmtEur(g.invest) + ', rentabilisé en ' + fmtMois(payback(g.invest, g.gain)) : 'non chiffré'}`);
    sl.addTable([
      ['#', 'Solution', 'Tâche', 'Priorité', 'Effort', 'Porteur', 'Échéance', 'Statut', 'Coût', 'Gain / an'].map(th),
      ...acts.map(({ t, s, q, g: gain, n }) => [String(n), s.sol || LEVIERS[s.levier] || '', t.nom, QUADRANTS[q], EFFORTS[s.effort] || '—',
        s.porteur || '—', s.echeance ? new Date(s.echeance).toLocaleDateString('fr-FR') : '—', STATUTS_ACTION[s.statutAction] || 'À lancer',
        invest(s) ? fmtEur(invest(s)) : '—', fmtDur(gain)])
    ], tableOpts([0.4, 3.0, 1.9, 1.2, 0.8, 1.4, 1.0, 0.9, 0.85, 0.88]));
  }
  const blob = await pptx.write({ outputType: 'blob' });
  await saveFile(blob, `restitution-${slug(immLabel(state))}.pptx`);
}

// Tableau au format « Data Visualizer » de Visio (organigramme de base)
function exportCsv(t) {
  const steps = t.steps;
  const idOf = i => 'E' + String(i + 1).padStart(2, '0');
  const rows = [['Process Step ID', 'Process Step Description', 'Next Step ID', 'Connector Label', 'Shape Type', 'Function', 'Phase', 'Alt Description']];
  rows.push(['DEBUT', t.origine || 'Début', steps.length ? idOf(0) : 'FIN', '', 'Start', steps[0]?.qui || NA, '', '']);
  steps.forEach((s, i) => {
    const next = i + 1 < steps.length ? idOf(i + 1) : 'FIN';
    let nextIds = next, labels = '';
    const k = !s.controle ? -1 : s.retour === FIN ? steps.length : steps.findIndex(x => x.id === s.retour);
    if (k >= 0) { nextIds = next + ',' + (k === steps.length ? 'FIN' : idOf(k)); labels = (s.labelSuite || 'Oui') + ',' + (s.labelAutre || 'Non'); }
    const alt = [s.outil && 'Outil : ' + s.outil, s.donnees && 'Données : ' + s.donnees, `${num(s.duree)} min`, attente(s) && `attente ${num(s.attente)} j`,
      s.precision && 'Ce qui coince : ' + s.precision].filter(Boolean).join(' | ');
    rows.push([idOf(i), s.quoi, nextIds, labels, s.controle ? 'Decision' : 'Process', s.qui || NA, '', alt]);
  });
  rows.push(['FIN', t.resultat || 'Fin', '', '', 'End', steps[steps.length - 1]?.qui || NA, '', '']);
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
  saveFile(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), `${slug(t.nom)}-visio.csv`);
}
function exportJson() {
  db.lastExport = new Date().toISOString();
  save();
  scheduleRender();
  const d = new Date().toISOString().slice(0, 10);
  download(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }), `carto-process-sauvegarde-${d}.json`);
}
function exportImm() {
  const d = new Date().toISOString().slice(0, 10);
  download(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }), `carto-process-${slug(immLabel(state))}-${d}.json`);
}
// Une sauvegarde complète remplace tout ; une immersion seule est ajoutée aux autres
function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (data && Array.isArray(data.immersions)) {
        if (!confirm('Sauvegarde complète : remplacer toutes les immersions actuelles par celles du fichier ?')) return;
        db = normalizeDb(data);
        setActive(db.immersions.find(i => i.id === db.activeId) || null);
        toast('Sauvegarde importée.');
      } else if (data && Array.isArray(data.taches)) {
        const imm = normalizeImm(data);
        const same = db.immersions.find(i => i.id === imm.id) || db.immersions.find(i => immKey(i) && immKey(i) === immKey(imm));
        if (same) {
          if (!confirm(`L'immersion « ${immLabel(same)} » existe déjà.\nOK : la remplacer par celle du fichier.\nAnnuler : ne rien importer.`)) return;
          imm.id = same.id;
          imm.dossier = same.dossier;
          db.immersions[db.immersions.indexOf(same)] = imm;
          if (state === same) setActive(imm);
          toast('Immersion « ' + immLabel(imm) + ' » remplacée.');
        } else {
          db.immersions.push(imm);
          toast('Immersion « ' + immLabel(imm) + ' » ajoutée.');
        }
      } else throw new Error('format');
      save();
      go('#/immersions');
      render();
    } catch (e) {
      toast('Fichier invalide : ce n\'est pas une sauvegarde Carto Process.');
    }
  };
  reader.readAsText(file);
}

/* ==========================================================================
   Actions
   ========================================================================== */
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2800);
}
function nextTask(phase, fromId) {
  const key = 'p' + phase + 'Done';
  const ts = state.taches;
  const i = ts.findIndex(t => t.id === fromId);
  const order = [...ts.slice(i + 1), ...ts.slice(0, i)];
  return order.find(t => !t[key] && (phase === 1 || t['p' + (phase - 1) + 'Done']));
}
function addTask() {
  const t = newTask();
  state.taches.push(t);
  save();
  go(`#/1/${t.id}`);
  setTimeout(() => { const el = document.querySelector('[data-bind="t|nom"]'); if (el) el.focus(); }, 30);
}

const actions = {
  'add-task': addTask,
  'del-task'() {
    const t = currentTask();
    if (!t || !confirm(`Supprimer la tâche « ${t.nom || 'sans nom'} » et tout son contenu ?`)) return;
    state.taches = state.taches.filter(x => x !== t);
    save(); go('#/1');
  },
  'done'(el) {
    const t = currentTask();
    const phase = Number(el.dataset.phase);
    if (phase === 1 && (!t.nom.trim() || !t.steps.length)) {
      toast('Il manque le nom de la tâche ou au moins une étape.');
      return;
    }
    t['p' + phase + 'Done'] = true;
    save();
    if (el.dataset.next === 'new') { toast('Tâche relevée ✓ On passe à la suivante.'); addTask(); return; }
    if (el.dataset.next === 'list') { go('#/1'); return; }
    const n = nextTask(phase, t.id);
    if (n) { toast('C\'est noté ✓ Tâche suivante.'); go(`#/${phase}/${n.id}`); }
    else { toast('Toutes les tâches de cette phase sont faites ✓'); go(`#/${phase}`); }
  },
  'undone'(el) { const t = currentTask(); t['p' + el.dataset.phase + 'Done'] = false; save(); render(); },
  'add-step'(el) {
    const t = currentTask();
    if (!t) return;
    const after = el.dataset.after ? t.steps.findIndex(x => x.id === el.dataset.after) : -1;
    const prev = after >= 0 ? t.steps[after] : t.steps[t.steps.length - 1];
    const s = newStep({ qui: prev ? prev.qui : (state.mission.personne || ''), outil: prev ? prev.outil : '' });
    if (after >= 0) t.steps.splice(after + 1, 0, s); else t.steps.push(s);
    flashId = 'step-' + s.id;
    save(); render();
  },
  'del-step'(el) {
    const t = currentTask();
    const s = t && t.steps.find(x => x.id === el.dataset.id);
    if (!s || !confirm(`Supprimer l'étape « ${s.quoi || 'sans nom'} » ?`)) return;
    t.steps = t.steps.filter(x => x !== s);
    t.steps.forEach(x => { if (x.retour === s.id) x.retour = ''; });
    save(); render();
  },
  'move-step'(el) {
    const t = currentTask();
    const i = t.steps.findIndex(x => x.id === el.dataset.id);
    const j = i + Number(el.dataset.dir);
    if (i < 0 || j < 0 || j >= t.steps.length) return;
    [t.steps[i], t.steps[j]] = [t.steps[j], t.steps[i]];
    flashId = 'step-' + el.dataset.id;
    save(); render();
  },
  'chip'(el) {
    const obj = resolveScope(el.dataset.scope);
    if (!obj) return;
    const f = el.dataset.field, v = el.dataset.value;
    obj[f] = obj[f] === v && f !== 'freqPer' ? '' : v;
    save(); render();
  },
  'toggle'(el) {
    const obj = resolveScope(el.dataset.scope);
    if (!obj) return;
    obj[el.dataset.field] = !obj[el.dataset.field];
    save(); render();
  },
  'open-sol'(el) {
    const s = currentTask().steps.find(x => x.id === el.dataset.id);
    s.solOpen = true;
    flashId = 'sol-' + s.id;
    save(); render();
  },
  'idea'(el) {
    const s = currentTask().steps.find(x => x.id === el.dataset.id);
    const [lev, txt] = ideasFor(s)[Number(el.dataset.k)];
    s.sol = String(s.sol || '').trim() ? s.sol.trim() + '\n+ ' + txt : txt;
    if (!s.levier) s.levier = lev;
    save(); render();
  },
  'toggle-fit'() { fitMaps = !fitMaps; render(); },
  'export-svg'(el) { const t = currentTask(); if (t) exportSvg(t, !!el.dataset.tobe); },
  'export-png'(el) { const t = currentTask(); if (t) exportPng(t, !!el.dataset.tobe); },
  'export-csv'() { const t = currentTask(); if (t) exportCsv(t); },
  'export-pptx'() { exportPptx().catch(e => { console.error(e); toast('Export PowerPoint impossible : ' + e.message); }); },
  'export-json': exportJson,
  'export-imm': exportImm,
  'new-imm'() {
    const imm = newImm();
    db.immersions.push(imm);
    setActive(imm);
    save(); go('#/accueil');
    setTimeout(() => { const el = document.querySelector('[data-bind="mission|service"]'); if (el) el.focus(); }, 30);
  },
  'open-imm'(el) {
    const imm = db.immersions.find(i => i.id === el.dataset.id);
    if (!imm) return;
    setActive(imm);
    save(); go(el.dataset.to || '#/accueil');
  },
  'del-imm'(el) {
    const imm = db.immersions.find(i => i.id === el.dataset.id);
    const onDisk = dirStatus === 'ok' && imm && imm.dossier;
    if (!imm || !confirm(`Supprimer l'immersion « ${immLabel(imm)} » et toutes ses tâches ?${onDisk ? `\nSon dossier « ${imm.dossier} » (et les fichiers qu'il contient) sera aussi supprimé.` : ''}`)) return;
    if (onDisk) dirHandle.removeEntry(imm.dossier, { recursive: true }).catch(e => toast('Dossier non supprimé : ' + e.message));
    db.immersions = db.immersions.filter(i => i !== imm);
    if (state === imm) setActive(null);
    save(); go('#/immersions'); render();
  },
  'year'(el) { portfolioYear = el.dataset.value; render(); },
  'dedupe'() {
    const groups = duplicateGroups();
    const remove = groups.flatMap(g => { const keep = keeperOf(g); return g.filter(i => i !== keep); });
    if (!remove.length || !confirm(`Supprimer ${plural(remove.length, 'doublon')} ?\nPour chaque immersion, la version la plus complète (puis la plus récente) est gardée.`)) return;
    remove.forEach(i => {
      if (dirStatus === 'ok' && i.dossier && !db.immersions.some(k => k !== i && !remove.includes(k) && k.dossier === i.dossier)) {
        dirHandle.removeEntry(i.dossier, { recursive: true }).catch(() => {});
      }
    });
    db.immersions = db.immersions.filter(i => !remove.includes(i));
    if (state && remove.includes(state)) setActive(null);
    save(false); render();
    toast(`${plural(remove.length, 'doublon supprimé', 'doublons supprimés')}.`);
  },
  'connect-dir'() { connectDir(); },
  'reconnect-dir'() { reconnectDir(); },
  'import-json'() { document.getElementById('importFile').click(); },
  'load-demo'() {
    if (db.immersions.length && !confirm('Remplacer toutes les données actuelles par la démonstration ?')) return;
    db = demoDb();
    setActive(db.immersions.find(i => i.id === db.activeId) || null);
    if (dirStatus === 'ok') { dirStatus = 'needs-permission'; toast('Démo chargée : le dossier de données est mis de côté, rien n\'y est écrit.'); }
    save(); go('#/immersions'); render();
  },
  'reset-all'() {
    if (!confirm('Effacer toutes les immersions et repartir de zéro ?\nPense à exporter une sauvegarde avant si besoin.')) return;
    db = emptyDb();
    setActive(null);
    if (dirStatus === 'ok') { dirStatus = 'needs-permission'; toast('Le contenu du dossier de données n\'est pas effacé : rouvre-le pour le recharger.'); }
    save(); go('#/immersions'); render();
    toast('C\'est tout propre. Crée ta première immersion.');
  },
  'print'() { window.print(); }
};

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (btn) {
    e.preventDefault();
    if (btn.disabled) return;
    const fn = actions[btn.dataset.action];
    if (fn) fn(btn);
    return;
  }
  // Clic sur une étape du schéma : on retrouve l'étape dans la page (ou dans la fiche d'immersion)
  const node = e.target.closest('.map-wrap [data-step]');
  const t = currentTask();
  if (node && t && t.steps.some(s => s.id === node.dataset.step)) {
    const r = route();
    flashId = (r.phase === 2 ? 'sol-' : r.phase === 3 ? 'val-' : 'step-') + node.dataset.step;
    if (!document.getElementById(flashId)) { flashId = 'step-' + node.dataset.step; go(`#/1/${t.id}`); }
    else render();
  }
});
document.addEventListener('toggle', e => {
  const d = e.target;
  if (d.dataset && d.dataset.detail) { if (d.open) openDetails.add(d.dataset.detail); else openDetails.delete(d.dataset.detail); }
}, true);
document.addEventListener('input', e => {
  const el = e.target.closest('[data-bind]');
  if (!el) return;
  applyBinding(el);
  save();
  if (el.type === 'checkbox' || el.tagName === 'SELECT') scheduleRender();
});
document.addEventListener('change', e => {
  if (e.target.id === 'importFile') {
    if (e.target.files[0]) importJson(e.target.files[0]);
    e.target.value = '';
    return;
  }
  const el = e.target.closest('[data-bind]');
  if (!el) return;
  applyBinding(el);
  save();
  scheduleRender();
});
// Entrée dans le libellé d'une étape : on enchaîne sur « Et ensuite ? »
document.addEventListener('keydown', e => {
  const el = e.target;
  if (e.key === 'Enter' && el.dataset && /\|quoi$/.test(el.dataset.bind || '') && route().phase === 1) {
    e.preventDefault();
    applyBinding(el);
    const id = el.dataset.bind.split('|')[0].split(':')[1];
    actions['add-step']({ dataset: { after: id } });
  }
});
window.addEventListener('hashchange', () => {
  // Une immersion créée puis abandonnée sans rien saisir n'encombre pas le tableau de bord
  if (route().page === 'immersions' && db.immersions.some(isEmptyImm)) {
    db.immersions = db.immersions.filter(i => !isEmptyImm(i));
    if (state && isEmptyImm(state)) setActive(null);
    save(false);
  }
  scheduleDiskWrite();
  render();
  if (!flashId) window.scrollTo(0, 0);
});

/* ==========================================================================
   Données de démonstration (fictives)
   ========================================================================== */
function demoImmSophie() {
  const st = newImm({ id: 'imm-sophie', createdAt: '2026-11-02' });
  st.mission = {
    service: 'Gestion de la connaissance', personne: 'Sophie', poste: 'Chargée de gestion de la connaissance',
    analyste: 'Analyste mission', debut: '2026-11-02', fin: '2026-11-13',
    contexte: 'Reprise du poste de Sophie. Objectif : comprendre le travail actuel, repérer les ressaisies, retraitements manuels et difficultés de suivi, puis chiffrer le temps gagné avec les solutions proposées.'
  };
  const S = 'Sophie', E = 'Expert métier', M = 'Manager', A = 'Conseiller agence', CF = 'Conformité';

  const t1 = newTask({
    id: 't1', nom: 'Mettre à jour une fiche procédure', freqQty: '40', freqPer: 'mois',
    description: 'Quand une procédure change, je modifie la fiche, je la fais valider par l\'expert puis je la publie pour les agences.',
    origine: 'Demande de mise à jour reçue par mail', resultat: 'Fiche publiée et demandeur prévenu',
    quiSait: 'personne', modeOp: 'non', quiSaitApres: 'une', modeOpApres: 'oui',
    notes: 'Pic de demandes en début de mois. Environ 30 % des fiches repartent en correction après relecture.',
    notesValidation: 'Très favorable au formulaire. Souhaite garder la main sur la mise en forme finale.',
    p1Done: true, p2Done: true, p3Done: true, cartoValidee: true, cartoValideeLe: '2026-11-04',
    penibilite: '4', penibiliteApres: '2', erreurs: '5', erreursApres: '1',
    steps: [
      newStep({ id: 't1s1', donnees: 'Objet, demandeur, fiche concernée', manipsEvitees: '2', effort: '1', coutJours: '1', porteur: 'Sophie', echeance: '2026-11-30', statutAction: 'encours', quoi: 'Lire la demande reçue par mail', qui: S, outil: 'Outlook', duree: '5', suivi: true, precision: 'Les demandes sont noyées dans la boîte mail, aucune vision du stock',
        sol: 'Liste des demandes partagée, avec une vue « en cours »', levier: 'outiller', tracabilite: true, nouveauTemps: '3', avis: 'ok' }),
      newStep({ id: 't1s2', donnees: 'Objet, demandeur, date', manipsEvitees: '6', effort: '1', coutJours: '1', porteur: 'Sophie + correspondant M365', echeance: '2026-11-30', statutAction: 'encours', quoi: 'Recopier la demande dans le fichier Excel de suivi', qui: S, outil: 'Excel', duree: '4', ressaisie: true, precision: 'Je recopie l\'objet, le demandeur et la date déjà présents dans le mail',
        sol: 'Formulaire en ligne (Microsoft Forms) : le demandeur saisit lui-même, la ligne de suivi se crée toute seule', levier: 'supprimer', tracabilite: true, nouveauTemps: '0', avis: 'ok' }),
      newStep({ id: 't1s3', donnees: 'Texte de la procédure', quoi: 'Rédiger ou modifier la fiche', qui: S, outil: 'Word', duree: '35' }),
      newStep({ id: 't1s4', donnees: 'Fiche en pièce jointe', attente: '6', nouvelleAttente: '2', manipsEvitees: '3', effort: '2', coutJours: '4', porteur: 'DSI (Power Automate)', echeance: '2027-01-31', quoi: 'Relire et valider la fiche', qui: E, outil: 'Outlook', duree: '20', suivi: true, precision: 'Relances à la main, 6 jours de délai moyen, aucune trace de la validation',
        sol: 'Circuit de validation avec relance automatique à J+3 et validation horodatée', levier: 'automatiser', tracabilite: true, securise: true, nouveauTemps: '12', avis: 'ok' }),
      newStep({ id: 't1s5', labelSuite: 'Oui', labelAutre: 'Non (30 %)', quoi: 'Fiche validée ?', qui: E, duree: '0', controle: true, retour: 't1s3' }),
      newStep({ id: 't1s6', manipsEvitees: '10', effort: '1', coutJours: '1', porteur: 'Sophie', echeance: '2026-12-15', quoi: 'Mettre en forme selon la charte', qui: S, outil: 'Word', duree: '15', manuel: true, precision: 'Toute la mise en forme est refaite à la main à chaque fiche',
        sol: 'Modèle de fiche avec les styles de la charte déjà en place', levier: 'modele', nouveauTemps: '5', avis: 'ok' }),
      newStep({ id: 't1s7', donnees: 'Contenu de la fiche', manipsEvitees: '8', effort: '2', coutJours: '4', porteur: 'Équipe SharePoint', echeance: '2027-02-28', quoi: 'Publier la fiche dans la base (copier-coller)', qui: S, outil: 'SharePoint', duree: '10', ressaisie: true, precision: 'Copier-coller de Word vers SharePoint, la mise en page casse',
        sol: 'Rédiger directement dans un modèle de page SharePoint', levier: 'outiller', nouveauTemps: '4', avis: 'discuter' }),
      newStep({ id: 't1s8', donnees: 'Statut, date de publication, demandeur', manipsEvitees: '4', effort: '2', coutJours: '4', porteur: 'DSI (Power Automate)', echeance: '2027-01-31', quoi: 'Mettre à jour le suivi et prévenir le demandeur', qui: S, outil: 'Excel + Outlook', duree: '6', ressaisie: true, manuel: true, precision: 'Double mise à jour : Excel puis mail',
        sol: 'Notification automatique au demandeur à la publication', levier: 'automatiser', tracabilite: true, nouveauTemps: '1', avis: 'ok' })
    ]
  });

  const t2 = newTask({
    id: 't2', nom: 'Répondre aux questions des agences', freqQty: '10', freqPer: 'jour',
    description: 'Les conseillers m\'écrivent quand ils ne trouvent pas une procédure ; je cherche la réponse et je leur réponds.',
    origine: 'Question d\'un conseiller par mail', resultat: 'Réponse envoyée au conseiller',
    quiSait: 'une', modeOp: 'partiel', quiSaitApres: 'plusieurs', modeOpApres: 'oui',
    notesValidation: 'D\'accord pour la boîte partagée ; la FAQ demandera du temps au démarrage.',
    p1Done: true, p2Done: true, p3Done: true, cartoValidee: true, cartoValideeLe: '2026-11-05',
    penibilite: '3', penibiliteApres: '2', erreurs: '8', erreursApres: '3',
    steps: [
      newStep({ id: 't2s1', donnees: 'Question, agence', quoi: 'Envoyer la question par mail', qui: A, outil: 'Outlook', duree: '3' }),
      newStep({ id: 't2s2', manipsEvitees: '1', effort: '1', coutJours: '1', porteur: 'Sophie', echeance: '2026-12-01', quoi: 'Lire et trier la question', qui: S, outil: 'Outlook', duree: '3', suivi: true, precision: 'Pas de classement : impossible de savoir quels sujets reviennent',
        sol: 'Boîte mail partagée avec catégories par sujet', levier: 'organiser', tracabilite: true, nouveauTemps: '2', avis: 'ok' }),
      newStep({ id: 't2s3', donnees: 'Mots-clés de la question', manipsEvitees: '3', effort: '3', coutJours: '12', porteur: 'Sophie + experts', echeance: '2027-03-31', quoi: 'Chercher la réponse dans la base', qui: S, outil: 'SharePoint', duree: '8', manuel: true, precision: 'La recherche donne de mauvais résultats, les fiches sont mal indexées',
        sol: 'Mots-clés sur les fiches + page FAQ des 50 questions les plus fréquentes', levier: 'outiller', nouveauTemps: '4', avis: 'ok' }),
      newStep({ id: 't2s4', attente: '2', nouvelleAttente: '1', manipsEvitees: '1', effort: '1', coutJours: '1', porteur: 'Manager', echeance: '2026-12-15', quoi: 'Demander à l\'expert et attendre sa réponse', qui: E, outil: 'Outlook / Teams', duree: '15', taux: '25', suivi: true, precision: 'Relances, aucun délai de réponse convenu',
        sol: 'Canal Teams des experts avec un délai de réponse convenu', levier: 'organiser', tracabilite: true, nouveauTemps: '10', avis: 'discuter' }),
      newStep({ id: 't2s5', quoi: 'Rédiger et envoyer la réponse', qui: S, outil: 'Outlook', duree: '6' }),
      newStep({ id: 't2s6', donnees: 'Thème, agence, date', manipsEvitees: '3', effort: '1', coutJours: '1', porteur: 'Sophie', echeance: '2026-12-01', quoi: 'Noter la question dans le fichier de suivi', qui: S, outil: 'Excel', duree: '2', ressaisie: true, precision: 'Double saisie mail + Excel, souvent oubliée',
        sol: 'Supprimer le fichier Excel : le suivi se fait avec les catégories de la boîte partagée', levier: 'supprimer', tracabilite: true, nouveauTemps: '0', avis: 'ok' })
    ]
  });

  const t3 = newTask({
    id: 't3', nom: 'Produire le reporting mensuel', freqQty: '1', freqPer: 'mois',
    description: 'Chaque mois je prépare une présentation sur l\'activité de la base pour la direction.',
    origine: 'Début de mois', resultat: 'Présentation envoyée à la direction',
    quiSait: 'personne', modeOp: 'non', penibilite: '5', erreurs: '2',
    p1Done: true, p2Done: true, p3Done: false,
    steps: [
      newStep({ id: 't3s1', quoi: 'Extraire les statistiques de consultation', qui: S, outil: 'SharePoint', duree: '30', manuel: true, precision: '4 exports différents à faire à la main',
        sol: 'Extraction planifiée automatiquement chaque début de mois', levier: 'automatiser' }),
      newStep({ id: 't3s2', donnees: 'Nombre de consultations par fiche et par mois', quoi: 'Rassembler les chiffres dans Excel', qui: S, outil: 'Excel', duree: '90', ressaisie: true, manuel: true, precision: 'Copier-coller et calculs à la main, risque d\'erreur',
        sol: 'Rapport Power BI branché directement sur les statistiques', levier: 'automatiser', securise: true, tracabilite: true }),
      newStep({ id: 't3s3', quoi: 'Faire les graphiques et la présentation', qui: S, outil: 'PowerPoint', duree: '60', manuel: true, precision: 'Les mêmes graphiques sont refaits chaque mois',
        sol: 'Le rapport en ligne remplace la présentation', levier: 'supprimer' }),
      newStep({ id: 't3s4', quoi: 'Relire et valider', qui: M, outil: 'Outlook', duree: '20' }),
      newStep({ id: 't3s5', quoi: 'Envoyer le reporting', qui: S, outil: 'Outlook', duree: '10' })
    ]
  });

  const t4 = newTask({
    id: 't4', nom: 'Veille réglementaire hebdomadaire', freqQty: '1', freqPer: 'semaine',
    description: 'Je consulte les sites officiels, je résume les nouveautés, je fais valider par la conformité puis j\'envoie une lettre au réseau.',
    origine: 'Chaque lundi matin', resultat: 'Lettre d\'information envoyée au réseau',
    quiSait: 'une', modeOp: 'partiel', penibilite: '3', erreurs: '1',
    p1Done: true,
    steps: [
      newStep({ id: 't4s1', quoi: 'Consulter les sites de veille', qui: S, outil: 'Navigateur', duree: '45', manuel: true, precision: '10 sites consultés un par un' }),
      newStep({ id: 't4s2', quoi: 'Résumer les nouveautés', qui: S, outil: 'Word', duree: '40' }),
      newStep({ id: 't4s3', attente: '3', quoi: 'Valider le contenu', qui: CF, outil: 'Outlook', duree: '30', suivi: true, precision: 'Validation par mail, aucun historique' }),
      newStep({ id: 't4s4', quoi: 'Mettre en page et envoyer la lettre', qui: S, outil: 'Outlook', duree: '20', manuel: true, precision: 'Liste de diffusion tenue à la main' })
    ]
  });

  const t5 = newTask({ id: 't5', nom: 'Revue annuelle des fiches obsolètes', freqQty: '1', freqPer: 'an', description: 'Une fois par an, repérer les fiches dépassées et les retirer ou les mettre à jour.' });

  st.taches = [t1, t2, t3, t4, t5];
  return st;
}

// Étape de démo compacte : flags = combinaison de R, M, S
function D(quoi, qui, outil, duree, flags = '', precision = '', sol = '', levier = '', nouveauTemps = '', extra = {}) {
  return newStep(Object.assign({
    quoi, qui, outil, duree: String(duree), precision, sol, levier, nouveauTemps: String(nouveauTemps),
    ressaisie: flags.includes('R'), manuel: flags.includes('M'), suivi: flags.includes('S'),
    avis: sol && nouveauTemps !== '' ? 'ok' : ''
  }, extra));
}
function doneTask(o) {
  return newTask(Object.assign({ p1Done: true, p2Done: true, p3Done: true, cartoValidee: true,
    penibilite: '4', penibiliteApres: '2', erreurs: '4', erreursApres: '1' }, o));
}

function demoDb() {
  const d = emptyDb();
  d.isDemo = true;

  const credits = newImm({ id: 'imm-credits', createdAt: '2026-03-09' });
  credits.mission = { service: 'Back-office crédits', personne: 'Karim', poste: 'Gestionnaire back-office crédits', analyste: 'Analyste mission',
    debut: '2026-03-09', fin: '2026-03-20', contexte: 'Délais de traitement des dossiers de prêt jugés trop longs.' };
  credits.taches = [
    doneTask({ nom: 'Constituer le dossier de prêt', freqQty: '60', freqPer: 'mois', origine: 'Pièces envoyées par le client', resultat: 'Dossier complet transmis à l\'analyste',
      quiSait: 'une', modeOp: 'partiel', quiSaitApres: 'plusieurs', modeOpApres: 'oui', steps: [
        D('Réceptionner les pièces par mail', 'Karim', 'Outlook', 10, 'S', 'Pièces manquantes relancées à la main', 'Portail de dépôt avec liste des pièces manquantes', 'outiller', 4, { tracabilite: true, attente: '5', nouvelleAttente: '2', manipsEvitees: '4', effort: '2', coutJours: '4', porteur: 'DSI', coutEuros: '1500', echeance: '2026-06-30', statutAction: 'fait', tempsReel: '5', dateMesure: '2026-09-15', donnees: 'Pièces justificatives' }),
        D('Ressaisir les infos client dans l\'outil crédit', 'Karim', 'Outil crédit', 15, 'R', 'Infos déjà présentes dans le CRM', 'Pré-remplissage automatique depuis le CRM', 'automatiser', 3, { manipsEvitees: '25', effort: '3', coutJours: '12', porteur: 'DSI', coutEuros: '1500', echeance: '2026-12-31', statutAction: 'encours', donnees: 'Identité, revenus, charges' }),
        D('Contrôler la complétude du dossier', 'Karim', 'Checklist papier', 12, 'M', 'Checklist papier, cochée à la main', 'Checklist intégrée à l\'outil avec blocage', 'outiller', 6, { securise: true, manipsEvitees: '5', effort: '1', coutJours: '1', porteur: 'Karim', echeance: '2026-04-30', statutAction: 'fait', tempsReel: '6', dateMesure: '2026-07-01' }),
        D('Transmettre à l\'analyste', 'Karim', 'Outlook', 5)
      ] }),
    doneTask({ nom: 'Éditer les offres de prêt', freqQty: '50', freqPer: 'mois', origine: 'Accord de l\'analyste', resultat: 'Offre signée reçue',
      quiSait: 'personne', modeOp: 'non', quiSaitApres: 'une', modeOpApres: 'oui', steps: [
        D('Générer l\'offre', 'Karim', 'Outil crédit', 8),
        D('Corriger la mise en page', 'Karim', 'Word', 10, 'M', 'Le modèle sort mal formaté', 'Modèle d\'offre corrigé dans l\'outil', 'modele', 2, { manipsEvitees: '8', effort: '1', coutJours: '1', porteur: 'Karim', echeance: '2026-04-15', statutAction: 'fait', tempsReel: '3', dateMesure: '2026-07-01' }),
        D('Envoyer et suivre le retour signé', 'Karim', 'Outlook', 10, 'S', 'Relances manuelles', 'Signature électronique avec relance automatique', 'automatiser', 2, { tracabilite: true, attente: '7', nouvelleAttente: '2', manipsEvitees: '4', effort: '2', coutJours: '4', porteur: 'DSI', coutEuros: '1500', echeance: '2026-09-30', statutAction: 'encours' })
      ] })
  ];

  const succ = newImm({ id: 'imm-successions', createdAt: '2026-06-01' });
  succ.mission = { service: 'Successions', personne: 'Nadia', poste: 'Conseillère successions', analyste: 'Analyste mission',
    debut: '2026-06-01', fin: '2026-06-12', contexte: 'Stock de dossiers en hausse, une seule personne formée.' };
  succ.taches = [
    doneTask({ nom: 'Ouvrir un dossier de succession', freqQty: '25', freqPer: 'mois', origine: 'Acte de décès reçu du notaire', resultat: 'Comptes bloqués et dossier ouvert',
      quiSait: 'personne', modeOp: 'non', quiSaitApres: 'une', modeOpApres: 'oui', steps: [
        D('Recevoir et scanner l\'acte du notaire', 'Nadia', 'Courrier', 10, 'M', 'Courrier papier scanné à la main', 'Réception dématérialisée via une boîte notaires', 'outiller', 4, { manipsEvitees: '3', effort: '1', coutJours: '1', porteur: 'Nadia', echeance: '2026-07-15', statutAction: 'fait', tempsReel: '4', dateMesure: '2026-10-01' }),
        D('Bloquer chaque compte du défunt', 'Nadia', 'Outil comptes', 15, 'R', 'Saisie compte par compte', 'Blocage groupé de tous les comptes', 'automatiser', 5, { securise: true, manipsEvitees: '12', effort: '3', coutJours: '12', porteur: 'DSI', coutEuros: '1500', echeance: '2027-03-31', statutAction: 'afaire' }),
        D('Créer le dossier dans le tableau de suivi', 'Nadia', 'Excel', 8, 'RS', 'Double saisie, pas de vision des délais', 'Tableau de bord des dossiers partagé', 'outiller', 2, { tracabilite: true, manipsEvitees: '6', effort: '1', coutJours: '1', porteur: 'Nadia', echeance: '2026-07-15', statutAction: 'fait', tempsReel: '3', dateMesure: '2026-10-01' })
      ] }),
    doneTask({ nom: 'Répondre aux notaires', freqQty: '6', freqPer: 'jour', origine: 'Demande d\'un notaire', resultat: 'Réponse envoyée',
      quiSait: 'une', modeOp: 'non', quiSaitApres: 'plusieurs', modeOpApres: 'oui', steps: [
        D('Rechercher le dossier', 'Nadia', 'Excel', 4, 'M', 'Recherche dans plusieurs fichiers', 'Tableau de bord unique', 'outiller', 1, { manipsEvitees: '2', effort: '1', coutJours: '1', porteur: 'Nadia', statutAction: 'fait' }),
        D('Rédiger la réponse', 'Nadia', 'Outlook', 8, 'M', 'Réponses rédigées à chaque fois', 'Bibliothèque de réponses types', 'modele', 4, { manipsEvitees: '3', effort: '1', coutJours: '1', porteur: 'Nadia', echeance: '2026-08-31', statutAction: 'encours' })
      ] })
  ];

  const assist = newImm({ id: 'imm-assistance', createdAt: '2026-09-14' });
  assist.mission = { service: 'Assistance clientèle', personne: 'Thomas', poste: 'Conseiller assistance', analyste: 'Analyste mission',
    debut: '2026-09-14', fin: '2026-09-25', contexte: 'Temps d\'appel moyen en hausse.' };
  assist.taches = [
    doneTask({ nom: 'Traiter une opposition carte', freqQty: '15', freqPer: 'jour', origine: 'Appel du client', resultat: 'Carte opposée, client informé',
      quiSait: 'plusieurs', modeOp: 'partiel', quiSaitApres: 'plusieurs', modeOpApres: 'oui', steps: [
        D('Prendre l\'appel et identifier le client', 'Thomas', 'Téléphone', 6),
        D('Faire l\'opposition', 'Thomas', 'Outil cartes', 4, 'R', 'Ressaisie du numéro de carte', 'Opposition lancée depuis la fiche client', 'automatiser', 2, { manipsEvitees: '3', effort: '2', coutJours: '4', porteur: 'DSI', coutEuros: '1500', echeance: '2027-01-31', statutAction: 'afaire' }),
        D('Envoyer la confirmation au client', 'Thomas', 'Outlook', 3, 'M', 'Mail rédigé à la main', 'Mail type envoyé automatiquement', 'automatiser', 0, { tracabilite: true, manipsEvitees: '4', effort: '1', coutJours: '1', porteur: 'Thomas', echeance: '2026-10-31', statutAction: 'fait', tempsReel: '0.5', dateMesure: '2026-10-28' })
      ] })
  ];

  const habil = newImm({ id: 'imm-habilitations', createdAt: '2025-11-03' });
  habil.mission = { service: 'Gestion des habilitations', personne: 'Claire', poste: 'Gestionnaire habilitations', analyste: 'Analyste mission',
    debut: '2025-11-03', fin: '2025-11-14', contexte: 'Délais d\'ouverture des accès pour les nouveaux arrivants.' };
  habil.taches = [
    doneTask({ nom: 'Créer les accès d\'un nouvel arrivant', freqQty: '8', freqPer: 'mois', origine: 'Demande des RH', resultat: 'Accès envoyés au manager',
      quiSait: 'personne', modeOp: 'non', quiSaitApres: 'une', modeOpApres: 'oui', steps: [
        D('Recevoir la demande des RH', 'Claire', 'Outlook', 5, 'S', 'Demandes incomplètes', 'Formulaire de demande obligatoire', 'outiller', 2, { attente: '4', nouvelleAttente: '1', manipsEvitees: '2', effort: '1', coutJours: '1', porteur: 'RH + Claire', echeance: '2025-12-15', statutAction: 'fait', tempsReel: '2', dateMesure: '2026-03-01' }),
        D('Créer les comptes dans 5 outils', 'Claire', '5 outils', 45, 'R', 'La même information saisie 5 fois', 'Demande unique avec création automatique', 'automatiser', 15, { securise: true, manipsEvitees: '40', effort: '3', coutJours: '12', porteur: 'DSI', coutEuros: '1500', echeance: '2026-06-30', statutAction: 'fait', tempsReel: '18', dateMesure: '2026-09-01', donnees: 'Identité, service, profils d\'accès' }),
        D('Envoyer les accès au manager', 'Claire', 'Outlook', 10, 'M', 'Mail préparé à la main', 'Kit d\'arrivée généré automatiquement', 'automatiser', 2, { tracabilite: true, manipsEvitees: '6', effort: '1', coutJours: '1', porteur: 'Claire', echeance: '2025-12-15', statutAction: 'fait', tempsReel: '2', dateMesure: '2026-03-01' })
      ] })
  ];

  const sophie = demoImmSophie();
  d.immersions = [habil, credits, succ, assist, sophie];
  d.activeId = sophie.id;
  return d;
}

/* ---------- Démarrage ---------- */
if (!location.hash) history.replaceState(null, '', '#/immersions');
save(false);
render();
initDir();
