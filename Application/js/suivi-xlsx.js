/*
 * suivi-xlsx.js — Lecteur .xlsx minimal et autonome (sans dépendance externe).
 *
 * Un fichier .xlsx est une archive ZIP contenant des XML. On lit ici uniquement
 * ce qu'il faut : la table des chaînes partagées (sharedStrings) et les lignes
 * d'une feuille. La décompression DEFLATE utilise DecompressionStream, disponible
 * dans les navigateurs récents.
 *
 * Expose window.ImpulsionMarketing.suiviXlsx avec :
 *   - parseWorkbook(arrayBuffer) -> Promise<{ sheetNames, sheet(name) }>
 *   - readSheetRows(arrayBuffer, sheetName) -> Promise<Array<Array<string>>>
 */
(function () {
    'use strict';

    // ── Lecture ZIP : on parcourt l'« End Of Central Directory » puis le central directory ──
    function readZipEntries(buf) {
        var dv = new DataView(buf);
        var bytes = new Uint8Array(buf);
        // Cherche l'EOCD (signature 0x06054b50) en partant de la fin.
        var eocd = -1;
        for (var i = buf.byteLength - 22; i >= 0; i--) {
            if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
        }
        if (eocd < 0) throw new Error('ZIP invalide (EOCD introuvable)');
        var count = dv.getUint16(eocd + 10, true);
        var cdOffset = dv.getUint32(eocd + 16, true);
        var entries = {};
        var p = cdOffset;
        for (var n = 0; n < count; n++) {
            if (dv.getUint32(p, true) !== 0x02014b50) break; // central file header
            var method = dv.getUint16(p + 10, true);
            var compSize = dv.getUint32(p + 20, true);
            var nameLen = dv.getUint16(p + 28, true);
            var extraLen = dv.getUint16(p + 30, true);
            var commentLen = dv.getUint16(p + 32, true);
            var localOffset = dv.getUint32(p + 42, true);
            var name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));
            entries[name] = { method: method, compSize: compSize, localOffset: localOffset };
            p += 46 + nameLen + extraLen + commentLen;
        }
        return { dv: dv, bytes: bytes, entries: entries };
    }

    function inflateRaw(u8) {
        // DecompressionStream('deflate-raw') → flux décompressé.
        var ds = new DecompressionStream('deflate-raw');
        var writer = ds.writable.getWriter();
        writer.write(u8);
        writer.close();
        return new Response(ds.readable).arrayBuffer().then(function (ab) { return new Uint8Array(ab); });
    }

    function entryBytes(zip, name) {
        var e = zip.entries[name];
        if (!e) return Promise.resolve(null);
        // Lit le local header pour connaître les longueurs réelles (nom + extra).
        var dv = zip.dv, off = e.localOffset;
        if (dv.getUint32(off, true) !== 0x04034b50) throw new Error('Entrée ZIP invalide : ' + name);
        var nameLen = dv.getUint16(off + 26, true);
        var extraLen = dv.getUint16(off + 28, true);
        var dataStart = off + 30 + nameLen + extraLen;
        var comp = zip.bytes.subarray(dataStart, dataStart + e.compSize);
        if (e.method === 0) return Promise.resolve(comp.slice()); // stored
        return inflateRaw(comp);
    }

    function entryText(zip, name) {
        return entryBytes(zip, name).then(function (u8) { return u8 ? new TextDecoder().decode(u8) : null; });
    }

    // ── Conversion colonne (A, B, …, AA) → index 0-based ──
    function colToIndex(ref) {
        var m = /^([A-Z]+)/.exec(ref);
        if (!m) return 0;
        var c = 0, s = m[1];
        for (var i = 0; i < s.length; i++) c = c * 26 + (s.charCodeAt(i) - 64);
        return c - 1;
    }

    function parseSharedStrings(xml) {
        if (!xml) return [];
        var doc = new DOMParser().parseFromString(xml, 'application/xml');
        var sis = doc.getElementsByTagName('si');
        var out = [];
        for (var i = 0; i < sis.length; i++) {
            var ts = sis[i].getElementsByTagName('t');
            var s = '';
            for (var j = 0; j < ts.length; j++) s += ts[j].textContent || '';
            out.push(s);
        }
        return out;
    }

    // workbook.xml + rels → [{name, path}]
    function parseSheetList(wbXml, relsXml) {
        var wb = new DOMParser().parseFromString(wbXml, 'application/xml');
        var rels = new DOMParser().parseFromString(relsXml, 'application/xml');
        var relMap = {};
        var rNodes = rels.getElementsByTagName('Relationship');
        for (var i = 0; i < rNodes.length; i++) {
            relMap[rNodes[i].getAttribute('Id')] = rNodes[i].getAttribute('Target');
        }
        var sheets = [];
        var sNodes = wb.getElementsByTagName('sheet');
        for (var k = 0; k < sNodes.length; k++) {
            var rid = sNodes[k].getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id')
                || sNodes[k].getAttribute('r:id');
            var tgt = relMap[rid] || '';
            if (tgt.indexOf('/') !== 0 && tgt.indexOf('xl/') !== 0) tgt = 'xl/' + tgt;
            sheets.push({ name: sNodes[k].getAttribute('name'), path: tgt.replace(/^\//, '') });
        }
        return sheets;
    }

    function parseSheetRows(sheetXml, shared) {
        var doc = new DOMParser().parseFromString(sheetXml, 'application/xml');
        var rowNodes = doc.getElementsByTagName('row');
        var rows = [];
        for (var r = 0; r < rowNodes.length; r++) {
            var cNodes = rowNodes[r].getElementsByTagName('c');
            var cells = []; var maxIdx = -1;
            for (var c = 0; c < cNodes.length; c++) {
                var cell = cNodes[c];
                var ref = cell.getAttribute('r') || '';
                var idx = ref ? colToIndex(ref) : c;
                var t = cell.getAttribute('t');
                var val = '';
                if (t === 'inlineStr') {
                    var isNode = cell.getElementsByTagName('t');
                    for (var z = 0; z < isNode.length; z++) val += isNode[z].textContent || '';
                } else {
                    var vNode = cell.getElementsByTagName('v')[0];
                    if (vNode) {
                        var raw = vNode.textContent;
                        val = (t === 's') ? (shared[parseInt(raw, 10)] || '') : raw;
                    }
                }
                cells[idx] = val;
                if (idx > maxIdx) maxIdx = idx;
            }
            for (var f = 0; f <= maxIdx; f++) if (cells[f] === undefined) cells[f] = '';
            rows.push(cells);
        }
        return rows;
    }

    function parseWorkbook(arrayBuffer) {
        var zip = readZipEntries(arrayBuffer);
        var shared, sheets;
        return entryText(zip, 'xl/sharedStrings.xml')
            .then(function (ss) { shared = parseSharedStrings(ss); return entryText(zip, 'xl/workbook.xml'); })
            .then(function (wb) {
                return entryText(zip, 'xl/_rels/workbook.xml.rels').then(function (rels) {
                    sheets = parseSheetList(wb, rels);
                    return {
                        sheetNames: sheets.map(function (s) { return s.name; }),
                        sheet: function (name) {
                            var meta = sheets.filter(function (s) { return s.name === name; })[0] || sheets[0];
                            if (!meta) return Promise.resolve([]);
                            return entryText(zip, meta.path).then(function (xml) { return parseSheetRows(xml, shared); });
                        }
                    };
                });
            });
    }

    function readSheetRows(arrayBuffer, sheetName) {
        return parseWorkbook(arrayBuffer).then(function (wbk) {
            var name = sheetName || wbk.sheetNames[0];
            return wbk.sheet(name);
        });
    }

    window.ImpulsionMarketing = window.ImpulsionMarketing || {};
    window.ImpulsionMarketing.suiviXlsx = { parseWorkbook: parseWorkbook, readSheetRows: readSheetRows };
})();
