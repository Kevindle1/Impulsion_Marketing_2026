/* eslint-disable */
// Génère la présentation PowerPoint du comité de développement (Impulsion Marketing).
// Lancer :  node docs/build-deck.cjs
// Sortie :  docs/Impulsion-Marketing-Comite-Developpement.pptx
const PptxGenJS = require('pptxgenjs');
const path = require('path');

const C = {
  primary: '00875A', primaryDk: '00734C', primaryDk2: '005C3D',
  ink: '0C1A14', muted: '56655E', muted2: '8B988F',
  line: 'EAEFEC', line2: 'F0F4F1', bg: 'F4F7F5', card: 'FFFFFF',
  green50: 'E8F6EF', green100: 'CCEBDD',
  amber: 'E8A100', amber50: 'FDF3E2', amberInk: 'A06F00',
  blue: '2563EB', blue50: 'E8F0FE',
  red: 'E2001A', violet: '7C3AED', violet50: 'F3E8FF',
  white: 'FFFFFF',
};
const FONT = 'Segoe UI';

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'WIDE';
pptx.author = 'Impulsion Marketing';
pptx.company = 'Impulsion Marketing';
pptx.title = 'Comité de développement — Impulsion Marketing';

const W = 13.333, H = 7.5, MX = 0.6;
const CW = W - MX * 2; // largeur contenu

// ---------- Helpers ----------
function footer(slide, n) {
  slide.addShape(pptx.ShapeType.line, { x: MX, y: 7.02, w: CW, h: 0, line: { color: C.line, width: 1 } });
  slide.addText('Impulsion Marketing', { x: MX, y: 7.05, w: 5, h: 0.3, fontFace: FONT, fontSize: 9, color: C.primary, bold: true });
  slide.addText('Dossier comité de développement — Juin 2026', { x: MX + 3, y: 7.05, w: CW - 6, h: 0.3, fontFace: FONT, fontSize: 9, color: C.muted2, align: 'center' });
  slide.addText(n + ' / 9', { x: W - MX - 1.2, y: 7.05, w: 1.2, h: 0.3, fontFace: FONT, fontSize: 9, color: C.muted2, align: 'right' });
}
function brandMark(slide, x, y, light) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 0.55, h: 0.55, rectRadius: 0.1, fill: { color: light ? C.white : C.primary } });
  slide.addText('IM', { x, y, w: 0.55, h: 0.55, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 15, bold: true, color: light ? C.primary : C.white });
  slide.addText([{ text: 'Impulsion', options: { bold: true } }, { text: '  Marketing', options: { color: light ? 'DDEFE7' : C.muted } }],
    { x: x + 0.65, y: y + 0.02, w: 4, h: 0.5, valign: 'middle', fontFace: FONT, fontSize: 14, color: light ? C.white : C.ink });
}
function sectionTitle(slide, title, sub) {
  slide.addShape(pptx.ShapeType.roundRect, { x: MX, y: 0.62, w: 0.16, h: 0.5, rectRadius: 0.05, fill: { color: C.primary } });
  slide.addText(title, { x: MX + 0.28, y: 0.5, w: CW - 0.3, h: 0.55, fontFace: FONT, fontSize: 26, bold: true, color: C.ink });
  if (sub) slide.addText(sub, { x: MX + 0.28, y: 1.06, w: CW - 0.3, h: 0.35, fontFace: FONT, fontSize: 13.5, color: C.muted });
}
function shotPlaceholder(slide, x, y, w, h, label, hint) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.1, fill: { color: C.green50 }, line: { color: '9FCBB7', width: 1.5, dashType: 'dash' } });
  slide.addText([
    { text: '🖼\n', options: { fontSize: 30 } },
    { text: label + '\n', options: { fontSize: 15, bold: true, color: C.primaryDk2 } },
    { text: hint || 'Insérez votre capture ici (remplacez ce cadre)', options: { fontSize: 10.5, color: C.muted } },
  ], { x, y, w, h, align: 'center', valign: 'middle', fontFace: FONT, lineSpacingMultiple: 1.1 });
}
function caption(slide, x, y, w, runs) {
  slide.addShape(pptx.ShapeType.rect, { x, y: y + 0.02, w: 0.05, h: 0.34, fill: { color: C.primary } });
  slide.addText(runs, { x: x + 0.14, y, w: w - 0.14, h: 0.4, valign: 'middle', fontFace: FONT, fontSize: 11, color: C.muted });
}
function statCard(slide, x, y, w, num, label, accent) {
  const h = 1.25;
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: C.card }, line: { color: C.line, width: 1 } });
  slide.addShape(pptx.ShapeType.rect, { x, y: y + 0.12, w: 0.08, h: h - 0.24, fill: { color: accent } });
  slide.addText(num, { x: x + 0.25, y: y + 0.16, w: w - 0.4, h: 0.55, fontFace: FONT, fontSize: 30, bold: true, color: accent });
  slide.addText(label, { x: x + 0.25, y: y + 0.72, w: w - 0.4, h: 0.45, fontFace: FONT, fontSize: 11.5, color: C.muted, bold: true });
}

