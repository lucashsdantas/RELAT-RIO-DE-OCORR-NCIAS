import { OccurrenceDataset, ReportConfig } from '../types/occurrence';
import { OccurrenceSummaryReport } from './natureCatalog';

declare global {
  interface Window {
    pdfMake?: {
      createPdf: (docDefinition: any) => {
        open: () => void;
        download: (defaultFileName?: string) => void;
        print: () => void;
        getBlob: (cb: (blob: Blob) => void) => void;
        getDataUrl: (cb: (dataUrl: string) => void) => void;
      };
      vfs?: any;
    };
  }
}

/**
 * Formata data e hora atual no padrão brasileiro (DD/MM/AAAA às HH:mm:ss)
 */
export function formatCurrentDateTime(date: Date = new Date()): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  const hr = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const sec = String(date.getSeconds()).padStart(2, '0');
  return `${d}/${m}/${y} às ${hr}:${min}:${sec}`;
}

/**
 * Formata string de input datetime-local (YYYY-MM-DDTHH:mm) para DD/MM/AAAA HH:mm
 */
export function formatBrazilianDateTime(isoLocal: string): string {
  if (!isoLocal) return 'Não informado';
  const [datePart, timePart] = isoLocal.split('T');
  if (!datePart) return isoLocal;
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return isoLocal;
  const timeStr = timePart ? timePart.slice(0, 5) : '00:00';
  return `${d}/${m}/${y} ${timeStr}`;
}

/**
 * Separa uma célula de data/hora (ex: "13/11/2026 06:42") em data em cima e hora em baixo
 */
export function splitDateAndTime(rawValue: string): { date: string; time: string } | null {
  const trimmed = (rawValue || '').trim();
  if (!trimmed || trimmed === '—') return null;

  const match = trimmed.match(
    /^(\d{2,4}[\/-]\d{2}[\/-]\d{2,4})(?:\s*(?:às|-|T)?\s*(\d{2}:\d{2}(?::\d{2})?))?/i
  );
  if (match && match[1] && match[2]) {
    let dateStr = match[1];
    // Converte ISO YYYY-MM-DD para DD/MM/YYYY quando aplicável
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-');
      dateStr = `${d}/${m}/${y}`;
    }
    return { date: dateStr, time: match[2] };
  }

  return null;
}

export function isDateTimeColumn(label: string): boolean {
  const upper = label.toUpperCase();
  return upper.includes('DATA REGISTRO') || upper.includes('DATA FATO') || upper.includes('DATA');
}

/**
 * Gera o nome de arquivo padrão para download do relatório
 */
export function generatePdfFileName(title: string, wing?: string): string {
  const now = new Date();
  const d = String(now.getDate()).padStart(2, '0');
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const y = now.getFullYear();
  const hr = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  const sanitizedTitle = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 28);

  const wingPart = wing ? `_ala_${wing.toLowerCase()}` : '';

  return `${sanitizedTitle || 'relatorio_ocorrencias'}${wingPart}_${y}${m}${d}_${hr}${min}.pdf`;
}

/**
 * Calcula larguras proporcionais para cada coluna da tabela em pdfmake
 */
function calculateColumnWidths(
  visibleColumns: { key: string; label: string }[],
  orientation: 'landscape' | 'portrait'
) {
  const orderColWidth = orientation === 'landscape' ? 22 : 18;
  const dataWidths = visibleColumns.map((col) => {
    const label = col.label.toUpperCase();
    if (label.includes('NÚMERO') || label.includes('NUMERO')) return orientation === 'landscape' ? 60 : 50;
    if (label.includes('REGISTRO')) return orientation === 'landscape' ? 54 : 44;
    if (label.includes('STATUS')) return orientation === 'landscape' ? 50 : 42;
    if (label.includes('FATO')) return orientation === 'landscape' ? 54 : 44;
    if (label.includes('UNIDADE')) return orientation === 'landscape' ? 84 : 64;
    if (label.includes('MUNICÍPIO') || label.includes('MUNICIPIO')) return orientation === 'landscape' ? 64 : 50;
    if (label.includes('BAIRRO')) return orientation === 'landscape' ? 62 : 50;
    if (label.includes('LOGRADOURO')) return orientation === 'landscape' ? 110 : '*';
    if (label.includes('NATUREZA')) return '*';
    return 'auto';
  });
  return [orderColWidth, ...dataWidths];
}

