import { FIXED_LOGO_URL } from './sampleData';
import { NATURE_CATALOG } from './natureCatalog';

/**
 * Gera e realiza o download da aplicação completa em um único arquivo HTML autônomo (index.html).
 * Inclui o catálogo completo de 452 naturezas, persistência local de parâmetros, bloqueio de edição pós-colagem,
 * seletor de natureza predominante e Quadro Resumo agrupado por Sub-grupo com subtotais no PDF.
 */
export function exportStandaloneSingleFileHtml(): void {
  const serializedCatalog = JSON.stringify(NATURE_CATALOG);

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Operacional de Ocorrências — 4º BBM</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/pdfmake.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.10/vfs_fonts.js"></script>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen antialiased">
  <header class="bg-white border-b border-slate-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
      <div class="flex items-center gap-3">
        <img src="${FIXED_LOGO_URL}" referrerpolicy="no-referrer" alt="Brasão" class="w-8 h-8 object-contain">
        <span class="text-base font-bold tracking-tight text-slate-900">Relatórios de Ocorrências — 4º BBM</span>
      </div>
      <span class="text-xs text-slate-500 hidden sm:inline">Configurações salvas automaticamente neste navegador</span>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 py-6 space-y-6">
    <!-- 1. Colar Dados -->
    <section class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-slate-900">1. Cole os Dados das Ocorrências</h2>
          <p class="text-xs text-slate-500">Copie a tabela na página do sistema (Ctrl+C) e cole diretamente no campo abaixo (Ctrl+V).</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input type="file" id="fileInput" accept=".html,.htm,.txt,.csv,.tsv" class="hidden">
          <button id="btnImportFile" class="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer">Importar Arquivo</button>
          <button id="btnClear" class="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 rounded-lg shadow-xs cursor-pointer transition-colors">Limpar Dados</button>
        </div>
      </div>

      <div id="lockBanner" class="hidden p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900">
        <span><strong>Dados carregados e bloqueados contra edição.</strong> Caso precise alterar algum registro, clique em <strong>Limpar Dados</strong> e cole a tabela novamente.</span>
      </div>

      <textarea id="txtInput" rows="6" placeholder="Cole aqui os dados copiados (tabela da web, Excel, CSV ou código HTML)..." class="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"></textarea>

      <div class="flex justify-end">
        <button id="btnProcess" class="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer">
          Processar Dados Colados
        </button>
      </div>
      <div id="alertBox" class="hidden p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700"></div>
    </section>

    <!-- 2. Parâmetros do Relatório (sempre visível e salvo automaticamente) -->
    <section id="configSection" class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <img src="${FIXED_LOGO_URL}" referrerpolicy="no-referrer" alt="Brasão" class="w-10 h-10 object-contain border border-slate-200 rounded p-0.5">
          <div>
            <h3 class="text-sm font-bold text-slate-900">2. Parâmetros e Personalização do Relatório</h3>
            <p class="text-[11px] text-slate-500">Ala de Serviço, intervalo de data/hora e colunas do PDF (salvos automaticamente)</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span id="pdfHint" class="text-[11px] text-amber-700 font-medium">Cole os dados acima para gerar o PDF</span>
          <button id="btnViewPdf" disabled class="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer">Abrir PDF</button>
          <button id="btnDownloadPdf" disabled class="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer">Baixar PDF</button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label class="text-xs font-bold text-slate-800 block mb-1">Ala de Serviço</label>
          <select id="cfgWing" class="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg">
            <option value="A">Ala A</option>
            <option value="B">Ala B</option>
            <option value="C">Ala C</option>
            <option value="D">Ala D</option>
          </select>
        </div>
        <div>
          <label class="text-xs font-bold text-slate-800 block mb-1">Data/Hora Inicial</label>
          <input type="datetime-local" id="cfgStart" class="w-full text-xs font-mono p-2 bg-slate-50 border border-slate-300 rounded-lg">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-800 block mb-1">Data/Hora Final</label>
          <input type="datetime-local" id="cfgEnd" class="w-full text-xs font-mono p-2 bg-slate-50 border border-slate-300 rounded-lg">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-800 block mb-1">Orientação</label>
          <select id="cfgOrientation" class="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg">
            <option value="landscape" selected>Paisagem (A4)</option>
            <option value="portrait">Retrato (A4)</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="text-xs font-bold text-slate-800 block mb-1">Título Principal</label>
          <input type="text" id="cfgTitle" value="RELATÓRIO OPERACIONAL DE ATENDIMENTOS E OCORRÊNCIAS" class="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-lg">
        </div>
        <div>
          <label class="text-xs font-bold text-slate-800 block mb-1">Subtítulo / Unidade</label>
          <input type="text" id="cfgSubtitle" value="4º Batalhão de Bombeiros Militar — Controle Operacional" class="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg">
        </div>
      </div>

      <div>
        <label class="text-xs font-bold text-slate-800 block mb-1.5">Colunas Ativas:</label>
        <div id="columnsList" class="flex flex-wrap gap-2"></div>
      </div>
    </section>

    <!-- 3. Classificação e Natureza Predominante -->
    <section id="classificationSection" class="hidden bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 class="text-sm font-bold text-slate-900">3. Definição da Natureza Predominante &amp; Conciliação</h3>
          <p id="classificationHint" class="text-xs text-slate-600"></p>
        </div>
        <button id="btnToggleAllClass" class="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer">
          Revisar Todas
        </button>
      </div>
      <div id="classificationList" class="divide-y divide-slate-200 border border-slate-200 rounded-lg"></div>
    </section>

    <!-- 4. Pré-visualização do Documento -->
    <section id="previewSection" class="hidden bg-slate-200/70 border border-slate-300 rounded-xl p-5 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-bold text-slate-900">4. Pré-visualização do Documento e Quadro Resumo</h3>
        <span id="rowCountLabel" class="text-xs font-mono text-slate-600"></span>
      </div>
      <div class="bg-white shadow-md border border-slate-300 p-6 rounded-sm overflow-x-auto space-y-5">
        <div id="docHeaderPreview" class="pb-3 border-b-2 border-slate-900 flex items-start justify-between gap-4"></div>
        <table id="previewTable" class="w-full text-left text-[10px] border-collapse"></table>
        <div id="summaryPreview" class="pt-4 border-t border-slate-300 space-y-4"></div>
        <div id="docFooterPreview" class="pt-2 border-t border-slate-200 flex justify-between text-[10px] text-slate-500"></div>
      </div>
    </section>
  </main>

  <script>
    const FIXED_LOGO_URL = '${FIXED_LOGO_URL}';
    const STD_COLS = ['NÚMERO','DATA REGISTRO','STATUS','DATA FATO','UNIDADES ATUAL','NATUREZAS','MUNICÍPIO','BAIRRO','LOGRADOURO'];
    const NATURE_CATALOG = ${serializedCatalog};
    const STORAGE_CFG_KEY = 'relatorio_ocorrencias_portable_cfg_v1';
    const STORAGE_HIDDEN_COLS_KEY = 'relatorio_ocorrencias_portable_hidden_cols_v1';

    let logoBase64 = null;
    let currentData = null;
    let visibleColumnsMap = {};
    let hiddenLabels = [];
    let natureOverrides = {};
    let showAllClassifications = false;

    const txtInput = document.getElementById('txtInput');
    const btnProcess = document.getElementById('btnProcess');
    const btnImportFile = document.getElementById('btnImportFile');
    const btnClear = document.getElementById('btnClear');
    const lockBanner = document.getElementById('lockBanner');
    const btnViewPdf = document.getElementById('btnViewPdf');
    const btnDownloadPdf = document.getElementById('btnDownloadPdf');
    const pdfHint = document.getElementById('pdfHint');

    function initAndLoadSettings() {
      const now = new Date();
      const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const pad = n => String(n).padStart(2, '0');
      const fmt = (d, hr) => d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + 'T' + hr;

      document.getElementById('cfgStart').value = fmt(yest, '07:00');
      document.getElementById('cfgEnd').value = fmt(now, '07:00');

      try {
        const rawCfg = localStorage.getItem(STORAGE_CFG_KEY);
        if (rawCfg) {
          const parsed = JSON.parse(rawCfg);
          if (parsed.wing) document.getElementById('cfgWing').value = parsed.wing;
          if (parsed.start) document.getElementById('cfgStart').value = parsed.start;
          if (parsed.end) document.getElementById('cfgEnd').value = parsed.end;
          if (parsed.title !== undefined) document.getElementById('cfgTitle').value = parsed.title;
          if (parsed.subtitle !== undefined) document.getElementById('cfgSubtitle').value = parsed.subtitle;
          if (parsed.orientation) document.getElementById('cfgOrientation').value = parsed.orientation;
        }
        const rawCols = localStorage.getItem(STORAGE_HIDDEN_COLS_KEY);
        if (rawCols) {
          const parsedCols = JSON.parse(rawCols);
          if (Array.isArray(parsedCols)) hiddenLabels = parsedCols;
        }
      } catch (e) {}
    }

    function saveSettings() {
      try {
        const payload = {
          wing: document.getElementById('cfgWing').value,
          start: document.getElementById('cfgStart').value,
          end: document.getElementById('cfgEnd').value,
          title: document.getElementById('cfgTitle').value,
          subtitle: document.getElementById('cfgSubtitle').value,
          orientation: document.getElementById('cfgOrientation').value
        };
        localStorage.setItem(STORAGE_CFG_KEY, JSON.stringify(payload));
      } catch (e) {}
    }

    function saveHiddenLabels() {
      try {
        localStorage.setItem(STORAGE_HIDDEN_COLS_KEY, JSON.stringify(hiddenLabels));
      } catch (e) {}
    }

    function renderColumnsControl() {
      const colsDiv = document.getElementById('columnsList');
      colsDiv.innerHTML = '';
      const headers = currentData
        ? currentData.headers
        : STD_COLS.map(lbl => ({ key: lbl, label: lbl }));

      headers.forEach(h => {
        const isVisible = currentData
          ? (visibleColumnsMap[h.key] !== undefined ? visibleColumnsMap[h.key] : !hiddenLabels.includes(h.label.toUpperCase()))
          : !hiddenLabels.includes(h.label.toUpperCase());

        if (currentData && visibleColumnsMap[h.key] === undefined) {
          visibleColumnsMap[h.key] = isVisible;
        }

        const btn = document.createElement('button');
        btn.className = 'px-2.5 py-1 text-xs rounded-lg border font-medium cursor-pointer ' + (isVisible ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-100 text-slate-400 border-slate-200 line-through');
        btn.textContent = h.label;
        btn.onclick = () => {
          const upper = h.label.toUpperCase();
          if (currentData) {
            visibleColumnsMap[h.key] = !isVisible;
            if (visibleColumnsMap[h.key]) {
              hiddenLabels = hiddenLabels.filter(l => l !== upper);
            } else if (!hiddenLabels.includes(upper)) {
              hiddenLabels.push(upper);
            }
            saveHiddenLabels();
            renderAll();
          } else {
            if (isVisible) {
              if (!hiddenLabels.includes(upper)) hiddenLabels.push(upper);
            } else {
              hiddenLabels = hiddenLabels.filter(l => l !== upper);
            }
            saveHiddenLabels();
            renderColumnsControl();
          }
        };
        colsDiv.appendChild(btn);
      });
    }

    function updateLockUI() {
      const hasData = Boolean(currentData);
      txtInput.readOnly = hasData;
      if (hasData) {
        txtInput.className = 'w-full text-xs font-mono p-3 bg-slate-100 text-slate-500 border border-slate-300 rounded-xl cursor-not-allowed select-none';
        lockBanner.classList.remove('hidden');
        btnProcess.classList.add('hidden');
        btnImportFile.disabled = true;
        btnImportFile.classList.add('opacity-50', 'cursor-not-allowed');
        btnClear.className = 'px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer transition-colors';
        btnViewPdf.disabled = false;
        btnDownloadPdf.disabled = false;
        pdfHint.classList.add('hidden');
      } else {
        txtInput.className = 'w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900';
        lockBanner.classList.add('hidden');
        btnProcess.classList.remove('hidden');
        btnImportFile.disabled = false;
        btnImportFile.classList.remove('opacity-50', 'cursor-not-allowed');
        btnClear.className = 'px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 rounded-lg shadow-xs cursor-pointer transition-colors';
        btnViewPdf.disabled = true;
        btnDownloadPdf.disabled = true;
        pdfHint.classList.remove('hidden');
      }
    }

    initAndLoadSettings();
    renderColumnsControl();
    updateLockUI();

    fetch(FIXED_LOGO_URL, { mode: 'cors' })
      .then(r => r.blob())
      .then(blob => {
        const u = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const max = 220;
          const sc = Math.min(max / img.naturalWidth, max / img.naturalHeight, 1);
          const c = document.createElement('canvas');
          c.width = Math.round(img.naturalWidth * sc);
          c.height = Math.round(img.naturalHeight * sc);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          logoBase64 = c.toDataURL('image/png');
          URL.revokeObjectURL(u);
        };
        img.src = u;
      }).catch(() => {});

    function normText(t) {
      return (t || '').toUpperCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^A-Z0-9.\\/\\s-]/g, ' ').replace(/\\s+/g, ' ').trim();
    }

    function detectCandidates(rawText) {
      const text = (rawText || '').trim();
      if (!text) return [];
      const found = [];
      const added = new Set();
      const add = e => { if (!added.has(e.id)) { added.add(e.id); found.push(e); } };
      const normRaw = normText(text);

      (text.match(/\\b5(?:\\.\\d+){2,6}\\b/g) || []).forEach(code => {
        NATURE_CATALOG.filter(e => e.code === code).forEach(add);
      });

      (text.match(/\\b\\d{5}\\b/g) || []).forEach(code => {
        const matches = NATURE_CATALOG.filter(e => e.code === code);
        if (matches.length === 1) add(matches[0]);
        else if (matches.length > 1) {
          const scored = matches.map(m => {
            let s = 0;
            if (normRaw.includes(normText(m.nature))) s += 10;
            if (normRaw.includes(normText(m.group))) s += 5;
            if (normRaw.includes(normText(m.subGroup))) s += 3;
            return { m, s };
          }).sort((a, b) => b.s - a.s);
          if (scored[0].s > 0) scored.filter(x => x.s === scored[0].s).forEach(x => add(x.m));
          else matches.forEach(add);
        }
      });

      if (found.length > 0) return found;

      const segs = text.split(/[;|\\n+]+|\\s+\\/\\s+/).map(s => s.trim()).filter(s => s.length >= 3);
      (segs.length ? segs : [text]).forEach(seg => {
        const ns = normText(seg);
        if (!ns) return;
        const exact = NATURE_CATALOG.filter(e => normText(e.nature) === ns);
        if (exact.length) { exact.forEach(add); return; }
        const scored = [];
        NATURE_CATALOG.forEach(e => {
          const nn = normText(e.nature), nsub = normText(e.subGroup), ng = normText(e.group);
          let sc = 0;
          if (ns.includes(nn) && nn.length >= 4) sc += 10 + nn.length;
          else if (nn.includes(ns) && ns.length >= 5) sc += 6 + ns.length;
          if (ns.includes(nsub) && nsub.length >= 4) sc += 4;
          if (ns.includes(ng) && ng.length >= 4) sc += 2;
          if (sc > 0) scored.push({ e, sc });
        });
        if (scored.length) {
          scored.sort((a, b) => b.sc - a.sc);
          scored.filter(x => x.sc >= scored[0].sc - 1).slice(0, 3).forEach(x => add(x.e));
        }
      });
      return found;
    }

    function computeClassificationAndSummary() {
      const natureHeader = currentData.headers.find(h => h.label.toUpperCase().includes('NATUREZA'));
      const numHeader = currentData.headers.find(h => h.label.toUpperCase().includes('NÚMERO') || h.label.toUpperCase().includes('NUMERO'));
      const items = currentData.rows.map((row, idx) => {
        const raw = natureHeader ? (row[natureHeader.key] || '') : '';
        const occNum = numHeader ? (row[numHeader.key] || ('#' + (idx+1))) : ('#' + (idx+1));
        const candidates = detectCandidates(raw);
        const ovId = natureOverrides[idx];
        const ovEntry = ovId ? NATURE_CATALOG.find(e => e.id === ovId) : null;
        const selected = ovEntry || (candidates.length ? candidates[0] : null);
        return {
          idx, occNum, raw, candidates, selected,
          hasMultiple: candidates.length > 1,
          isUnclassified: !selected,
          isManual: Boolean(ovEntry)
        };
      });

      const grpMap = new Map();
      const natMap = new Map();
      let multiPending = 0, unclass = 0;
      items.forEach(it => {
        if (it.hasMultiple && !it.isManual) multiPending++;
        if (it.selected) {
          const e = it.selected;
          grpMap.set(e.group, (grpMap.get(e.group) || 0) + 1);
          const ex = natMap.get(e.id);
          if (ex) ex.count++;
          else natMap.set(e.id, { ...e, count: 1 });
        } else {
          unclass++;
          const g = 'NÃO CLASSIFICADO';
          grpMap.set(g, (grpMap.get(g) || 0) + 1);
          const fid = 'UNCLASS__' + normText(it.raw);
          const ex = natMap.get(fid);
          if (ex) ex.count++;
          else natMap.set(fid, { id: fid, code: '—', group: g, subGroup: 'A DEFINIR', nature: it.raw || 'Sem natureza', count: 1 });
        }
      });

      const total = items.length;
      const byGroup = Array.from(grpMap.entries()).map(([group, count]) => ({ group, count, pct: total ? (count/total*100) : 0 }))
        .sort((a, b) => b.count - a.count || a.group.localeCompare(b.group, 'pt-BR'));
      const grpOrd = new Map(byGroup.map((g, i) => [g.group, i]));
      const byNature = Array.from(natMap.values()).map(n => ({ ...n, pct: total ? (n.count/total*100) : 0 }))
        .sort((a, b) => (grpOrd.get(a.group) - grpOrd.get(b.group)) || (b.count - a.count) || a.code.localeCompare(b.code));

      // Agrupamento por Sub-grupo com subtotais
      const subMap = new Map();
      byNature.forEach(entry => {
        const key = entry.group + '||' + entry.subGroup;
        const existing = subMap.get(key);
        if (existing) {
          existing.entries.push(entry);
          existing.subtotalCount += entry.count;
        } else {
          subMap.set(key, {
            group: entry.group,
            subGroup: entry.subGroup,
            entries: [entry],
            subtotalCount: entry.count,
            subtotalPct: 0
          });
        }
      });

      const bySubGroup = Array.from(subMap.values()).map(blk => ({
        ...blk,
        subtotalPct: total ? (blk.subtotalCount / total * 100) : 0,
        entries: blk.entries.sort((a, b) => (b.count - a.count) || a.code.localeCompare(b.code))
      })).sort((a, b) => {
        const ga = grpOrd.get(a.group) ?? 999;
        const gb = grpOrd.get(b.group) ?? 999;
        if (ga !== gb) return ga - gb;
        if (b.subtotalCount !== a.subtotalCount) return b.subtotalCount - a.subtotalCount;
        return a.subGroup.localeCompare(b.subGroup, 'pt-BR');
      });

      return { items, summary: { total, byGroup, byNature, bySubGroup, multiPending, unclass } };
    }

    function fmtBrDate(iso) {
      if (!iso) return 'Não informado';
      const [dp, tp] = iso.split('T');
      const [y, m, d] = dp.split('-');
      return d + '/' + m + '/' + y + ' ' + (tp || '00:00').slice(0, 5);
    }

    function parseInput(raw, clipHtml) {
      if (clipHtml && /<(table|tr)[\\s>]/i.test(clipHtml)) {
        const res = parseHtmlStr(clipHtml);
        if (res) return res;
      }
      const txt = (raw || '').trim();
      if (!txt) return null;
      if (/<(table|tr)[\\s>]/i.test(txt)) return parseHtmlStr(txt);
      const lines = txt.split(/\\r?\\n/).filter(l => l.trim());
      const delim = txt.includes('\\t') ? '\\t' : (txt.includes(';') ? ';' : '|');
      return buildData(lines.map(l => l.split(delim).map(c => c.trim())));
    }

    function parseHtmlStr(html) {
      const wrapped = /<table[\\s>]/i.test(html) ? html : '<table>' + html + '</table>';
      const doc = new DOMParser().parseFromString(wrapped, 'text/html');
      const table = doc.querySelector('table');
      if (!table) return null;
      const rows = Array.from(table.querySelectorAll('tr'));
      const matrix = rows.map(r => Array.from(r.querySelectorAll('th,td')).map(c => c.textContent.trim().replace(/\\s+/g, ' '))).filter(r => r.length > 0);
      return buildData(matrix);
    }

    function buildData(matrix) {
      if (!matrix || matrix.length === 0) return null;
      const maxCols = Math.max(...matrix.map(r => r.length));
      if (maxCols < 2) return null;
      const firstJoined = matrix[0].join(' ').toUpperCase();
      const hasHeader = firstJoined.includes('NUMERO') || firstJoined.includes('NÚMERO') || firstJoined.includes('STATUS') || firstJoined.includes('NATUREZA');
      let headers, startIdx;
      if (hasHeader) {
        startIdx = 1;
        headers = matrix[0].map((lbl, i) => ({ key: 'col_' + i, label: lbl || ('COLUNA_' + (i+1)) }));
      } else if (maxCols === 9) {
        startIdx = 0;
        headers = STD_COLS.map((lbl, i) => ({ key: 'col_' + i, label: lbl }));
      } else {
        startIdx = 1;
        headers = matrix[0].map((lbl, i) => ({ key: 'col_' + i, label: lbl || ('COLUNA_' + (i+1)) }));
      }
      const dataRows = [];
      for (let i = startIdx; i < matrix.length; i++) {
        const obj = {}; let hasVal = false;
        headers.forEach((h, idx) => { const v = matrix[i][idx] || ''; if (v) hasVal = true; obj[h.key] = v; });
        if (hasVal) dataRows.push(obj);
      }
      return dataRows.length ? { headers, rows: dataRows } : null;
    }

    function applyParsedData(parsed) {
      currentData = parsed;
      visibleColumnsMap = {};
      parsed.headers.forEach(h => {
        visibleColumnsMap[h.key] = !hiddenLabels.includes(h.label.toUpperCase());
      });
      natureOverrides = {};
      document.getElementById('alertBox').classList.add('hidden');
      updateLockUI();
      renderAll();
    }

    function renderAll() {
      renderColumnsControl();
      if (!currentData) return;

      document.getElementById('classificationSection').classList.remove('hidden');
      document.getElementById('previewSection').classList.remove('hidden');

      const { items, summary } = computeClassificationAndSummary();

      // Classification panel
      const attention = items.filter(it => it.hasMultiple || it.isUnclassified || it.isManual);
      const listItems = showAllClassifications ? items : attention;
      document.getElementById('classificationHint').textContent = (summary.multiPending + summary.unclass > 0)
        ? (summary.multiPending + summary.unclass) + ' ocorrência(s) precisam de confirmação da natureza predominante.'
        : 'Todas as ' + summary.total + ' ocorrências estão classificadas e conciliadas (' + summary.total + ' = ' + summary.total + ').';

      const classListDiv = document.getElementById('classificationList');
      classListDiv.innerHTML = '';
      if (listItems.length === 0) {
        classListDiv.innerHTML = '<div class="p-3 text-xs text-slate-600 bg-slate-50">Nenhuma pendência detectada. Clique em "Revisar Todas" caso queira ajustar manualmente alguma ocorrência.</div>';
      } else {
        listItems.forEach(it => {
          const wrap = document.createElement('div');
          wrap.className = 'p-3 space-y-2 ' + (it.isUnclassified ? 'bg-rose-50/40' : (it.hasMultiple && !it.isManual ? 'bg-amber-50/40' : 'bg-white'));
          wrap.innerHTML = '<div class="text-xs"><strong class="font-mono">' + it.occNum + '</strong> — <span class="font-mono text-slate-600">' + it.raw + '</span></div>';

          if (it.candidates.length > 0) {
            const cRow = document.createElement('div');
            cRow.className = 'flex flex-wrap gap-1.5';
            it.candidates.forEach(c => {
              const b = document.createElement('button');
              const sel = it.selected && it.selected.id === c.id;
              b.className = 'px-2.5 py-1 text-xs rounded border cursor-pointer ' + (sel ? 'bg-slate-900 text-white border-slate-900 font-semibold' : 'bg-white text-slate-700 border-slate-300');
              b.textContent = c.code + ' - ' + c.nature + ' (' + c.group + ')';
              b.onclick = () => { natureOverrides[it.idx] = c.id; renderAll(); };
              cRow.appendChild(b);
            });
            wrap.appendChild(cRow);
          }

          const selEl = document.createElement('select');
          selEl.className = 'w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded mt-1';
          const defaultOpt = document.createElement('option');
          defaultOpt.value = '';
          defaultOpt.textContent = '-- Selecionar / alterar no catálogo completo (' + NATURE_CATALOG.length + ' naturezas) --';
          selEl.appendChild(defaultOpt);
          NATURE_CATALOG.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.id;
            opt.textContent = e.code + ' - ' + e.nature + ' (' + e.group + ')';
            if (it.selected && it.selected.id === e.id) opt.selected = true;
            selEl.appendChild(opt);
          });
          selEl.onchange = () => { if (selEl.value) { natureOverrides[it.idx] = selEl.value; renderAll(); } };
          wrap.appendChild(selEl);
          classListDiv.appendChild(wrap);
        });
      }

      // Header & Table Preview
      const wing = document.getElementById('cfgWing').value;
      const start = fmtBrDate(document.getElementById('cfgStart').value);
      const end = fmtBrDate(document.getElementById('cfgEnd').value);
      const title = document.getElementById('cfgTitle').value;
      const subtitle = document.getElementById('cfgSubtitle').value;

      document.getElementById('docHeaderPreview').innerHTML = \`
        <div class="flex items-start gap-3">
          <img src="\${FIXED_LOGO_URL}" referrerpolicy="no-referrer" class="w-12 h-12 object-contain">
          <div>
            <h4 class="text-sm font-extrabold text-slate-900">\${title}</h4>
            <p class="text-xs text-slate-600">\${subtitle}</p>
            <p class="text-[11px] font-semibold text-slate-800 mt-1">Ala de Serviço: Ala \${wing} | Período: \${start} a \${end}</p>
          </div>
        </div>
        <div class="text-right text-[11px]">
          <div class="font-bold text-slate-900">ALA \${wing}</div>
          <div class="text-slate-500">Gerado em: \${new Date().toLocaleString('pt-BR')}</div>
          <div class="font-bold text-sky-700">Total: \${summary.total} ocorrências</div>
        </div>\`;

      const active = currentData.headers.filter(h => visibleColumnsMap[h.key]);
      let html = '<thead class="bg-slate-900 text-white"><tr>';
      active.forEach(h => { html += '<th class="p-2 border border-slate-700">' + h.label + '</th>'; });
      html += '</tr></thead><tbody>';
      currentData.rows.forEach((r, i) => {
        html += '<tr class="' + (i % 2 === 0 ? 'bg-white' : 'bg-slate-50') + '">';
        active.forEach(h => { html += '<td class="p-1.5 border border-slate-200 text-slate-800">' + (r[h.key] || '—') + '</td>'; });
        html += '</tr>';
      });
      html += '</tbody>';
      document.getElementById('previewTable').innerHTML = html;

      // Summary Preview (por Grupo + por Sub-grupo com subtotais)
      const pctStr = v => v.toFixed(1).replace('.', ',') + '%';
      let sumHtml = '<div><h5 class="text-xs font-extrabold text-slate-900 uppercase">Quadro Resumo — Quantitativo de Ocorrências Atendidas</h5><p class="text-[10px] text-slate-600">Total de Ocorrências: ' + summary.total + ' | Total de Naturezas: ' + summary.total + '</p></div>';
      sumHtml += '<table class="max-w-lg w-full text-left text-[10px] border-collapse border border-slate-300"><thead class="bg-slate-900 text-white"><tr><th class="p-1.5 border border-slate-700">GRUPO</th><th class="p-1.5 border border-slate-700 text-center">OCORRÊNCIAS</th><th class="p-1.5 border border-slate-700 text-center">%</th></tr></thead><tbody>';
      summary.byGroup.forEach((g, i) => {
        sumHtml += '<tr class="' + (i%2===0?'bg-white':'bg-slate-50') + '"><td class="p-1 border border-slate-200 font-semibold">' + g.group + '</td><td class="p-1 border border-slate-200 text-center font-mono font-bold">' + g.count + '</td><td class="p-1 border border-slate-200 text-center font-mono">' + pctStr(g.pct) + '</td></tr>';
      });
      sumHtml += '<tr class="bg-slate-200 font-bold"><td class="p-1.5 border border-slate-300">TOTAL GERAL POR GRUPO</td><td class="p-1.5 border border-slate-300 text-center font-mono">' + summary.total + '</td><td class="p-1.5 border border-slate-300 text-center font-mono">100,0%</td></tr></tbody></table>';

      sumHtml += '<table class="w-full text-left text-[10px] border-collapse border border-slate-300"><thead class="bg-slate-900 text-white"><tr><th class="p-1.5 border border-slate-700">GRUPO</th><th class="p-1.5 border border-slate-700 text-center">CÓDIGO</th><th class="p-1.5 border border-slate-700">SUB-GRUPO</th><th class="p-1.5 border border-slate-700">NATUREZA</th><th class="p-1.5 border border-slate-700 text-center">QTD.</th><th class="p-1.5 border border-slate-700 text-center">%</th></tr></thead><tbody>';
      summary.bySubGroup.forEach(blk => {
        blk.entries.forEach((n, i) => {
          sumHtml += '<tr class="' + (i%2===0?'bg-white':'bg-slate-50') + '"><td class="p-1 border border-slate-200 font-semibold">' + n.group + '</td><td class="p-1 border border-slate-200 text-center font-mono font-bold">' + n.code + '</td><td class="p-1 border border-slate-200">' + n.subGroup + '</td><td class="p-1 border border-slate-200">' + n.nature + '</td><td class="p-1 border border-slate-200 text-center font-mono font-bold">' + n.count + '</td><td class="p-1 border border-slate-200 text-center font-mono">' + pctStr(n.pct) + '</td></tr>';
        });
        sumHtml += '<tr class="bg-slate-100 font-bold text-slate-900"><td colspan="4" class="p-1 border border-slate-300 text-right">Subtotal — ' + blk.group + ' / ' + blk.subGroup + '</td><td class="p-1 border border-slate-300 text-center font-mono">' + blk.subtotalCount + '</td><td class="p-1 border border-slate-300 text-center font-mono">' + pctStr(blk.subtotalPct) + '</td></tr>';
      });
      sumHtml += '<tr class="bg-slate-200 font-bold"><td colspan="4" class="p-1.5 border border-slate-300">TOTAL GERAL DE NATUREZAS ATENDIDAS</td><td class="p-1.5 border border-slate-300 text-center font-mono">' + summary.total + '</td><td class="p-1.5 border border-slate-300 text-center font-mono">100,0%</td></tr></tbody></table>';

      document.getElementById('summaryPreview').innerHTML = sumHtml;
      document.getElementById('docFooterPreview').innerHTML = '<span>DOCUMENTO DE USO CORPORATIVO / RESERVADO</span><span>Página 1</span>';
      document.getElementById('rowCountLabel').textContent = summary.total + ' ocorrências · ' + summary.bySubGroup.length + ' subgrupo(s)';
    }

    function createPdfDoc() {
      const { summary } = computeClassificationAndSummary();
      const active = currentData.headers.filter(h => visibleColumnsMap[h.key]);
      const wing = document.getElementById('cfgWing').value;
      const start = fmtBrDate(document.getElementById('cfgStart').value);
      const end = fmtBrDate(document.getElementById('cfgEnd').value);
      const title = document.getElementById('cfgTitle').value;
      const subtitle = document.getElementById('cfgSubtitle').value;
      const orientation = document.getElementById('cfgOrientation').value;
      const isL = orientation === 'landscape';
      const pctStr = v => v.toFixed(1).replace('.', ',') + '%';

      const body = [active.map(h => ({ text: h.label, fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' }))];
      currentData.rows.forEach((r, i) => {
        body.push(active.map(h => ({ text: r[h.key] || '—', fillColor: i % 2 === 0 ? '#FFFFFF' : '#F8FAFC', fontSize: 6.5 })));
      });

      const groupBody = [[
        { text: 'GRUPO', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7 },
        { text: 'OCORRÊNCIAS', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
        { text: '%', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' }
      ]];
      summary.byGroup.forEach((g, i) => {
        const f = i % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        groupBody.push([
          { text: g.group, fillColor: f, bold: true, fontSize: 7 },
          { text: String(g.count), fillColor: f, bold: true, alignment: 'center', fontSize: 7 },
          { text: pctStr(g.pct), fillColor: f, alignment: 'center', fontSize: 7 }
        ]);
      });
      groupBody.push([
        { text: 'TOTAL GERAL POR GRUPO', fillColor: '#E2E8F0', bold: true, fontSize: 7 },
        { text: String(summary.total), fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 },
        { text: '100,0%', fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 }
      ]);

      const natureBody = [[
        { text: 'GRUPO', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7 },
        { text: 'CÓDIGO', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
        { text: 'SUB-GRUPO', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7 },
        { text: 'NATUREZA', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7 },
        { text: 'QTD.', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
        { text: '%', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' }
      ]];
      summary.bySubGroup.forEach(blk => {
        blk.entries.forEach((n, i) => {
          const f = i % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
          natureBody.push([
            { text: n.group, fillColor: f, bold: true, fontSize: 6.5 },
            { text: n.code, fillColor: f, bold: true, alignment: 'center', fontSize: 6.5 },
            { text: n.subGroup, fillColor: f, fontSize: 6.5 },
            { text: n.nature, fillColor: f, fontSize: 6.5 },
            { text: String(n.count), fillColor: f, bold: true, alignment: 'center', fontSize: 6.5 },
            { text: pctStr(n.pct), fillColor: f, alignment: 'center', fontSize: 6.5 }
          ]);
        });
        natureBody.push([
          { text: 'Subtotal — ' + blk.group + ' / ' + blk.subGroup, colSpan: 4, fillColor: '#F1F5F9', bold: true, alignment: 'right', fontSize: 6.5, color: '#0F172A' },
          {}, {}, {},
          { text: String(blk.subtotalCount), fillColor: '#F1F5F9', bold: true, alignment: 'center', fontSize: 6.5, color: '#0F172A' },
          { text: pctStr(blk.subtotalPct), fillColor: '#F1F5F9', bold: true, alignment: 'center', fontSize: 6.5, color: '#0F172A' }
        ]);
      });
      natureBody.push([
        { text: 'TOTAL GERAL DE NATUREZAS ATENDIDAS', colSpan: 4, fillColor: '#E2E8F0', bold: true, fontSize: 7 },
        {}, {}, {},
        { text: String(summary.total), fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 },
        { text: '100,0%', fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 }
      ]);

      return {
        pageSize: 'A4',
        pageOrientation: orientation,
        pageMargins: [24, 86, 24, 36],
        header: (cp, pc, ps) => ({
          margin: [24, 14, 24, 10],
          stack: [
            {
              columns: [
                {
                  width: '*',
                  columns: [
                    ...(logoBase64 ? [{ image: logoBase64, fit: [44, 44], width: 44, margin: [0, 0, 10, 0] }] : []),
                    {
                      width: '*',
                      stack: [
                        { text: title, fontSize: 10.5, bold: true, color: '#0F172A' },
                        { text: subtitle, fontSize: 7.5, color: '#475569', margin: [0, 2, 0, 2] },
                        { text: 'Ala de Serviço: Ala ' + wing + '   |   Período: ' + start + ' a ' + end, fontSize: 7, bold: true, color: '#0F172A' }
                      ]
                    }
                  ]
                },
                {
                  width: 190,
                  alignment: 'right',
                  stack: [
                    { text: 'ALA ' + wing, fontSize: 8.5, bold: true, color: '#0F172A' },
                    { text: 'Gerado em: ' + new Date().toLocaleString('pt-BR'), fontSize: 6.5, color: '#475569', margin: [0, 2, 0, 1] },
                    { text: 'Total de Ocorrências: ' + summary.total, fontSize: 7, bold: true, color: '#0369A1' }
                  ]
                }
              ]
            },
            { canvas: [{ type: 'line', x1: 0, y1: 8, x2: ps.width - 48, y2: 8, lineWidth: 1, lineColor: '#CBD5E1' }] }
          ]
        }),
        footer: (cp, pc) => ({
          margin: [24, 8, 24, 8],
          columns: [
            { text: 'DOCUMENTO DE USO CORPORATIVO / RESERVADO • GERADO CLIENT-SIDE', fontSize: 6.5, color: '#64748B' },
            { text: 'Página ' + cp + ' de ' + pc, alignment: 'right', fontSize: 7, bold: true, color: '#0F172A' }
          ]
        }),
        content: [
          { table: { headerRows: 1, dontBreakRows: true, widths: active.map(() => '*'), body } },
          {
            margin: [0, 16, 0, 6],
            unbreakable: true,
            stack: [
              { text: 'QUADRO RESUMO — QUANTITATIVO DE OCORRÊNCIAS ATENDIDAS', fontSize: 9.5, bold: true, color: '#0F172A' },
              { text: 'Total de Ocorrências: ' + summary.total + ' | Total de Naturezas: ' + summary.total, fontSize: 7, color: '#475569', margin: [0, 1, 0, 6] },
              { table: { headerRows: 1, dontBreakRows: true, widths: isL ? [260, 80, 60] : ['*', 75, 50], body: groupBody } }
            ]
          },
          {
            margin: [0, 8, 0, 0],
            table: { headerRows: 1, dontBreakRows: true, widths: isL ? [125, 48, 115, '*', 42, 42] : [95, 42, 80, '*', 34, 34], body: natureBody }
          }
        ]
      };
    }

    ['cfgWing','cfgStart','cfgEnd','cfgTitle','cfgSubtitle','cfgOrientation'].forEach(id => {
      const handler = () => { saveSettings(); renderAll(); };
      document.getElementById(id).addEventListener('change', handler);
      document.getElementById(id).addEventListener('input', handler);
    });

    document.getElementById('btnToggleAllClass').onclick = () => {
      showAllClassifications = !showAllClassifications;
      document.getElementById('btnToggleAllClass').textContent = showAllClassifications ? 'Mostrar Pendências' : 'Revisar Todas';
      renderAll();
    };

    txtInput.addEventListener('paste', (e) => {
      if (currentData) { e.preventDefault(); return; }
      const plain = e.clipboardData.getData('text/plain');
      const html = e.clipboardData.getData('text/html');
      if (plain || html) {
        e.preventDefault();
        txtInput.value = plain || html;
        const parsed = parseInput(txtInput.value, html);
        if (parsed) {
          applyParsedData(parsed);
        } else {
          document.getElementById('alertBox').textContent = 'Não foi possível identificar uma tabela nos dados colados.';
          document.getElementById('alertBox').classList.remove('hidden');
        }
      }
    });

    btnProcess.onclick = () => {
      if (currentData) return;
      const parsed = parseInput(txtInput.value);
      if (parsed) {
        applyParsedData(parsed);
      } else {
        document.getElementById('alertBox').textContent = 'Não foi possível identificar uma tabela nos dados colados.';
        document.getElementById('alertBox').classList.remove('hidden');
      }
    };

    btnImportFile.onclick = () => {
      if (!currentData) document.getElementById('fileInput').click();
    };

    document.getElementById('fileInput').onchange = (e) => {
      if (currentData) return;
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = ev => {
        txtInput.value = ev.target.result;
        const parsed = parseInput(ev.target.result);
        if (parsed) applyParsedData(parsed);
        else {
          document.getElementById('alertBox').textContent = 'Não foi possível identificar uma tabela no arquivo importado.';
          document.getElementById('alertBox').classList.remove('hidden');
        }
      };
      r.readAsText(f);
      e.target.value = '';
    };

    btnClear.onclick = () => {
      txtInput.value = '';
      currentData = null;
      visibleColumnsMap = {};
      natureOverrides = {};
      document.getElementById('alertBox').classList.add('hidden');
      document.getElementById('classificationSection').classList.add('hidden');
      document.getElementById('previewSection').classList.add('hidden');
      updateLockUI();
      renderColumnsControl();
    };

    btnViewPdf.onclick = () => { if (currentData) pdfMake.createPdf(createPdfDoc()).open(); };
    btnDownloadPdf.onclick = () => { if (currentData) pdfMake.createPdf(createPdfDoc()).download('relatorio_ocorrencias_ala_' + document.getElementById('cfgWing').value.toLowerCase() + '.pdf'); };
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'index.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
