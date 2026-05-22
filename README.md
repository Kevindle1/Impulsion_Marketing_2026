# <!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DevHub — Mes développements</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
<style>
:root {
  --bg: #0e1014;
  --bg-1: #15181f;
  --bg-2: #1c2029;
  --bg-3: #252a36;
  --border: #2a2f3d;
  --border-soft: #1f2330;
  --text: #e7e9ee;
  --text-dim: #9ba1b0;
  --text-faint: #5f6677;
  --accent: #d4a574;
  --accent-soft: rgba(212, 165, 116, 0.12);
  --blue: #6ba3d6;
  --green: #7ec27e;
  --red: #d97171;
  --font-display: 'Fraunces', serif;
  --font-body: 'IBM Plex Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, monospace;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  height: 100%; background: var(--bg); color: var(--text);
  font-family: var(--font-body); font-size: 14px; line-height: 1.5;
  overflow: hidden;
}
body { display: grid; grid-template-columns: 320px 1fr; }
.sidebar { background: var(--bg-1); border-right: 1px solid var(--border); display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
.sidebar-head { padding: 20px 18px 16px; border-bottom: 1px solid var(--border-soft); }
.logo { display: flex; align-items: baseline; gap: 10px; }
.logo-mark { color: var(--accent); font-size: 18px; }
.logo-text { font-family: var(--font-display); font-size: 22px; font-weight: 600; font-style: italic; letter-spacing: -0.01em; }
.meta { margin-top: 6px; font-family: var(--font-mono); font-size: 11px; color: var(--text-faint); }
.folder-btn { margin: 12px 14px; padding: 10px 14px; background: var(--accent); color: var(--bg); border: none; border-radius: 4px; cursor: pointer; font-family: var(--font-mono); font-size: 11.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; transition: opacity 0.15s; }
.folder-btn:hover { opacity: 0.9; }
.folder-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.search-wrap { padding: 0 14px 12px; }
#search { width: 100%; background: var(--bg-2); border: 1px solid var(--border); color: var(--text); padding: 9px 12px; font-family: var(--font-mono); font-size: 12px; border-radius: 4px; outline: none; transition: border-color 0.15s; }
#search:focus { border-color: var(--accent); background: var(--bg); }
#search::placeholder { color: var(--text-faint); }
.project-list { flex: 1; overflow-y: auto; padding: 8px 0; }
.project-item { padding: 10px 18px; cursor: pointer; border-left: 2px solid transparent; transition: background 0.12s, border-color 0.12s; }
.project-item:hover { background: var(--bg-2); }
.project-item.active { background: var(--bg-2); border-left-color: var(--accent); }
.project-item.is-archive { opacity: 0.6; }
.project-item.is-archive .pname::before { content: '⌧ '; color: var(--text-faint); font-family: var(--font-mono); }
.project-item .pname { font-weight: 500; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.project-item .pmeta { margin-top: 2px; font-family: var(--font-mono); font-size: 10.5px; color: var(--text-faint); }
.empty { padding: 20px; text-align: center; color: var(--text-faint); font-family: var(--font-mono); font-size: 11px; }
.main { height: 100vh; overflow: hidden; display: flex; flex-direction: column; }
.hidden { display: none !important; }
.welcome { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; overflow-y: auto; }
.welcome-inner { max-width: 620px; width: 100%; }
.welcome h1 { font-family: var(--font-display); font-size: 52px; font-weight: 600; line-height: 1.05; letter-spacing: -0.025em; }
.welcome h1 em { font-style: italic; color: var(--accent); font-weight: 400; }
.welcome .lead { margin-top: 18px; font-size: 16px; color: var(--text-dim); max-width: 520px; }
.welcome code { font-family: var(--font-mono); font-size: 0.88em; background: var(--bg-2); padding: 1px 6px; border-radius: 3px; color: var(--accent); border: 1px solid var(--border-soft); }
.welcome-hint { margin-top: 36px; padding: 20px 22px; background: var(--bg-1); border: 1px solid var(--border-soft); border-left: 2px solid var(--accent); border-radius: 0 4px 4px 0; }
.welcome-hint strong { font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent); }
.welcome-hint ol { margin-top: 10px; padding-left: 20px; color: var(--text-dim); font-size: 13.5px; line-height: 1.8; }
.welcome-warn { margin-top: 18px; padding: 12px 16px; background: rgba(217, 113, 113, 0.06); border: 1px solid rgba(217, 113, 113, 0.2); border-radius: 4px; display: none; font-size: 12.5px; color: var(--text-dim); }
.project-view { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.proj-header { padding: 22px 28px 18px; border-bottom: 1px solid var(--border-soft); display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; }
.proj-title h2 { font-family: var(--font-display); font-size: 28px; font-weight: 600; letter-spacing: -0.02em; }
.proj-actions { display: flex; gap: 8px; margin-top: 10px; }
.btn-action { background: var(--bg-2); color: var(--text-dim); border: 1px solid var(--border); padding: 7px 14px; border-radius: 4px; cursor: pointer; font-family: var(--font-mono); font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; transition: all 0.15s; }
.btn-action:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-soft); }
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-action.primary { background: var(--accent); color: var(--bg); border-color: var(--accent); }
.btn-action.primary:hover { opacity: 0.9; color: var(--bg); }
.proj-stats { font-family: var(--font-mono); font-size: 11px; color: var(--text-faint); text-align: right; line-height: 1.7; }
.proj-stats strong { color: var(--text-dim); font-weight: 500; }
.split { display: grid; grid-template-columns: 280px 1fr; flex: 1; overflow: hidden; }
.tree-panel { border-right: 1px solid var(--border-soft); background: var(--bg-1); display: flex; flex-direction: column; overflow: hidden; }
.tree-head { padding: 10px 16px; font-family: var(--font-mono); font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-faint); border-bottom: 1px solid var(--border-soft); }
.tree { flex: 1; overflow-y: auto; padding: 8px 0; font-family: var(--font-mono); font-size: 12.5px; }
.tree-node { padding: 3px 12px 3px 0; cursor: pointer; user-select: none; white-space: nowrap; display: flex; align-items: center; gap: 4px; color: var(--text-dim); transition: background 0.1s, color 0.1s; }
.tree-node:hover { background: var(--bg-2); color: var(--text); }
.tree-node.active { background: var(--accent-soft); color: var(--accent); }
.tree-node .ico { display: inline-block; width: 14px; text-align: center; flex-shrink: 0; opacity: 0.6; }
.tree-node.dir .ico { color: var(--blue); }
.tree-node.file.not-readable { opacity: 0.5; cursor: default; }
.tree-node.file.not-readable:hover { background: transparent; color: var(--text-dim); }
.tree-children.collapsed { display: none; }
.code-panel { display: flex; flex-direction: column; overflow: hidden; background: var(--bg); }
.code-head { padding: 10px 18px; background: var(--bg-1); border-bottom: 1px solid var(--border-soft); font-family: var(--font-mono); font-size: 11.5px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.file-path { color: var(--text-dim); }
.file-info { color: var(--text-faint); font-size: 10.5px; }
.code-wrap { flex: 1; overflow: auto; margin: 0; background: var(--bg); }
.code-wrap code { display: block; padding: 18px 20px; font-family: var(--font-mono); font-size: 12.5px; line-height: 1.65; background: transparent !important; }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 14px 20px; border-radius: 4px; background: var(--bg-1); border: 1px solid var(--border); border-left: 3px solid var(--accent); font-family: var(--font-mono); font-size: 12px; color: var(--text); z-index: 1000; box-shadow: 0 8px 24px rgba(0,0,0,0.4); min-width: 280px; max-width: 420px; animation: slideIn 0.25s ease-out; }
.toast.success { border-left-color: var(--green); }
.toast.error { border-left-color: var(--red); }
.toast .t-title { font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; font-size: 10.5px; color: var(--text-faint); margin-bottom: 4px; }
.toast.success .t-title { color: var(--green); }
.toast.error .t-title { color: var(--red); }
@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
.overlay { position: fixed; inset: 0; background: rgba(14, 16, 20, 0.85); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.overlay-inner { background: var(--bg-1); border: 1px solid var(--border); padding: 28px 40px; border-radius: 6px; text-align: center; min-width: 320px; }
.overlay-title { font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--accent); margin-bottom: 12px; }
.overlay-msg { font-family: var(--font-mono); font-size: 12px; color: var(--text-dim); }
.progress { margin-top: 16px; height: 3px; background: var(--bg-2); border-radius: 2px; overflow: hidden; }
.progress-bar { height: 100%; background: var(--accent); width: 0%; transition: width 0.2s; }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--bg-3); border-radius: 5px; border: 2px solid var(--bg); }
::-webkit-scrollbar-thumb:hover { background: var(--border); }
@media (max-width: 900px) {
  body { grid-template-columns: 1fr; }
  .sidebar { height: 40vh; border-right: none; border-bottom: 1px solid var(--border); }
  .main { height: 60vh; }
  .split { grid-template-columns: 1fr; }
  .welcome h1 { font-size: 36px; }
}
</style>
</head>
<body>
<aside class="sidebar">
  <div class="sidebar-head">
    <div class="logo"><span class="logo-mark">◆</span><span class="logo-text">DevHub</span></div>
    <div class="meta" id="meta">Aucun dossier chargé</div>
  </div>
  <button class="folder-btn" id="pickBtn">Choisir le dossier</button>
  <div class="search-wrap"><input type="text" id="search" placeholder="Filtrer les projets…" autocomplete="off"></div>
  <nav class="project-list" id="projectList"><div class="empty">Aucun projet</div></nav>
