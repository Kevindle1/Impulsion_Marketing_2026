'use strict';

/* ==========================================================================
   Carto Process — diagnostic de poste et amélioration des processus
   - 100 % hors ligne : ouvrir index.html dans le navigateur.
   - Données enregistrées dans le navigateur (localStorage), export/import JSON.
   - Méthodes : cartographie de processus (Businessmap) + notation BPMN simplifiée.
   ========================================================================== */

const STORE_KEY = 'cartoProcess.v1';
const NA = 'Non attribué';

const STEP_TYPES = {
  tache:    'Tâche (dans un outil)',
  manuelle: 'Tâche manuelle (papier, hors outil)',
  auto:     'Tâche automatisée (système)',
  decision: 'Décision / contrôle',
  attente:  'Attente / délai'
};
const FLAGS = [
  { key: 'ressaisie', label: 'Ressaisie', short: 'R', color: '#c8372d' },
  { key: 'manuel',    label: 'Retraitement manuel', short: 'M', color: '#d9730d' },
  { key: 'suivi',     label: 'Difficulté de suivi', short: 'S', color: '#8a4baf' }
];
const STATUTS = { afaire: 'À cartographier', encours: 'En cours', fait: 'Cartographié', valide: 'Validé avec l\'équipe' };
const CRITICITES = { 1: 'Faible', 2: 'Moyenne', 3: 'Forte' };
const PERIODES = {
  jour:    { label: 'par jour',    mult: 220 },
  semaine: { label: 'par semaine', mult: 47 },
  mois:    { label: 'par mois',    mult: 12 },
  an:      { label: 'par an',      mult: 1 }
};
const LEVIERS = {
  supprimer:    'Supprimer l\'étape',
  automatiser:  'Automatiser',
  simplifier:   'Simplifier / outiller',
  standardiser: 'Standardiser (modèle, règle)'
};
const EFFORTS = { 1: 'Faible', 2: 'Moyen', 3: 'Fort' };
const IMP_STATUTS = { proposee: 'Proposée', retenue: 'Retenue', realisee: 'Réalisée', ecartee: 'Écartée' };
const QUADRANTS = {
  quickwin:    'Gain rapide',
  planifier:   'À planifier',
  structurant: 'Projet structurant',
  petit:       'Petit plus',
  arbitrer:    'À arbitrer',
  ecarter:     'À reconsidérer'
};
const TABS = [
  ['cadrage', 'Cadrage'],
  ['etapes', 'Relevé des étapes'],
  ['carte', 'Cartographie actuelle'],
  ['analyse', 'Analyse & pistes'],
  ['cible', 'Cible & gains']
];

/* ---------- Utilitaires ---------- */
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : 0; };
const fmtInt = n => Math.round(n).toLocaleString('fr-FR');
const fmtDec = (n, d = 1) => n.toLocaleString('fr-FR', { maximumFractionDigits: d });
const splitList = s => String(s || '').split(/[,;\n]/).map(x => x.trim()).filter(Boolean);
const slug = s => String(s || 'export').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();

function fmtDur(min) {
  if (min < 60) return fmtInt(min) + ' min';
  const h = min / 60;
  return (h < 10 ? fmtDec(h) : fmtInt(h)) + ' h';
}
function fmtEtp(min) {
  const etp = min / 60 / (num(state.settings.heuresEtp) || 1607);
  return etp.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ETP';
}
const pct = (a, b) => b ? Math.round(a / b * 100) + ' %' : '—';

/* ---------- Modèle ---------- */
function newStep(o) {
  return Object.assign({
    id: uid(), type: 'tache', nom: '', acteur: '', outil: '', donnees: '', duree: '', taux: '100',
    ressaisie: false, manuel: false, suivi: false, irritant: '',
    cible: '', labelSuite: 'Oui', labelCible: 'Non'
  }, o);
}
function newImp(o) {
  return Object.assign({
    id: uid(), titre: '', stepId: '', levier: 'simplifier', gain: '', manips: '',
    tracabilite: false, controle: false, effort: '1', statut: 'proposee', description: ''
  }, o);
}
function newProcess(o) {
  return Object.assign({
    id: uid(), nom: 'Nouveau processus', domaine: '', finalite: '', declencheur: '', resultat: '',
    volQty: '', volPer: 'mois', criticite: '2', statut: 'afaire',
    fournisseurs: '', entrees: '', sorties: '', clients: '',
    acteurs: '', outils: '', interlocuteurs: '', dateEntretien: '', notes: '',
    steps: [], ameliorations: []
  }, o);
}
function emptyState() {
  return {
    version: 1, isDemo: false,
    mission: { service: '', poste: '', titulaire: '', analyste: '', debut: '', fin: '', contexte: '' },
    settings: { heuresEtp: '1607', seuilGain: '20' },
    processes: []
  };
}

/* ---------- Calculs ---------- */
const volume = p => num(p.volQty) * (PERIODES[p.volPer]?.mult ?? 1);
const taux = s => (s.taux === '' || s.taux == null) ? 100 : num(s.taux);
const stepOcc = (p, s) => volume(p) * taux(s) / 100;               // nombre d'exécutions par an
const stepAnnual = (p, s) => num(s.duree) * stepOcc(p, s);         // minutes par an
const isIrritant = s => FLAGS.some(f => s[f.key]) || !!String(s.irritant || '').trim();
const activeImps = p => p.ameliorations.filter(a => a.statut !== 'ecartee');
const stepOf = (p, id) => p.steps.find(s => s.id === id);

// Minutes économisées par exécution d'une étape (toutes pistes actives confondues)
function stepReduction(p, s) {
  const imps = activeImps(p).filter(a => a.stepId === s.id);
  if (imps.some(a => a.levier === 'supprimer')) return num(s.duree);
  return Math.min(num(s.duree), imps.reduce((t, a) => t + num(a.gain), 0));
}
function impGainPerOcc(p, a) {
  const s = stepOf(p, a.stepId);
  if (!s) return 0;
  return a.levier === 'supprimer' ? num(s.duree) : Math.min(num(a.gain), num(s.duree));
}
function impAnnualGain(p, a) {
  const s = stepOf(p, a.stepId);
  return s ? impGainPerOcc(p, a) * stepOcc(p, s) : 0;
}
function impAnnualManips(p, a) {
  const s = stepOf(p, a.stepId);
  return s ? num(a.manips) * stepOcc(p, s) : 0;
}
function quadrant(p, a) {
  const high = impAnnualGain(p, a) / 60 >= num(state.settings.seuilGain);
  const e = num(a.effort) || 2;
  if (high) return e <= 1 ? 'quickwin' : e === 2 ? 'planifier' : 'structurant';
  return e <= 1 ? 'petit' : e === 2 ? 'arbitrer' : 'ecarter';
}

// Étapes du processus cible : étapes supprimées retirées, durées réduites, irritants traités
function toBeSteps(p) {
  const imps = activeImps(p);
  const kept = [];
  p.steps.forEach((s, i) => {
    const mine = imps.filter(a => a.stepId === s.id);
    if (mine.some(a => a.levier === 'supprimer')) return;
    const red = stepReduction(p, s);
    const c = Object.assign({}, s, { _n: i + 1, duree: num(s.duree) - red, _gain: red, _imps: mine });
    if (mine.length) {
      c._improved = true;
      c.ressaisie = c.manuel = c.suivi = false;
      c.irritant = '';
      if (mine.some(a => a.levier === 'automatiser') && s.type !== 'decision') c.type = 'auto';
    }
    kept.push(c);
  });
  const keptIds = new Set(kept.map(s => s.id));
  kept.forEach(c => {
    if (c.type === 'decision' && c.cible && !keptIds.has(c.cible)) {
      const idx = p.steps.findIndex(s => s.id === c.cible);
      const next = p.steps.slice(idx + 1).find(s => keptIds.has(s.id));
      c.cible = next ? next.id : '';
    }
  });
  return kept;
}

function procStats(p) {
  let total = 0, irrit = 0, gain = 0, nbIrr = 0, ressaisies = 0;
  p.steps.forEach(s => {
    const a = stepAnnual(p, s);
    total += a;
    if (isIrritant(s)) { irrit += a; nbIrr++; }
    if (s.ressaisie) ressaisies++;
    gain += stepReduction(p, s) * stepOcc(p, s);
  });
  const imps = activeImps(p);
  const tobe = toBeSteps(p);
  return {
    total, irrit, gain, after: total - gain, nbIrr, ressaisies,
    manips: imps.reduce((t, a) => t + impAnnualManips(p, a), 0),
    tracab: imps.filter(a => a.tracabilite).length,
    controles: imps.filter(a => a.controle).length,
    nbImps: imps.length,
    nbSteps: p.steps.length,
    nbStepsAfter: tobe.length,
    nbIrrAfter: tobe.filter(isIrritant).length,
    ressaisiesAfter: tobe.filter(s => s.ressaisie).length
  };
}
function globalStats() {
  const t = { total: 0, irrit: 0, gain: 0, manips: 0, tracab: 0, controles: 0, nbImps: 0 };
  state.processes.forEach(p => {
    const s = procStats(p);
    Object.keys(t).forEach(k => { t[k] += s[k]; });
  });
  return t;
}

/* ---------- Persistance ---------- */
let state = loadState();
let lastSaved = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) { /* stockage indisponible : on repart de la démo */ }
  return demoState();
}
function normalize(s) {
  const base = emptyState();
  const out = Object.assign(base, s);
  out.mission = Object.assign(emptyState().mission, s.mission);
  out.settings = Object.assign(emptyState().settings, s.settings);
  out.processes = (s.processes || []).map(p => {
    const np = newProcess(p);
    np.steps = (p.steps || []).map(newStep);
    np.ameliorations = (p.ameliorations || []).map(newImp);
    return np;
  });
  return out;
}
function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    lastSaved = new Date();
    const el = document.getElementById('savedAt');
    if (el) el.textContent = savedLabel();
  } catch (e) {
    toast('Enregistrement impossible dans ce navigateur : pensez à exporter en JSON.');
  }
}
const savedLabel = () => lastSaved
  ? 'Enregistré à ' + lastSaved.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  : 'Enregistrement automatique';

/* ---------- Navigation ---------- */
function route() {
  const parts = (location.hash || '#/tableau').replace(/^#\/?/, '').split('/');
  return { page: parts[0] || 'tableau', id: parts[1], tab: parts[2] || 'cadrage' };
}
function currentProcess() {
  const r = route();
  return r.page === 'p' ? state.processes.find(p => p.id === r.id) : null;
}
function go(hash) { location.hash = hash; }

/* ---------- Rendu ---------- */
const $main = document.getElementById('main');
const $side = document.getElementById('sidebar');
let renderPending = false;
let flashStep = null;
let mapSeq = 0;
let fitMaps = false;   // « Vue d'ensemble » : le diagramme tient dans la largeur

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
  $side.innerHTML = viewSidebar();
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
  if (flashStep) {
    const el = document.getElementById(flashStep);
    if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); }
    flashStep = null;
  }
}

function viewMain() {
  const r = route();
  const banner = state.isDemo ? `
    <div class="banner"><span><b>Données de démonstration (fictives).</b> Explorez librement, puis repartez de zéro pour votre mission.</span>
    <span class="actions"><button class="btn sm" data-action="reset-all">Repartir de zéro</button></span></div>` : '';
  let body;
  switch (r.page) {
    case 'mission': body = viewMission(); break;
    case 'processus': body = viewInventory(); break;
    case 'synthese': body = viewSynthese(); break;
    case 'methode': body = viewMethode(); break;
    case 'p': {
      const p = currentProcess();
      body = p ? viewProcess(p, r.tab) : `<div class="empty">Processus introuvable. <br><a href="#/processus">Retour à l'inventaire</a></div>`;
      break;
    }
    default: body = viewDashboard();
  }
  return banner + body;
}

