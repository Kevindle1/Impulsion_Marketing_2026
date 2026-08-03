/**
 * Champs personnalisés — Impulsion Marketing
 * Moteur générique : définitions de champ par « point d'attache », rendu HTML,
 * câblage (conditionnalité, listes répétables), collecte des valeurs, validation.
 *
 * Un point d'attache identifie où un champ s'affiche : les id d'étape du workflow
 * (mêmes id que js/workflow-standalone.js, ex. 'ebf_bat'), ou l'un des emplacements
 * du formulaire de création : 'creation.step1' (Informations générales),
 * 'creation.step2' (Segmentation), 'creation.step3' (Détails produit),
 * 'creation.step3.canal.base' (socle de chaque canal, jamais filtré par type de
 * livrable), 'creation.step3.canal' (champs additionnels par canal, filtrables
 * par type de livrable via canalTypes).
 *
 * Ce module ne connaît PAS le stockage sur disque (dépôts, fichiers) : il lit/écrit
 * uniquement dans l'objet `values` qu'on lui passe. C'est à l'appelant (details.html,
 * campaign.html) de faire le lien avec les bonnes clés de campagne.json.
 */

window.ImpulsionMarketing = window.ImpulsionMarketing || {};

window.ImpulsionMarketing.customFields = (function () {
  'use strict';

  var IM = window.ImpulsionMarketing;

  function esc(s) { var sec = IM.security; return (sec && sec.escapeHtml) ? sec.escapeHtml(s) : String(s == null ? '' : s); }
  // IM.security.escapeHtml échappe pour un contexte TEXTE (<, >, &) mais pas les
  // guillemets doubles — insuffisant pour une valeur placée dans un attribut
  // HTML="...", où un " dans la valeur (ex. JSON.stringify, texte saisi par
  // l'utilisateur) romprait l'attribut. escAttr() complète l'échappement pour ce cas.
  function escAttr(s) { return esc(s).replace(/"/g, '&quot;'); }
  function isValidUrl(u) { var sec = IM.security; return (sec && sec.isValidUrl) ? sec.isValidUrl(u) : /^https?:\/\/.+/i.test(u || ''); }

  var TYPE_LABELS = {
    text: 'Texte court',
    textarea: 'Texte long',
    url: 'URL',
    number: 'Nombre',
    date: 'Date',
    select: 'Liste déroulante',
    radio: 'Choix unique (radio)',
    checkbox: 'Case à cocher',
    'checkbox-group': 'Cases à cocher multiples',
    list: 'Liste répétable (URLs ou textes)',
    richtext: 'Texte enrichi',
    file: 'Fichier'
  };

  // Champs déjà en place avant l'admin « Champs personnalisés », migrés vers le
  // moteur générique — repli utilisé UNIQUEMENT pour un point d'attache que
  // l'admin n'a PAS ENCORE configuré (même principe que workflow.steps : la
  // config stockée sur V:// prévaut dès qu'elle existe, point d'attache par
  // point d'attache). Indispensable pour ne jamais perdre un champ existant
  // après une mise à jour de code SANS mise à jour synchrone de _config.json —
  // "Données de production" ne se redéploie jamais avec le code.
  var DEFAULT_FIELDS = {
    'creation.step1': [
      { id: 'taskName', label: 'Nom de la tache planner (ID)', type: 'text', order: 1, required: true },
      { id: 'description', label: 'DESCRIPTION', type: 'textarea', order: 2, required: true },
      { id: 'launchDate', label: 'Date Envoi client', type: 'date', order: 3, required: true },
      { id: 'kickoffNeeded', label: 'Kick-off', type: 'radio', order: 4, options: ['Oui', 'Non'] },
      { id: 'kickoffDate', label: 'Date de kick-off', type: 'date', order: 5, showIf: { field: 'kickoffNeeded', op: 'eq', value: 'Oui' } },
      { id: 'typology', label: 'Typologie', type: 'select', order: 6, required: true, configRef: 'TYPOLOGIES' },
      { id: 'market', label: 'Marché', type: 'select', order: 7, required: true, configRef: 'MARCHES' },
      { id: 'recurrence', label: 'Récurrence', type: 'select', order: 8, required: true, configRef: 'RECURRENCES' }
    ],
    'creation.step2': [
      { id: 'cibleProspect', label: 'Cible aussi des prospects', type: 'checkbox', order: 1 },
      { id: 'prospectSource', label: 'Source / précision', type: 'text', order: 2, showIf: { field: 'cibleProspect', op: 'checked' }, help: 'Ex : courriers refus EER, listes entreprises…' },
      { id: 'persona', label: 'Persona', type: 'text', order: 3 }
    ],
    'creation.step3': [
      { id: 'productUrl', label: 'URL fiche produit', type: 'url', order: 1 },
      { id: 'offrePromo', label: 'Offre promotionnelle', type: 'radio', order: 2, options: ['Oui', 'Non'] },
      { id: 'offerValidityDate', label: 'Date de mise en vigueur de l\'offre', type: 'date', order: 3, showIf: { field: 'offrePromo', op: 'eq', value: 'Oui' } },
      { id: 'offerEndDate', label: 'Date de fin de validité', type: 'date', order: 4, showIf: { field: 'offrePromo', op: 'eq', value: 'Oui' } },
      { id: 'parcoursSelfcare', label: 'Parcours selfcare', type: 'radio', order: 5, options: ['Oui', 'Non'] },
      { id: 'parcoursSimulateur', label: 'Parcours simulateur', type: 'radio', order: 6, options: ['Oui', 'Non'] },
      { id: 'transfo', label: 'Transfo', type: 'radio', order: 7, options: ['Oui', 'Non'], required: true },
      { id: 'lotNumber', label: 'Numéro de Lot', type: 'select', order: 8, configRef: 'LOTS', showIf: { field: 'transfo', op: 'eq', value: 'Oui' } }
    ],
    // Champs « socle » de chaque canal — présents une seule fois par canal,
    // JAMAIS filtrés par canalTypes (contrairement à 'creation.step3.canal' qui
    // reste réservé aux champs additionnels propres à certains types de livrable).
    'creation.step3.canal.base': [
      { id: 'channelContent', label: 'Type de livrable', type: 'select', order: 1, required: true, configRef: 'CANAUX' },
      { id: 'deliverableLabel', label: 'Nom du livrable', type: 'text', order: 2, required: true, help: 'Le nom final est standardisé : Type de livrable - votre saisie. Il doit rester unique pour chaque canal.' },
      { id: 'comType', label: 'Type de Com', type: 'select', order: 3, required: true, configRef: 'TYPES_COM' },
      { id: 'targetingCriteria', label: 'Critère ciblage', type: 'text', order: 4, required: true },
      { id: 'comTypology', label: 'Typologie de communication', type: 'radio', order: 5, required: true, configRef: 'COM_TYPOLOGIES' },
      { id: 'urlLccx', label: 'Lien LCCX (optionnel)', type: 'url', order: 6 }
    ]
  };

  // ── Lecture de la config ──
  // Fusionne les définitions par défaut (DEFAULT_FIELDS) et celles stockées dans
  // _config.json — la config l'emporte ENTIÈREMENT, point d'attache par point
  // d'attache, dès qu'elle existe (un admin qui édite « Informations générales »
  // sauvegarde sa version complète, qui remplace alors le repli par défaut).
  function allDefs() {
    var cfg = (IM.config && IM.config.CUSTOM_FIELDS && typeof IM.config.CUSTOM_FIELDS === 'object') ? IM.config.CUSTOM_FIELDS : {};
    var out = {};
    Object.keys(DEFAULT_FIELDS).forEach(function (k) { out[k] = DEFAULT_FIELDS[k]; });
    Object.keys(cfg).forEach(function (k) { out[k] = cfg[k]; });
    return out;
  }

  function attachPoints() {
    return Object.keys(allDefs());
  }

  // Champs définis pour un point d'attache, filtrés par type de canal (si le champ
  // restreint canalTypes) et triés par ordre d'affichage.
  //
  // `canalType` OMIS (undefined) = contexte sans canal précis (ex. listing admin) →
  // repli permissif, tous les champs sont renvoyés (cohérent avec CANAL_STEPS :
  // absent = flux complet). `canalType` fourni mais vide ('') = contexte utilisateur
  // réel où aucun type n'est encore choisi → un champ restreint doit rester masqué
  // (sinon il apparaîtrait puis disparaîtrait au premier choix, effet de bord gênant
  // dans le formulaire de création).
  function getFields(attachPoint, canalType) {
    var list = allDefs()[attachPoint];
    if (!Array.isArray(list)) return [];
    return list
      .filter(function (f) { return f && f.id && f.type; })
      .filter(function (f) {
        if (!Array.isArray(f.canalTypes) || !f.canalTypes.length) return true;
        if (canalType === undefined) return true;
        return f.canalTypes.indexOf(canalType) !== -1;
      })
      .slice()
      .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  }

  // Options d'un champ select/radio/checkbox-group : soit une liste en dur
  // (field.options), soit une liste déjà pilotée par l'admin (field.configRef,
  // ex. 'CANAUX', 'MARCHES' → réutilise IM.config.<REF>).
  function fieldOptions(field) {
    if (Array.isArray(field.options)) return field.options;
    if (field.configRef && IM.config && Array.isArray(IM.config[field.configRef])) return IM.config[field.configRef];
    return [];
  }

  function isSimpleRequired(f) { return f.required === true; }
  function requiredGroup(f) { return (f.required && typeof f.required === 'object' && f.required.group) ? f.required.group : null; }

  // Condition d'affichage : { field: <id du champ déclencheur>, op: 'eq'|'neq'|'in'|'checked'|'unchecked', value }
  function evalShowIf(field, values) {
    if (!field || !field.showIf || !field.showIf.field) return true;
    var cond = field.showIf;
    var v = values ? values[cond.field] : undefined;
    switch (cond.op) {
      case 'neq': return v !== cond.value;
      case 'in': return Array.isArray(cond.value) && cond.value.indexOf(v) !== -1;
      case 'checked': return v === true || v === 'true';
      case 'unchecked': return !(v === true || v === 'true');
      case 'eq':
      default: return v === cond.value;
    }
  }

  // ── Rendu HTML ──

  function inputHtml(field, value, domId) {
    value = value == null ? '' : value;
    switch (field.type) {
      case 'textarea':
        return '<textarea class="admin-input cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '">' + esc(value) + '</textarea>';
      case 'richtext':
        return '<div class="cf-richtext" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '" contenteditable="true">' + (value || '') + '</div>';
      case 'url':
        return '<input type="url" class="admin-input cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '" value="' + escAttr(value) + '" placeholder="https://...">';
      case 'number':
        return '<input type="number" class="admin-input cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '" value="' + escAttr(value) + '" min="0">';
      case 'date':
        return '<input type="date" class="admin-input cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '" value="' + escAttr(value) + '">';
      case 'select': {
        var opts = fieldOptions(field);
        var html = '<select class="admin-select cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '"><option value="">Choisir…</option>';
        opts.forEach(function (o) { html += '<option value="' + escAttr(o) + '"' + (value === o ? ' selected' : '') + '>' + esc(o) + '</option>'; });
        return html + '</select>';
      }
      case 'radio': {
        var ropts = fieldOptions(field);
        return ropts.map(function (o) {
          return '<label class="cf-radio-opt"><input type="radio" name="' + domId + '" data-cf-field="' + escAttr(field.id) + '" value="' + escAttr(o) + '"' + (value === o ? ' checked' : '') + '> ' + esc(o) + '</label>';
        }).join(' ');
      }
      case 'checkbox':
        return '<label class="cf-checkbox-opt"><input type="checkbox" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '"' + (value === true || value === 'true' ? ' checked' : '') + '> ' + esc(field.checkboxLabel || 'Oui') + '</label>';
      case 'checkbox-group': {
        var gopts = fieldOptions(field);
        var vals = Array.isArray(value) ? value : [];
        return gopts.map(function (o) {
          return '<label class="cf-checkbox-opt"><input type="checkbox" data-cf-field="' + escAttr(field.id) + '" data-cf-group-value="' + escAttr(o) + '"' + (vals.indexOf(o) !== -1 ? ' checked' : '') + '> ' + esc(o) + '</label>';
        }).join(' ');
      }
      case 'list': {
        var itemType = field.itemType === 'text' ? 'text' : 'url';
        var items = Array.isArray(value) && value.length ? value : [''];
        var rows = items.map(function (v) {
          return '<div class="cf-list-row"><input type="' + itemType + '" class="admin-input cf-input cf-list-item" data-cf-field="' + escAttr(field.id) + '" value="' + escAttr(v) + '" placeholder="' + (itemType === 'url' ? 'https://...' : '') + '">'
            + '<button type="button" class="icon-del cf-list-remove" data-cf-field="' + escAttr(field.id) + '" title="Retirer">✕</button></div>';
        }).join('');
        return '<div class="cf-list" data-cf-list="' + escAttr(field.id) + '" data-cf-item-type="' + itemType + '">' + rows
          + '<button type="button" class="btn btn-secondary cf-list-add" data-cf-field="' + escAttr(field.id) + '">+ Ajouter</button></div>';
      }
      case 'file':
        return '<input type="file" class="cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '">'
          + (typeof value === 'string' && value ? '<div class="cf-file-current">Fichier actuel : ' + esc(value) + '</div>' : '');
      case 'text':
      default:
        return '<input type="text" class="admin-input cf-input" id="' + domId + '" data-cf-field="' + escAttr(field.id) + '" value="' + escAttr(value) + '">';
    }
  }

  function renderFields(attachPoint, values, opts) {
    opts = opts || {};
    values = values || {};
    var fields = getFields(attachPoint, opts.canalType);
    if (!fields.length) return '';
    // idPrefix OMIS (undefined) → préfixe auto-généré (cas normal, nouveaux champs
    // perso). idPrefix explicitement '' → PAS de préfixe, l'id DOM est field.id tel
    // quel — utilisé pour migrer un champ déjà existant sans changer son id (du
    // code externe au module peut le référencer directement, ex. document.getElementById('launchDate')).
    // idSuffix : variante SUFFIXE (field.id + suffixe, sans séparateur) — utilisée
    // pour migrer un champ déjà existant répété par canal (ex. 'channelContent' + i
    // → 'channelContent1'), convention déjà en place dans tout le formulaire de
    // création pour les champs par canal (jamais préfixée).
    var idPrefix = (opts.idPrefix !== undefined) ? opts.idPrefix : ('cf-' + attachPoint.replace(/[^a-zA-Z0-9]/g, '-'));
    var html = '';
    fields.forEach(function (f) {
      var visible = evalShowIf(f, values);
      var marked = isSimpleRequired(f) || !!requiredGroup(f);
      var domId = (opts.idSuffix !== undefined) ? (f.id + opts.idSuffix) : (idPrefix ? (idPrefix + '-' + f.id) : f.id);
      html += '<div class="cf-field" data-cf-row="' + escAttr(f.id) + '"'
        + (f.showIf ? ' data-cf-showif="' + escAttr(JSON.stringify(f.showIf)) + '"' : '')
        + (visible ? '' : ' style="display:none;"') + '>';
      if (f.type !== 'checkbox') {
        html += '<label class="cf-label" for="' + escAttr(domId) + '">' + esc(f.label) + (marked ? ' <span class="cf-required">*</span>' : '') + '</label>';
      }
      html += inputHtml(f, values[f.id], domId);
      if (f.help) html += '<div class="cf-help">' + esc(f.help) + '</div>';
      html += '</div>';
    });
    return '<div class="cf-fields-block" data-cf-attach="' + escAttr(attachPoint) + '">' + html + '</div>';
  }

  // ── Câblage DOM ──

  function findBlock(cont, attachPoint) {
    if (!cont) return null;
    if (cont.classList && cont.classList.contains('cf-fields-block')) return cont;
    return cont.querySelector('.cf-fields-block[data-cf-attach="' + attachPoint + '"]');
  }

  function collectValues(cont, attachPoint, canalType) {
    var block = findBlock(cont, attachPoint);
    var values = {};
    if (!block) return values;
    getFields(attachPoint, canalType).forEach(function (f) {
      switch (f.type) {
        case 'checkbox': {
          var cb = block.querySelector('input[type="checkbox"][data-cf-field="' + f.id + '"]:not([data-cf-group-value])');
          values[f.id] = !!(cb && cb.checked);
          break;
        }
        case 'checkbox-group': {
          var vals = [];
          block.querySelectorAll('input[data-cf-field="' + f.id + '"][data-cf-group-value]').forEach(function (cb) {
            if (cb.checked) vals.push(cb.getAttribute('data-cf-group-value'));
          });
          values[f.id] = vals;
          break;
        }
        case 'radio': {
          var checked = block.querySelector('input[data-cf-field="' + f.id + '"]:checked');
          values[f.id] = checked ? checked.value : '';
          break;
        }
        case 'list': {
          var items = [];
          block.querySelectorAll('.cf-list-item[data-cf-field="' + f.id + '"]').forEach(function (inp) {
            if (inp.value.trim()) items.push(inp.value.trim());
          });
          values[f.id] = items;
          break;
        }
        case 'richtext': {
          var rt = block.querySelector('[data-cf-field="' + f.id + '"]');
          values[f.id] = rt ? rt.innerHTML : '';
          break;
        }
        case 'file': {
          var fi = block.querySelector('input[type="file"][data-cf-field="' + f.id + '"]');
          values[f.id] = (fi && fi.files && fi.files[0]) ? fi.files[0] : (values[f.id] || null);
          break;
        }
        default: {
          var el = block.querySelector('[data-cf-field="' + f.id + '"]');
          values[f.id] = el ? el.value : '';
        }
      }
    });
    return values;
  }

  // Câble la conditionnalité (showIf) et les listes répétables sur un bloc déjà
  // inséré dans le DOM. `onChange(values)` est appelé (optionnel) à chaque saisie.
  function wireFields(cont, attachPoint, opts) {
    opts = opts || {};
    var block = findBlock(cont, attachPoint);
    if (!block) return;

    function refreshVisibility() {
      var values = collectValues(block, attachPoint, opts.canalType);
      block.querySelectorAll('.cf-field[data-cf-showif]').forEach(function (row) {
        var cond = null;
        try { cond = JSON.parse(row.getAttribute('data-cf-showif')); } catch (e) { cond = null; }
        row.style.display = evalShowIf({ showIf: cond }, values) ? '' : 'none';
      });
      if (typeof opts.onChange === 'function') opts.onChange(values);
    }

    // Écoute en phase de CAPTURE (3e argument true), pas de bulle (par défaut) :
    // le reste de l'appli redéclenche parfois la conditionnalité d'un champ migré
    // via new Event('change') SANS l'option bubbles (convention déjà en place
    // partout ailleurs dans ces pages, ex. restauration d'un brouillon ou
    // pré-remplissage en édition) — un tel événement ne remonte jamais jusqu'à ce
    // conteneur délégué, mais la phase de capture, elle, traverse toujours les
    // ancêtres jusqu'à la cible, événement bouillonnant ou non.
    block.addEventListener('input', refreshVisibility, true);
    block.addEventListener('change', refreshVisibility, true);

    block.addEventListener('click', function (e) {
      var addBtn = e.target.closest && e.target.closest('.cf-list-add');
      if (addBtn) {
        var fieldId = addBtn.getAttribute('data-cf-field');
        var listEl = block.querySelector('.cf-list[data-cf-list="' + fieldId + '"]');
        if (!listEl) return;
        var itemType = listEl.getAttribute('data-cf-item-type') || 'url';
        var row = document.createElement('div');
        row.className = 'cf-list-row';
        row.innerHTML = '<input type="' + itemType + '" class="admin-input cf-input cf-list-item" data-cf-field="' + escAttr(fieldId) + '" value="" placeholder="' + (itemType === 'url' ? 'https://...' : '') + '">'
          + '<button type="button" class="icon-del cf-list-remove" data-cf-field="' + escAttr(fieldId) + '" title="Retirer">✕</button>';
        listEl.insertBefore(row, addBtn);
        return;
      }
      var rmBtn = e.target.closest && e.target.closest('.cf-list-remove');
      if (rmBtn) {
        var r = rmBtn.closest('.cf-list-row');
        var lst = rmBtn.closest('.cf-list');
        if (r && lst) {
          if (lst.querySelectorAll('.cf-list-row').length > 1) r.remove();
          else { var inp = r.querySelector('input'); if (inp) inp.value = ''; }
        }
        refreshVisibility();
      }
    });
  }

  // ── Validation ──

  function validateValues(attachPoint, values, canalType) {
    values = values || {};
    var errors = [];
    var fields = getFields(attachPoint, canalType).filter(function (f) { return evalShowIf(f, values); });

    function hasValue(f) {
      var v = values[f.id];
      if (f.type === 'checkbox-group' || f.type === 'list') return Array.isArray(v) && v.length > 0;
      if (f.type === 'checkbox') return v === true || v === 'true';
      return v !== undefined && v !== null && String(v).trim() !== '';
    }

    fields.forEach(function (f) {
      if (isSimpleRequired(f) && !hasValue(f)) {
        errors.push({ fieldId: f.id, message: '« ' + f.label + ' » est obligatoire.' });
      }
    });

    var groups = {};
    fields.forEach(function (f) {
      var g = requiredGroup(f);
      if (!g) return;
      groups[g] = groups[g] || { fields: [], satisfied: false };
      groups[g].fields.push(f);
      if (hasValue(f)) groups[g].satisfied = true;
    });
    Object.keys(groups).forEach(function (g) {
      if (!groups[g].satisfied && groups[g].fields.length) {
        var labels = groups[g].fields.map(function (f) { return f.label; }).join(', ');
        errors.push({ fieldId: groups[g].fields[0].id, message: 'Au moins un de ces champs doit être renseigné : ' + labels });
      }
    });

    fields.forEach(function (f) {
      if (f.type === 'url' && hasValue(f) && !isValidUrl(values[f.id])) {
        errors.push({ fieldId: f.id, message: '« ' + f.label + ' » doit être une URL valide (http:// ou https://).' });
      }
      if (f.type === 'list' && f.itemType !== 'text' && Array.isArray(values[f.id])) {
        values[f.id].forEach(function (u) {
          if (u && !isValidUrl(u)) errors.push({ fieldId: f.id, message: '« ' + f.label + ' » contient une URL invalide : ' + u });
        });
      }
    });

    return errors;
  }

  // ── API Publique ──
  return {
    TYPE_LABELS: TYPE_LABELS,
    attachPoints: attachPoints,
    getFields: getFields,
    fieldOptions: fieldOptions,
    isSimpleRequired: isSimpleRequired,
    requiredGroup: requiredGroup,
    evalShowIf: evalShowIf,
    renderFields: renderFields,
    wireFields: wireFields,
    collectValues: collectValues,
    validateValues: validateValues
  };
})();