function buildSummaryContentBlocks(summary: OccurrenceSummaryReport, isLandscape: boolean) {
  const pct = (val: number) => `${val.toFixed(1).replace('.', ',')}%`;

  // Tabela 1: Quantitativo por Grupo
  const groupBody: any[] = [
    [
      { text: 'GRUPO', style: 'tableHeader', fillColor: '#0F172A', color: '#FFFFFF', alignment: 'left' },
      { text: 'NATUREZAS ATENDIDAS', style: 'tableHeader', fillColor: '#0F172A', color: '#FFFFFF', alignment: 'center' },
      { text: '%', style: 'tableHeader', fillColor: '#0F172A', color: '#FFFFFF', alignment: 'center' },
    ],
  ];

  summary.byGroup.forEach((g, idx) => {
    const fill = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
    groupBody.push([
      { text: g.group, style: 'tableCell', fillColor: fill, bold: true, color: '#0F172A' },
      { text: String(g.concurrentCount), style: 'tableCell', fillColor: fill, bold: true, alignment: 'center', color: '#0F172A' },
      { text: pct(g.concurrentPercentage), style: 'tableCell', fillColor: fill, alignment: 'center', color: '#475569' },
    ]);
  });

  groupBody.push([
    { text: 'TOTAL DE NATUREZAS ATENDIDAS POR GRUPO', style: 'tableCell', fillColor: '#E2E8F0', bold: true, color: '#0F172A' },
    { text: String(summary.totalConcurrentNatures), style: 'tableCell', fillColor: '#E2E8F0', bold: true, alignment: 'center', color: '#0F172A' },
    { text: summary.totalConcurrentNatures > 0 ? '100,0%' : '0,0%', style: 'tableCell', fillColor: '#E2E8F0', bold: true, alignment: 'center', color: '#0F172A' },
  ]);

  // Tabela 2: Quantitativo por Sub-grupo e Natureza
  const natureBody: any[] = [
    [
      { text: 'GRUPO', style: 'tableHeader', fillColor: '#0F172A', color: '#FFFFFF', alignment: 'left' },
      { text: 'CÓDIGO', style: 'tableHeader', fillColor: '#0F172A', color: '#FFFFFF', alignment: 'center' },
      { text: 'SUB-GRUPO', style: 'tableHeader', fillColor: '#0F172A', color: '#FFFFFF', alignment: 'left' },
      { text: 'NATUREZA', style: 'tableHeader', fillColor: '#0F172A', color: '#FFFFFF', alignment: 'left' },
      { text: 'NATUREZAS ATENDIDAS', style: 'tableHeader', fillColor: '#0F172A', color: '#FFFFFF', alignment: 'center' },
      { text: '%', style: 'tableHeader', fillColor: '#0F172A', color: '#FFFFFF', alignment: 'center' },
    ],
  ];

  summary.bySubGroup.forEach((block) => {
    block.items.forEach((n, idx) => {
      const fill = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      natureBody.push([
        { text: n.group, style: 'tableCell', fillColor: fill, color: '#334155', bold: true },
        { text: n.code, style: 'tableCell', fillColor: fill, alignment: 'center', color: '#0F172A', bold: true },
        { text: n.subGroup, style: 'tableCell', fillColor: fill, color: '#334155' },
        { text: n.nature, style: 'tableCell', fillColor: fill, color: '#0F172A' },
        { text: String(n.concurrentCount), style: 'tableCell', fillColor: fill, alignment: 'center', bold: true, color: '#0F172A' },
        { text: pct(n.concurrentPercentage), style: 'tableCell', fillColor: fill, alignment: 'center', color: '#475569' },
      ]);
    });

    natureBody.push([
      {
        text: `Subtotal — ${block.group} / ${block.subGroup}`,
        colSpan: 4,
        style: 'tableCell',
        fillColor: '#F1F5F9',
        bold: true,
        alignment: 'right',
        color: '#0F172A',
      },
      {},
      {},
      {},
      { text: String(block.subtotalConcurrentCount), style: 'tableCell', fillColor: '#F1F5F9', bold: true, alignment: 'center', color: '#0F172A' },
      { text: pct(block.subtotalConcurrentPercentage), style: 'tableCell', fillColor: '#F1F5F9', bold: true, alignment: 'center', color: '#0F172A' },
    ]);
  });

  natureBody.push([
    {
      text: `TOTAL GERAL DE NATUREZAS ATENDIDAS (RAIs registrados: ${summary.totalOccurrences})`,
      colSpan: 4,
      style: 'tableCell',
      fillColor: '#E2E8F0',
      bold: true,
      color: '#0F172A',
    },
    {},
    {},
    {},
    { text: String(summary.totalConcurrentNatures), style: 'tableCell', fillColor: '#E2E8F0', bold: true, alignment: 'center', color: '#0F172A' },
    { text: summary.totalConcurrentNatures > 0 ? '100,0%' : '0,0%', style: 'tableCell', fillColor: '#E2E8F0', bold: true, alignment: 'center', color: '#0F172A' },
  ]);

  const summaryTableLayout = {
    hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length - 1 || i === node.table.body.length ? 0.9 : 0.5),
    vLineWidth: () => 0.5,
    hLineColor: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length ? '#0F172A' : '#CBD5E1'),
    vLineColor: () => '#E2E8F0',
    paddingLeft: () => 4,
    paddingTop: () => 3,
    paddingRight: () => 4,
    paddingBottom: () => 3,
  };

  const raiSummaryText =
    `Número de atendimentos foi ${summary.totalOccurrences}, dado pelo número de RAIs registrados, enquanto houveram ${summary.totalConcurrentNatures} naturezas atendidas.` +
    (summary.multiNatureOccurrencesCount > 0
      ? ` (${summary.multiNatureOccurrencesCount} ocorrência(s) possuíam mais de uma natureza e todas foram mencionadas e contabilizadas abaixo.)`
      : '');

  const blocks: any[] = [
    {
      margin: [0, 16, 0, 6],
      unbreakable: true,
      stack: [
        {
          text: 'QUADRO RESUMO — QUANTITATIVO DE NATUREZAS ATENDIDAS',
          fontSize: 9.5,
          bold: true,
          color: '#0F172A',
        },
        {
          text: raiSummaryText,
          fontSize: 7.5,
          bold: true,
          color: '#0369A1',
          margin: [0, 2, 0, 6],
        },
        {
          table: {
            headerRows: 1,
            dontBreakRows: true,
            widths: isLandscape ? [240, 110, 48] : ['*', 95, 40],
            body: groupBody,
          },
          layout: summaryTableLayout,
        },
      ],
    },
    {
      margin: [0, 8, 0, 0],
      table: {
        headerRows: 1,
        dontBreakRows: true,
        widths: isLandscape ? [120, 46, 110, '*', 90, 38] : [86, 38, 76, '*', 76, 32],
        body: natureBody,
      },
      layout: summaryTableLayout,
    },
  ];

  // Quadro à parte — Naturezas de Produtividade
  if (summary.productivityTotalCount > 0) {
    const prodBody: any[] = [
      [
        { text: 'CÓDIGO', style: 'tableHeader', fillColor: '#1E293B', color: '#FFFFFF', alignment: 'center' },
        { text: 'SUB-GRUPO', style: 'tableHeader', fillColor: '#1E293B', color: '#FFFFFF', alignment: 'left' },
        { text: 'NATUREZA DE PRODUTIVIDADE', style: 'tableHeader', fillColor: '#1E293B', color: '#FFFFFF', alignment: 'left' },
        { text: 'EXCLUSIVA', style: 'tableHeader', fillColor: '#1E293B', color: '#FFFFFF', alignment: 'center' },
        { text: 'COM OUTRA NAT.', style: 'tableHeader', fillColor: '#1E293B', color: '#FFFFFF', alignment: 'center' },
        { text: 'ATENDIMENTOS', style: 'tableHeader', fillColor: '#1E293B', color: '#FFFFFF', alignment: 'center' },
        { text: '%', style: 'tableHeader', fillColor: '#1E293B', color: '#FFFFFF', alignment: 'center' },
      ],
    ];

    summary.productivitySummary.forEach((p, idx) => {
      const fill = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      prodBody.push([
        { text: p.code, style: 'tableCell', fillColor: fill, alignment: 'center', bold: true, color: '#0F172A' },
        { text: p.subGroup, style: 'tableCell', fillColor: fill, color: '#334155' },
        { text: p.nature, style: 'tableCell', fillColor: fill, color: '#0F172A' },
        { text: String(p.exclusiveCount), style: 'tableCell', fillColor: fill, alignment: 'center', color: '#334155' },
        { text: String(p.mixedCount), style: 'tableCell', fillColor: fill, alignment: 'center', color: '#334155' },
        { text: String(p.totalCount), style: 'tableCell', fillColor: fill, alignment: 'center', bold: true, color: '#0F172A' },
        { text: pct(p.percentage), style: 'tableCell', fillColor: fill, alignment: 'center', color: '#475569' },
      ]);
    });

    prodBody.push([
      { text: 'TOTAL GERAL DE PRODUTIVIDADE', colSpan: 3, style: 'tableCell', fillColor: '#E2E8F0', bold: true, color: '#0F172A' },
      {},
      {},
      { text: String(summary.productivityExclusiveCount), style: 'tableCell', fillColor: '#E2E8F0', bold: true, alignment: 'center', color: '#0F172A' },
      { text: String(summary.productivityMixedCount), style: 'tableCell', fillColor: '#E2E8F0', bold: true, alignment: 'center', color: '#0F172A' },
      { text: String(summary.productivityTotalCount), style: 'tableCell', fillColor: '#E2E8F0', bold: true, alignment: 'center', color: '#0F172A' },
      { text: '100,0%', style: 'tableCell', fillColor: '#E2E8F0', bold: true, alignment: 'center', color: '#0F172A' },
    ]);

    blocks.push({
      margin: [0, 14, 0, 0],
      unbreakable: true,
      stack: [
        {
          text: 'QUADRO À PARTE — ATENDIMENTOS COM NATUREZA DE PRODUTIVIDADE',
          fontSize: 9,
          bold: true,
          color: '#0F172A',
        },
        {
          text: `Total de registros de Produtividade: ${summary.productivityTotalCount} | Exclusivas (só Produtividade): ${summary.productivityExclusiveCount} | Em ocorrências mistas: ${summary.productivityMixedCount}`,
          fontSize: 7,
          color: '#475569',
          margin: [0, 1, 0, 6],
        },
        {
          table: {
            headerRows: 1,
            dontBreakRows: true,
            widths: isLandscape ? [48, 85, '*', 48, 62, 58, 38] : [42, 64, '*', 40, 50, 48, 30],
            body: prodBody,
          },
          layout: summaryTableLayout,
        },
      ],
    });
  }

  return blocks;
}