// ================= SLIDE 1 — COUVERTURE =================
{
  const s = pptx.addSlide();
  s.background = { color: C.primaryDk };
  // bandes décoratives
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.primaryDk } });
  s.addShape(pptx.ShapeType.roundRect, { x: 8.7, y: -2.2, w: 7.5, h: 7.5, rectRadius: 0.5, fill: { color: C.primary }, rotate: 20 });
  s.addShape(pptx.ShapeType.roundRect, { x: 10.2, y: 3.6, w: 6, h: 6, rectRadius: 0.5, fill: { color: '0FA56E' }, rotate: 18 });
  brandMark(s, MX, 0.7, true);
  s.addText('COMITÉ DE DÉVELOPPEMENT', { x: MX, y: 2.5, w: 10, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: 'B9ECD7', charSpacing: 3 });
  s.addText('Impulsion Marketing', { x: MX, y: 2.95, w: 11.5, h: 1.2, fontFace: FONT, fontSize: 52, bold: true, color: C.white });
  s.addText('Pilotage de bout en bout des campagnes marketing', { x: MX, y: 4.15, w: 10.5, h: 0.5, fontFace: FONT, fontSize: 19, color: 'E6FFF4' });
  s.addText([
    { text: 'Point d’avancement', options: { bold: true } },
    { text: '       Date : 19 juin 2026       Statut : développement livré ✓', options: { color: 'CFEDE0' } },
  ], { x: MX, y: 5.5, w: 11.5, h: 0.4, fontFace: FONT, fontSize: 13, color: C.white });
}

// ================= SLIDE 2 — CONTEXTE & OBJECTIF =================
{
  const s = pptx.addSlide(); s.background = { color: C.white };
  sectionTitle(s, 'Contexte & objectif', 'Pourquoi ce passage en comité.');
  s.addText([
    { text: 'Il y a trois semaines, le ', options: {} },
    { text: 'COFON (comité de fonctionnement)', options: { bold: true, color: C.primaryDk } },
    { text: ' a donné son aval pour lancer le développement d’Impulsion Marketing. Ce développement est aujourd’hui ', options: {} },
    { text: 'réalisé et opérationnel', options: { bold: true } },
    { text: '. L’objet de ce passage est de ', options: {} },
    { text: 'contextualiser l’avancement', options: { bold: true } },
    { text: ' : ce qui a été livré, la phase de test en cours, et le plan de généralisation à venir.', options: {} },
  ], { x: MX, y: 1.7, w: CW, h: 1.4, fontFace: FONT, fontSize: 16, color: C.ink, lineSpacingMultiple: 1.25 });

  const cw = (CW - 0.6) / 3;
  statCard(s, MX, 3.5, cw, '100 %', 'Développement livré et fonctionnel', C.primary);
  statCard(s, MX + cw + 0.3, 3.5, cw, '2', 'Campagnes pilotes en parallèle', C.amber);
  statCard(s, MX + (cw + 0.3) * 2, 3.5, cw, 'Prêt', 'Équipes formées & accès ouverts', C.blue);

  // Callout
  s.addShape(pptx.ShapeType.roundRect, { x: MX, y: 5.15, w: CW, h: 1.55, rectRadius: 0.1, fill: { color: C.green50 }, line: { color: C.green100, width: 1 } });
  s.addText('🎯  En une phrase', { x: MX + 0.3, y: 5.3, w: CW - 0.6, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: C.primaryDk2 });
  s.addText('Impulsion centralise tout le cycle d’une campagne — de la demande à la mise en production — avec un suivi clair des livrables, des rôles et des échéances. La solution est prête ; nous validons en conditions réelles avant le déploiement à l’ensemble des équipes.',
    { x: MX + 0.3, y: 5.7, w: CW - 0.6, h: 0.9, fontFace: FONT, fontSize: 12.5, color: '2C4A3C', lineSpacingMultiple: 1.15 });
  footer(s, 2);
}