</aside>
<main class="main">
  <div id="welcome" class="welcome">
    <div class="welcome-inner">
      <h1>Mes <em>développements</em></h1>
      <p class="lead">Index local de mes projets. Choisis un dossier (ex: <code>U:\Développement</code>) et l'app liste tous les sous-dossiers avec leur arborescence, le code des fichiers, et permet d'archiver une version zip directement dans le dossier.</p>
      <div class="welcome-hint">
        <strong>Démarrage</strong>
        <ol>
          <li>Clique sur <code>Choisir le dossier</code> en haut à gauche</li>
          <li>Sélectionne le dossier racine (ex: <code>U:\Développement</code>)</li>
          <li>Autorise la <strong>lecture et écriture</strong> quand le navigateur demande</li>
          <li>Sur un projet, bouton <code>Archiver</code> → crée <code>archive-DATE-Projet.zip</code> dans le dossier</li>
        </ol>
      </div>
      <div class="welcome-warn" id="warn"></div>
    </div>
  </div>
  <article id="projectView" class="project-view hidden">
    <header class="proj-header">
      <div class="proj-title">
        <h2 id="projName">—</h2>
        <div class="proj-actions">
          <button class="btn-action primary" id="archiveBtn">Archiver</button>
          <button class="btn-action" id="refreshBtn">Rescanner</button>
        </div>
      </div>
      <div class="proj-stats" id="projStats"></div>
    </header>
    <div class="split">
      <div class="tree-panel">
        <div class="tree-head">Arborescence</div>
        <div class="tree" id="tree"></div>
      </div>
      <div class="code-panel">
        <div class="code-head">
          <span id="filePath" class="file-path">Sélectionne un fichier</span>
          <span id="fileInfo" class="file-info"></span>
        </div>
        <pre class="code-wrap"><code id="code" class="hljs"></code></pre>
      </div>
    </div>
  </article>
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script>
const state = { rootHandle: null, rootName: null, projects: [], current: null };
const CODE_EXT = new Set(['html','htm','css','scss','sass','less','js','mjs','cjs','jsx','ts','tsx','vue','json','xml','yaml','yml','toml','ini','env','md','txt','csv','log','py','rb','php','java','cs','cpp','c','h','go','rs','sql','sh','ps1','bat','cmd','vbs','vba','bas','cls','gitignore','editorconfig']);
const MAX_FILE_SIZE = 1000000;
const IGNORE_DIRS = new Set(['node_modules','.git','.svn','dist','build','.next','.nuxt','__pycache__','vendor','bin','obj','.vs','.idea']);
const $ = (sel) => document.querySelector(sel);
function fmtSize(b) { if (b < 1024) return b + ' o'; if (b < 1048576) return (b/1024).toFixed(1) + ' Ko'; return (b/1048576).toFixed(1) + ' Mo'; }
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }); }
function todayStr() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function getExt(name) { const i = name.lastIndexOf('.'); return i < 0 ? '' : name.slice(i+1).toLowerCase(); }
function fileIcon(name) {
  if (name === 'package.json') return '⬢';
  if (/^readme/i.test(name)) return '★';
  const ext = getExt(name);
  const map = { html:'◧', htm:'◧', css:'◐', scss:'◐', sass:'◐', js:'◉', mjs:'◉', cjs:'◉', jsx:'◉', ts:'◉', tsx:'◉', json:'◈', xml:'◈', yaml:'◈', yml:'◈', md:'◰', txt:'◰', py:'◎', rb:'◎', php:'◎', ps1:'▸', bat:'▸', sh:'▸', cmd:'▸', sql:'◫', vba:'◆', bas:'◆', cls:'◆' };
  return map[ext] || '○';
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function toast(title, msg, type = 'info', duration = 4000) {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<div class="t-title">${escapeHtml(title)}</div><div>${escapeHtml(msg)}</div>`;
  document.body.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; }, duration - 300);
  setTimeout(() => el.remove(), duration);
}
function showOverlay(title, msg) {
  let o = $('#overlay');
  if (!o) {
    o = document.createElement('div');
    o.id = 'overlay';
    o.className = 'overlay';
    o.innerHTML = `<div class="overlay-inner"><div class="overlay-title" id="ovTitle"></div><div class="overlay-msg" id="ovMsg"></div><div class="progress"><div class="progress-bar" id="ovBar"></div></div></div>`;
    document.body.appendChild(o);
  }
  $('#ovTitle').textContent = title;
  $('#ovMsg').textContent = msg;
  $('#ovBar').style.width = '0%';
}
function setProgress(pct, msg) { $('#ovBar').style.width = pct + '%'; if (msg) $('#ovMsg').textContent = msg; }
function hideOverlay() { const o = $('#overlay'); if (o) o.remove(); }
function checkApiSupport() {
  if (!window.showDirectoryPicker) {
    $('#warn').innerHTML = '<strong>Navigateur non compatible.</strong><br>Utilise <strong>Chrome</strong> ou <strong>Edge</strong> récent. Firefox et Safari ne supportent pas la File System Access API.';
    $('#warn').style.display = 'block';
    $('#pickBtn').disabled = true;
    return false;
  }
  return true;
}
async function scanDirectory(dirHandle, depth = 0, maxDepth = 6) {
  if (depth > maxDepth) return { children: [], fileCount: 0, totalSize: 0, lastMod: 0 };
  const children = [];
  let fileCount = 0, totalSize = 0, lastMod = 0;
  try {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'directory') {
        if (IGNORE_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
        const sub = await scanDirectory(entry, depth + 1, maxDepth);
        children.push({ type: 'dir', name: entry.name, handle: entry, children: sub.children });
        fileCount += sub.fileCount; totalSize += sub.totalSize;
        if (sub.lastMod > lastMod) lastMod = sub.lastMod;
      } else if (entry.kind === 'file') {
        try {
          const file = await entry.getFile();
          const ext = getExt(entry.name);
          const readable = (CODE_EXT.has(ext) || /^readme$/i.test(entry.name)) && file.size < MAX_FILE_SIZE;
          children.push({ type: 'file', name: entry.name, handle: entry, size: file.size, modified: file.lastModified, ext, readable });
          fileCount++; totalSize += file.size;
          if (file.lastModified > lastMod) lastMod = file.lastModified;
        } catch (e) {}
      }
    }
  } catch (e) { console.warn('Scan échec', dirHandle.name, e); }
  children.sort((a, b) => { if (a.type !== b.type) return a.type === 'dir' ? -1 : 1; return a.name.localeCompare(b.name, 'fr'); });
  return { children, fileCount, totalSize, lastMod };
}
async function pickFolder() {
  try {
    const rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
    const perm = await rootHandle.queryPermission({ mode: 'readwrite' });
    if (perm !== 'granted') {
      const ask = await rootHandle.requestPermission({ mode: 'readwrite' });
      if (ask !== 'granted') { toast('Permission refusée', 'Sans accès en écriture, impossible d\'archiver.', 'error'); return; }
    }
    state.rootHandle = rootHandle;
    state.rootName = rootHandle.name;
    await rescanAll();
  } catch (e) { if (e.name !== 'AbortError') { console.error(e); toast('Erreur', e.message, 'error'); } }
}
async function rescanAll() {
  if (!state.rootHandle) return;
  $('#projectList').innerHTML = '<div class="empty">Scan en cours…</div>';
  state.projects = [];
  const projectHandles = [];
  for await (const entry of state.rootHandle.values()) {
    if (entry.kind === 'directory' && !IGNORE_DIRS.has(entry.name) && !entry.name.startsWith('.')) {
      projectHandles.push(entry);
    }
  }
  projectHandles.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  for (let i = 0; i < projectHandles.length; i++) {
    const h = projectHandles[i];
    $('#projectList').innerHTML = `<div class="empty">Scan… (${i+1}/${projectHandles.length})<br>${escapeHtml(h.name)}</div>`;
    const result = await scanDirectory(h);
    state.projects.push({
      name: h.name, handle: h, tree: result.children,
      fileCount: result.fileCount, totalSize: result.totalSize, lastMod: result.lastMod,
      isArchive: /^archive-\d{4}-\d{2}-\d{2}-/.test(h.name),
    });
  }
  $('#meta').textContent = `${state.rootName} · ${state.projects.length} projet${state.projects.length > 1 ? 's' : ''}`;
  renderProjectList();
  if (state.current) {
    const stillThere = state.projects.find(p => p.name === state.current.name);
    if (stillThere) openProject(stillThere);
    else { state.current = null; $('#welcome').classList.remove('hidden'); $('#projectView').classList.add('hidden'); }
  }
}
function renderProjectList() {
  const filter = $('#search').value.toLowerCase().trim();
  const list = state.projects.filter(p => !filter || p.name.toLowerCase().includes(filter));
  if (list.length === 0) { $('#projectList').innerHTML = '<div class="empty">Aucun projet</div>'; return; }
  $('#projectList').innerHTML = list.map(p => `
    <div class="project-item ${state.current === p ? 'active' : ''} ${p.isArchive ? 'is-archive' : ''}" data-name="${escapeHtml(p.name)}">
      <div class="pname">${escapeHtml(p.name)}</div>
      <div class="pmeta">${p.fileCount} fichier${p.fileCount > 1 ? 's' : ''} · ${fmtSize(p.totalSize)}</div>
    </div>`).join('');
  $('#projectList').querySelectorAll('.project-item').forEach(el => {
    el.addEventListener('click', () => {
      const proj = state.projects.find(p => p.name === el.dataset.name);
      if (proj) openProject(proj);
    });
  });
}
function openProject(proj) {
  state.current = proj;
  renderProjectList();
  $('#welcome').classList.add('hidden');
  $('#projectView').classList.remove('hidden');
  $('#projName').textContent = proj.name;
  $('#projStats').innerHTML = `<strong>${proj.fileCount}</strong> fichiers · <strong>${fmtSize(proj.totalSize)}</strong><br>Modif. ${fmtDate(proj.lastMod)}`;
  $('#archiveBtn').disabled = proj.isArchive;
  $('#archiveBtn').textContent = proj.isArchive ? 'Archive (lecture seule)' : 'Archiver';
  $('#tree').innerHTML = renderTree(proj.tree, 0);
  bindTreeEvents();
  $('#filePath').textContent = 'Sélectionne un fichier';
  $('#fileInfo').textContent = '';
  $('#code').textContent = '';
}
function renderTree(items, level) {
  return items.map((item) => {
    const pad = 8 + level * 14;
    if (item.type === 'dir') {
      const id = 'd_' + Math.random().toString(36).slice(2, 9);
      return `<div class="tree-node dir" data-id="${id}" style="padding-left:${pad}px"><span class="ico">▸</span><span>${escapeHtml(item.name)}</span></div><div class="tree-children" data-parent="${id}">${renderTree(item.children, level + 1)}</div>`;
    } else {
      const cls = item.readable ? '' : 'not-readable';
      return `<div class="tree-node file ${cls}" style="padding-left:${pad}px"><span class="ico">${fileIcon(item.name)}</span><span>${escapeHtml(item.name)}</span></div>`;
    }
  }).join('');
}
function bindTreeEvents() {
  $('#tree').querySelectorAll('.tree-node.dir').forEach(node => {
    node.addEventListener('click', () => {
      const id = node.dataset.id;
      const children = $('#tree').querySelector(`[data-parent="${id}"]`);
      if (children) {
        children.classList.toggle('collapsed');
        node.querySelector('.ico').textContent = children.classList.contains('collapsed') ? '▸' : '▾';
      }
    });
  });
  const allFiles = flattenFiles(state.current.tree);
  $('#tree').querySelectorAll('.tree-node.file').forEach((node, idx) => {
    if (node.classList.contains('not-readable')) return;
    node.addEventListener('click', async () => {
      $('#tree').querySelectorAll('.tree-node.file').forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      const item = allFiles[idx];
      if (item) await openFile(item);
    });
  });
  $('#tree').querySelectorAll('.tree-children').forEach((c, i) => { if (i > 0) c.classList.add('collapsed'); });
  $('#tree').querySelectorAll('.tree-node.dir').forEach((n, i) => { n.querySelector('.ico').textContent = i === 0 ? '▾' : '▸'; });
}
function flattenFiles(items) {
  const result = [];
  for (const item of items) {
    if (item.type === 'file') result.push(item);
    else if (item.type === 'dir') result.push(...flattenFiles(item.children));
  }
  return result;
}
async function openFile(item) {
  $('#filePath').textContent = item.name;
  $('#fileInfo').textContent = `${fmtSize(item.size)} · ${fmtDate(item.modified)}`;
  $('#code').textContent = 'Chargement…';
  try {
    const file = await item.handle.getFile();
    const text = await file.text();
    $('#code').className = 'hljs language-' + (item.ext || 'plaintext');
    $('#code').textContent = text;
    if (window.hljs) { delete $('#code').dataset.highlighted; hljs.highlightElement($('#code')); }
  } catch (e) { $('#code').textContent = 'Erreur de lecture : ' + e.message; }
}
async function archiveProject() {
  if (!state.current || !state.rootHandle) return;
  if (state.current.isArchive) return;
  const proj = state.current;
  const zipName = `archive-${todayStr()}-${proj.name}.zip`;
  const existing = state.projects.find(p => p.name === zipName);
  if (existing) { if (!confirm(`L'archive "${zipName}" existe déjà. La remplacer ?`)) return; }
  showOverlay('Archivage en cours', 'Préparation…');
  try {
    const zip = new JSZip();
    const allFiles = [];
    await collectFilesRecursive(proj.handle, '', allFiles);
    setProgress(5, `${allFiles.length} fichiers à compresser`);
    let done = 0;
    for (const f of allFiles) {
      try {
        const file = await f.handle.getFile();
        const buf = await file.arrayBuffer();
        zip.file(f.path, buf);
      } catch (e) { console.warn('skip', f.path, e); }
      done++;
      if (done % 5 === 0 || done === allFiles.length) {
        const pct = 5 + Math.floor((done / allFiles.length) * 60);
        setProgress(pct, `Compression ${done}/${allFiles.length}`);
        await new Promise(r => setTimeout(r, 0));
      }
    }
    setProgress(70, 'Génération du zip…');
    const blob = await zip.generateAsync(
      { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
      (m) => { setProgress(70 + Math.floor(m.percent * 0.25), `Compression ${m.percent.toFixed(0)}%`); }
    );
    setProgress(96, `Écriture sur disque (${fmtSize(blob.size)})…`);
    const fileHandle = await state.rootHandle.getFileHandle(zipName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
    setProgress(100, 'Terminé');
    await new Promise(r => setTimeout(r, 300));
    hideOverlay();
    toast('Archive créée', `${zipName} (${fmtSize(blob.size)})`, 'success', 5000);
    await rescanAll();
  } catch (e) { hideOverlay(); console.error(e); toast('Erreur d\'archivage', e.message, 'error', 6000); }
}
async function collectFilesRecursive(dirHandle, prefix, out) {
  for await (const entry of dirHandle.values()) {
    const path = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.kind === 'directory') {
      if (IGNORE_DIRS.has(entry.name)) continue;
      await collectFilesRecursive(entry, path, out);
    } else if (entry.kind === 'file') {
      out.push({ path, handle: entry });
    }
  }
}
$('#pickBtn').addEventListener('click', pickFolder);
$('#search').addEventListener('input', renderProjectList);
$('#archiveBtn').addEventListener('click', archiveProject);
$('#refreshBtn').addEventListener('click', rescanAll);
checkApiSupport();
</script>
</body>
</html>