/**
 * Constrói a definição de documento completa do pdfmake
 */
export function buildPdfDocDefinition(
  dataset: OccurrenceDataset,
  config: ReportConfig,
  filteredRows: Record<string, string>[],
  summary?: OccurrenceSummaryReport
) {
  const visibleColumns = dataset.headers.filter((h) => h.visible);
  const emissionTimestamp = formatCurrentDateTime();
  const totalCount = filteredRows.length;

  const isLandscape = config.orientation === 'landscape';
  const tableFontSize = config.compactMode ? 6.5 : isLandscape ? 7 : 6.5;
  const headerFontSize = config.compactMode ? 7 : 7.5;
  const cellPadding = config.compactMode ? [3, 2, 3, 2] : [3, 3.5, 3, 3.5];

  const startFormatted = formatBrazilianDateTime(config.startDateTime);
  const endFormatted = formatBrazilianDateTime(config.endDateTime);
  const periodLabel = `Período: ${startFormatted} a ${endFormatted}`;
  const wingLabel = `Ala de Serviço: Ala ${config.serviceWing}`;

  const tableBody: any[] = [];

  const headerCells = [
    {
      text: '#',
      style: 'tableHeader',
      fillColor: '#0F172A',
      color: '#FFFFFF',
      alignment: 'center',
    },
    ...visibleColumns.map((col) => ({
      text: col.label,
      style: 'tableHeader',
      fillColor: '#0F172A',
      color: '#FFFFFF',
      alignment:
        col.label.toUpperCase().includes('NÚMERO') ||
        col.label.toUpperCase().includes('NUMERO') ||
        col.label.toUpperCase().includes('STATUS') ||
        isDateTimeColumn(col.label)
          ? 'center'
          : 'left',
    })),
  ];
  tableBody.push(headerCells);

  filteredRows.forEach((row, rowIndex) => {
    const isEven = rowIndex % 2 === 0;
    const rowFillColor = config.showZebra ? (isEven ? '#FFFFFF' : '#F8FAFC') : '#FFFFFF';

    const orderCell = {
      text: String(rowIndex + 1),
      style: 'tableCell',
      fillColor: rowFillColor,
      color: '#475569',
      bold: true,
      alignment: 'center',
    };

    const rowCells = visibleColumns.map((col) => {
      const val = row[col.key] || '—';
      const labelUpper = col.label.toUpperCase();
      const isStatusCol = labelUpper.includes('STATUS');
      const isNumCol = labelUpper.includes('NÚMERO') || labelUpper.includes('NUMERO');
      const isDateCol = isDateTimeColumn(col.label);

      let textColor = '#1E293B';
      let isBold = false;

      if (isStatusCol) {
        isBold = true;
        const normVal = val.toLowerCase();
        if (normVal.includes('conclu') || normVal.includes('encerrad') || normVal.includes('finaliz')) {
          textColor = '#15803d';
        } else if (normVal.includes('andamento') || normVal.includes('atend')) {
          textColor = '#b45309';
        } else if (normVal.includes('pendente') || normVal.includes('abert')) {
          textColor = '#b91c1c';
        }
      } else if (isNumCol) {
        isBold = true;
        textColor = '#0f172a';
      }

      if (isDateCol) {
        const parts = splitDateAndTime(val);
        if (parts) {
          return {
            text: [
              { text: `${parts.date}\n`, color: '#0F172A' },
              { text: parts.time, color: '#475569' },
            ],
            style: 'tableCell',
            fillColor: rowFillColor,
            alignment: 'center',
          };
        }
      }

      return {
        text: val,
        style: 'tableCell',
        fillColor: rowFillColor,
        color: textColor,
        bold: isBold,
        alignment: isStatusCol || isNumCol || isDateCol ? 'center' : 'left',
      };
    });

    tableBody.push([orderCell, ...rowCells]);
  });

  const columnWidths = calculateColumnWidths(visibleColumns, config.orientation);

  const contentBlocks: any[] = [
    {
      table: {
        headerRows: config.repeatHeader ? 1 : 0,
        dontBreakRows: true,
        widths: columnWidths,
        body: tableBody,
      },
      layout: {
        hLineWidth: function (i: number, node: any) {
          return i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5;
        },
        vLineWidth: function () {
          return 0.5;
        },
        hLineColor: function (i: number, node: any) {
          if (i === 0 || i === 1) return '#0F172A';
          if (i === node.table.body.length) return '#0F172A';
          return '#E2E8F0';
        },
        vLineColor: function () {
          return '#E2E8F0';
        },
        paddingLeft: function () {
          return cellPadding[0];
        },
        paddingTop: function () {
          return cellPadding[1];
        },
        paddingRight: function () {
          return cellPadding[2];
        },
        paddingBottom: function () {
          return cellPadding[3];
        },
      },
    },
  ];

  if (summary && summary.totalOccurrences > 0) {
    contentBlocks.push(...buildSummaryContentBlocks(summary, isLandscape));
  }

  const docDefinition: any = {
    pageSize: 'A4',
    pageOrientation: config.orientation,
    pageMargins: isLandscape ? [24, 88, 24, 38] : [24, 94, 24, 38],

    header: function (_currentPage: number, _pageCount: number, pageSize: any) {
      const titleContent: any[] = [
        {
          text: config.title || 'RELATÓRIO OPERACIONAL DE ATENDIMENTOS E OCORRÊNCIAS',
          fontSize: 10.5,
          bold: true,
          color: '#0F172A',
          characterSpacing: 0.2,
        },
        {
          text: config.subtitle || '4º Batalhão de Bombeiros Militar — Controle Operacional',
          fontSize: 7.5,
          color: '#475569',
          margin: [0, 2, 0, 2],
        },
        {
          text: [
            { text: wingLabel, bold: true, color: '#0F172A' },
            { text: '   |   ', color: '#94A3B8' },
            { text: periodLabel, bold: true, color: '#0F172A' },
            ...(config.department
              ? [{ text: '   |   ', color: '#94A3B8' }, { text: config.department, color: '#475569' }]
              : []),
          ],
          fontSize: 7,
          margin: [0, 1, 0, 0],
        },
      ];

      return {
        margin: [24, 14, 24, 10],
        stack: [
          {
            columns: [
              {
                width: '*',
                columns: [
                  ...(config.logoBase64
                    ? [
                        {
                          image: config.logoBase64,
                          fit: [46, 46],
                          width: 46,
                          margin: [0, 0, 10, 0],
                        },
                      ]
                    : []),
                  {
                    width: '*',
                    stack: titleContent,
                  },
                ],
              },
              {
                width: isLandscape ? 210 : 165,
                alignment: 'right',
                stack: [
                  {
                    text: `ALA ${config.serviceWing}`,
                    fontSize: 8.5,
                    bold: true,
                    color: '#0F172A',
                  },
                  {
                    text: `Gerado em: ${emissionTimestamp}`,
                    fontSize: 6.5,
                    color: '#475569',
                    margin: [0, 2, 0, 1],
                  },
                  {
                    text: `Atendimentos (RAIs): ${totalCount} | Naturezas: ${summary ? summary.totalConcurrentNatures : totalCount}`,
                    fontSize: 7,
                    bold: true,
                    color: '#0369A1',
                  },
                ],
              },
            ],
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 8,
                x2: pageSize.width - 48,
                y2: 8,
                lineWidth: 1,
                lineColor: '#CBD5E1',
              },
              {
                type: 'line',
                x1: 0,
                y1: 10,
                x2: isLandscape ? 130 : 90,
                y2: 10,
                lineWidth: 2,
                lineColor: '#0F172A',
              },
            ],
          },
        ],
      };
    },

    footer: function (currentPage: number, pageCount: number, pageSize: any) {
      return {
        margin: [24, 10, 24, 10],
        stack: [
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: pageSize.width - 48,
                y2: 0,
                lineWidth: 0.5,
                lineColor: '#E2E8F0',
              },
            ],
          },
          {
            margin: [0, 6, 0, 0],
            columns: [
              {
                width: '*',
                text:
                  config.confidentialityText ||
                  'DOCUMENTO DE USO CORPORATIVO / RESERVADO • GERADO CLIENT-SIDE',
                fontSize: 6.5,
                color: '#64748B',
              },
              {
                width: 140,
                alignment: 'right',
                text: [
                  { text: 'Página ', fontSize: 7, color: '#64748B' },
                  { text: `${currentPage}`, fontSize: 7, bold: true, color: '#0F172A' },
                  { text: ' de ', fontSize: 7, color: '#64748B' },
                  { text: `${pageCount}`, fontSize: 7, bold: true, color: '#0F172A' },
                ],
              },
            ],
          },
        ],
      };
    },

    content: contentBlocks,

    styles: {
      tableHeader: {
        fontSize: headerFontSize,
        bold: true,
        margin: [1, 2, 1, 2],
      },
      tableCell: {
        fontSize: tableFontSize,
        margin: [0, 1, 0, 1],
      },
    },

    defaultStyle: {
      font: 'Roboto',
    },
  };

  return docDefinition;
}

export function ensurePdfMake(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.pdfMake && window.pdfMake.createPdf);
}

export function createPdfInstance(
  dataset: OccurrenceDataset,
  config: ReportConfig,
  filteredRows: Record<string, string>[],
  summary?: OccurrenceSummaryReport
) {
  if (!ensurePdfMake()) {
    throw new Error(
      'A biblioteca pdfmake não foi carregada corretamente. Verifique sua conexão com a internet.'
    );
  }

  const docDef = buildPdfDocDefinition(dataset, config, filteredRows, summary);
  return window.pdfMake!.createPdf(docDef);
}

export function generatePdfBlobUrl(
  dataset: OccurrenceDataset,
  config: ReportConfig,
  filteredRows: Record<string, string>[],
  summary?: OccurrenceSummaryReport
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const pdfInstance = createPdfInstance(dataset, config, filteredRows, summary);
      pdfInstance.getBlob((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        resolve(url);
      });
    } catch (err) {
      reject(err);
    }
  });
}
