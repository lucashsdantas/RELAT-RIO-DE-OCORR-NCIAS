import { FIXED_LOGO_URL } from './sampleData';
import { NATURE_CATALOG } from './natureCatalog';

/**
 * Gera e realiza o download da aplicação completa em um único arquivo HTML autônomo (index.html).
 * Inclui o catálogo completo de naturezas, upload/seleção de logos em localStorage, coleta multipágina,
 * filtros completos, paginação direta na página principal, conciliação de naturezas concorrentes e
 * Quadro à Parte de Produtividade no PDF.
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
        <img id="hdrLogoImg" src="${FIXED_LOGO_URL}" referrerpolicy="no-referrer" alt="Brasão" class="w-8 h-8 object-contain">
        <span class="text-base font-bold tracking-tight text-slate-900">Relatórios de Ocorrências — 4º BBM</span>
      </div>
      <span class="text-xs text-slate-500 hidden sm:inline">Configurações e logos salvas automaticamente neste navegador</span>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 py-6 space-y-6">
    <!-- 1. Colar Dados (Página Única ou Multipágina) -->
    <section class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 class="text-base font-bold text-slate-900">1. Coleta de Dados das Ocorrências</h2>
          <p id="entryHint" class="text-xs text-slate-500">Copie a tabela na página do sistema (Ctrl+C) e cole diretamente no campo abaixo (Ctrl+V).</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div id="entryModeWrap" class="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg">
            <button id="btnModeSingle" type="button" class="px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-slate-900 shadow-sm cursor-pointer">Página Única</button>
            <button id="btnModeMulti" type="button" class="px-3 py-1.5 text-xs font-semibold rounded-md text-slate-600 hover:text-slate-900 cursor-pointer">Relatório Multipágina</button>
          </div>
          <input type="file" id="fileInput" accept=".html,.htm,.txt,.csv,.tsv" class="hidden">
          <button id="btnImportFile" type="button" class="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer">Importar Arquivo</button>
          <button id="btnClear" type="button" class="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 rounded-lg shadow-xs cursor-pointer transition-colors">Limpar Dados</button>
        </div>
      </div>

      <div id="lockBanner" class="hidden p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900">
        <strong>Dados carregados e bloqueados contra edição.</strong> Caso precise alterar algum registro ou colar outro lote, clique em <strong>Limpar Dados</strong>.
      </div>

      <!-- Modo Página Única -->
      <div id="singleEntryWrap" class="space-y-3">
        <textarea id="txtInput" rows="6" placeholder="Cole aqui os dados copiados (tabela da web, Excel, CSV ou código HTML)..." class="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"></textarea>
        <div class="flex flex-wrap justify-between items-center gap-2">
          <button id="btnSwitchToMulti" type="button" class="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer">+ Adicionar Mais Dados (Multipágina)</button>
          <button id="btnProcess" type="button" class="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer">Processar Dados Colados</button>
        </div>
      </div>

      <!-- Modo Multipágina -->
      <div id="multiEntryWrap" class="hidden space-y-3">
        <div id="pagesList" class="space-y-3"></div>
        <div id="multiActionsWrap" class="flex flex-wrap justify-between items-center gap-2">
          <button id="btnAddPage" type="button" class="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer">+ Adicionar Mais Dados</button>
          <button id="btnProcessMulti" type="button" class="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer">Processar Tudo em Um Relatório</button>
        </div>
      </div>

      <div id="alertBox" class="hidden p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700"></div>
    </section>

    <!-- 2. Parâmetros do Relatório & Logotipo -->
    <section id="configSection" class="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div class="flex items-center gap-3">
          <img id="cfgLogoPreview" src="${FIXED_LOGO_URL}" referrerpolicy="no-referrer" alt="Brasão" class="w-12 h-12 object-contain border border-slate-200 rounded p-0.5 bg-white">
          <div>
            <h3 class="text-sm font-bold text-slate-900">2. Parâmetros, Logotipo e Personalização</h3>
            <p class="text-[11px] text-slate-500">Ala de Serviço, intervalo de data/hora, logotipo e colunas do PDF (salvos automaticamente)</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span id="pdfHint" class="text-[11px] text-amber-700 font-medium">Cole os dados acima para gerar o PDF</span>
          <button id="btnViewPdf" type="button" disabled class="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer">Abrir PDF</button>
          <button id="btnDownloadPdf" type="button" disabled class="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer">Baixar PDF</button>
        </div>
      </div>

      <!-- Logotipo: Seleção e Upload -->
      <div class="bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span class="text-xs font-bold text-slate-800">Logotipo do Relatório</span>
            <p class="text-[10px] text-slate-500">As logos enviadas ficam salvas localmente neste navegador. O GitHub Pages estático não grava arquivos no repositório automaticamente.</p>
          </div>
          <div>
            <input type="file" id="logoUploadInput" accept="image/png,image/jpeg,image/webp,image/svg+xml" class="hidden">
            <button id="btnUploadLogo" type="button" class="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer">+ Nova Logo</button>
          </div>
        </div>
        <div id="logoGallery" class="flex flex-wrap gap-2"></div>
        <p id="logoErrorBox" class="hidden text-[11px] text-rose-700 font-medium"></p>
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
          <h3 class="text-sm font-bold text-slate-900">3. Definição da Natureza Predominante, Concorrência &amp; Produtividade</h3>
          <p id="classificationHint" class="text-xs text-slate-600"></p>
        </div>
        <button id="btnToggleAllClass" type="button" class="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer">
          Revisar Todas
        </button>
      </div>
      <div id="classificationList" class="divide-y divide-slate-200 border border-slate-200 rounded-lg"></div>
    </section>

    <!-- 4. Filtros Completos + Pré-visualização Paginada -->
    <section id="previewSection" class="hidden bg-slate-200/70 border border-slate-300 rounded-xl p-5 space-y-4">
      <!-- Painel de Filtros -->
      <div class="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 class="text-sm font-bold text-slate-900">4. Filtros e Pré-visualização do Documento</h3>
            <p class="text-[11px] text-slate-500">Filtre por ocorrência, natureza, município, status ou intervalo de datas/horários.</p>
          </div>
          <div class="flex items-center gap-2">
            <span id="rowCountLabel" class="text-xs font-mono text-slate-600"></span>
            <button id="btnClearFilters" type="button" class="px-3 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer">Limpar Filtros</button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <div>
            <label class="text-[11px] font-bold text-slate-700 block mb-1">Ocorrência (Número)</label>
            <input type="text" id="fltOcc" placeholder="Ex: 2026-08912" class="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg">
          </div>
          <div>
            <label class="text-[11px] font-bold text-slate-700 block mb-1">Natureza</label>
            <input type="text" id="fltNat" list="fltNatList" placeholder="Código ou descrição..." class="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg">
            <datalist id="fltNatList"></datalist>
          </div>
          <div>
            <label class="text-[11px] font-bold text-slate-700 block mb-1">Município</label>
            <select id="fltMun" class="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg">
              <option value="all">Todos os Municípios</option>
            </select>
          </div>
          <div>
            <label class="text-[11px] font-bold text-slate-700 block mb-1">Status</label>
            <select id="fltStatus" class="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg">
              <option value="all">Todos os Status</option>
            </select>
          </div>
          <div>
            <label class="text-[11px] font-bold text-slate-700 block mb-1">Campo de Data/Hora</label>
            <select id="fltDateField" class="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg">
              <option value="any">Data Fato ou Registro</option>
              <option value="fact">Somente Data Fato</option>
              <option value="register">Somente Data Registro</option>
            </select>
          </div>
          <div>
            <label class="text-[11px] font-bold text-slate-700 block mb-1">Data e Hora Inicial</label>
            <input type="datetime-local" id="fltStartDt" class="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg">
          </div>
          <div>
            <label class="text-[11px] font-bold text-slate-700 block mb-1">Data e Hora Final</label>
            <input type="datetime-local" id="fltEndDt" class="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg">
          </div>
          <div>
            <label class="text-[11px] font-bold text-slate-700 block mb-1">Busca Livre</label>
            <input type="text" id="fltGlobal" placeholder="Bairro, rua, viatura..." class="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg">
          </div>
        </div>
      </div>

      <!-- Barra de Paginação na Página Principal -->
      <div class="bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="flex items-center gap-2 text-slate-600 font-mono">
          <span id="pageRangeLabel">Mostrando 0 de 0</span>
          <select id="rowsPerPageSelect" class="px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded">
            <option value="15">15 / página</option>
            <option value="20" selected>20 / página</option>
            <option value="30">30 / página</option>
            <option value="50">50 / página</option>
          </select>
        </div>
        <div class="flex items-center gap-1.5">
          <button id="btnFirstPage" type="button" class="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer">Primeira</button>
          <button id="btnPrevPage" type="button" class="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer">Anterior</button>
          <span id="pageNumLabel" class="font-mono font-semibold px-2">Página 1 de 1</span>
          <button id="btnNextPage" type="button" class="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer">Próxima</button>
          <button id="btnLastPage" type="button" class="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer">Última</button>
        </div>
      </div>

      <!-- Folha do Documento -->
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
    const DEFAULT_LOGO_ID = 'default-4bbm';
    const STD_COLS = ['NÚMERO','DATA REGISTRO','STATUS','DATA FATO','UNIDADES ATUAL','NATUREZAS','MUNICÍPIO','BAIRRO','LOGRADOURO'];
    const NATURE_CATALOG = ${serializedCatalog};
    const STORAGE_CFG_KEY = 'relatorio_ocorrencias_portable_cfg_v1';
    const STORAGE_HIDDEN_COLS_KEY = 'relatorio_ocorrencias_portable_hidden_cols_v1';
    const STORAGE_LOGOS_KEY = 'relatorio_ocorrencias_portable_logos_v1';

    let defaultLogoBase64 = null;
    let customLogos = [];
    let selectedLogoId = DEFAULT_LOGO_ID;
    let entryMode = 'single';
    let pageDrafts = [
      { id: 'p1', rawText: '', clipboardHtml: '' },
      { id: 'p2', rawText: '', clipboardHtml: '' }
    ];
    let currentData = null;
    let visibleColumnsMap = {};
    let hiddenLabels = [];
    let natureOverrides = {};
    let showAllClassifications = false;
    let currentPage = 1;
    let rowsPerPage = 20;

    const txtInput = document.getElementById('txtInput');
    const btnProcess = document.getElementById('btnProcess');
    const btnProcessMulti = document.getElementById('btnProcessMulti');
    const btnAddPage = document.getElementById('btnAddPage');
    const btnImportFile = document.getElementById('btnImportFile');
    const btnClear = document.getElementById('btnClear');
    const lockBanner = document.getElementById('lockBanner');
    const btnViewPdf = document.getElementById('btnViewPdf');
    const btnDownloadPdf = document.getElementById('btnDownloadPdf');
    const pdfHint = document.getElementById('pdfHint');

    function getActiveLogoDataUrl() {
      if (selectedLogoId === DEFAULT_LOGO_ID) return defaultLogoBase64;
      const found = customLogos.find(l => l.id === selectedLogoId);
      return found ? found.dataUrl : defaultLogoBase64;
    }

    function getActiveLogoImgSrc() {
      if (selectedLogoId === DEFAULT_LOGO_ID) return defaultLogoBase64 || FIXED_LOGO_URL;
      const found = customLogos.find(l => l.id === selectedLogoId);
      return found ? found.dataUrl : (defaultLogoBase64 || FIXED_LOGO_URL);
    }

    function updateLogoPreviews() {
      const src = getActiveLogoImgSrc();
      document.getElementById('hdrLogoImg').src = src;
      document.getElementById('cfgLogoPreview').src = src;
    }

    function renderLogoGallery() {
      const wrap = document.getElementById('logoGallery');
      wrap.innerHTML = '';
      const list = [
        { id: DEFAULT_LOGO_ID, name: 'Brasão Oficial 4º BBM (Padrão)', dataUrl: defaultLogoBase64 || FIXED_LOGO_URL, isBuiltIn: true },
        ...customLogos
      ];
      list.forEach(item => {
        const isSel = selectedLogoId === item.id;
        const card = document.createElement('div');
        card.className = 'inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs ' + (isSel ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-300');
        const selBtn = document.createElement('button');
        selBtn.type = 'button';
        selBtn.className = 'inline-flex items-center gap-1.5 cursor-pointer';
        selBtn.innerHTML = '<img src="' + item.dataUrl + '" referrerpolicy="no-referrer" class="w-5 h-5 object-contain bg-white rounded p-0.5"><span>' + item.name + '</span>';
        selBtn.onclick = () => {
          selectedLogoId = item.id;
          saveSettings();
          updateLogoPreviews();
          renderLogoGallery();
          if (currentData) renderAll();
        };
        card.appendChild(selBtn);
        if (!item.isBuiltIn) {
          const delBtn = document.createElement('button');
          delBtn.type = 'button';
          delBtn.className = 'ml-1 text-[11px] font-bold hover:text-rose-400 cursor-pointer';
          delBtn.textContent = '✕';
          delBtn.title = 'Remover logo';
          delBtn.onclick = () => {
            customLogos = customLogos.filter(l => l.id !== item.id);
            try { localStorage.setItem(STORAGE_LOGOS_KEY, JSON.stringify(customLogos)); } catch (e) {}
            if (selectedLogoId === item.id) selectedLogoId = DEFAULT_LOGO_ID;
            saveSettings();
            updateLogoPreviews();
            renderLogoGallery();
            if (currentData) renderAll();
          };
          card.appendChild(delBtn);
        }
        wrap.appendChild(card);
      });
    }

    function initAndLoadSettings() {
      const now = new Date();
      const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const pad = n => String(n).padStart(2, '0');
      const fmt = (d, hr) => d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + 'T' + hr;

      document.getElementById('cfgStart').value = fmt(yest, '07:00');
      document.getElementById('cfgEnd').value = fmt(now, '07:00');

      try {
        const rawLogos = localStorage.getItem(STORAGE_LOGOS_KEY);
        if (rawLogos) {
          const parsedLogos = JSON.parse(rawLogos);
          if (Array.isArray(parsedLogos)) customLogos = parsedLogos;
        }
        const rawCfg = localStorage.getItem(STORAGE_CFG_KEY);
        if (rawCfg) {
          const parsed = JSON.parse(rawCfg);
          if (parsed.wing) document.getElementById('cfgWing').value = parsed.wing;
          if (parsed.start) document.getElementById('cfgStart').value = parsed.start;
          if (parsed.end) document.getElementById('cfgEnd').value = parsed.end;
          if (parsed.title !== undefined) document.getElementById('cfgTitle').value = parsed.title;
          if (parsed.subtitle !== undefined) document.getElementById('cfgSubtitle').value = parsed.subtitle;
          if (parsed.orientation) document.getElementById('cfgOrientation').value = parsed.orientation;
          if (parsed.selectedLogoId) selectedLogoId = parsed.selectedLogoId;
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
          orientation: document.getElementById('cfgOrientation').value,
          selectedLogoId: selectedLogoId
        };
        localStorage.setItem(STORAGE_CFG_KEY, JSON.stringify(payload));
      } catch (e) {}
    }

    function saveHiddenLabels() {
      try {
        localStorage.setItem(STORAGE_HIDDEN_COLS_KEY, JSON.stringify(hiddenLabels));
      } catch (e) {}
    }

    function renderPagesEditor() {
      const listDiv = document.getElementById('pagesList');
      listDiv.innerHTML = '';
      const locked = Boolean(currentData);
      pageDrafts.forEach((p, idx) => {
        const box = document.createElement('div');
        box.className = 'border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2';

        const top = document.createElement('div');
        top.className = 'flex items-center justify-between';
        const lbl = document.createElement('span');
        lbl.className = 'text-xs font-bold text-slate-800';
        lbl.textContent = 'Página ' + (idx + 1);
        top.appendChild(lbl);

        if (!locked && pageDrafts.length > 1) {
          const rm = document.createElement('button');
          rm.type = 'button';
          rm.className = 'text-[11px] text-slate-500 hover:text-rose-700 cursor-pointer';
          rm.textContent = 'Remover';
          rm.onclick = () => {
            pageDrafts = pageDrafts.filter(x => x.id !== p.id);
            renderPagesEditor();
          };
          top.appendChild(rm);
        }
        box.appendChild(top);

        const ta = document.createElement('textarea');
        ta.rows = locked ? 3 : 4;
        ta.readOnly = locked;
        ta.value = p.rawText;
        ta.placeholder = 'Cole aqui com Ctrl+V os registros da Página ' + (idx + 1) + '...';
        ta.className = 'w-full text-xs font-mono p-2.5 border border-slate-300 rounded-lg ' + (locked ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white');
        ta.addEventListener('paste', (e) => {
          if (currentData) { e.preventDefault(); return; }
          const plain = e.clipboardData.getData('text/plain');
          const html = e.clipboardData.getData('text/html');
          if (plain || html) {
            e.preventDefault();
            p.rawText = plain || html;
            p.clipboardHtml = html || '';
            ta.value = p.rawText;
          }
        });
        ta.addEventListener('input', () => {
          if (!currentData) { p.rawText = ta.value; p.clipboardHtml = ''; }
        });
        box.appendChild(ta);
        listDiv.appendChild(box);
      });
      btnAddPage.textContent = '+ Adicionar Mais Dados (Página ' + (pageDrafts.length + 1) + ')';
    }

    function setEntryMode(mode) {
      entryMode = mode;
      const bSingle = document.getElementById('btnModeSingle');
      const bMulti = document.getElementById('btnModeMulti');
      const wSingle = document.getElementById('singleEntryWrap');
      const wMulti = document.getElementById('multiEntryWrap');
      if (mode === 'single') {
        bSingle.className = 'px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-slate-900 shadow-sm cursor-pointer';
        bMulti.className = 'px-3 py-1.5 text-xs font-semibold rounded-md text-slate-600 hover:text-slate-900 cursor-pointer';
        wSingle.classList.remove('hidden');
        wMulti.classList.add('hidden');
        document.getElementById('entryHint').textContent = 'Copie a tabela na página do sistema (Ctrl+C) e cole diretamente no campo abaixo (Ctrl+V).';
      } else {
        bMulti.className = 'px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-slate-900 shadow-sm cursor-pointer';
        bSingle.className = 'px-3 py-1.5 text-xs font-semibold rounded-md text-slate-600 hover:text-slate-900 cursor-pointer';
        wSingle.classList.add('hidden');
        wMulti.classList.remove('hidden');
        document.getElementById('entryHint').textContent = 'Cole os dados de cada página nos campos abaixo e processe tudo em um único relatório consolidado.';
        renderPagesEditor();
      }
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
        btn.type = 'button';
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
      document.getElementById('entryModeWrap').classList.toggle('hidden', hasData);
      if (hasData) {
        txtInput.className = 'w-full text-xs font-mono p-3 bg-slate-100 text-slate-500 border border-slate-300 rounded-xl cursor-not-allowed select-none';
        lockBanner.classList.remove('hidden');
        btnProcess.classList.add('hidden');
        document.getElementById('btnSwitchToMulti').classList.add('hidden');
        document.getElementById('multiActionsWrap').classList.add('hidden');
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
        document.getElementById('btnSwitchToMulti').classList.remove('hidden');
        document.getElementById('multiActionsWrap').classList.remove('hidden');
        btnImportFile.disabled = false;
        btnImportFile.classList.remove('opacity-50', 'cursor-not-allowed');
        btnClear.className = 'px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-300 hover:bg-rose-100 rounded-lg shadow-xs cursor-pointer transition-colors';
        btnViewPdf.disabled = true;
        btnDownloadPdf.disabled = true;
        pdfHint.classList.remove('hidden');
      }
      if (entryMode === 'multi') renderPagesEditor();
    }

    initAndLoadSettings();
    updateLogoPreviews();
    renderLogoGallery();
    renderColumnsControl();
    updateLockUI();

    fetch(FIXED_LOGO_URL, { mode: 'cors' })
      .then(r => r.blob())
      .then(blob => {
        const u = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const max = 240;
          const sc = Math.min(max / img.naturalWidth, max / img.naturalHeight, 1);
          const c = document.createElement('canvas');
          c.width = Math.round(img.naturalWidth * sc);
          c.height = Math.round(img.naturalHeight * sc);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          defaultLogoBase64 = c.toDataURL('image/png');
          URL.revokeObjectURL(u);
          updateLogoPreviews();
          renderLogoGallery();
        };
        img.src = u;
      }).catch(() => {});

    document.getElementById('btnUploadLogo').onclick = () => document.getElementById('logoUploadInput').click();
    document.getElementById('logoUploadInput').onchange = (e) => {
      const file = e.target.files[0];
      e.target.value = '';
      if (!file) return;
      const errBox = document.getElementById('logoErrorBox');
      errBox.classList.add('hidden');
      if (!file.type.startsWith('image/')) {
        errBox.textContent = 'Selecione uma imagem válida (PNG, JPG, WEBP ou SVG).';
        errBox.classList.remove('hidden');
        return;
      }
      const u = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const max = 240;
        const sc = Math.min(max / (img.naturalWidth || 160), max / (img.naturalHeight || 160), 1);
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round((img.naturalWidth || 160) * sc));
        c.height = Math.max(1, Math.round((img.naturalHeight || 160) * sc));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const dataUrl = c.toDataURL('image/png');
        URL.revokeObjectURL(u);
        const item = { id: 'custom-' + Date.now(), name: file.name.replace(/\\.[^.]+$/, '') || 'Logo', dataUrl, isBuiltIn: false };
        customLogos.push(item);
        try { localStorage.setItem(STORAGE_LOGOS_KEY, JSON.stringify(customLogos)); } catch (err) {}
        selectedLogoId = item.id;
        saveSettings();
        updateLogoPreviews();
        renderLogoGallery();
        if (currentData) renderAll();
      };
      img.onerror = () => {
        URL.revokeObjectURL(u);
        errBox.textContent = 'Não foi possível ler o arquivo de imagem.';
        errBox.classList.remove('hidden');
      };
      img.src = u;
    };

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

      (text.match(/\\b\\d{5,6}\\b/g) || []).forEach(code => {
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

    function parseDateMs(raw) {
      const t = (raw || '').trim();
      if (!t) return null;
      const br = t.match(/^(\\d{2})\\/(\\d{2})\\/(\\d{4})(?:\\s*(?:às|-|T)?\\s*(\\d{2}):(\\d{2})(?::(\\d{2}))?)?/i);
      if (br) {
        const dt = new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]), Number(br[4] || 0), Number(br[5] || 0), Number(br[6] || 0));
        return isNaN(dt.getTime()) ? null : dt.getTime();
      }
      const iso = t.match(/^(\\d{4})-(\\d{2})-(\\d{2})(?:[T\\s]+(\\d{2}):(\\d{2})(?::(\\d{2}))?)?/);
      if (iso) {
        const dt = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), Number(iso[4] || 0), Number(iso[5] || 0), Number(iso[6] || 0));
        return isNaN(dt.getTime()) ? null : dt.getTime();
      }
      return null;
    }

    function findCol(headers, keywords) {
      const f = headers.find(h => keywords.some(k => h.label.toUpperCase().includes(k)));
      return f ? f.key : null;
    }

    function getFilteredRows() {
      if (!currentData) return [];
      const h = currentData.headers;
      const numK = findCol(h, ['NÚMERO', 'NUMERO', 'NUM']);
      const natK = findCol(h, ['NATUREZA']);
      const munK = findCol(h, ['MUNICÍPIO', 'MUNICIPIO', 'CIDADE']);
      const stK = findCol(h, ['STATUS', 'SITUACAO']);
      const factK = findCol(h, ['DATA FATO', 'FATO']);
      const regK = findCol(h, ['DATA REGISTRO', 'REGISTRO']);

      const fOcc = document.getElementById('fltOcc').value.trim().toLowerCase();
      const fNat = document.getElementById('fltNat').value.trim().toLowerCase();
      const fMun = document.getElementById('fltMun').value;
      const fSt = document.getElementById('fltStatus').value;
      const fDateField = document.getElementById('fltDateField').value;
      const fStartMs = parseDateMs(document.getElementById('fltStartDt').value);
      const fEndMs = parseDateMs(document.getElementById('fltEndDt').value);
      const fGlobal = document.getElementById('fltGlobal').value.trim().toLowerCase();
      const hasDt = fStartMs !== null || fEndMs !== null;

      return currentData.rows.filter(r => {
        if (fSt !== 'all' && stK && (r[stK] || '').trim() !== fSt) return false;
        if (fMun !== 'all' && munK && (r[munK] || '').trim() !== fMun) return false;
        if (fOcc) {
          const v = (numK ? (r[numK] || '') : Object.values(r).join(' ')).toLowerCase();
          if (!v.includes(fOcc)) return false;
        }
        if (fNat) {
          const v = (natK ? (r[natK] || '') : Object.values(r).join(' ')).toLowerCase();
          if (!v.includes(fNat)) return false;
        }
        if (hasDt) {
          const cols = [];
          if (fDateField === 'fact' && factK) cols.push(factK);
          else if (fDateField === 'register' && regK) cols.push(regK);
          else { if (factK) cols.push(factK); if (regK) cols.push(regK); }
          const tss = cols.map(k => parseDateMs(r[k] || '')).filter(x => x !== null);
          if (!tss.length) return false;
          if (!tss.some(ts => (fStartMs === null || ts >= fStartMs) && (fEndMs === null || ts <= fEndMs))) return false;
        }
        if (fGlobal) {
          if (!Object.values(r).some(v => (v || '').toLowerCase().includes(fGlobal))) return false;
        }
        return true;
      });
    }

    function populateFilterOptions() {
      if (!currentData) return;
      const h = currentData.headers;
      const stK = findCol(h, ['STATUS', 'SITUACAO']);
      const munK = findCol(h, ['MUNICÍPIO', 'MUNICIPIO', 'CIDADE']);
      const natK = findCol(h, ['NATUREZA']);

      const stSel = document.getElementById('fltStatus');
      const prevSt = stSel.value;
      stSel.innerHTML = '<option value="all">Todos os Status</option>';
      if (stK) {
        Array.from(new Set(currentData.rows.map(r => (r[stK] || '').trim()).filter(Boolean))).sort().forEach(v => {
          const o = document.createElement('option'); o.value = v; o.textContent = v; stSel.appendChild(o);
        });
      }
      stSel.value = prevSt || 'all';

      const munSel = document.getElementById('fltMun');
      const prevMun = munSel.value;
      munSel.innerHTML = '<option value="all">Todos os Municípios</option>';
      if (munK) {
        Array.from(new Set(currentData.rows.map(r => (r[munK] || '').trim()).filter(Boolean))).sort().forEach(v => {
          const o = document.createElement('option'); o.value = v; o.textContent = v; munSel.appendChild(o);
        });
      }
      munSel.value = prevMun || 'all';

      const natDl = document.getElementById('fltNatList');
      natDl.innerHTML = '';
      if (natK) {
        const s = new Set();
        currentData.rows.forEach(r => (r[natK] || '').split(/[;|\\n]+/).forEach(p => { if (p.trim()) s.add(p.trim()); }));
        Array.from(s).sort().forEach(v => {
          const o = document.createElement('option'); o.value = v; natDl.appendChild(o);
        });
      }
    }

    function computeClassificationAndSummary(rowsToProcess) {
      const natureHeader = currentData.headers.find(h => h.label.toUpperCase().includes('NATUREZA'));
      const numHeader = currentData.headers.find(h => h.label.toUpperCase().includes('NÚMERO') || h.label.toUpperCase().includes('NUMERO'));
      const items = rowsToProcess.map((row, i) => {
        const origIdx = currentData.rows.indexOf(row);
        const idx = origIdx >= 0 ? origIdx : i;
        const raw = natureHeader ? (row[natureHeader.key] || '') : '';
        const occNum = numHeader ? (row[numHeader.key] || ('#' + (idx+1))) : ('#' + (idx+1));
        const candidates = detectCandidates(raw);
        const operational = candidates.filter(c => c.group.trim().toUpperCase() !== 'PRODUTIVIDADE');
        const prodList = candidates.filter(c => c.group.trim().toUpperCase() === 'PRODUTIVIDADE');
        const primaryPool = operational.length ? operational : prodList;

        const ovId = natureOverrides[idx];
        const ovEntry = ovId ? NATURE_CATALOG.find(e => e.id === ovId) : null;
        const selected = ovEntry || (primaryPool.length ? primaryPool[0] : null);
        return {
          idx, occNum, raw, candidates, operational, prodList, selected,
          isExclusiveProd: prodList.length > 0 && operational.length === 0,
          hasMultiple: primaryPool.length > 1,
          isUnclassified: !selected,
          isManual: Boolean(ovEntry)
        };
      });

      const grpMap = new Map();
      const natMap = new Map();
      const prodMap = new Map();
      let multiPending = 0, unclass = 0, totalConcurrent = 0;
      let prodTotal = 0, prodExcl = 0, prodMixed = 0;

      const ensureGrp = g => { if (!grpMap.has(g)) grpMap.set(g, { count: 0, concurrentCount: 0 }); return grpMap.get(g); };
      const ensureNat = e => {
        if (!natMap.has(e.id)) natMap.set(e.id, { ...e, count: 0, concurrentCount: 0 });
        return natMap.get(e.id);
      };

      items.forEach(it => {
        if (it.hasMultiple && !it.isManual) multiPending++;

        // Quadro à Parte Produtividade
        if (it.prodList.length > 0) {
          const isMix = it.operational.length > 0;
          it.prodList.forEach(pe => {
            prodTotal++;
            if (isMix) prodMixed++; else prodExcl++;
            const exP = prodMap.get(pe.id);
            if (exP) {
              exP.totalCount++;
              if (isMix) exP.mixedCount++; else exP.exclusiveCount++;
            } else {
              prodMap.set(pe.id, { ...pe, exclusiveCount: isMix ? 0 : 1, mixedCount: isMix ? 1 : 0, totalCount: 1 });
            }
          });
        }

        // Predominante (1 por atendimento)
        if (it.selected) {
          ensureGrp(it.selected.group).count++;
          ensureNat(it.selected).count++;
        } else {
          unclass++;
          const g = 'NÃO CLASSIFICADO';
          ensureGrp(g).count++;
          ensureNat({ id: 'UNCLASS__' + normText(it.raw), code: '—', group: g, subGroup: 'A DEFINIR', nature: it.raw || 'Sem natureza' }).count++;
        }

        // Concorrentes
        const concList = it.operational.length ? it.operational : (it.prodList.length ? it.prodList : (it.selected ? [it.selected] : []));
        if (concList.length) {
          concList.forEach(ce => {
            totalConcurrent++;
            ensureGrp(ce.group).concurrentCount++;
            ensureNat(ce).concurrentCount++;
          });
        } else {
          const g = 'NÃO CLASSIFICADO';
          totalConcurrent++;
          ensureGrp(g).concurrentCount++;
          ensureNat({ id: 'UNCLASS__' + normText(it.raw), code: '—', group: g, subGroup: 'A DEFINIR', nature: it.raw || 'Sem natureza' }).concurrentCount++;
        }
      });

      const total = items.length;
      const byGroup = Array.from(grpMap.entries()).map(([group, c]) => ({
        group,
        count: c.count,
        concurrentCount: c.concurrentCount,
        pct: totalConcurrent ? (c.concurrentCount / totalConcurrent * 100) : 0
      })).sort((a, b) => b.count - a.count || b.concurrentCount - a.concurrentCount || a.group.localeCompare(b.group, 'pt-BR'));

      const grpOrd = new Map(byGroup.map((g, i) => [g.group, i]));
      const byNature = Array.from(natMap.values()).map(n => ({
        ...n,
        pct: totalConcurrent ? (n.concurrentCount / totalConcurrent * 100) : 0
      })).sort((a, b) => (grpOrd.get(a.group) - grpOrd.get(b.group)) || (b.count - a.count) || (b.concurrentCount - a.concurrentCount) || a.code.localeCompare(b.code));

      const subMap = new Map();
      byNature.forEach(entry => {
        const key = entry.group + '||' + entry.subGroup;
        const existing = subMap.get(key);
        if (existing) {
          existing.entries.push(entry);
          existing.subtotalCount += entry.count;
          existing.subtotalConc += entry.concurrentCount;
        } else {
          subMap.set(key, { group: entry.group, subGroup: entry.subGroup, entries: [entry], subtotalCount: entry.count, subtotalConc: entry.concurrentCount, subtotalPct: 0 });
        }
      });

      const bySubGroup = Array.from(subMap.values()).map(blk => ({
        ...blk,
        subtotalPct: totalConcurrent ? (blk.subtotalConc / totalConcurrent * 100) : 0
      })).sort((a, b) => {
        const ga = grpOrd.get(a.group) ?? 999;
        const gb = grpOrd.get(b.group) ?? 999;
        if (ga !== gb) return ga - gb;
        if (b.subtotalCount !== a.subtotalCount) return b.subtotalCount - a.subtotalCount;
        return a.subGroup.localeCompare(b.subGroup, 'pt-BR');
      });

      const byProd = Array.from(prodMap.values()).map(p => ({
        ...p,
        pct: prodTotal ? (p.totalCount / prodTotal * 100) : 0
      })).sort((a, b) => b.totalCount - a.totalCount || a.code.localeCompare(b.code));

      return { items, summary: { total, totalConcurrent, byGroup, byNature, bySubGroup, byProd, prodTotal, prodExcl, prodMixed, multiPending, unclass } };
    }

    function fmtBrDate(iso) {
      if (!iso) return 'Não informado';
      const [dp, tp] = iso.split('T');
      const [y, m, d] = dp.split('-');
      return d + '/' + m + '/' + y + ' ' + (tp || '00:00').slice(0, 5);
    }

    function splitDateAndTime(rawVal) {
      const t = (rawVal || '').trim();
      if (!t || t === '—') return null;
      const m = t.match(/^(\\d{2,4}[\\/-]\\d{2}[\\/-]\\d{2,4})(?:\\s*(?:às|-|T)?\\s*(\\d{2}:\\d{2}(?::\\d{2})?))?/i);
      if (m && m[1] && m[2]) {
        let dStr = m[1];
        if (/^\\d{4}-\\d{2}-\\d{2}$/.test(dStr)) {
          const pts = dStr.split('-');
          dStr = pts[2] + '/' + pts[1] + '/' + pts[0];
        }
        return { date: dStr, time: m[2] };
      }
      return null;
    }

    function isDateColLabel(lbl) {
      const u = (lbl || '').toUpperCase();
      return u.includes('DATA REGISTRO') || u.includes('DATA FATO') || u.includes('DATA');
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

    function mergeParsedPages(datasets) {
      const baseHeaders = datasets[0].headers.map(h => ({ ...h }));
      const mergedRows = [];
      datasets.forEach(ds => {
        const map = new Map();
        baseHeaders.forEach(bh => map.set(bh.label.toUpperCase(), bh.key));
        ds.headers.forEach(dh => {
          const u = dh.label.toUpperCase();
          if (!map.has(u)) {
            const nk = 'col_' + baseHeaders.length;
            baseHeaders.push({ key: nk, label: dh.label });
            map.set(u, nk);
          }
        });
        ds.rows.forEach(r => {
          const row = {};
          baseHeaders.forEach(bh => { row[bh.key] = ''; });
          ds.headers.forEach(dh => {
            const tk = map.get(dh.label.toUpperCase());
            if (tk) row[tk] = r[dh.key] || '';
          });
          mergedRows.push(row);
        });
      });
      return { headers: baseHeaders, rows: mergedRows };
    }

    function applyParsedData(parsed) {
      currentData = parsed;
      currentPage = 1;
      visibleColumnsMap = {};
      parsed.headers.forEach(h => {
        visibleColumnsMap[h.key] = !hiddenLabels.includes(h.label.toUpperCase());
      });
      natureOverrides = {};
      document.getElementById('alertBox').classList.add('hidden');
      populateFilterOptions();
      updateLockUI();
      renderAll();
    }

    function renderAll() {
      renderColumnsControl();
      if (!currentData) return;

      document.getElementById('classificationSection').classList.remove('hidden');
      document.getElementById('previewSection').classList.remove('hidden');

      const filtered = getFilteredRows();
      const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
      if (currentPage > totalPages) currentPage = totalPages;
      const startIdx = (currentPage - 1) * rowsPerPage;
      const pageRows = filtered.slice(startIdx, startIdx + rowsPerPage);

      document.getElementById('pageRangeLabel').textContent = filtered.length
        ? ('Mostrando ' + (startIdx + 1) + '–' + Math.min(startIdx + rowsPerPage, filtered.length) + ' de ' + filtered.length)
        : '0 registros encontrados';
      document.getElementById('pageNumLabel').textContent = 'Página ' + currentPage + ' de ' + totalPages;
      document.getElementById('btnFirstPage').disabled = currentPage <= 1;
      document.getElementById('btnPrevPage').disabled = currentPage <= 1;
      document.getElementById('btnNextPage').disabled = currentPage >= totalPages;
      document.getElementById('btnLastPage').disabled = currentPage >= totalPages;

      const { items, summary } = computeClassificationAndSummary(filtered);

      const attention = items.filter(it => it.hasMultiple || it.isUnclassified || it.isManual);
      const listItems = showAllClassifications ? items : attention;
      document.getElementById('classificationHint').textContent = (summary.multiPending + summary.unclass > 0)
        ? (summary.multiPending + summary.unclass) + ' ocorrência(s) precisam de confirmação da natureza predominante. (' + summary.total + ' atendimentos · ' + summary.totalConcurrent + ' naturezas · ' + summary.prodTotal + ' produtividade)'
        : summary.total + ' atendimentos · ' + summary.totalConcurrent + ' naturezas · ' + summary.prodTotal + ' registros de Produtividade.';

      const classListDiv = document.getElementById('classificationList');
      classListDiv.innerHTML = '';
      if (listItems.length === 0) {
        classListDiv.innerHTML = '<div class="p-3 text-xs text-slate-600 bg-slate-50">Nenhuma pendência detectada. Clique em "Revisar Todas" caso queira ajustar manualmente alguma ocorrência.</div>';
      } else {
        listItems.forEach(it => {
          const wrap = document.createElement('div');
          wrap.className = 'p-3 space-y-2 ' + (it.isUnclassified ? 'bg-rose-50/40' : (it.hasMultiple && !it.isManual ? 'bg-amber-50/40' : 'bg-white'));
          wrap.innerHTML = '<div class="text-xs"><strong class="font-mono">' + it.occNum + '</strong> — <span class="font-mono text-slate-600">' + it.raw + '</span>' + (it.prodList.length ? ' <span class="text-sky-700 font-semibold">[Produtividade' + (it.isExclusiveProd ? ' exclusiva' : ' + operacional') + ']</span>' : '') + '</div>';

          if (it.candidates.length > 0) {
            const cRow = document.createElement('div');
            cRow.className = 'flex flex-wrap gap-1.5';
            it.candidates.forEach(c => {
              const b = document.createElement('button');
              b.type = 'button';
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

      const wing = document.getElementById('cfgWing').value;
      const start = fmtBrDate(document.getElementById('cfgStart').value);
      const end = fmtBrDate(document.getElementById('cfgEnd').value);
      const title = document.getElementById('cfgTitle').value;
      const subtitle = document.getElementById('cfgSubtitle').value;
      const logoSrc = getActiveLogoImgSrc();

      document.getElementById('docHeaderPreview').innerHTML =
        '<div class="flex items-start gap-3">' +
          '<img src="' + logoSrc + '" referrerpolicy="no-referrer" class="w-12 h-12 object-contain">' +
          '<div>' +
            '<h4 class="text-sm font-extrabold text-slate-900">' + title + '</h4>' +
            '<p class="text-xs text-slate-600">' + subtitle + '</p>' +
            '<p class="text-[11px] font-semibold text-slate-800 mt-1">Ala de Serviço: Ala ' + wing + ' | Período: ' + start + ' a ' + end + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="text-right text-[11px]">' +
          '<div class="font-bold text-slate-900">ALA ' + wing + '</div>' +
          '<div class="text-slate-500">Gerado em: ' + new Date().toLocaleString('pt-BR') + '</div>' +
          '<div class="font-bold text-sky-700">Total: ' + summary.total + ' atendimentos · ' + summary.totalConcurrent + ' naturezas</div>' +
        '</div>';

      const active = currentData.headers.filter(h => visibleColumnsMap[h.key]);
      let html = '<thead class="bg-slate-900 text-white"><tr>';
      html += '<th class="p-2 border border-slate-700 text-center w-8">#</th>';
      active.forEach(h => {
        const u = h.label.toUpperCase();
        const ctr = u.includes('NÚMERO') || u.includes('NUMERO') || u.includes('STATUS') || isDateColLabel(h.label);
        html += '<th class="p-2 border border-slate-700 ' + (ctr ? 'text-center' : 'text-left') + '">' + h.label + '</th>';
      });
      html += '</tr></thead><tbody>';
      if (pageRows.length === 0) {
        html += '<tr><td colspan="' + (active.length + 1) + '" class="p-6 text-center text-slate-500">Nenhum registro encontrado com os filtros atuais.</td></tr>';
      } else {
        pageRows.forEach((r, i) => {
          const globalNum = startIdx + i + 1;
          html += '<tr class="' + (i % 2 === 0 ? 'bg-white' : 'bg-slate-50') + '">';
          html += '<td class="p-1.5 border border-slate-200 text-center font-mono font-bold text-slate-600">' + globalNum + '</td>';
          active.forEach(h => {
            const val = r[h.key] || '—';
            const u = h.label.toUpperCase();
            const isNum = u.includes('NÚMERO') || u.includes('NUMERO');
            const isSt = u.includes('STATUS');
            const isDt = isDateColLabel(h.label);
            const parts = isDt ? splitDateAndTime(val) : null;
            const cls = 'p-1.5 border border-slate-200 text-slate-800' + (isNum ? ' font-mono font-bold text-center whitespace-nowrap' : '') + (isSt || isDt ? ' text-center' : '');
            if (parts) {
              html += '<td class="' + cls + '"><div class="flex flex-col items-center justify-center leading-tight font-mono whitespace-nowrap"><span class="text-slate-900">' + parts.date + '</span><span class="text-[9px] text-slate-500">' + parts.time + '</span></div></td>';
            } else {
              html += '<td class="' + cls + '">' + val + '</td>';
            }
          });
          html += '</tr>';
        });
      }
      html += '</tbody>';
      document.getElementById('previewTable').innerHTML = html;

      const pctStr = v => v.toFixed(1).replace('.', ',') + '%';
      let sumHtml = '<div><h5 class="text-xs font-extrabold text-slate-900 uppercase">Quadro Resumo — Quantitativo de Atendimentos e Naturezas</h5><p class="text-[10px] text-slate-600">Atendimentos (Ocorrências): ' + summary.total + ' | Total de Naturezas (incl. concorrentes): ' + summary.totalConcurrent + '</p></div>';
      sumHtml += '<table class="max-w-xl w-full text-left text-[10px] border-collapse border border-slate-300"><thead class="bg-slate-900 text-white"><tr><th class="p-1.5 border border-slate-700">GRUPO</th><th class="p-1.5 border border-slate-700 text-center">ATEND. (PREDOM.)</th><th class="p-1.5 border border-slate-700 text-center">TOTAL NATUREZAS</th><th class="p-1.5 border border-slate-700 text-center">% NAT.</th></tr></thead><tbody>';
      summary.byGroup.forEach((g, i) => {
        sumHtml += '<tr class="' + (i%2===0?'bg-white':'bg-slate-50') + '"><td class="p-1 border border-slate-200 font-semibold">' + g.group + '</td><td class="p-1 border border-slate-200 text-center font-mono font-bold">' + g.count + '</td><td class="p-1 border border-slate-200 text-center font-mono font-bold text-sky-700">' + g.concurrentCount + '</td><td class="p-1 border border-slate-200 text-center font-mono">' + pctStr(g.pct) + '</td></tr>';
      });
      sumHtml += '<tr class="bg-slate-200 font-bold"><td class="p-1.5 border border-slate-300">TOTAL GERAL POR GRUPO</td><td class="p-1.5 border border-slate-300 text-center font-mono">' + summary.total + '</td><td class="p-1.5 border border-slate-300 text-center font-mono">' + summary.totalConcurrent + '</td><td class="p-1.5 border border-slate-300 text-center font-mono">' + (summary.totalConcurrent ? '100,0%' : '0,0%') + '</td></tr></tbody></table>';

      sumHtml += '<table class="w-full text-left text-[10px] border-collapse border border-slate-300"><thead class="bg-slate-900 text-white"><tr><th class="p-1.5 border border-slate-700">GRUPO</th><th class="p-1.5 border border-slate-700 text-center">CÓDIGO</th><th class="p-1.5 border border-slate-700">SUB-GRUPO</th><th class="p-1.5 border border-slate-700">NATUREZA</th><th class="p-1.5 border border-slate-700 text-center">ATEND.</th><th class="p-1.5 border border-slate-700 text-center">NATUREZAS</th><th class="p-1.5 border border-slate-700 text-center">% NAT.</th></tr></thead><tbody>';
      summary.bySubGroup.forEach(blk => {
        blk.entries.forEach((n, i) => {
          sumHtml += '<tr class="' + (i%2===0?'bg-white':'bg-slate-50') + '"><td class="p-1 border border-slate-200 font-semibold">' + n.group + '</td><td class="p-1 border border-slate-200 text-center font-mono font-bold">' + n.code + '</td><td class="p-1 border border-slate-200">' + n.subGroup + '</td><td class="p-1 border border-slate-200">' + n.nature + '</td><td class="p-1 border border-slate-200 text-center font-mono font-bold">' + n.count + '</td><td class="p-1 border border-slate-200 text-center font-mono font-bold text-sky-700">' + n.concurrentCount + '</td><td class="p-1 border border-slate-200 text-center font-mono">' + pctStr(n.pct) + '</td></tr>';
        });
        sumHtml += '<tr class="bg-slate-100 font-bold text-slate-900"><td colspan="4" class="p-1 border border-slate-300 text-right">Subtotal — ' + blk.group + ' / ' + blk.subGroup + '</td><td class="p-1 border border-slate-300 text-center font-mono">' + blk.subtotalCount + '</td><td class="p-1 border border-slate-300 text-center font-mono">' + blk.subtotalConc + '</td><td class="p-1 border border-slate-300 text-center font-mono">' + pctStr(blk.subtotalPct) + '</td></tr>';
      });
      sumHtml += '<tr class="bg-slate-200 font-bold"><td colspan="4" class="p-1.5 border border-slate-300">TOTAL GERAL (ATENDIMENTOS × NATUREZAS)</td><td class="p-1.5 border border-slate-300 text-center font-mono">' + summary.total + '</td><td class="p-1.5 border border-slate-300 text-center font-mono">' + summary.totalConcurrent + '</td><td class="p-1.5 border border-slate-300 text-center font-mono">' + (summary.totalConcurrent ? '100,0%' : '0,0%') + '</td></tr></tbody></table>';

      if (summary.prodTotal > 0) {
        sumHtml += '<div class="pt-3 border-t border-slate-300 space-y-2"><div><h5 class="text-xs font-extrabold text-slate-900 uppercase">Quadro à Parte — Atendimentos com Natureza de Produtividade</h5><p class="text-[10px] text-slate-600">Total de Produtividade: ' + summary.prodTotal + ' | Exclusivas: ' + summary.prodExcl + ' | Mistas (com outra natureza): ' + summary.prodMixed + '</p></div>';
        sumHtml += '<table class="w-full text-left text-[10px] border-collapse border border-slate-300"><thead class="bg-slate-800 text-white"><tr><th class="p-1.5 border border-slate-700 text-center">CÓDIGO</th><th class="p-1.5 border border-slate-700">SUB-GRUPO</th><th class="p-1.5 border border-slate-700">NATUREZA DE PRODUTIVIDADE</th><th class="p-1.5 border border-slate-700 text-center">EXCLUSIVA</th><th class="p-1.5 border border-slate-700 text-center">COM OUTRA NAT.</th><th class="p-1.5 border border-slate-700 text-center">ATENDIMENTOS</th><th class="p-1.5 border border-slate-700 text-center">%</th></tr></thead><tbody>';
        summary.byProd.forEach((p, i) => {
          sumHtml += '<tr class="' + (i%2===0?'bg-white':'bg-slate-50') + '"><td class="p-1 border border-slate-200 text-center font-mono font-bold">' + p.code + '</td><td class="p-1 border border-slate-200">' + p.subGroup + '</td><td class="p-1 border border-slate-200">' + p.nature + '</td><td class="p-1 border border-slate-200 text-center font-mono">' + p.exclusiveCount + '</td><td class="p-1 border border-slate-200 text-center font-mono">' + p.mixedCount + '</td><td class="p-1 border border-slate-200 text-center font-mono font-bold">' + p.totalCount + '</td><td class="p-1 border border-slate-200 text-center font-mono">' + pctStr(p.pct) + '</td></tr>';
        });
        sumHtml += '<tr class="bg-slate-200 font-bold"><td colspan="3" class="p-1.5 border border-slate-300">TOTAL GERAL DE PRODUTIVIDADE</td><td class="p-1.5 border border-slate-300 text-center font-mono">' + summary.prodExcl + '</td><td class="p-1.5 border border-slate-300 text-center font-mono">' + summary.prodMixed + '</td><td class="p-1.5 border border-slate-300 text-center font-mono">' + summary.prodTotal + '</td><td class="p-1.5 border border-slate-300 text-center font-mono">100,0%</td></tr></tbody></table></div>';
      }

      document.getElementById('summaryPreview').innerHTML = sumHtml;
      document.getElementById('docFooterPreview').innerHTML = '<span>DOCUMENTO DE USO CORPORATIVO / RESERVADO</span><span>Página ' + currentPage + ' de ' + totalPages + '</span>';
      document.getElementById('rowCountLabel').textContent = filtered.length + ' de ' + currentData.rows.length + ' atendimento(s) · ' + summary.totalConcurrent + ' natureza(s)';
    }

    function createPdfDoc() {
      const filtered = getFilteredRows();
      const { summary } = computeClassificationAndSummary(filtered);
      const active = currentData.headers.filter(h => visibleColumnsMap[h.key]);
      const wing = document.getElementById('cfgWing').value;
      const start = fmtBrDate(document.getElementById('cfgStart').value);
      const end = fmtBrDate(document.getElementById('cfgEnd').value);
      const title = document.getElementById('cfgTitle').value;
      const subtitle = document.getElementById('cfgSubtitle').value;
      const orientation = document.getElementById('cfgOrientation').value;
      const isL = orientation === 'landscape';
      const pctStr = v => v.toFixed(1).replace('.', ',') + '%';
      const logoBase64 = getActiveLogoDataUrl();

      const body = [[
        { text: '#', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
        ...active.map(h => ({ text: h.label, fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' }))
      ]];
      filtered.forEach((r, i) => {
        const bg = i % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        body.push([
          { text: String(i + 1), fillColor: bg, bold: true, color: '#475569', alignment: 'center', fontSize: 6.5 },
          ...active.map(h => {
            const val = r[h.key] || '—';
            const u = h.label.toUpperCase();
            const isNum = u.includes('NÚMERO') || u.includes('NUMERO');
            const isSt = u.includes('STATUS');
            const isDt = isDateColLabel(h.label);
            if (isDt) {
              const pts = splitDateAndTime(val);
              if (pts) {
                return {
                  text: [{ text: pts.date + '\\n', color: '#0F172A' }, { text: pts.time, color: '#475569' }],
                  fillColor: bg,
                  alignment: 'center',
                  fontSize: 6.5
                };
              }
            }
            return {
              text: val,
              fillColor: bg,
              bold: isNum || isSt,
              alignment: (isNum || isSt || isDt) ? 'center' : 'left',
              fontSize: 6.5
            };
          })
        ]);
      });

      const mainWidths = [
        isL ? 22 : 18,
        ...active.map(h => {
          const u = h.label.toUpperCase();
          if (u.includes('NÚMERO') || u.includes('NUMERO')) return isL ? 60 : 50;
          if (u.includes('REGISTRO') || u.includes('FATO')) return isL ? 54 : 44;
          if (u.includes('STATUS')) return isL ? 50 : 42;
          if (u.includes('NATUREZA')) return '*';
          return 'auto';
        })
      ];

      const groupBody = [[
        { text: 'GRUPO', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7 },
        { text: 'ATEND. (PREDOM.)', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
        { text: 'TOTAL NATUREZAS', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
        { text: '% NAT.', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' }
      ]];
      summary.byGroup.forEach((g, i) => {
        const f = i % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        groupBody.push([
          { text: g.group, fillColor: f, bold: true, fontSize: 7 },
          { text: String(g.count), fillColor: f, bold: true, alignment: 'center', fontSize: 7 },
          { text: String(g.concurrentCount), fillColor: f, bold: true, alignment: 'center', fontSize: 7, color: '#0369A1' },
          { text: pctStr(g.pct), fillColor: f, alignment: 'center', fontSize: 7 }
        ]);
      });
      groupBody.push([
        { text: 'TOTAL GERAL POR GRUPO', fillColor: '#E2E8F0', bold: true, fontSize: 7 },
        { text: String(summary.total), fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 },
        { text: String(summary.totalConcurrent), fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 },
        { text: summary.totalConcurrent ? '100,0%' : '0,0%', fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 }
      ]);

      const natureBody = [[
        { text: 'GRUPO', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7 },
        { text: 'CÓDIGO', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
        { text: 'SUB-GRUPO', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7 },
        { text: 'NATUREZA', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7 },
        { text: 'ATEND.', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
        { text: 'NATUREZAS', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
        { text: '% NAT.', fillColor: '#0F172A', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' }
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
            { text: String(n.concurrentCount), fillColor: f, bold: true, alignment: 'center', fontSize: 6.5, color: '#0369A1' },
            { text: pctStr(n.pct), fillColor: f, alignment: 'center', fontSize: 6.5 }
          ]);
        });
        natureBody.push([
          { text: 'Subtotal — ' + blk.group + ' / ' + blk.subGroup, colSpan: 4, fillColor: '#F1F5F9', bold: true, alignment: 'right', fontSize: 6.5, color: '#0F172A' },
          {}, {}, {},
          { text: String(blk.subtotalCount), fillColor: '#F1F5F9', bold: true, alignment: 'center', fontSize: 6.5, color: '#0F172A' },
          { text: String(blk.subtotalConc), fillColor: '#F1F5F9', bold: true, alignment: 'center', fontSize: 6.5, color: '#0F172A' },
          { text: pctStr(blk.subtotalPct), fillColor: '#F1F5F9', bold: true, alignment: 'center', fontSize: 6.5, color: '#0F172A' }
        ]);
      });
      natureBody.push([
        { text: 'TOTAL GERAL (ATENDIMENTOS × NATUREZAS)', colSpan: 4, fillColor: '#E2E8F0', bold: true, fontSize: 7 },
        {}, {}, {},
        { text: String(summary.total), fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 },
        { text: String(summary.totalConcurrent), fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 },
        { text: summary.totalConcurrent ? '100,0%' : '0,0%', fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 }
      ]);

      const contentBlocks = [
        { table: { headerRows: 1, dontBreakRows: true, widths: mainWidths, body }, layout: 'lightHorizontalLines' },
        { text: 'QUADRO RESUMO — QUANTITATIVO DE ATENDIMENTOS E NATUREZAS', fontSize: 9.5, bold: true, margin: [0, 14, 0, 2] },
        { text: 'Total de Atendimentos: ' + summary.total + ' | Total de Naturezas (incl. concorrentes): ' + summary.totalConcurrent, fontSize: 7, color: '#475569', margin: [0, 0, 0, 6] },
        { table: { headerRows: 1, dontBreakRows: true, widths: isL ? [230, 72, 72, 48] : ['*', 62, 62, 40], body: groupBody }, layout: 'lightHorizontalLines', margin: [0, 0, 0, 10] },
        { table: { headerRows: 1, dontBreakRows: true, widths: isL ? [115, 44, 105, '*', 42, 48, 38] : [82, 38, 72, '*', 32, 38, 30], body: natureBody }, layout: 'lightHorizontalLines' }
      ];

      if (summary.prodTotal > 0) {
        const prodBody = [[
          { text: 'CÓDIGO', fillColor: '#1E293B', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
          { text: 'SUB-GRUPO', fillColor: '#1E293B', color: '#FFFFFF', bold: true, fontSize: 7 },
          { text: 'NATUREZA DE PRODUTIVIDADE', fillColor: '#1E293B', color: '#FFFFFF', bold: true, fontSize: 7 },
          { text: 'EXCLUSIVA', fillColor: '#1E293B', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
          { text: 'COM OUTRA NAT.', fillColor: '#1E293B', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
          { text: 'ATENDIMENTOS', fillColor: '#1E293B', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' },
          { text: '%', fillColor: '#1E293B', color: '#FFFFFF', bold: true, fontSize: 7, alignment: 'center' }
        ]];
        summary.byProd.forEach((p, i) => {
          const f = i % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
          prodBody.push([
            { text: p.code, fillColor: f, bold: true, alignment: 'center', fontSize: 6.5 },
            { text: p.subGroup, fillColor: f, fontSize: 6.5 },
            { text: p.nature, fillColor: f, fontSize: 6.5 },
            { text: String(p.exclusiveCount), fillColor: f, alignment: 'center', fontSize: 6.5 },
            { text: String(p.mixedCount), fillColor: f, alignment: 'center', fontSize: 6.5 },
            { text: String(p.totalCount), fillColor: f, bold: true, alignment: 'center', fontSize: 6.5 },
            { text: pctStr(p.pct), fillColor: f, alignment: 'center', fontSize: 6.5 }
          ]);
        });
        prodBody.push([
          { text: 'TOTAL GERAL DE PRODUTIVIDADE', colSpan: 3, fillColor: '#E2E8F0', bold: true, fontSize: 7 },
          {}, {},
          { text: String(summary.prodExcl), fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 },
          { text: String(summary.prodMixed), fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 },
          { text: String(summary.prodTotal), fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 },
          { text: '100,0%', fillColor: '#E2E8F0', bold: true, alignment: 'center', fontSize: 7 }
        ]);
        contentBlocks.push(
          { text: 'QUADRO À PARTE — ATENDIMENTOS COM NATUREZA DE PRODUTIVIDADE', fontSize: 9, bold: true, margin: [0, 14, 0, 2] },
          { text: 'Total: ' + summary.prodTotal + ' | Exclusivas: ' + summary.prodExcl + ' | Mistas: ' + summary.prodMixed, fontSize: 7, color: '#475569', margin: [0, 0, 0, 6] },
          { table: { headerRows: 1, dontBreakRows: true, widths: isL ? [48, 85, '*', 48, 62, 58, 38] : [42, 64, '*', 40, 50, 48, 30], body: prodBody }, layout: 'lightHorizontalLines' }
        );
      }

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
                    { text: 'Atendimentos: ' + summary.total + ' | Naturezas: ' + summary.totalConcurrent, fontSize: 7, bold: true, color: '#0369A1' }
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
            { text: 'Página ' + cp + ' de ' + pc, fontSize: 7, alignment: 'right', color: '#0F172A', bold: true }
          ]
        }),
        content: contentBlocks
      };
    }

    ['cfgWing', 'cfgStart', 'cfgEnd', 'cfgOrientation', 'cfgTitle', 'cfgSubtitle'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        saveSettings();
        if (currentData) renderAll();
      });
      document.getElementById(id).addEventListener('change', () => {
        saveSettings();
        if (currentData) renderAll();
      });
    });

    ['fltOcc', 'fltNat', 'fltMun', 'fltStatus', 'fltDateField', 'fltStartDt', 'fltEndDt', 'fltGlobal'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => { currentPage = 1; if (currentData) renderAll(); });
      document.getElementById(id).addEventListener('change', () => { currentPage = 1; if (currentData) renderAll(); });
    });

    document.getElementById('btnClearFilters').onclick = () => {
      document.getElementById('fltOcc').value = '';
      document.getElementById('fltNat').value = '';
      document.getElementById('fltMun').value = 'all';
      document.getElementById('fltStatus').value = 'all';
      document.getElementById('fltDateField').value = 'any';
      document.getElementById('fltStartDt').value = '';
      document.getElementById('fltEndDt').value = '';
      document.getElementById('fltGlobal').value = '';
      currentPage = 1;
      if (currentData) renderAll();
    };

    document.getElementById('rowsPerPageSelect').onchange = (e) => {
      rowsPerPage = Number(e.target.value) || 20;
      currentPage = 1;
      if (currentData) renderAll();
    };
    document.getElementById('btnFirstPage').onclick = () => { currentPage = 1; renderAll(); };
    document.getElementById('btnPrevPage').onclick = () => { currentPage = Math.max(1, currentPage - 1); renderAll(); };
    document.getElementById('btnNextPage').onclick = () => { currentPage += 1; renderAll(); };
    document.getElementById('btnLastPage').onclick = () => {
      const f = getFilteredRows();
      currentPage = Math.max(1, Math.ceil(f.length / rowsPerPage));
      renderAll();
    };

    document.getElementById('btnToggleAllClass').onclick = () => {
      showAllClassifications = !showAllClassifications;
      document.getElementById('btnToggleAllClass').textContent = showAllClassifications ? 'Mostrar Pendências' : 'Revisar Todas';
      renderAll();
    };

    document.getElementById('btnModeSingle').onclick = () => { if (!currentData) setEntryMode('single'); };
    document.getElementById('btnModeMulti').onclick = () => { if (!currentData) setEntryMode('multi'); };
    document.getElementById('btnSwitchToMulti').onclick = () => {
      if (currentData) return;
      if (txtInput.value.trim()) {
        pageDrafts = [
          { id: 'p1', rawText: txtInput.value, clipboardHtml: '' },
          { id: 'p2', rawText: '', clipboardHtml: '' }
        ];
      }
      setEntryMode('multi');
    };
    btnAddPage.onclick = () => {
      if (currentData) return;
      pageDrafts.push({ id: 'p' + Date.now(), rawText: '', clipboardHtml: '' });
      renderPagesEditor();
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

    btnProcessMulti.onclick = () => {
      if (currentData) return;
      const nonEmpty = pageDrafts.filter(p => p.rawText.trim() || (p.clipboardHtml || '').trim());
      if (!nonEmpty.length) {
        document.getElementById('alertBox').textContent = 'Cole os dados em pelo menos uma página.';
        document.getElementById('alertBox').classList.remove('hidden');
        return;
      }
      const datasets = [];
      for (let i = 0; i < nonEmpty.length; i++) {
        const parsed = parseInput(nonEmpty[i].rawText, nonEmpty[i].clipboardHtml);
        if (!parsed) {
          document.getElementById('alertBox').textContent = 'Não foi possível identificar uma tabela na Página ' + (i + 1) + '.';
          document.getElementById('alertBox').classList.remove('hidden');
          return;
        }
        datasets.push(parsed);
      }
      applyParsedData(datasets.length === 1 ? datasets[0] : mergeParsedPages(datasets));
    };

    btnImportFile.onclick = () => {
      if (!currentData) document.getElementById('fileInput').click();
    };

    document.getElementById('fileInput').onchange = (e) => {
      if (currentData) return;
      const f = e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = ev => {
        if (entryMode === 'single') {
          txtInput.value = ev.target.result;
          const parsed = parseInput(ev.target.result);
          if (parsed) applyParsedData(parsed);
          else {
            document.getElementById('alertBox').textContent = 'Não foi possível identificar uma tabela no arquivo importado.';
            document.getElementById('alertBox').classList.remove('hidden');
          }
        } else {
          const empty = pageDrafts.find(p => !p.rawText.trim());
          if (empty) empty.rawText = ev.target.result;
          else pageDrafts.push({ id: 'p' + Date.now(), rawText: ev.target.result, clipboardHtml: '' });
          renderPagesEditor();
        }
      };
      r.readAsText(f);
      e.target.value = '';
    };

    btnClear.onclick = () => {
      txtInput.value = '';
      pageDrafts = [{ id: 'p1', rawText: '', clipboardHtml: '' }, { id: 'p2', rawText: '', clipboardHtml: '' }];
      currentData = null;
      currentPage = 1;
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