// ================= SLIDE 3 — LÀ OÙ ON EN EST (TIMELINE) =================
{
  const s = pptx.addSlide(); s.background = { color: C.white };
  sectionTitle(s, 'Là où nous en sommes', 'Du feu vert à la mise à l’échelle.');
  const steps = [
    { t: 'COFON', d: 'Aval donné · il y a 3 sem.', st: 'done' },
    { t: 'Développement', d: 'Réalisé ✓', st: 'done' },
    { t: 'Pilote', d: '2 campagnes en test', st: 'now' },
    { t: 'Généralisation', d: 'À venir · en 2 temps', st: 'todo' },
    { t: 'Essaimage', d: 'Autres caisses', st: 'todo' },
  ];
  const y = 3.0, x0 = 1.1, x1 = 12.0, n = steps.length;
  const gap = (x1 - x0) / (n - 1);
  s.addShape(pptx.ShapeType.line, { x: x0, y: y + 0.16, w: x1 - x0, h: 0, line: { color: C.line, width: 2.5 } });
  s.addShape(pptx.ShapeType.line, { x: x0, y: y + 0.16, w: gap * 2, h: 0, line: { color: C.primary, width: 2.5 } });
  steps.forEach((stp, i) => {
    const cx = x0 + gap * i;
    const done = stp.st === 'done', now = stp.st === 'now';
    if (now) s.addShape(pptx.ShapeType.ellipse, { x: cx - 0.26, y: y - 0.1, w: 0.52, h: 0.52, fill: { color: C.amber50 } });
    s.addShape(pptx.ShapeType.ellipse, { x: cx - 0.16, y: y, w: 0.32, h: 0.32, fill: { color: done ? C.primary : C.white }, line: { color: done ? C.primary : (now ? C.amber : C.line), width: 3 } });
    s.addText(stp.t, { x: cx - 1.2, y: y + 0.45, w: 2.4, h: 0.3, align: 'center', fontFace: FONT, fontSize: 13, bold: true, color: C.ink });
    s.addText(stp.d, { x: cx - 1.3, y: y + 0.74, w: 2.6, h: 0.5, align: 'center', fontFace: FONT, fontSize: 10.5, color: C.muted });
  });
  // Callout bénéfice
  s.addShape(pptx.ShapeType.roundRect, { x: MX, y: 5.2, w: CW, h: 1.5, rectRadius: 0.1, fill: { color: C.green50 }, line: { color: C.green100, width: 1 } });
  s.addText('✅  Une solution prête, validée avant de passer à l’échelle', { x: MX + 0.3, y: 5.35, w: CW - 0.6, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: C.primaryDk2 });
  s.addText('Le développement est terminé. Deux campagnes pilotes tournent en parallèle pour éprouver l’outil à 100 % en conditions réelles, avant la généralisation aux équipes puis l’ouverture à d’autres caisses régionales.',
    { x: MX + 0.3, y: 5.75, w: CW - 0.6, h: 0.85, fontFace: FONT, fontSize: 12.5, color: '2C4A3C', lineSpacingMultiple: 1.15 });
  footer(s, 3);
}