/* ---------- Champs liés ---------- */
const bindAttr = (scope, field) => `data-bind="${esc(scope + '|' + field)}"`;
function inp(scope, field, val, attrs = '') {
  return `<input ${bindAttr(scope, field)} value="${esc(val)}" ${attrs}>`;
}
function numInp(scope, field, val, attrs = '') {
  return `<input type="number" min="0" step="any" ${bindAttr(scope, field)} value="${esc(val)}" ${attrs}>`;
}
function area(scope, field, val, attrs = '') {
  return `<textarea ${bindAttr(scope, field)} ${attrs}>${esc(val)}</textarea>`;
}
function sel(scope, field, val, options, attrs = '') {
  const opts = Array.isArray(options) ? options : Object.entries(options);
  return `<select ${bindAttr(scope, field)} ${attrs}>${opts.map(([v, l]) =>
    `<option value="${esc(v)}"${String(v) === String(val) ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
}
function chk(scope, field, val, label, title = '') {
  return `<label class="check" title="${esc(title)}"><input type="checkbox" ${bindAttr(scope, field)}${val ? ' checked' : ''}> ${label}</label>`;
}
const field = (label, control, cls = '') => `<label class="field ${cls}"><span>${label}</span>${control}</label>`;

function resolveScope(scope) {
  if (scope === 'mission') return state.mission;
  if (scope === 'settings') return state.settings;
  const p = currentProcess();
  if (scope === 'p') return p;
  const [k, id] = scope.split(':');
  if (k === 'pid') return state.processes.find(x => x.id === id);
  if (!p) return null;
  if (k === 's') return stepOf(p, id);
  if (k === 'a') return p.ameliorations.find(x => x.id === id);
  return null;
}
function applyBinding(el) {
  const [scope, f] = el.dataset.bind.split('|');
  const obj = resolveScope(scope);
  if (!obj) return;
  obj[f] = el.type === 'checkbox' ? el.checked : el.value;
}

/* ---------- Barre latérale ---------- */
function viewSidebar() {
  const r = route();
  const link = (hash, ico, label, active) =>
    `<a class="nav-link${active ? ' active' : ''}" href="${hash}"><span class="ico">${ico}</span>${label}</a>`;
  const procs = state.processes.map(p => `
    <a class="nav-link nav-proc${r.page === 'p' && r.id === p.id ? ' active' : ''}" href="#/p/${p.id}/${r.page === 'p' ? r.tab : 'cadrage'}" title="${esc(p.nom)} — ${esc(STATUTS[p.statut])}">
      <span class="dot ${p.statut}"></span><span class="name">${esc(p.nom || 'Sans nom')}</span></a>`).join('');
  return `
    <div class="brand"><div class="logo">CP</div><div><strong>Carto Process</strong><small>Diagnostic &amp; amélioration</small></div></div>
    ${link('#/tableau', '◧', 'Tableau de bord', r.page === 'tableau')}
    ${link('#/mission', '◎', 'Mission &amp; poste', r.page === 'mission')}
    ${link('#/processus', '☰', 'Inventaire des processus', r.page === 'processus')}
    ${link('#/synthese', '▤', 'Synthèse / vitrine', r.page === 'synthese')}
    ${link('#/methode', '?', 'Méthode &amp; guide', r.page === 'methode')}
    <div class="nav-title">Processus du poste (${state.processes.length})</div>
    ${procs}
    <button class="side-btn" data-action="add-process">+ Nouveau processus</button>
    <div class="side-foot"><div id="savedAt">${savedLabel()}</div><div>Données stockées sur ce poste uniquement.</div></div>`;
}

/* ---------- Tableau de bord ---------- */
function viewDashboard() {
  const m = state.mission;
  const ps = state.processes;
  if (!ps.length) {
    return `${pageHead('Tableau de bord', m.poste || 'Diagnostic de poste')}
      <div class="empty">Aucun processus répertorié pour l'instant.<br>
        <button class="btn primary" data-action="add-process">+ Répertorier un premier processus</button>
        <button class="btn" data-action="load-demo">Charger la démo</button></div>`;
  }
  const g = globalStats();
  const mapped = ps.filter(p => p.steps.length).length;
  const rows = ps.map(p => ({ p, s: procStats(p) }));
  const max = Math.max(1, ...rows.map(r => r.s.total));

  const irritants = [];
  ps.forEach(p => p.steps.forEach((s, i) => { if (isIrritant(s)) irritants.push({ p, s, i, v: stepAnnual(p, s) }); }));
  irritants.sort((a, b) => b.v - a.v);

  const wins = [];
  ps.forEach(p => activeImps(p).forEach(a => { if (quadrant(p, a) === 'quickwin') wins.push({ p, a, v: impAnnualGain(p, a) }); }));
  wins.sort((a, b) => b.v - a.v);

  const sub = [m.service, m.titulaire ? 'Poste de ' + m.titulaire : ''].filter(Boolean).join(' · ');
  return `
    ${pageHead('Tableau de bord', m.poste || 'Diagnostic de poste', sub, `<a class="btn" href="#/synthese">Voir la synthèse</a>`)}
    <div class="kpis">
      ${kpi('Processus répertoriés', ps.length, `${mapped} cartographié${mapped > 1 ? 's' : ''}`)}
      ${kpi('Temps annuel du poste', fmtDur(g.total), fmtEtp(g.total))}
      ${kpi('Temps sur étapes irritantes', fmtDur(g.irrit), pct(g.irrit, g.total) + ' du temps total', 'bad')}
      ${kpi('Gain potentiel', fmtDur(g.gain), fmtEtp(g.gain) + ' · ' + pct(g.gain, g.total), 'good')}
      ${kpi('Manipulations évitées', fmtInt(g.manips), 'par an')}
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Processus du poste</h2><p class="muted small">Temps annuel par processus : part irritante en rouge, gain potentiel à droite.</p></div>
        <a class="btn sm" href="#/processus">Gérer l'inventaire</a></div>
      <div class="table-wrap"><table>
        <thead><tr><th>Processus</th><th>Statut</th><th class="right">Volume / an</th><th style="width:34%">Temps annuel</th><th class="right">Total</th><th class="right">Gain potentiel</th></tr></thead>
        <tbody>${rows.map(({ p, s }) => `
          <tr>
            <td><a href="#/p/${p.id}/${p.steps.length ? 'carte' : 'cadrage'}"><b>${esc(p.nom)}</b></a><div class="small muted">${esc(p.domaine)}</div></td>
            <td><span class="badge ${p.statut}">${esc(STATUTS[p.statut])}</span></td>
            <td class="right num">${fmtInt(volume(p))}</td>
            <td><div class="bar-track" title="Irritant : ${fmtDur(s.irrit)} / Total : ${fmtDur(s.total)}">
              <div class="bar irr" style="width:${s.irrit / max * 100}%"></div>
              <div class="bar" style="width:${(s.total - s.irrit) / max * 100}%"></div></div></td>
            <td class="right num">${s.total ? fmtDur(s.total) : '—'}</td>
            <td class="right num" style="color:var(--ok);font-weight:600">${s.gain ? '−' + fmtDur(s.gain) : '—'}</td>
          </tr>`).join('')}</tbody>
      </table></div>
      <div class="legend-inline"><span><i style="background:var(--danger)"></i>Temps sur étapes irritantes</span><span><i style="background:#7d93c4"></i>Autre temps</span></div>
    </div>
    <div class="grid two">
      <div class="card">
        <div class="card-head"><div><h2>Principaux irritants</h2><p class="muted small">Classés par temps annuel consommé.</p></div></div>
        ${irritants.length ? `<ul class="list-plain">${irritants.slice(0, 7).map(({ p, s, i, v }) => `
          <li><div><a href="#/p/${p.id}/analyse"><b>${esc(s.nom)}</b></a> ${flagChips(s)}
            <div class="meta">${esc(p.nom)} · étape ${i + 1}${s.irritant ? ' · ' + esc(s.irritant) : ''}</div></div>
            <b class="num" style="white-space:nowrap">${fmtDur(v)}</b></li>`).join('')}</ul>` : '<p class="muted">Aucun irritant relevé.</p>'}
      </div>
      <div class="card">
        <div class="card-head"><div><h2>Gains rapides</h2><p class="muted small">Effort faible et gain ≥ ${esc(state.settings.seuilGain)} h/an.</p></div></div>
        ${wins.length ? `<ul class="list-plain">${wins.slice(0, 7).map(({ p, a, v }) => `
          <li><div><a href="#/p/${p.id}/analyse"><b>${esc(a.titre || 'Piste sans titre')}</b></a>
            <div class="meta">${esc(p.nom)} · ${esc(LEVIERS[a.levier])} · ${esc(IMP_STATUTS[a.statut])}</div></div>
            <b class="num" style="color:var(--ok);white-space:nowrap">−${fmtDur(v)}</b></li>`).join('')}</ul>` : '<p class="muted">Aucun gain rapide identifié pour l\'instant.</p>'}
      </div>
    </div>`;
}

function pageHead(title, eyebrow, sub = '', actions = '') {
  return `<header class="page-head"><div>
    ${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}<h1>${title}</h1>
    ${sub ? `<p class="sub">${sub}</p>` : ''}</div>
    ${actions ? `<div class="actions no-print">${actions}</div>` : ''}</header>`;
}
function kpi(label, value, hint, cls = '') {
  return `<div class="kpi ${cls}"><div class="label">${label}</div><div class="value">${value}</div><div class="hint">${hint}</div></div>`;
}
function flagChips(s) {
  const chips = FLAGS.filter(f => s[f.key]).map(f => `<span class="flag-chip ${f.short}" title="${f.label}">${f.short}</span>`);
  if (!chips.length && String(s.irritant || '').trim()) chips.push('<span class="flag-chip X" title="Irritant">!</span>');
  return chips.join(' ');
}

/* ---------- Mission ---------- */
function viewMission() {
  const m = state.mission, st = state.settings;
  return `
    ${pageHead('Mission &amp; poste', 'Cadrage de la mission', 'Le contexte général : quel service, quel poste, quelle période. Les paramètres servent aux calculs de gains.')}
    <div class="card">
      <div class="card-head"><h2>La mission</h2></div>
      <div class="form-grid">
        ${field('Service', inp('mission', 'service', m.service, 'placeholder="Ex. Gestion de la connaissance"'))}
        ${field('Poste analysé', inp('mission', 'poste', m.poste, 'placeholder="Intitulé du poste repris"'))}
        ${field('Titulaire / personne interrogée', inp('mission', 'titulaire', m.titulaire))}
        ${field('Analyste', inp('mission', 'analyste', m.analyste))}
        ${field('Début de mission', inp('mission', 'debut', m.debut, 'type="date"'))}
        ${field('Fin de mission', inp('mission', 'fin', m.fin, 'type="date"'))}
        ${field('Contexte et objectifs', area('mission', 'contexte', m.contexte, 'rows="4"'), 'wide')}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Paramètres de calcul</h2><p class="muted small">Les temps sont saisis en minutes par exécution, puis projetés à l'année.</p></div></div>
      <div class="form-grid">
        ${field('Heures travaillées par ETP et par an', numInp('settings', 'heuresEtp', st.heuresEtp))}
        ${field('Seuil « gain fort » (heures / an)', numInp('settings', 'seuilGain', st.seuilGain))}
        <div class="help" style="align-self:end">Conversion des volumes : 1 jour ouvré = ×220/an, 1 semaine = ×47/an, 1 mois = ×12/an.</div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Données</h2><p class="muted small">Tout est enregistré automatiquement dans ce navigateur, sur ce poste. Exportez régulièrement une sauvegarde JSON.</p></div></div>
      <div class="actions">
        <button class="btn primary" data-action="export-json">⭳ Exporter la sauvegarde (JSON)</button>
        <button class="btn" data-action="import-json">⭱ Importer une sauvegarde</button>
        <button class="btn" data-action="load-demo">Recharger la démo</button>
        <button class="btn danger" data-action="reset-all">Tout effacer et repartir de zéro</button>
      </div>
    </div>`;
}

/* ---------- Inventaire ---------- */
function viewInventory() {
  const ps = state.processes;
  return `
    ${pageHead('Inventaire des processus', 'Étape 1 · Répertorier', 'Listez toutes les activités du poste avant de cartographier. Le volume permet de projeter les temps à l\'année ; la criticité aide à prioriser l\'ordre des entretiens.',
      `<button class="btn primary" data-action="add-process">+ Ajouter un processus</button>`)}
    <div class="card">
      ${ps.length ? `<div class="table-wrap"><table class="inv">
        <thead><tr><th>#</th><th>Processus</th><th>Domaine</th><th>Volume</th><th>Criticité</th><th>Statut</th><th class="right">Étapes</th><th class="right">Temps / an</th><th></th></tr></thead>
        <tbody>${ps.map((p, i) => {
          const s = procStats(p);
          return `<tr>
            <td class="muted">${i + 1}</td>
            <td>${inp('pid:' + p.id, 'nom', p.nom)}</td>
            <td>${inp('pid:' + p.id, 'domaine', p.domaine)}</td>
            <td><div class="inline" style="min-width:190px">${numInp('pid:' + p.id, 'volQty', p.volQty, 'style="max-width:80px"')}${sel('pid:' + p.id, 'volPer', p.volPer, Object.entries(PERIODES).map(([k, v]) => [k, v.label]))}</div></td>
            <td>${sel('pid:' + p.id, 'criticite', p.criticite, CRITICITES)}</td>
            <td>${sel('pid:' + p.id, 'statut', p.statut, STATUTS)}</td>
            <td class="right num">${p.steps.length}</td>
            <td class="right num">${s.total ? fmtDur(s.total) : '—'}</td>
            <td class="actions-cell">
              <a class="btn sm" href="#/p/${p.id}/cadrage">Ouvrir</a>
              <button class="icon-btn" title="Dupliquer" data-action="dup-process" data-id="${p.id}">⧉</button>
              <button class="icon-btn danger" title="Supprimer" data-action="del-process" data-id="${p.id}">✕</button>
            </td></tr>`;
        }).join('')}</tbody></table></div>`
        : `<div class="empty">Aucun processus. Commencez par lister les activités du poste.<br><button class="btn primary" data-action="add-process">+ Ajouter un processus</button></div>`}
    </div>`;
}

/* ---------- Processus ---------- */
function viewProcess(p, tab) {
  const s = procStats(p);
  const tabs = TABS.map(([k, l], i) =>
    `<a class="tab${tab === k ? ' active' : ''}" href="#/p/${p.id}/${k}"><span class="n">${i + 1}</span>${l}</a>`).join('');
  let body;
  switch (tab) {
    case 'etapes': body = tabEtapes(p); break;
    case 'carte': body = tabCarte(p); break;
    case 'analyse': body = tabAnalyse(p); break;
    case 'cible': body = tabCible(p, s); break;
    default: body = tabCadrage(p);
  }
  return `
    ${pageHead(esc(p.nom || 'Sans nom'), `Processus <span class="badge ${p.statut}">${esc(STATUTS[p.statut])}</span>`, esc(p.finalite))}
    <div class="strip">
      <div>Volume<b>${fmtInt(volume(p))} / an</b></div>
      <div>Étapes<b>${s.nbSteps}</b></div>
      <div>Temps annuel<b>${fmtDur(s.total)}</b></div>
      <div>Équivalent<b>${fmtEtp(s.total)}</b></div>
      <div>Sur étapes irritantes<b class="bad">${fmtDur(s.irrit)} (${pct(s.irrit, s.total)})</b></div>
      <div>Gain potentiel<b class="good">${s.gain ? '−' + fmtDur(s.gain) : '—'}</b></div>
    </div>
    <nav class="tabs">${tabs}</nav>
    ${body}`;
}

function tabCadrage(p) {
  return `
    <div class="card">
      <div class="card-head"><div><h2>Identité du processus</h2><p class="muted small">But, début, fin et volume : de quoi parle-t-on et combien de fois par an ?</p></div></div>
      <div class="form-grid">
        ${field('Nom du processus', inp('p', 'nom', p.nom))}
        ${field('Domaine / famille', inp('p', 'domaine', p.domaine))}
        ${field('Volume', `<div class="inline">${numInp('p', 'volQty', p.volQty, 'placeholder="Nombre"')}${sel('p', 'volPer', p.volPer, Object.entries(PERIODES).map(([k, v]) => [k, v.label]))}</div>`)}
        ${field('Criticité', sel('p', 'criticite', p.criticite, CRITICITES))}
        ${field('Statut de la cartographie', sel('p', 'statut', p.statut, STATUTS))}
        ${field('Finalité (à quoi sert ce processus ?)', area('p', 'finalite', p.finalite, 'rows="2"'), 'wide')}
        ${field('Événement déclencheur (début)', inp('p', 'declencheur', p.declencheur, 'placeholder="Ex. Réception d\'une demande"'))}
        ${field('Résultat attendu (fin)', inp('p', 'resultat', p.resultat, 'placeholder="Ex. Fiche publiée"'))}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Vue SIPOC</h2><p class="muted small">Fournisseurs → Entrées → Processus → Sorties → Clients. Une ligne par élément.</p></div></div>
      <div class="sipoc">
        <div class="col"><h4><b>S</b>uppliers · Fournisseurs</h4>${area('p', 'fournisseurs', p.fournisseurs)}</div>
        <div class="col"><h4><b>I</b>nputs · Entrées</h4>${area('p', 'entrees', p.entrees)}</div>
        <div class="col center"><h4><b>P</b>rocessus</h4><div class="proc-name">${esc(p.nom)}</div>
          <div class="small muted">${p.steps.length} étape${p.steps.length > 1 ? 's' : ''}<br>${esc(p.declencheur || 'Début ?')} → ${esc(p.resultat || 'Fin ?')}</div></div>
        <div class="col"><h4><b>O</b>utputs · Sorties</h4>${area('p', 'sorties', p.sorties)}</div>
        <div class="col"><h4><b>C</b>ustomers · Clients</h4>${area('p', 'clients', p.clients)}</div>
      </div>
    </div>
    <div class="grid two">
      <div class="card">
        <div class="card-head"><div><h2>Acteurs &amp; outils</h2><p class="muted small">Séparés par des virgules. Chaque acteur devient un couloir du diagramme.</p></div></div>
        <div class="form-grid">
          ${field('Acteurs (couloirs)', area('p', 'acteurs', p.acteurs, 'rows="3" placeholder="Gestionnaire, Expert métier, Manager"'), 'wide')}
          ${field('Outils utilisés', area('p', 'outils', p.outils, 'rows="2" placeholder="Outlook, Excel, SharePoint"'), 'wide')}
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div><h2>Entretiens</h2><p class="muted small">Avec qui, quand, et ce qui a été dit.</p></div></div>
        <div class="form-grid">
          ${field('Interlocuteurs rencontrés', inp('p', 'interlocuteurs', p.interlocuteurs))}
          ${field('Date', inp('p', 'dateEntretien', p.dateEntretien, 'type="date"'))}
          ${field('Notes d\'entretien', area('p', 'notes', p.notes, 'rows="4"'), 'wide')}
        </div>
      </div>
    </div>
    <div class="actions"><a class="btn primary" href="#/p/${p.id}/etapes">Étape suivante : relever les étapes →</a></div>`;
}

function datalists(p) {
  const acteurs = [...new Set([...splitList(p.acteurs), ...p.steps.map(s => s.acteur).filter(Boolean)])];
  const outils = [...new Set([...splitList(p.outils), ...p.steps.map(s => s.outil).filter(Boolean)])];
  return `<datalist id="dl-acteurs">${acteurs.map(a => `<option value="${esc(a)}">`).join('')}</datalist>
    <datalist id="dl-outils">${outils.map(a => `<option value="${esc(a)}">`).join('')}</datalist>`;
}

function tabEtapes(p) {
  const steps = p.steps;
  const cards = steps.map((s, i) => {
    const sc = 's:' + s.id;
    const isDec = s.type === 'decision';
    const targets = [['', '— choisir l\'étape —'], ...steps.map((t, j) => [t.id, `${j + 1}. ${t.nom || 'Sans nom'}`]).filter(([id]) => id !== s.id)];
    return `
    <div class="step-card${isIrritant(s) ? ' irritant' : ''}${isDec ? ' decision' : ''}" id="step-${s.id}">
      <div class="step-num">${i + 1}</div>
      <div class="step-body">
        <div class="step-row r1">
          ${field('Type', sel(sc, 'type', s.type, STEP_TYPES))}
          ${field(isDec ? 'Question / contrôle' : 'Étape (verbe + objet)', inp(sc, 'nom', s.nom, `placeholder="${isDec ? 'Ex. Dossier complet ?' : 'Ex. Saisir la demande dans Excel'}"`))}
          ${field('Qui ? (acteur)', inp(sc, 'acteur', s.acteur, 'list="dl-acteurs"'))}
          ${field('Avec quel outil ?', inp(sc, 'outil', s.outil, 'list="dl-outils"'))}
        </div>
        <div class="step-row r2">
          ${field('Données manipulées', inp(sc, 'donnees', s.donnees))}
          ${field('Durée (min)', numInp(sc, 'duree', s.duree))}
          ${field('% des cas', numInp(sc, 'taux', s.taux, 'max="100" title="Part des exécutions où cette étape a lieu"'))}
          <div class="calc">Par an : <b>${fmtDur(stepAnnual(p, s))}</b><br>${fmtInt(stepOcc(p, s))} exécutions</div>
        </div>
        <div class="step-row r3">
          <div class="flags">${FLAGS.map(f => chk(sc, f.key, s[f.key], `<span class="flag-chip ${f.short}">${f.short}</span> ${f.label}`)).join('')}</div>
          ${inp(sc, 'irritant', s.irritant, 'placeholder="Irritant constaté (ce qui fait perdre du temps, source d\'erreur…)"')}
        </div>
        ${isDec ? `<div class="step-row r4">
          Si ${inp(sc, 'labelSuite', s.labelSuite)} → étape suivante (${i + 2 <= steps.length ? i + 2 : 'fin'}) ; si ${inp(sc, 'labelCible', s.labelCible)} → ${sel(sc, 'cible', s.cible, targets)}
        </div>` : ''}
      </div>
      <div class="step-actions">
        <button class="icon-btn" title="Monter" data-action="move-step" data-id="${s.id}" data-dir="-1"${i === 0 ? ' disabled' : ''}>↑</button>
        <button class="icon-btn" title="Descendre" data-action="move-step" data-id="${s.id}" data-dir="1"${i === steps.length - 1 ? ' disabled' : ''}>↓</button>
        <button class="icon-btn" title="Insérer une étape après" data-action="add-step" data-after="${s.id}">+</button>
        <button class="icon-btn danger" title="Supprimer" data-action="del-step" data-id="${s.id}">✕</button>
      </div>
    </div>`;
  }).join('');
  return `
    ${datalists(p)}
    <div class="card">
      <div class="card-head"><div><h2>Relevé des étapes</h2>
        <p class="muted small">Dans l'ordre, du déclencheur au résultat. Pour chaque étape : qui, avec quoi, combien de temps (hors attente), et les irritants.
        Cochez <b>R</b> ressaisie, <b>M</b> retraitement manuel, <b>S</b> difficulté de suivi. « % des cas » sert aux étapes conditionnelles (ex. 25 % des demandes).</p></div>
        <a class="btn" href="#/p/${p.id}/carte">Voir la cartographie →</a></div>
      ${steps.length ? cards : `<div class="empty">Aucune étape relevée. Partez du déclencheur : « ${esc(p.declencheur || 'que se passe-t-il en premier ?')} »</div>`}
      <div class="actions" style="margin-top:12px">
        <button class="btn primary" data-action="add-step">+ Ajouter une étape</button>
        <button class="btn" data-action="add-step" data-type="decision">+ Ajouter une décision</button>
      </div>
    </div>`;
}

function tabCarte(p) {
  if (!p.steps.length) return `<div class="empty">Relevez d'abord les étapes pour générer la cartographie.<br><a class="btn primary" href="#/p/${p.id}/etapes">Relever les étapes</a></div>`;
  return `
    <div class="card">
      <div class="card-head">
        <div><h2>Cartographie actuelle (AS-IS)</h2><p class="muted small">Diagramme BPMN simplifié en couloirs, généré depuis le relevé. Cliquez sur une étape pour la modifier.</p></div>
        <div class="actions">
          <button class="btn sm" data-action="toggle-fit">${fitMaps ? '⤢ Taille réelle' : '⤡ Vue d\'ensemble'}</button>
          <button class="btn sm" data-action="export-png" data-which="asis">⭳ PNG</button>
          <button class="btn sm" data-action="export-svg" data-which="asis">⭳ SVG</button>
          <button class="btn sm" data-action="export-csv" title="Tableau pour Visio · Data Visualizer">⭳ CSV pour Visio</button>
        </div>
      </div>
      <div class="map-wrap${fitMaps ? ' fit' : ''}" data-scroll-key="asis">${renderMap(p, p.steps)}</div>
      ${mapLegend()}
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Temps par étape</h2><p class="muted small">Où part le temps sur une année.</p></div></div>
      ${paretoHtml(p)}
    </div>
    <p class="help">Export Visio : ouvrez le CSV dans Excel, mettez les données sous forme de tableau, puis dans Visio utilisez <i>Data Visualizer</i> (Organigramme de base / couloirs) en pointant sur ce tableau.</p>`;
}

function mapLegend() {
  return `<div class="map-legend">
    <span>${miniSvg('start')} Début</span><span>${miniSvg('end')} Fin</span><span>${miniSvg('tache')} Tâche</span>
    <span>${miniSvg('manuelle')} Manuelle</span><span>${miniSvg('auto')} Automatisée</span><span>${miniSvg('decision')} Décision</span>
    <span>${miniSvg('attente')} Attente</span>
    ${FLAGS.map(f => `<span><span class="flag-chip ${f.short}">${f.short}</span> ${f.label}</span>`).join('')}
    <span><span class="flag-chip X">!</span> Autre irritant</span>
    <span><span class="flag-chip ok">✓</span> Étape améliorée (cible)</span>
  </div>`;
}

function paretoHtml(p) {
  const rows = p.steps.map((s, i) => ({ s, i, v: stepAnnual(p, s) })).filter(r => r.v > 0).sort((a, b) => b.v - a.v);
  if (!rows.length) return '<p class="muted">Renseignez les durées et le volume pour voir la répartition.</p>';
  const max = rows[0].v;
  return `<div class="bars">${rows.map(({ s, i, v }) => `
    <div class="bar-row"><div class="bar-label" title="${esc(s.nom)}">${i + 1}. ${esc(s.nom)}</div>
      <div class="bar-track"><div class="bar${isIrritant(s) ? ' irr' : ''}" style="width:${v / max * 100}%"></div></div>
      <div class="bar-val">${fmtDur(v)}</div></div>`).join('')}</div>
    <div class="legend-inline"><span><i style="background:var(--danger)"></i>Étape irritante</span><span><i style="background:#7d93c4"></i>Autre étape</span></div>`;
}

function tabAnalyse(p) {
  const irr = p.steps.map((s, i) => ({ s, i })).filter(({ s }) => isIrritant(s));
  const stepOpts = [['', '— étape concernée —'], ...p.steps.map((s, i) => [s.id, `${i + 1}. ${s.nom || 'Sans nom'}`])];
  const impCards = p.ameliorations.map((a, k) => {
    const sc = 'a:' + a.id;
    const s = stepOf(p, a.stepId);
    const q = quadrant(p, a);
    const sup = a.levier === 'supprimer';
    return `
    <div class="imp-card${a.statut === 'ecartee' ? ' ecartee' : ''}" id="imp-${a.id}">
      <div class="imp-num">${k + 1}</div>
      <div class="imp-body">
        <div class="imp-row r1">
          ${field('Piste d\'amélioration', inp(sc, 'titre', a.titre, 'placeholder="Ex. Formulaire de demande en ligne"'))}
          ${field('Étape concernée', sel(sc, 'stepId', a.stepId, stepOpts))}
          ${field('Levier', sel(sc, 'levier', a.levier, LEVIERS))}
        </div>
        <div class="imp-row r2">
          ${field('Gain (min / fois)', sup ? `<input disabled value="${s ? num(s.duree) : 0} (étape supprimée)">` : numInp(sc, 'gain', a.gain))}
          ${field('Manip. évitées / fois', numInp(sc, 'manips', a.manips, 'title="Nombre de manipulations (clics, copier-coller, saisies) évitées à chaque exécution"'))}
          ${field('Effort', sel(sc, 'effort', a.effort, EFFORTS))}
          ${field('Statut', sel(sc, 'statut', a.statut, IMP_STATUTS))}
          <div class="flags" style="padding-bottom:8px">${chk(sc, 'tracabilite', a.tracabilite, 'Améliore la traçabilité')}${chk(sc, 'controle', a.controle, 'Sécurise un contrôle')}</div>
        </div>
        ${area(sc, 'description', a.description, 'rows="2" placeholder="Comment ? (outil, règle, qui porte la mise en œuvre…)"')}
        <div class="imp-foot">
          <span>Gain annuel : <b style="color:var(--ok)">${fmtDur(impAnnualGain(p, a))}</b> (${fmtEtp(impAnnualGain(p, a))})</span>
          <span>Manipulations évitées : <b>${fmtInt(impAnnualManips(p, a))}</b> / an</span>
          <span class="badge ${q}">${QUADRANTS[q]}</span>
        </div>
      </div>
      <div class="step-actions"><button class="icon-btn danger" title="Supprimer la piste" data-action="del-imp" data-id="${a.id}">✕</button></div>
    </div>`;
  }).join('');

  return `
    <div class="grid two">
      <div class="card">
        <div class="card-head"><div><h2>Irritants relevés</h2><p class="muted small">${irr.length} étape${irr.length > 1 ? 's' : ''} irritante${irr.length > 1 ? 's' : ''}. Chaque irritant devrait avoir au moins une piste.</p></div></div>
        ${irr.length ? `<div class="irr-list">${irr.map(({ s, i }) => {
          const imps = p.ameliorations.filter(a => a.stepId === s.id);
          return `<div class="irr-item"><div class="top">
              <div><div class="title">${i + 1}. ${esc(s.nom)} ${flagChips(s)}</div>
                <div class="desc">${esc(s.irritant || 'Irritant à préciser')}</div></div>
              <b class="num" style="white-space:nowrap">${fmtDur(stepAnnual(p, s))}/an</b></div>
            ${imps.length ? `<div class="imps">✓ ${imps.map(a => esc(a.titre || 'Piste sans titre')).join(' · ')}</div>`
              : `<div class="imps none">Aucune piste · <a href="#" data-action="add-imp" data-step="${s.id}">+ proposer une amélioration</a></div>`}
          </div>`;
        }).join('')}</div>` : '<p class="muted">Aucun irritant relevé. Cochez R / M / S ou décrivez l\'irritant dans le relevé des étapes.</p>'}
      </div>
      <div class="card">
        <div class="card-head"><div><h2>Temps par étape</h2><p class="muted small">Concentrer l'effort là où part le temps.</p></div></div>
        ${paretoHtml(p)}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Pistes d'amélioration</h2><p class="muted small">Une piste agit sur une étape : la supprimer, l'automatiser, la simplifier ou la standardiser. Les pistes « écartées » ne comptent pas dans les gains.</p></div>
        <button class="btn primary" data-action="add-imp">+ Ajouter une piste</button></div>
      ${impCards || '<div class="empty">Aucune piste pour l\'instant.</div>'}
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Matrice effort / gain</h2><p class="muted small">Gain fort = au moins ${esc(state.settings.seuilGain)} h/an (modifiable dans Mission &amp; poste). Survolez une bulle pour le détail.</p></div></div>
      ${matrixHtml(p.ameliorations.filter(a => a.statut !== 'ecartee').map(a => ({ p, a, label: p.ameliorations.indexOf(a) + 1 })))}
    </div>`;
}

function matrixHtml(items) {
  const cell = (q, title) => {
    const b = items.filter(it => quadrant(it.p, it.a) === q);
    return `<div class="mcell ${q}"><h4>${title}</h4><div class="bubbles">${b.map(it =>
      `<span class="bubble" title="${esc((it.a.titre || 'Piste') + ' — ' + fmtDur(impAnnualGain(it.p, it.a)) + '/an, effort ' + EFFORTS[it.a.effort])}">${esc(it.label)}</span>`).join('')}</div></div>`;
  };
  return `<div class="matrix">
    <div class="axis-y">Gain annuel →</div>
    ${cell('quickwin', 'Gains rapides')}${cell('planifier', 'À planifier')}${cell('structurant', 'Projets structurants')}
    ${cell('petit', 'Petits plus')}${cell('arbitrer', 'À arbitrer')}${cell('ecarter', 'À reconsidérer')}
    <div></div><div class="axis-x"><span>Effort faible</span><span>Effort moyen</span><span>Effort fort</span></div>
  </div>`;
}

function tabCible(p, s) {
  if (!p.steps.length) return `<div class="empty">Relevez d'abord les étapes.<br><a class="btn primary" href="#/p/${p.id}/etapes">Relever les étapes</a></div>`;
  const tobe = toBeSteps(p);
  const cmp = (label, before, after, fmt, hint = '') => `
    <div class="kpi compare"><div class="label">${label}</div>
      <div class="row"><span class="before">${fmt(before)}</span><span class="after">${fmt(after)}</span></div>
      <div class="delta">${before > after ? '−' + fmt(before - after) + ' (' + pct(before - after, before) + ')' : hint || 'inchangé'}</div></div>`;
  const plan = activeImps(p).slice().sort((a, b) => impAnnualGain(p, b) - impAnnualGain(p, a));
  const max = Math.max(1, s.total);
  return `
    <div class="kpis">
      ${cmp('Temps annuel', s.total, s.after, fmtDur)}
      ${cmp('Équivalent temps plein', s.total, s.after, fmtEtp)}
      ${cmp('Nombre d\'étapes', s.nbSteps, s.nbStepsAfter, fmtInt)}
      ${cmp('Étapes avec ressaisie', s.ressaisies, s.ressaisiesAfter, fmtInt)}
      ${cmp('Étapes irritantes', s.nbIrr, s.nbIrrAfter, fmtInt)}
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Valeur apportée</h2><p class="muted small">Les quatre indicateurs demandés : temps gagné, manipulations évitées, traçabilité, sécurisation des contrôles.</p></div></div>
      <div class="kpis" style="margin-bottom:0">
        ${kpi('Temps gagné', fmtDur(s.gain), fmtEtp(s.gain) + ' par an', 'good')}
        ${kpi('Manipulations évitées', fmtInt(s.manips), 'par an', 'good')}
        ${kpi('Traçabilité améliorée', s.tracab, `piste${s.tracab > 1 ? 's' : ''} concernée${s.tracab > 1 ? 's' : ''}`)}
        ${kpi('Contrôles sécurisés', s.controles, `piste${s.controles > 1 ? 's' : ''} concernée${s.controles > 1 ? 's' : ''}`)}
      </div>
      <div class="bars" style="margin-top:16px">
        <div class="bar-row"><div class="bar-label">Aujourd'hui</div><div class="bar-track"><div class="bar" style="width:${s.total / max * 100}%"></div></div><div class="bar-val">${fmtDur(s.total)}</div></div>
        <div class="bar-row"><div class="bar-label">Cible</div><div class="bar-track"><div class="bar after" style="width:${s.after / max * 100}%"></div><div class="bar gain" style="width:${s.gain / max * 100}%;opacity:.35"></div></div><div class="bar-val">${fmtDur(s.after)}</div></div>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div><h2>Cartographie cible (TO-BE)</h2><p class="muted small">Calculée à partir des pistes non écartées : étapes supprimées retirées, durées réduites, étapes automatisées passées en « système ». Les numéros renvoient au relevé actuel.</p></div>
        <div class="actions">
          <button class="btn sm" data-action="toggle-fit">${fitMaps ? '⤢ Taille réelle' : '⤡ Vue d\'ensemble'}</button>
          <button class="btn sm" data-action="export-png" data-which="tobe">⭳ PNG</button>
          <button class="btn sm" data-action="export-svg" data-which="tobe">⭳ SVG</button>
        </div>
      </div>
      <div class="map-wrap${fitMaps ? ' fit' : ''}" data-scroll-key="tobe">${tobe.length ? renderMap(p, tobe, { tobe: true }) : '<div class="empty">Toutes les étapes sont supprimées.</div>'}</div>
      ${mapLegend()}
    </div>
    <div class="card">
      <div class="card-head"><div><h2>Plan d'action</h2><p class="muted small">Pistes retenues ou proposées, classées par gain.</p></div></div>
      ${plan.length ? planTable(p, plan) : '<p class="muted">Aucune piste. Ajoutez-en dans l\'onglet « Analyse &amp; pistes ».</p>'}
    </div>`;
}

function planTable(p, plan) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>Piste</th><th>Étape</th><th>Levier</th><th>Priorité</th><th>Statut</th><th class="right">Gain / an</th><th class="right">Manip. évitées</th></tr></thead>
    <tbody>${plan.map(a => {
      const s = stepOf(p, a.stepId), q = quadrant(p, a);
      return `<tr><td><b>${esc(a.titre || 'Sans titre')}</b>${a.description ? `<div class="small muted">${esc(a.description)}</div>` : ''}</td>
        <td class="small">${s ? (p.steps.indexOf(s) + 1) + '. ' + esc(s.nom) : '—'}</td>
        <td class="small">${esc(LEVIERS[a.levier])}${a.tracabilite ? ' · traçabilité' : ''}${a.controle ? ' · contrôle' : ''}</td>
        <td><span class="badge ${q}">${QUADRANTS[q]}</span></td>
        <td class="small">${esc(IMP_STATUTS[a.statut])}</td>
        <td class="right num" style="color:var(--ok);font-weight:600">${fmtDur(impAnnualGain(p, a))}</td>
        <td class="right num">${fmtInt(impAnnualManips(p, a))}</td></tr>`;
    }).join('')}</tbody></table></div>`;
}

/* ---------- Synthèse ---------- */
function viewSynthese() {
  const m = state.mission;
  const g = globalStats();
  const ps = state.processes;
  const period = [m.debut, m.fin].filter(Boolean).map(d => new Date(d).toLocaleDateString('fr-FR')).join(' → ');
  const procs = ps.filter(p => p.steps.length).map(p => {
    const s = procStats(p);
    const irr = p.steps.map((st, i) => ({ st, i })).filter(({ st }) => isIrritant(st));
    const plan = activeImps(p).slice().sort((a, b) => impAnnualGain(p, b) - impAnnualGain(p, a));
    return `
    <section class="report-proc">
      <div class="card">
        <div class="eyebrow">${esc(p.domaine)} <span class="badge ${p.statut}">${esc(STATUTS[p.statut])}</span></div>
        <h2>${esc(p.nom)}</h2>
        <p class="muted">${esc(p.finalite)}</p>
        <div class="strip">
          <div>Volume<b>${fmtInt(volume(p))} / an</b></div>
          <div>Temps actuel<b>${fmtDur(s.total)}</b></div>
          <div>Irritants<b class="bad">${s.nbIrr} étapes · ${fmtDur(s.irrit)}</b></div>
          <div>Temps cible<b>${fmtDur(s.after)}</b></div>
          <div>Gain<b class="good">${fmtDur(s.gain)} · ${fmtEtp(s.gain)}</b></div>
          <div>Manip. évitées<b>${fmtInt(s.manips)} / an</b></div>
        </div>
        <h3 style="margin:10px 0 8px">Aujourd'hui</h3>
        <div class="map-wrap">${renderMap(p, p.steps)}</div>
        ${irr.length ? `<h3 style="margin:16px 0 6px">Irritants</h3><ul class="list-plain">${irr.map(({ st, i }) =>
          `<li><div>${i + 1}. <b>${esc(st.nom)}</b> ${flagChips(st)}<div class="meta">${esc(st.irritant)}</div></div><b class="num">${fmtDur(stepAnnual(p, st))}/an</b></li>`).join('')}</ul>` : ''}
        ${plan.length ? `<h3 style="margin:16px 0 6px">Pistes d'amélioration</h3>${planTable(p, plan)}
          <h3 style="margin:16px 0 8px">Demain (cible)</h3><div class="map-wrap">${renderMap(p, toBeSteps(p), { tobe: true })}</div>` : ''}
      </div>
    </section>`;
  }).join('');
  return `
    <div class="report">
      ${pageHead('Synthèse du diagnostic', esc(m.service || 'Diagnostic de poste'),
        [m.poste, m.titulaire && 'Titulaire : ' + esc(m.titulaire), m.analyste && 'Analyse : ' + esc(m.analyste), period].filter(Boolean).map(esc).join(' · '),
        `<button class="btn primary" data-action="print">🖶 Imprimer / PDF</button>`)}
      ${m.contexte ? `<div class="card"><h3 style="margin-bottom:6px">Contexte</h3><p style="white-space:pre-line">${esc(m.contexte)}</p></div>` : ''}
      <div class="kpis">
        ${kpi('Processus répertoriés', ps.length, ps.filter(p => p.steps.length).length + ' cartographiés')}
        ${kpi('Temps annuel actuel', fmtDur(g.total), fmtEtp(g.total))}
        ${kpi('Temps sur irritants', fmtDur(g.irrit), pct(g.irrit, g.total), 'bad')}
        ${kpi('Temps gagné', fmtDur(g.gain), fmtEtp(g.gain), 'good')}
        ${kpi('Manipulations évitées', fmtInt(g.manips), 'par an', 'good')}
        ${kpi('Traçabilité / contrôles', `${g.tracab} / ${g.controles}`, 'pistes concernées')}
      </div>
      <div class="card">
        <h3 style="margin-bottom:8px">Inventaire des processus du poste</h3>
        <div class="table-wrap"><table>
          <thead><tr><th>Processus</th><th>Domaine</th><th>Statut</th><th class="right">Volume / an</th><th class="right">Temps actuel</th><th class="right">Gain</th></tr></thead>
          <tbody>${ps.map(p => { const s = procStats(p); return `<tr><td><b>${esc(p.nom)}</b></td><td>${esc(p.domaine)}</td>
            <td><span class="badge ${p.statut}">${esc(STATUTS[p.statut])}</span></td><td class="right num">${fmtInt(volume(p))}</td>
            <td class="right num">${s.total ? fmtDur(s.total) : '—'}</td><td class="right num" style="color:var(--ok)">${s.gain ? fmtDur(s.gain) : '—'}</td></tr>`; }).join('')}</tbody>
        </table></div>
      </div>
      ${procs}
    </div>`;
}

/* ---------- Méthode ---------- */
function viewMethode() {
  const steps = [
    ['Identifier', 'Choisir le processus, son but, son début et sa fin. Répertorier toutes les activités du poste.', 'Inventaire · Cadrage'],
    ['Collecter', 'Entretiens et observation : étapes, acteurs, outils, données, temps passé, irritants.', 'Cadrage · Relevé des étapes'],
    ['Cartographier', 'Diagramme en couloirs (un couloir par acteur), notation BPMN simplifiée.', 'Cartographie actuelle'],
    ['Analyser', 'Repérer ressaisies, retraitements manuels, difficultés de suivi, attentes et goulots.', 'Analyse & pistes'],
    ['Améliorer & mesurer', 'Proposer des pistes, prioriser effort/gain, chiffrer la valeur et dessiner la cible.', 'Cible & gains · Synthèse']
  ];
  const questions = [
    'Qu\'est-ce qui déclenche ce travail ? Combien de fois par jour, semaine ou mois ?',
    'À quoi sert-il ? Qui utilise le résultat ?',
    'Quelles sont les étapes, dans l\'ordre ? Qui fait quoi ?',
    'Quels outils et quelles données utilisez-vous à chaque étape ?',
    'Combien de temps prend chaque étape, sans compter les attentes ?',
    'Saisissez-vous une information qui existe déjà ailleurs ? (ressaisie)',
    'Faites-vous des copier-coller, des mises en forme ou des calculs à la main ? (retraitement manuel)',
    'Comment savez-vous où en est une demande ? Qui relance, et comment ? (suivi)',
    'Quels contrôles sont faits ? Sont-ils tracés ? Que se passe-t-il en cas d\'erreur ?',
    'Dans quels cas le processus change-t-il de chemin ? Dans quelle proportion ?',
    'Qu\'est-ce qui vous fait perdre le plus de temps ? Que changeriez-vous en premier ?'
  ];
  const legend = [
    ['start', 'Événement de début', 'Ce qui déclenche le processus.'],
    ['end', 'Événement de fin', 'Le résultat obtenu.'],
    ['tache', 'Tâche', 'Action réalisée par un acteur dans un outil.'],
    ['manuelle', 'Tâche manuelle', 'Action hors outil (papier, téléphone…).'],
    ['auto', 'Tâche automatisée', 'Réalisée par le système, sans intervention.'],
    ['decision', 'Décision (passerelle)', 'Le chemin se sépare selon une condition.'],
    ['attente', 'Attente', 'Délai : validation, retour d\'un tiers…'],
    ['flow', 'Flux de séquence', 'L\'ordre d\'enchaînement des étapes.']
  ];
  return `
    ${pageHead('Méthode &amp; guide d\'entretien', 'Cartographie de processus · BPMN simplifié', 'Démarche en cinq temps, inspirée de la cartographie de processus (Businessmap) et de la notation BPMN (exemples Outscale). Objectif : une cartographie simple et rapide, pas un document lourd.')}
    <div class="card">
      <div class="card-head"><h2>La démarche</h2></div>
      <div class="method-steps">${steps.map(([t, d, w], i) => `
        <div class="method-step"><div class="n">${i + 1}</div><h4>${t}</h4><p>${d}</p><div class="where">→ <b>${w}</b></div></div>`).join('')}</div>
    </div>
    <div class="grid two">
      <div class="card">
        <div class="card-head"><h2>Guide d'entretien</h2></div>
        <ol class="questions">${questions.map(q => `<li>${esc(q)}</li>`).join('')}</ol>
      </div>
      <div class="card">
        <div class="card-head"><h2>Les trois irritants à traquer</h2></div>
        <ul class="list-plain">
          <li><div><span class="flag-chip R">R</span> <b>Ressaisie</b><div class="meta">Une même information saisie plusieurs fois, dans plusieurs outils.</div></div></li>
          <li><div><span class="flag-chip M">M</span> <b>Retraitement manuel</b><div class="meta">Copier-coller, mise en forme, calcul, consolidation faits à la main.</div></div></li>
          <li><div><span class="flag-chip S">S</span> <b>Difficulté de suivi</b><div class="meta">Pas de vision de l'avancement, relances manuelles, pas de trace.</div></div></li>
        </ul>
        <h3 style="margin:16px 0 6px">Calcul des temps</h3>
        <p class="muted small">Temps annuel d'une étape = durée (min) × volume annuel × % des cas. Un ETP = ${esc(state.settings.heuresEtp)} h par an (paramétrable).</p>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h2>Notation utilisée (BPMN simplifié)</h2><p class="muted small">Chaque acteur a son couloir horizontal ; on lit le processus de gauche à droite.</p></div>
      <div class="legend-grid">${legend.map(([k, t, d]) => `<div class="legend-item">${miniSvg(k, 34)}<div><b>${t}</b><p>${d}</p></div></div>`).join('')}</div>
    </div>`;
}

/* ==========================================================================
   Diagramme BPMN en couloirs (SVG autonome, exportable)
   ========================================================================== */
const C = {
  ink: '#1d2433', muted: '#5b6578', line: '#4a5568', laneHead: '#e9eef6', laneA: '#ffffff', laneB: '#f7f9fc', laneLine: '#d5dbe5',
  irrFill: '#fdeceb', irr: '#c8372d', okFill: '#e8f6ee', ok: '#1d8a5a', autoFill: '#eaf1fd', auto: '#2457c5',
  decFill: '#fff6e5', dec: '#b45309', start: '#1d8a5a', alt: '#b45309'
};

function wrapText(t, max, maxLines) {
  const words = String(t || '').split(/\s+/).filter(Boolean);
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

function laneList(p, steps) {
  const used = steps.map(s => (s.acteur || '').trim() || NA);
  const lanes = splitList(p.acteurs).filter(a => used.includes(a));
  used.forEach(a => { if (!lanes.includes(a)) lanes.push(a); });
  return lanes.length ? lanes : [NA];
}

function shapeIcon(type, x, y) {
  if (type === 'auto') {
    return `<g fill="none" stroke="${C.auto}"><circle cx="${x}" cy="${y}" r="4.6" stroke-width="2.6" stroke-dasharray="2 1.6"/><circle cx="${x}" cy="${y}" r="1.6" stroke-width="1.2"/></g>`;
  }
  if (type === 'manuelle') {
    return `<path d="M${x - 4} ${y - 5} h5 l3 3 v8 h-8 z M${x + 1} ${y - 5} v3 h3" fill="none" stroke="${C.muted}" stroke-width="1.2"/>`;
  }
  return `<g fill="none" stroke="${C.muted}" stroke-width="1.3"><circle cx="${x}" cy="${y - 2.5}" r="2.6"/><path d="M${x - 4.5} ${y + 5} a4.5 4.5 0 0 1 9 0"/></g>`;
}

function renderMap(p, steps, opt = {}) {
  const id = 'mk' + (++mapSeq) + (opt.tobe ? 't' : 'a');
  const lanes = laneList(p, steps);
  const HEAD = 132, COL = 152, LANE = 132, BW = 122, BH = 58, DR = 28, ER = 17;
  const n = steps.length;
  const loops = [];
  steps.forEach((s, i) => {
    if (s.type !== 'decision' || !s.cible) return;
    const t = steps.findIndex(x => x.id === s.cible);
    if (t >= 0 && t !== i + 1) loops.push({ i, t });
  });
  const LH = lanes.length * LANE;
  const GUT = loops.length ? 16 + loops.length * 14 : 0;
  const W = HEAD + (n + 2) * COL;
  const H = LH + GUT;
  const li = a => Math.max(0, lanes.indexOf((a || '').trim() || NA));
  const X = c => HEAD + c * COL + COL / 2;
  const Y = l => l * LANE + LANE / 2;

  const nodes = [
    { k: 'start', x: X(0), y: Y(li(steps[0].acteur)) },
    ...steps.map((s, i) => ({ k: s.type || 'tache', s, i, x: X(i + 1), y: Y(li(s.acteur)) })),
    { k: 'end', x: X(n + 1), y: Y(li(steps[n - 1].acteur)) }
  ];
  const round = k => k === 'start' || k === 'end' || k === 'attente';
  const hw = nd => nd.k === 'decision' ? DR : round(nd.k) ? ER : BW / 2;
  const hh = nd => nd.k === 'decision' ? DR : round(nd.k) ? ER : BH / 2;

  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Segoe UI, Roboto, Arial, sans-serif">`);
  o.push(`<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C.line}"/></marker>
    <marker id="${id}b" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C.alt}"/></marker></defs>`);
  o.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>`);

  // Couloirs
  lanes.forEach((name, l) => {
    o.push(`<rect x="0" y="${l * LANE}" width="${W}" height="${LANE}" fill="${l % 2 ? C.laneB : C.laneA}" stroke="${C.laneLine}"/>`);
    o.push(`<rect x="0" y="${l * LANE}" width="${HEAD - 12}" height="${LANE}" fill="${C.laneHead}" stroke="${C.laneLine}"/>`);
    o.push(svgLines((HEAD - 12) / 2, Y(l) + 4, wrapText(name, 15, 3), { center: true, weight: 600, size: 12 }));
  });

  // Flux de séquence
  for (let k = 0; k < nodes.length - 1; k++) {
    const a = nodes[k], b = nodes[k + 1];
    const x1 = a.x + hw(a), y1 = a.y, x2 = b.x - hw(b), y2 = b.y;
    const d = y1 === y2 ? `M${x1} ${y1} H${x2}` : `M${x1} ${y1} H${(x1 + x2) / 2} V${y2} H${x2}`;
    o.push(`<path d="${d}" fill="none" stroke="${C.line}" stroke-width="1.4" marker-end="url(#${id})"/>`);
    if (a.k === 'decision') o.push(`<text x="${x1 + 5}" y="${y1 - 6}" font-size="10.5" fill="${C.muted}">${esc(a.s.labelSuite || 'Oui')}</text>`);
  }
  // Branches alternatives des décisions (passent sous les couloirs)
  loops.forEach((lp, k) => {
    const a = nodes[lp.i + 1], t = nodes[lp.t + 1];
    const gy = LH + 10 + k * 14;
    // Entrée par le bas de la cible, décalée à droite pour ne pas couvrir la durée et l'outil
    const tx = t.k === 'decision' || round(t.k) ? t.x : t.x + BW / 2 - 12;
    o.push(`<path d="M${a.x} ${a.y + DR} V${gy} H${tx} V${t.y + hh(t)}" fill="none" stroke="${C.alt}" stroke-width="1.4" stroke-dasharray="5 3" marker-end="url(#${id}b)"/>`);
    o.push(`<text x="${a.x + 6}" y="${a.y + DR + 26}" font-size="10.5" fill="${C.alt}" font-weight="600">${esc(a.s.labelCible || 'Non')}</text>`);
  });

  // Nœuds
  nodes.forEach(nd => {
    if (nd.k === 'start' || nd.k === 'end') {
      const isStart = nd.k === 'start';
      o.push(`<circle cx="${nd.x}" cy="${nd.y}" r="${ER}" fill="#fff" stroke="${isStart ? C.start : C.ink}" stroke-width="${isStart ? 2 : 4}"/>`);
      o.push(svgLines(nd.x, nd.y + ER + 15, wrapText((isStart ? p.declencheur : p.resultat) || (isStart ? 'Début' : 'Fin'), 20, 3), { size: 10.5, fill: C.muted }));
      return;
    }
    const s = nd.s;
    const num0 = s._n || nd.i + 1;
    const irr = isIrritant(s);
    const annual = stepAnnual(p, s);
    const tip = [`${num0}. ${s.nom}`, `Acteur : ${s.acteur || NA}`, s.outil && `Outil : ${s.outil}`, s.donnees && `Données : ${s.donnees}`,
      `Durée : ${num(s.duree)} min${taux(s) < 100 ? ` (${taux(s)} % des cas)` : ''} · ${fmtDur(annual)}/an`,
      s.irritant && `Irritant : ${s.irritant}`,
      s._imps && s._imps.length && `Améliorations : ${s._imps.map(a => a.titre).join(' ; ')}`].filter(Boolean).join('\n');
    const g = [`<g data-step="${s.id}" style="cursor:pointer"><title>${esc(tip)}</title>`];
    let top = nd.y - BH / 2;
    const durTxt = num(s.duree) > 0 || s._gain ? `${fmtDec(num(s.duree))} min${taux(s) < 100 ? ` · ${fmtDec(taux(s))} %` : ''}` : '';

    if (nd.k === 'decision') {
      g.push(`<polygon points="${nd.x},${nd.y - DR} ${nd.x + DR},${nd.y} ${nd.x},${nd.y + DR} ${nd.x - DR},${nd.y}" fill="${irr ? C.irrFill : C.decFill}" stroke="${irr ? C.irr : C.dec}" stroke-width="1.6"/>`);
      g.push(`<text x="${nd.x}" y="${nd.y + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="${C.dec}">?</text>`);
      const lines = wrapText(s.nom, 22, 2);
      g.push(svgLines(nd.x, nd.y - DR - 7 - (lines.length - 1) * 13, lines, { size: 10.5, weight: 600 }));
      if (num(s.duree) > 0) g.push(`<text x="${nd.x + DR + 4}" y="${nd.y + 16}" font-size="10" fill="${C.muted}">${esc(durTxt)}</text>`);
    } else if (nd.k === 'attente') {
      top = nd.y - ER;
      g.push(`<circle cx="${nd.x}" cy="${nd.y}" r="${ER}" fill="#fff" stroke="${irr ? C.irr : C.muted}" stroke-width="1.5"/>`);
      g.push(`<circle cx="${nd.x}" cy="${nd.y}" r="${ER - 4}" fill="none" stroke="${irr ? C.irr : C.muted}" stroke-width="1.2"/>`);
      g.push(`<path d="M${nd.x} ${nd.y - 8} V${nd.y} L${nd.x + 6} ${nd.y + 3}" fill="none" stroke="${C.muted}" stroke-width="1.4"/>`);
      g.push(svgLines(nd.x, nd.y + ER + 14, wrapText(s.nom, 20, 2), { size: 10.5 }));
      if (durTxt) g.push(`<text x="${nd.x}" y="${nd.y + ER + 42}" text-anchor="middle" font-size="10" fill="${C.muted}">${esc(durTxt)}</text>`);
    } else {
      const x0 = nd.x - BW / 2, y0 = nd.y - BH / 2;
      let fill = '#fff', stroke = C.muted;
      if (s._improved) { fill = C.okFill; stroke = C.ok; }
      else if (irr) { fill = C.irrFill; stroke = C.irr; }
      else if (nd.k === 'auto') { fill = C.autoFill; stroke = C.auto; }
      g.push(`<rect x="${x0}" y="${y0}" width="${BW}" height="${BH}" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="1.6"${nd.k === 'manuelle' ? ' stroke-dasharray="5 3"' : ''}/>`);
      g.push(shapeIcon(nd.k, x0 + 11, y0 + 11));
      g.push(`<text x="${x0 + BW - 7}" y="${y0 + 13}" text-anchor="end" font-size="9.5" fill="${C.muted}">${num0}</text>`);
      g.push(svgLines(nd.x, nd.y + 8, wrapText(s.nom, 18, 3), { center: true, size: 11.2 }));
      const gainTxt = s._gain ? ` (−${fmtDec(s._gain)})` : '';
      g.push(`<text x="${nd.x}" y="${y0 + BH + 13}" text-anchor="middle" font-size="10.5" fill="${s._gain ? C.ok : C.ink}" font-weight="600">${esc(durTxt + gainTxt)}</text>`);
      if (s.outil) g.push(`<text x="${nd.x}" y="${y0 + BH + 25}" text-anchor="middle" font-size="10" fill="${C.muted}">${esc(wrapText(s.outil, 24, 1)[0] || '')}</text>`);
    }

    // Pastilles d'irritants / d'amélioration au-dessus de la forme
    const chips = FLAGS.filter(f => s[f.key]).map(f => ({ t: f.short, c: f.color }));
    if (!chips.length && String(s.irritant || '').trim()) chips.push({ t: '!', c: C.irr });
    if (s._improved) chips.push({ t: '✓', c: C.ok });
    if (chips.length) {
      const cw = 17, gap = 3, total = chips.length * cw + (chips.length - 1) * gap;
      // Décision : pastilles à gauche du losange (le libellé occupe le dessus)
      let cx = nd.k === 'decision' ? nd.x - DR - total - 4 : nd.x - total / 2;
      const cy = nd.k === 'decision' ? nd.y - 24 : top - 18;
      chips.forEach(ch => {
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

// Petites formes pour les légendes
function miniSvg(kind, size = 22) {
  const s = size, c = s / 2;
  let body = '';
  switch (kind) {
    case 'start': body = `<circle cx="${c}" cy="${c}" r="${s * .36}" fill="#fff" stroke="${C.start}" stroke-width="2"/>`; break;
    case 'end': body = `<circle cx="${c}" cy="${c}" r="${s * .34}" fill="#fff" stroke="${C.ink}" stroke-width="3.2"/>`; break;
    case 'decision': body = `<polygon points="${c},2 ${s - 2},${c} ${c},${s - 2} 2,${c}" fill="${C.decFill}" stroke="${C.dec}" stroke-width="1.5"/>`; break;
    case 'attente': body = `<circle cx="${c}" cy="${c}" r="${s * .4}" fill="#fff" stroke="${C.muted}" stroke-width="1.3"/><circle cx="${c}" cy="${c}" r="${s * .28}" fill="none" stroke="${C.muted}"/>`; break;
    case 'flow': body = `<defs><marker id="lg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${C.line}"/></marker></defs><path d="M2 ${c} H${s - 3}" stroke="${C.line}" stroke-width="1.5" marker-end="url(#lg-arrow)"/>`; break;
    default: {
      const stroke = kind === 'auto' ? C.auto : C.muted, fill = kind === 'auto' ? C.autoFill : '#fff';
      body = `<rect x="1.5" y="${s * .2}" width="${s - 3}" height="${s * .6}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="1.4"${kind === 'manuelle' ? ' stroke-dasharray="3 2"' : ''}/>`;
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
function mapSvgFor(p, which) {
  return which === 'tobe' ? renderMap(p, toBeSteps(p), { tobe: true }) : renderMap(p, p.steps);
}
function exportSvg(p, which) {
  const svg = '<?xml version="1.0" encoding="UTF-8"?>\n' + mapSvgFor(p, which);
  download(new Blob([svg], { type: 'image/svg+xml' }), `${slug(p.nom)}-${which === 'tobe' ? 'cible' : 'actuel'}.svg`);
}
function exportPng(p, which) {
  const svg = mapSvgFor(p, which);
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
    canvas.toBlob(b => {
      if (b) download(b, `${slug(p.nom)}-${which === 'tobe' ? 'cible' : 'actuel'}.png`);
      else toast('Export PNG impossible dans ce navigateur : utilisez le SVG.');
    }, 'image/png');
  };
  img.onerror = () => toast('Export PNG impossible : utilisez le SVG.');
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}
// Tableau au format « Data Visualizer » de Visio (organigramme de base)
function exportCsv(p) {
  const steps = p.steps;
  const idOf = i => 'P' + String(i + 1).padStart(2, '0');
  const rows = [['Process Step ID', 'Process Step Description', 'Next Step ID', 'Connector Label', 'Shape Type', 'Function', 'Phase', 'Alt Description']];
  rows.push(['DEBUT', p.declencheur || 'Début', steps.length ? idOf(0) : 'FIN', '', 'Start', (steps[0]?.acteur) || NA, '', '']);
  steps.forEach((s, i) => {
    const next = i + 1 < steps.length ? idOf(i + 1) : 'FIN';
    let nextIds = next, labels = '';
    if (s.type === 'decision') {
      const t = steps.findIndex(x => x.id === s.cible);
      if (t >= 0) { nextIds = next + ',' + idOf(t); labels = (s.labelSuite || 'Oui') + ',' + (s.labelCible || 'Non'); }
    }
    const alt = [s.outil && 'Outil : ' + s.outil, `${num(s.duree)} min`, s.irritant && 'Irritant : ' + s.irritant].filter(Boolean).join(' | ');
    rows.push([idOf(i), s.nom, nextIds, labels, s.type === 'decision' ? 'Decision' : 'Process', s.acteur || NA, '', alt]);
  });
  rows.push(['FIN', p.resultat || 'Fin', '', '', 'End', (steps[steps.length - 1]?.acteur) || NA, '', '']);
  const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
  download(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), `${slug(p.nom)}-visio.csv`);
}
function exportJson() {
  const d = new Date().toISOString().slice(0, 10);
  download(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }), `carto-process-${slug(state.mission.service || 'mission')}-${d}.json`);
}
function importJson(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !Array.isArray(data.processes)) throw new Error('format');
      if (!confirm('Remplacer les données actuelles par cette sauvegarde ?')) return;
      state = normalize(data);
      save();
      go('#/tableau');
      render();
      toast('Sauvegarde importée.');
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
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}

const actions = {
  'add-process'() {
    const p = newProcess();
    state.processes.push(p);
    save();
    go(`#/p/${p.id}/cadrage`);
  },
  'dup-process'(el) {
    const src = state.processes.find(p => p.id === el.dataset.id);
    if (!src) return;
    const copy = normalize({ processes: [JSON.parse(JSON.stringify(src))] }).processes[0];
    const ids = {};
    copy.id = uid();
    copy.nom = src.nom + ' (copie)';
    copy.steps.forEach(s => { const old = s.id; s.id = uid(); ids[old] = s.id; });
    copy.steps.forEach(s => { if (s.cible) s.cible = ids[s.cible] || ''; });
    copy.ameliorations.forEach(a => { a.id = uid(); a.stepId = ids[a.stepId] || ''; });
    state.processes.splice(state.processes.indexOf(src) + 1, 0, copy);
    save(); render();
  },
  'del-process'(el) {
    const p = state.processes.find(x => x.id === el.dataset.id);
    if (!p || !confirm(`Supprimer le processus « ${p.nom} » et toutes ses étapes ?`)) return;
    state.processes = state.processes.filter(x => x !== p);
    save();
    if (route().page === 'p') go('#/processus'); else render();
  },
  'add-step'(el) {
    const p = currentProcess();
    if (!p) return;
    const last = p.steps[p.steps.length - 1];
    const s = newStep({ acteur: last ? last.acteur : (splitList(p.acteurs)[0] || '') });
    if (el.dataset.type === 'decision') { s.type = 'decision'; s.duree = '0'; }
    const after = el.dataset.after ? p.steps.findIndex(x => x.id === el.dataset.after) : -1;
    if (after >= 0) p.steps.splice(after + 1, 0, s); else p.steps.push(s);
    if (p.statut === 'afaire') p.statut = 'encours';
    flashStep = 'step-' + s.id;
    save(); render();
    const input = document.querySelector(`[data-bind="s:${s.id}|nom"]`);
    if (input) input.focus();
  },
  'del-step'(el) {
    const p = currentProcess();
    const s = p && stepOf(p, el.dataset.id);
    if (!s) return;
    const linked = p.ameliorations.filter(a => a.stepId === s.id);
    const msg = `Supprimer l'étape « ${s.nom || 'sans nom'} » ?` + (linked.length ? `\n${linked.length} piste(s) d'amélioration liée(s) seront aussi supprimée(s).` : '');
    if (!confirm(msg)) return;
    p.steps = p.steps.filter(x => x !== s);
    p.steps.forEach(x => { if (x.cible === s.id) x.cible = ''; });
    p.ameliorations = p.ameliorations.filter(a => a.stepId !== s.id);
    save(); render();
  },
  'move-step'(el) {
    const p = currentProcess();
    const i = p.steps.findIndex(x => x.id === el.dataset.id);
    const j = i + Number(el.dataset.dir);
    if (i < 0 || j < 0 || j >= p.steps.length) return;
    [p.steps[i], p.steps[j]] = [p.steps[j], p.steps[i]];
    flashStep = 'step-' + el.dataset.id;
    save(); render();
  },
  'add-imp'(el) {
    const p = currentProcess();
    if (!p) return;
    const firstIrr = p.steps.find(s => isIrritant(s) && !p.ameliorations.some(a => a.stepId === s.id));
    const a = newImp({ stepId: el.dataset.step || (firstIrr ? firstIrr.id : (p.steps[0]?.id || '')) });
    p.ameliorations.push(a);
    flashStep = 'imp-' + a.id;
    save(); render();
    const input = document.querySelector(`[data-bind="a:${a.id}|titre"]`);
    if (input) input.focus();
  },
  'del-imp'(el) {
    const p = currentProcess();
    const a = p && p.ameliorations.find(x => x.id === el.dataset.id);
    if (!a || !confirm(`Supprimer la piste « ${a.titre || 'sans titre'} » ?`)) return;
    p.ameliorations = p.ameliorations.filter(x => x !== a);
    save(); render();
  },
  'export-svg'(el) { const p = currentProcess(); if (p) exportSvg(p, el.dataset.which); },
  'export-png'(el) { const p = currentProcess(); if (p) exportPng(p, el.dataset.which); },
  'export-csv'() { const p = currentProcess(); if (p) exportCsv(p); },
  'export-json'() { exportJson(); },
  'import-json'() { document.getElementById('importFile').click(); },
  'load-demo'() {
    if (state.processes.length && !confirm('Remplacer les données actuelles par la démonstration ?')) return;
    state = demoState();
    save(); go('#/tableau'); render();
  },
  'reset-all'() {
    if (!confirm('Effacer toutes les données et repartir de zéro ?\nPensez à exporter une sauvegarde avant si besoin.')) return;
    state = emptyState();
    save(); go('#/mission'); render();
    toast('Données effacées. Commencez par décrire la mission.');
  },
  'toggle-fit'() { fitMaps = !fitMaps; render(); },
  'print'() { window.print(); }
};

document.addEventListener('click', e => {
  const btn = e.target.closest('[data-action]');
  if (btn) {
    e.preventDefault();
    const fn = actions[btn.dataset.action];
    if (fn) fn(btn);
    return;
  }
  const node = e.target.closest('.map-wrap [data-step]');
  const p = currentProcess();
  if (node && p && stepOf(p, node.dataset.step)) {
    flashStep = 'step-' + node.dataset.step;
    go(`#/p/${p.id}/etapes`);
  }
});
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
window.addEventListener('hashchange', () => {
  render();
  if (!flashStep) window.scrollTo(0, 0);
});

/* ==========================================================================
   Données de démonstration (fictives)
   ========================================================================== */
function demoState() {
  const s = emptyState();
  s.isDemo = true;
  s.mission = {
    service: 'Gestion de la connaissance',
    poste: 'Chargé(e) de gestion de la connaissance',
    titulaire: 'Titulaire du poste (fictif)',
    analyste: 'Analyste mission',
    debut: '2026-11-02',
    fin: '2026-11-13',
    contexte: 'Comprendre le fonctionnement actuel du poste avec l\'équipe : étapes, finalité, acteurs, données et outils, temps passé et irritants (ressaisies, retraitements manuels, difficultés de suivi).\nLivrable : une cartographie simple et rapide, puis l\'objectivation de la valeur apportée (temps gagné, manipulations évitées, traçabilité, sécurisation des contrôles).'
  };
  const G = 'Gestionnaire connaissance', E = 'Expert métier', M = 'Manager', A = 'Conseiller agence', CF = 'Conformité';

  const p1 = newProcess({
    id: 'p1', nom: 'Mettre à jour une fiche procédure', domaine: 'Base de connaissance',
    finalite: 'Garantir que les fiches procédures utilisées par le réseau sont à jour et validées par un expert.',
    declencheur: 'Demande de mise à jour reçue', resultat: 'Fiche publiée et demandeur informé',
    volQty: '40', volPer: 'mois', criticite: '3', statut: 'valide',
    fournisseurs: 'Agences\nServices experts\nConformité', entrees: 'Demande par mail\nTexte réglementaire\nAncienne fiche',
    sorties: 'Fiche publiée\nTableau de suivi à jour', clients: 'Conseillers du réseau\nServices du siège',
    acteurs: `${G}, ${E}`, outils: 'Outlook, Excel, Word, SharePoint',
    interlocuteurs: 'Titulaire du poste, 1 expert métier', dateEntretien: '2026-11-03',
    notes: 'Pic de demandes en début de mois. 30 % des fiches repartent en correction après relecture.',
    steps: [
      newStep({ id: 'p1s1', nom: 'Recevoir la demande par mail', acteur: G, outil: 'Outlook', donnees: 'Objet, demandeur, fiche concernée', duree: '5', suivi: true, irritant: 'Demandes dispersées dans la boîte mail, aucune vision du stock' }),
      newStep({ id: 'p1s2', nom: 'Recopier la demande dans le tableau de suivi', acteur: G, outil: 'Excel', donnees: 'Objet, demandeur, date', duree: '4', ressaisie: true, irritant: 'Ressaisie des informations déjà présentes dans le mail' }),
      newStep({ id: 'p1s3', nom: 'Rédiger ou modifier la fiche', acteur: G, outil: 'Word', donnees: 'Contenu de la procédure', duree: '35' }),
      newStep({ id: 'p1s4', nom: 'Relire et valider la fiche', acteur: E, outil: 'Outlook', donnees: 'Fiche en pièce jointe', duree: '20', suivi: true, irritant: 'Relances manuelles, 6 jours de délai moyen, pas de trace de la validation' }),
      newStep({ id: 'p1s5', type: 'decision', nom: 'Fiche validée ?', acteur: E, duree: '0', cible: 'p1s3', labelSuite: 'Oui', labelCible: 'Non (30 %)' }),
      newStep({ id: 'p1s6', nom: 'Mettre en forme selon la charte', acteur: G, outil: 'Word', duree: '15', manuel: true, irritant: 'Mise en forme refaite à la main à chaque fiche' }),
      newStep({ id: 'p1s7', nom: 'Publier dans la base (copier-coller)', acteur: G, outil: 'SharePoint', duree: '10', ressaisie: true, irritant: 'Copier-coller Word vers SharePoint, mise en page cassée' }),
      newStep({ id: 'p1s8', nom: 'Mettre à jour le suivi et informer le demandeur', acteur: G, outil: 'Excel + Outlook', duree: '6', ressaisie: true, manuel: true, irritant: 'Double mise à jour Excel + mail' })
    ],
    ameliorations: [
      newImp({ titre: 'Liste des demandes SharePoint (vue « en cours »)', stepId: 'p1s1', levier: 'simplifier', gain: '2', manips: '1', tracabilite: true, effort: '1', statut: 'retenue', description: 'Le stock de demandes devient visible par toute l\'équipe.' }),
      newImp({ titre: 'Formulaire de demande en ligne (Microsoft Forms)', stepId: 'p1s2', levier: 'supprimer', manips: '3', tracabilite: true, effort: '1', statut: 'retenue', description: 'Le demandeur saisit lui-même ; la ligne de suivi est créée automatiquement.' }),
      newImp({ titre: 'Circuit de validation avec relance automatique', stepId: 'p1s4', levier: 'automatiser', gain: '8', manips: '2', tracabilite: true, controle: true, effort: '2', statut: 'retenue', description: 'Approbation Power Automate : relance à J+3, validation horodatée.' }),
      newImp({ titre: 'Modèle de fiche avec les styles de la charte', stepId: 'p1s6', levier: 'standardiser', gain: '10', manips: '5', effort: '1', statut: 'proposee' }),
      newImp({ titre: 'Rédaction directe dans un modèle de page SharePoint', stepId: 'p1s7', levier: 'simplifier', gain: '7', manips: '4', effort: '2', statut: 'proposee' }),
      newImp({ titre: 'Notification automatique au demandeur à la publication', stepId: 'p1s8', levier: 'automatiser', gain: '5', manips: '2', tracabilite: true, effort: '1', statut: 'proposee' })
    ]
  });

  const p2 = newProcess({
    id: 'p2', nom: 'Répondre aux questions des agences', domaine: 'Assistance réseau',
    finalite: 'Apporter une réponse fiable et rapide aux conseillers sur les procédures.',
    declencheur: 'Question d\'un conseiller', resultat: 'Réponse envoyée et tracée',
    volQty: '10', volPer: 'jour', criticite: '3', statut: 'fait',
    fournisseurs: 'Conseillers agence', entrees: 'Question par mail', sorties: 'Réponse écrite', clients: 'Conseillers agence',
    acteurs: `${A}, ${G}, ${E}`, outils: 'Outlook, SharePoint, Excel, Teams',
    steps: [
      newStep({ id: 'p2s1', nom: 'Poser la question par mail', acteur: A, outil: 'Outlook', duree: '3' }),
      newStep({ id: 'p2s2', nom: 'Lire et qualifier la question', acteur: G, outil: 'Outlook', duree: '3', suivi: true, irritant: 'Pas de catégorisation : impossible de savoir quels sujets reviennent' }),
      newStep({ id: 'p2s3', nom: 'Rechercher la réponse dans la base', acteur: G, outil: 'SharePoint', duree: '8', manuel: true, irritant: 'Recherche peu pertinente, fiches mal indexées' }),
      newStep({ id: 'p2s4', type: 'decision', nom: 'Réponse trouvée ?', acteur: G, duree: '0', cible: 'p2s6', labelSuite: 'Non (25 %)', labelCible: 'Oui' }),
      newStep({ id: 'p2s5', nom: 'Solliciter l\'expert et attendre son retour', acteur: E, outil: 'Outlook / Teams', duree: '15', taux: '25', suivi: true, irritant: 'Relances, pas de délai de réponse partagé' }),
      newStep({ id: 'p2s6', nom: 'Rédiger et envoyer la réponse', acteur: G, outil: 'Outlook', duree: '6' }),
      newStep({ id: 'p2s7', nom: 'Consigner la question dans le fichier de suivi', acteur: G, outil: 'Excel', duree: '2', ressaisie: true, irritant: 'Double saisie mail + Excel, souvent oubliée' })
    ],
    ameliorations: [
      newImp({ titre: 'Boîte partagée avec catégories par thème', stepId: 'p2s2', levier: 'simplifier', gain: '1', manips: '1', tracabilite: true, effort: '1', statut: 'retenue' }),
      newImp({ titre: 'Mots-clés sur les fiches + FAQ des 50 questions récurrentes', stepId: 'p2s3', levier: 'simplifier', gain: '4', manips: '3', effort: '2', statut: 'retenue' }),
      newImp({ titre: 'Canal Teams experts avec délai de réponse convenu', stepId: 'p2s5', levier: 'simplifier', gain: '5', manips: '1', tracabilite: true, effort: '1', statut: 'proposee' }),
      newImp({ titre: 'Supprimer le fichier Excel : suivi par les catégories', stepId: 'p2s7', levier: 'supprimer', manips: '2', tracabilite: true, effort: '1', statut: 'retenue' })
    ]
  });

  const p3 = newProcess({
    id: 'p3', nom: 'Produire le reporting mensuel d\'activité', domaine: 'Pilotage',
    finalite: 'Rendre compte de l\'activité de la base de connaissance à la direction.',
    declencheur: 'Début de mois', resultat: 'Reporting diffusé',
    volQty: '1', volPer: 'mois', criticite: '2', statut: 'fait',
    fournisseurs: 'Statistiques SharePoint\nFichiers de suivi', entrees: 'Exports de consultation\nTableaux Excel',
    sorties: 'Présentation mensuelle', clients: 'Direction\nManager',
    acteurs: `${G}, ${M}`, outils: 'SharePoint, Excel, PowerPoint, Outlook',
    steps: [
      newStep({ id: 'p3s1', nom: 'Extraire les statistiques de consultation', acteur: G, outil: 'SharePoint', duree: '30', manuel: true, irritant: 'Export manuel de 4 rapports différents' }),
      newStep({ id: 'p3s2', nom: 'Consolider les données dans Excel', acteur: G, outil: 'Excel', duree: '90', ressaisie: true, manuel: true, irritant: 'Copier-coller et retraitements, risque d\'erreur' }),
      newStep({ id: 'p3s3', nom: 'Construire graphiques et présentation', acteur: G, outil: 'PowerPoint', duree: '60', manuel: true, irritant: 'Graphiques refaits chaque mois' }),
      newStep({ id: 'p3s4', nom: 'Relire et valider', acteur: M, outil: 'Outlook', duree: '20' }),
      newStep({ id: 'p3s5', type: 'decision', nom: 'Corrections à faire ?', acteur: M, duree: '0', cible: 'p3s3', labelSuite: 'Non', labelCible: 'Oui' }),
      newStep({ id: 'p3s6', nom: 'Diffuser le reporting', acteur: G, outil: 'Outlook', duree: '10' })
    ],
    ameliorations: [
      newImp({ titre: 'Extraction planifiée des statistiques', stepId: 'p3s1', levier: 'automatiser', gain: '25', manips: '12', effort: '2', statut: 'proposee' }),
      newImp({ titre: 'Rapport Power BI connecté aux sources', stepId: 'p3s2', levier: 'automatiser', gain: '80', manips: '40', tracabilite: true, controle: true, effort: '3', statut: 'proposee', description: 'Calculs fiabilisés et identiques chaque mois.' }),
      newImp({ titre: 'Le rapport en ligne remplace la présentation', stepId: 'p3s3', levier: 'supprimer', manips: '20', effort: '2', statut: 'proposee' }),
      newImp({ titre: 'Diffusion par lien vers le rapport', stepId: 'p3s6', levier: 'simplifier', gain: '7', manips: '2', effort: '1', statut: 'proposee' })
    ]
  });

  const p4 = newProcess({
    id: 'p4', nom: 'Veille réglementaire et lettre d\'information', domaine: 'Veille',
    finalite: 'Informer le réseau des évolutions réglementaires impactant les procédures.',
    declencheur: 'Chaque lundi', resultat: 'Lettre d\'information diffusée',
    volQty: '1', volPer: 'semaine', criticite: '2', statut: 'encours',
    acteurs: `${G}, ${CF}`, outils: 'Navigateur, Word, Outlook',
    steps: [
      newStep({ id: 'p4s1', nom: 'Consulter les sources de veille', acteur: G, outil: 'Navigateur', duree: '45', manuel: true, irritant: '10 sites consultés un par un' }),
      newStep({ id: 'p4s2', nom: 'Sélectionner et résumer les nouveautés', acteur: G, outil: 'Word', duree: '40' }),
      newStep({ id: 'p4s3', type: 'attente', nom: 'Attendre le retour de la conformité', acteur: CF, duree: '0', suivi: true, irritant: 'Délai variable, aucune visibilité' }),
      newStep({ id: 'p4s4', nom: 'Valider le contenu', acteur: CF, outil: 'Outlook', duree: '30', suivi: true, irritant: 'Validation par mail, pas d\'historique' }),
      newStep({ id: 'p4s5', nom: 'Mettre en page et diffuser la lettre', acteur: G, outil: 'Outlook', duree: '20', manuel: true, irritant: 'Liste de diffusion tenue à la main' })
    ],
    ameliorations: [
      newImp({ titre: 'Alertes de veille automatiques dans Teams', stepId: 'p4s1', levier: 'automatiser', gain: '20', manips: '10', effort: '1', statut: 'retenue' }),
      newImp({ titre: 'Approbation tracée dans Teams', stepId: 'p4s4', levier: 'simplifier', gain: '10', manips: '2', tracabilite: true, controle: true, effort: '1', statut: 'proposee' }),
      newImp({ titre: 'Actualité SharePoint avec abonnement', stepId: 'p4s5', levier: 'simplifier', gain: '15', manips: '3', effort: '2', statut: 'proposee' })
    ]
  });

  const p5 = newProcess({ id: 'p5', nom: 'Revue annuelle des contenus obsolètes', domaine: 'Base de connaissance', volQty: '1', volPer: 'an', criticite: '2', statut: 'afaire', finalite: 'Retirer ou mettre à jour les fiches dépassées.' });
  const p6 = newProcess({ id: 'p6', nom: 'Gérer les droits d\'accès à la base', domaine: 'Administration', volQty: '3', volPer: 'mois', criticite: '1', statut: 'afaire' });

  s.processes = [p1, p2, p3, p4, p5, p6];
  return s;
}

/* ---------- Démarrage ---------- */
if (!location.hash) history.replaceState(null, '', '#/tableau');
save();
render();