// ================= SLIDE 4 — CE QUE LA SOLUTION APPORTE (TABLEAU DE BORD) =================
{
  const s = pptx.addSlide(); s.background = { color: C.white };
  sectionTitle(s, 'Ce que la solution apporte', 'Une vision d’ensemble, accessible à chaque rôle.');
  // gauche : bénéfices
  const bx = MX, bw = 4.6;
  const bullets = [
    'Un point d’entrée unique, du brief à la mise en production.',
    'Chacun voit ses campagnes et ce qui l’attend, dès l’accueil.',
    'Des indicateurs cliquables (à produire, à valider, échéances).',
    'Rôles clairs : PO/Marketing, Com, EBF, Data, managers.',
    'Recherche par références (code projet, réf. com/paracom…).',
  ];
  let yy = 1.85;
  bullets.forEach((b) => {
    s.addShape(pptx.ShapeType.ellipse, { x: bx, y: yy + 0.02, w: 0.26, h: 0.26, fill: { color: C.green50 } });
    s.addText('✓', { x: bx, y: yy + 0.02, w: 0.26, h: 0.26, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 11, bold: true, color: C.primary });
    s.addText(b, { x: bx + 0.38, y: yy - 0.05, w: bw - 0.38, h: 0.6, fontFace: FONT, fontSize: 13, color: C.ink, lineSpacingMultiple: 1.1 });
    yy += 0.82;
  });
  // droite : capture
  const px = MX + bw + 0.4, pw = CW - bw - 0.4;
  shotPlaceholder(s, px, 1.7, pw, 4.3, 'Capture — Tableau de bord', 'Indicateurs, « À produire » et « Mes campagnes en cours »');
  caption(s, px, 6.1, pw, [
    { text: 'Tableau de bord', options: { bold: true, color: C.ink } },
    { text: ' — priorisation immédiate : à produire, à valider, échéances proches.', options: {} },
  ]);
  footer(s, 4);
}

// ================= SLIDE 5 — COMITÉ ÉDITORIAL =================
{
  const s = pptx.addSlide(); s.background = { color: C.white };
  sectionTitle(s, 'Planifier : le comité éditorial', 'Arbitrer et programmer les campagnes, ensemble.');
  shotPlaceholder(s, MX, 1.7, CW, 4.25, 'Capture — Comité éditorial', 'Vue de planification éditoriale partagée');
  caption(s, MX, 6.05, CW, [
    { text: 'Comité éditorial', options: { bold: true, color: C.ink } },
    { text: ' — une vue partagée pour arbitrer les priorités et programmer les campagnes dans le temps.', options: {} },
  ]);
  footer(s, 5);
}

// ================= SLIDE 6 — SUIVI DE BOUT EN BOUT =================
{
  const s = pptx.addSlide(); s.background = { color: C.white };
  sectionTitle(s, 'Le suivi d’une campagne, de bout en bout', 'Chaque livrable, chaque validation, chaque date — tracés.');
  // gauche : stepper
  const lx = MX, lw = 5.6;
  s.addShape(pptx.ShapeType.roundRect, { x: lx, y: 1.7, w: lw, h: 4.55, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.line, width: 1 } });
  const steps = [
    { n: '1', t: 'Saisie de la demande', d: 'Le PO crée la campagne', b: 'PO', bc: C.violet, bg: C.violet50 },
    { n: '2', t: 'Affectation & kick-off', d: 'Le manager affecte les équipes', b: 'Manager', bc: C.violet, bg: C.violet50 },
    { n: '3', t: 'Maquette', d: 'Conception du visuel', b: 'Com', bc: C.blue, bg: C.blue50 },
    { n: '4', t: 'BAT / VAT', d: 'Bon à tirer, validation', b: 'EBF', bc: C.amberInk, bg: C.amber50 },
    { n: '5', t: 'Ciblage', d: 'Sélection des cibles', b: 'Data', bc: C.primary, bg: C.green50 },
    { n: '6', t: 'Test en production', d: 'Contrôle avant envoi', b: 'Data', bc: C.primary, bg: C.green50 },
    { n: '7', t: 'Mise en production', d: 'Campagne lancée', b: 'MEP', bc: C.primaryDk2, bg: C.green50 },
  ];
  let sy = 1.85;
  const rowH = 0.61;
  steps.forEach((st) => {
    s.addShape(pptx.ShapeType.roundRect, { x: lx + 0.25, y: sy + 0.06, w: 0.42, h: 0.42, rectRadius: 0.06, fill: { color: st.bc } });
    s.addText(st.n, { x: lx + 0.25, y: sy + 0.06, w: 0.42, h: 0.42, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 13, bold: true, color: C.white });
    s.addText(st.t, { x: lx + 0.82, y: sy, w: 3.0, h: 0.3, fontFace: FONT, fontSize: 12.5, bold: true, color: C.ink });
    s.addText(st.d, { x: lx + 0.82, y: sy + 0.28, w: 3.2, h: 0.28, fontFace: FONT, fontSize: 10, color: C.muted });
    s.addShape(pptx.ShapeType.roundRect, { x: lx + lw - 1.15, y: sy + 0.1, w: 0.95, h: 0.34, rectRadius: 0.17, fill: { color: st.bg } });
    s.addText(st.b, { x: lx + lw - 1.15, y: sy + 0.1, w: 0.95, h: 0.34, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 10, bold: true, color: st.bc });
    sy += rowH;
  });
  // droite : capture
  const rx = lx + lw + 0.4, rw = CW - lw - 0.4;
  shotPlaceholder(s, rx, 1.7, rw, 4.05, 'Capture — Détail d’une campagne', 'Timeline des étapes : dates & statuts');
  caption(s, rx, 5.85, rw, [
    { text: 'Fiche campagne', options: { bold: true, color: C.ink } },
    { text: ' — la timeline complète des livrables, horodatée par étape.', options: {} },
  ]);
  footer(s, 6);
}

// ================= SLIDE 7 — CE QU'IL RESTE À FAIRE (GÉNÉRALISATION) =================
{
  const s = pptx.addSlide(); s.background = { color: C.white };
  sectionTitle(s, 'Ce qu’il nous reste à faire', 'Du pilote à la généralisation.');
  // phase actuelle
  s.addShape(pptx.ShapeType.roundRect, { x: MX, y: 1.7, w: CW, h: 0.95, rectRadius: 0.1, fill: { color: C.amber50 }, line: { color: 'F0D98A', width: 1 } });
  s.addText([
    { text: 'PHASE ACTUELLE   ', options: { bold: true, color: C.amberInk, charSpacing: 1 } },
    { text: 'Deux campagnes lancées en parallèle sur Impulsion pour valider l’outil à 100 % en conditions réelles, avant d’embarquer toutes les équipes.', options: { color: '5C4600' } },
  ], { x: MX + 0.3, y: 1.78, w: CW - 0.6, h: 0.8, fontFace: FONT, fontSize: 13, valign: 'middle', lineSpacingMultiple: 1.1 });

  s.addText('Une généralisation en deux temps', { x: MX, y: 2.95, w: CW, h: 0.4, fontFace: FONT, fontSize: 17, bold: true, color: C.ink });
  // phase 1
  const phY = 3.5, phH = 1.45;
  s.addShape(pptx.ShapeType.roundRect, { x: MX, y: phY, w: CW, h: phH, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.line, width: 1 } });
  s.addShape(pptx.ShapeType.ellipse, { x: MX + 0.3, y: phY + 0.3, w: 0.5, h: 0.5, fill: { color: C.primary } });
  s.addText('1', { x: MX + 0.3, y: phY + 0.3, w: 0.5, h: 0.5, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 16, bold: true, color: C.white });
  s.addText('Bascule encadrée', { x: MX + 1.0, y: phY + 0.22, w: CW - 1.3, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.ink });
  s.addText('Arrêt du flux sur les anciens outils. Une équipe dédiée de 5 à 6 personnes migre toutes les tâches en une seule fois sur Impulsion, pour repartir d’une base propre et complète.',
    { x: MX + 1.0, y: phY + 0.62, w: CW - 1.3, h: 0.7, fontFace: FONT, fontSize: 12.5, color: C.muted, lineSpacingMultiple: 1.1 });
  // phase 2
  const ph2 = phY + phH + 0.25;
  s.addShape(pptx.ShapeType.roundRect, { x: MX, y: ph2, w: CW, h: phH, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.line, width: 1 } });
  s.addShape(pptx.ShapeType.ellipse, { x: MX + 0.3, y: ph2 + 0.3, w: 0.5, h: 0.5, fill: { color: C.primary } });
  s.addText('2', { x: MX + 0.3, y: ph2 + 0.3, w: 0.5, h: 0.5, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 16, bold: true, color: C.white });
  s.addText('Autonomie des équipes', { x: MX + 1.0, y: ph2 + 0.22, w: CW - 1.3, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.ink });
  s.addText('On redonne la main à toutes les équipes pour qu’elles travaillent directement dans Impulsion, au quotidien.',
    { x: MX + 1.0, y: ph2 + 0.62, w: CW - 1.3, h: 0.7, fontFace: FONT, fontSize: 12.5, color: C.muted, lineSpacingMultiple: 1.1 });
  footer(s, 7);
}

// ================= SLIDE 8 — PRÊT & ESSAIMAGE =================
{
  const s = pptx.addSlide(); s.background = { color: C.white };
  sectionTitle(s, 'Prêt à déployer — et déjà attendu ailleurs', 'Le terrain est préparé, l’intérêt dépasse notre caisse.');
  // bloc prêt
  s.addShape(pptx.ShapeType.roundRect, { x: MX, y: 1.8, w: CW, h: 1.5, rectRadius: 0.1, fill: { color: C.green50 }, line: { color: C.green100, width: 1 } });
  s.addText('🚀  Déjà prêt pour le déploiement', { x: MX + 0.3, y: 1.95, w: CW - 0.6, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.primaryDk2 });
  s.addText('Toutes les équipes ont reçu une présentation de l’outil et l’ensemble des accès sont ouverts. Le terrain est préparé pour une bascule rapide.',
    { x: MX + 0.3, y: 2.4, w: CW - 0.6, h: 0.8, fontFace: FONT, fontSize: 13, color: '2C4A3C', lineSpacingMultiple: 1.15 });
  // bloc essaimage
  s.addShape(pptx.ShapeType.roundRect, { x: MX, y: 3.55, w: CW, h: 1.55, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.line, width: 1 } });
  s.addText('🌍  Au-delà de notre caisse', { x: MX + 0.3, y: 3.7, w: CW - 0.6, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.ink });
  s.addText([
    { text: 'Le 16 juin', options: { bold: true } },
    { text: ', l’outil a été présenté à ', options: {} },
    { text: 'deux caisses régionales', options: { bold: true } },
    { text: ', intéressées pour le récupérer. Un rendez-vous est prévu pour les accompagner dans la configuration et le déploiement chez elles.', options: {} },
  ], { x: MX + 0.3, y: 4.15, w: CW - 0.6, h: 0.85, fontFace: FONT, fontSize: 13, color: C.muted, lineSpacingMultiple: 1.15 });
  // synthèse
  s.addShape(pptx.ShapeType.roundRect, { x: MX, y: 5.35, w: CW, h: 1.35, rectRadius: 0.1, fill: { color: C.primaryDk } });
  s.addText('🏁  En synthèse', { x: MX + 0.3, y: 5.5, w: CW - 0.6, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: C.white });
  s.addText([
    { text: 'Développement livré, pilote en cours, équipes formées et accès prêts, et un intérêt déjà au-delà de notre périmètre. ', options: { color: 'EAFFF5' } },
    { text: 'Un projet en réussite, sur le point de passer à l’échelle.', options: { bold: true, color: C.white } },
  ], { x: MX + 0.3, y: 5.92, w: CW - 0.6, h: 0.7, fontFace: FONT, fontSize: 13, lineSpacingMultiple: 1.15 });
  footer(s, 8);
}

// ================= SLIDE 9 — CLÔTURE =================
{
  const s = pptx.addSlide(); s.background = { color: C.primaryDk };
  s.addShape(pptx.ShapeType.roundRect, { x: -2, y: 4.4, w: 8, h: 7, rectRadius: 0.5, fill: { color: C.primaryDk2 }, rotate: 18 });
  s.addShape(pptx.ShapeType.roundRect, { x: 9.5, y: -2.5, w: 7, h: 7, rectRadius: 0.5, fill: { color: '0FA56E' }, rotate: 16 });
  brandMark(s, MX, 0.7, true);
  s.addText('Un projet en réussite', { x: MX, y: 2.9, w: 12, h: 1.1, fontFace: FONT, fontSize: 46, bold: true, color: C.white });
  s.addText('Prêt à passer à l’échelle.', { x: MX, y: 4.05, w: 12, h: 0.6, fontFace: FONT, fontSize: 20, color: 'E6FFF4' });
  s.addText('Merci — questions & échanges', { x: MX, y: 5.2, w: 12, h: 0.5, fontFace: FONT, fontSize: 15, color: 'CFEDE0' });
}

const out = path.join(__dirname, 'Impulsion-Marketing-Comite-Developpement.pptx');
pptx.writeFile({ fileName: out }).then((f) => {
  console.log('PPTX généré :', f);
}).catch((e) => { console.error('Erreur génération PPTX :', e); process.exit(1); });
