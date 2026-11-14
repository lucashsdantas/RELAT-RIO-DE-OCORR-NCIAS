import { ColumnDefinition, OccurrenceDataset, OccurrenceRow, ParseResult } from '../types/occurrence';

// Lista das colunas prioritárias solicitadas pelo usuário
export const REQUIRED_STANDARD_COLUMNS = [
  'NÚMERO',
  'DATA REGISTRO',
  'STATUS',
  'DATA FATO',
  'UNIDADES ATUAL',
  'NATUREZAS',
  'MUNICÍPIO',
  'BAIRRO',
  'LOGRADOURO',
];

/**
 * Normaliza um texto de cabeçalho removendo acentos excessivos, espaços duplicados e pontuação
 */
export function normalizeHeaderKey(text: string): string {
  return text
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Mapeia um texto bruto de cabeçalho para o rótulo canônico padrão se corresponder
 */
function mapToCanonicalHeader(rawText: string, index: number): { label: string; isStandard: boolean } {
  const clean = rawText.trim();
  if (!clean) {
    return { label: `COLUNA_${index + 1}`, isStandard: false };
  }

  const norm = normalizeHeaderKey(clean);

  if (norm.includes('NUMERO') || norm === 'NUM' || norm === 'N' || norm === 'REDS' || norm === 'BO') {
    return { label: 'NÚMERO', isStandard: true };
  }
  if (norm.includes('REGISTRO') || norm.includes('DT REG') || norm.includes('DATA REG')) {
    return { label: 'DATA REGISTRO', isStandard: true };
  }
  if (norm.includes('STATUS') || norm.includes('SITUACAO')) {
    return { label: 'STATUS', isStandard: true };
  }
  if (norm.includes('FATO') || norm.includes('DT FATO')) {
    return { label: 'DATA FATO', isStandard: true };
  }
  if (norm.includes('UNIDADE')) {
    return { label: 'UNIDADES ATUAL', isStandard: true };
  }
  if (norm.includes('NATUREZA')) {
    return { label: 'NATUREZAS', isStandard: true };
  }
  if (norm.includes('MUNICIPIO') || norm.includes('CIDADE')) {
    return { label: 'MUNICÍPIO', isStandard: true };
  }
  if (norm.includes('BAIRRO')) {
    return { label: 'BAIRRO', isStandard: true };
  }
  if (norm.includes('LOGRADOURO') || norm.includes('ENDERECO')) {
    return { label: 'LOGRADOURO', isStandard: true };
  }

  return { label: clean, isStandard: false };
}

/**
 * Verifica se uma linha parece ser um cabeçalho de ocorrências
 */
function looksLikeHeaderRow(cells: string[]): boolean {
  let matches = 0;
  for (const cell of cells) {
    const mapped = mapToCanonicalHeader(cell, 0);
    if (mapped.isStandard) matches++;
  }
  return matches >= 2;
}

/**
 * Higieniza o texto extraído de células de tabela HTML
 */
export function sanitizeCellText(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  const unwanted = clone.querySelectorAll('script, style, svg, noscript');
  unwanted.forEach((el) => el.remove());

  const brs = clone.querySelectorAll('br');
  brs.forEach((br) => br.replaceWith(' '));

  let text = clone.textContent || '';

  text = text
    .replace(/[\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, ' ')
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

/**
 * Parser genérico para texto delimitado (TSV com TAB, CSV com ; ou |), respeitando aspas
 */
function parseDelimitedMatrix(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let inQuotes = false;

  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    const next = normalized[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        currentCell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        currentCell += ch;
      }
    } else {
      if (ch === '"' && currentCell.trim() === '') {
        inQuotes = true;
      } else if (ch === delimiter) {
        currentRow.push(currentCell.replace(/\s+/g, ' ').trim());
        currentCell = '';
      } else if (ch === '\n') {
        currentRow.push(currentCell.replace(/\s+/g, ' ').trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += ch;
      }
    }
  }

  currentRow.push(currentCell.replace(/\s+/g, ' ').trim());
  if (currentRow.some((c) => c.length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

/**
 * Constrói o Dataset padronizado a partir de uma matriz de strings
 */
function buildDatasetFromMatrix(
  matrix: string[][],
  sourceFileName: string,
  detectedFormat: 'html' | 'tsv' | 'csv'
): ParseResult {
  if (matrix.length === 0) {
    return {
      success: false,
      errorMessage: 'Nenhuma linha de dados foi encontrada no conteúdo colado.',
    };
  }

  const maxCols = Math.max(...matrix.map((r) => r.length));
  if (maxCols < 2) {
    return {
      success: false,
      errorMessage:
        'Não foi possível identificar colunas suficientes. Certifique-se de copiar a tabela completa (ou linhas separadas por Tabulação / Ponto e vírgula).',
    };
  }

  const firstRow = matrix[0];
  const hasExplicitHeaders = looksLikeHeaderRow(firstRow);

  let headers: ColumnDefinition[];
  let dataStartIndex = 0;

  if (hasExplicitHeaders) {
    dataStartIndex = 1;
    headers = Array.from({ length: maxCols }, (_, idx) => {
      const raw = firstRow[idx] || '';
      const mapped = mapToCanonicalHeader(raw, idx);
      return {
        key: `col_${idx}`,
        label: mapped.label,
        visible: true,
        isStandard: mapped.isStandard,
      };
    });
  } else if (maxCols === REQUIRED_STANDARD_COLUMNS.length) {
    // Usuário colou apenas as linhas de ocorrência sem o cabeçalho!
    dataStartIndex = 0;
    headers = REQUIRED_STANDARD_COLUMNS.map((stdLabel, idx) => ({
      key: `col_${idx}`,
      label: stdLabel,
      visible: true,
      isStandard: true,
    }));
  } else if (matrix.length >= 2) {
    // Assume primeira linha como cabeçalho genérico
    dataStartIndex = 1;
    headers = Array.from({ length: maxCols }, (_, idx) => {
      const raw = firstRow[idx] || '';
      const mapped = mapToCanonicalHeader(raw, idx);
      return {
        key: `col_${idx}`,
        label: mapped.label,
        visible: true,
        isStandard: mapped.isStandard,
      };
    });
  } else {
    // Única linha sem cabeçalho detectado
    dataStartIndex = 0;
    headers = Array.from({ length: maxCols }, (_, idx) => ({
      key: `col_${idx}`,
      label: REQUIRED_STANDARD_COLUMNS[idx] || `COLUNA_${idx + 1}`,
      visible: true,
      isStandard: idx < REQUIRED_STANDARD_COLUMNS.length,
    }));
  }

  const dataRows: OccurrenceRow[] = [];
  for (let r = dataStartIndex; r < matrix.length; r++) {
    const rawRow = matrix[r];
    const rowObj: OccurrenceRow = {};
    let hasValue = false;

    headers.forEach((col, idx) => {
      const val = (rawRow[idx] || '').trim();
      if (val) hasValue = true;
      rowObj[col.key] = val;
    });

    if (hasValue) {
      dataRows.push(rowObj);
    }
  }

  if (dataRows.length === 0) {
    return {
      success: false,
      errorMessage: 'Apenas o cabeçalho foi detectado, sem linhas de ocorrências registradas.',
    };
  }

  const presentLabels = headers.map((h) => h.label);
  const missingStandard = REQUIRED_STANDARD_COLUMNS.filter((req) => !presentLabels.includes(req));
  const warnings: string[] = [];

  if (missingStandard.length > 0) {
    warnings.push(
      `Colunas padrão ausentes neste trecho: ${missingStandard.join(', ')}. As ${headers.length} colunas identificadas foram mantidas normalmente.`
    );
  }

  const dataset: OccurrenceDataset = {
    headers,
    rows: dataRows,
    extractedAt: new Date(),
    sourceName: sourceFileName,
    detectedFormat,
    totalRows: dataRows.length,
  };

  return {
    success: true,
    dataset,
    warnings,
  };
}

/**
 * Analisa conteúdo HTML e extrai a melhor tabela de ocorrências
 */
export function parseOccurrenceHtml(rawHtml: string, sourceFileName?: string): ParseResult {
  if (!rawHtml || !rawHtml.trim()) {
    return {
      success: false,
      errorMessage: 'O conteúdo está vazio. Cole os dados ou selecione um arquivo válido.',
    };
  }

  try {
    // Caso o usuário tenha colado apenas <tr>...</tr> sem <table>, envolve em <table>
    const htmlNormalized =
      /<table[\s>]/i.test(rawHtml)
        ? rawHtml
        : /<tr[\s>]/i.test(rawHtml)
        ? `<table>${rawHtml}</table>`
        : rawHtml;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlNormalized, 'text/html');
    const tables = Array.from(doc.querySelectorAll('table'));

    if (tables.length === 0) {
      return {
        success: false,
        tablesFoundCount: 0,
        errorMessage: 'Nenhuma tabela HTML encontrada no trecho fornecido.',
      };
    }

    const scoredTables = tables.map((tbl) => {
      let score = 0;
      const allRows = Array.from(tbl.querySelectorAll('tr'));
      score += Math.min(allRows.length * 2, 50);

      let thElements = Array.from(tbl.querySelectorAll('th'));
      if (thElements.length === 0 && allRows.length > 0) {
        thElements = Array.from(allRows[0].querySelectorAll('td'));
      }
      score += thElements.length * 3;

      const headerTexts = thElements.map((th) => normalizeHeaderKey(th.textContent || ''));

      REQUIRED_STANDARD_COLUMNS.forEach((std) => {
        const normStd = normalizeHeaderKey(std);
        const hasMatch = headerTexts.some((h) => {
          if (h === normStd) return true;
          if (h && (normStd.includes(h) || h.includes(normStd))) return true;
          if (normStd.includes('NUMERO') && (h === 'NUM' || h.includes('NUMERO') || h === 'N')) return true;
          if (normStd.includes('REGISTRO') && (h.includes('REG') || h.includes('REGISTRO'))) return true;
          if (normStd.includes('STATUS') && (h.includes('SITUACAO') || h.includes('STATUS'))) return true;
          if (normStd.includes('FATO') && h.includes('FATO')) return true;
          if (normStd.includes('UNIDADE') && (h.includes('UNID') || h.includes('BATALHAO') || h.includes('CIA'))) return true;
          if (normStd.includes('NATUREZA') && (h.includes('NATUREZA') || h.includes('TIPO'))) return true;
          if (normStd.includes('MUNICIPIO') && (h.includes('MUNICIPIO') || h.includes('CIDADE'))) return true;
          if (normStd.includes('BAIRRO') && h.includes('BAIRRO')) return true;
          if (normStd.includes('LOGRADOURO') && (h.includes('LOGRADOURO') || h.includes('ENDERECO') || h.includes('LOCAL'))) return true;
          return false;
        });

        if (hasMatch) score += 25;
      });

      return { table: tbl, score, rowCount: allRows.length };
    });

    scoredTables.sort((a, b) => b.score - a.score);
    const bestMatch = scoredTables[0];

    if (!bestMatch || bestMatch.rowCount === 0) {
      return {
        success: false,
        tablesFoundCount: tables.length,
        errorMessage: 'A tabela encontrada no HTML não possui linhas suficientes para extração.',
      };
    }

    const allRows = Array.from(bestMatch.table.querySelectorAll('tr'));
    const matrix: string[][] = [];

    for (const row of allRows) {
      const cells = Array.from(row.querySelectorAll('th, td'));
      if (cells.length === 0) continue;
      if (cells.length === 1 && (cells[0].getAttribute('colspan') || '1') !== '1') continue;

      const rowValues = cells.map((c) => sanitizeCellText(c));
      if (rowValues.some((v) => v.length > 0)) {
        matrix.push(rowValues);
      }
    }

    const result = buildDatasetFromMatrix(matrix, sourceFileName || 'Tabela HTML', 'html');
    return {
      ...result,
      tablesFoundCount: tables.length,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      errorMessage: `Erro ao processar o HTML: ${message}`,
    };
  }
}

/**
 * Parser unificado e inteligente para qualquer dado colado pelo usuário:
 * - Código HTML (<table> / <tr>) ou HTML rico da área de transferência
 * - Texto copiado direto de tabelas da web / Excel / Planilhas (separado por TAB)
 * - Texto delimitado por ponto e vírgula (;) ou barra vertical (|)
 */
export function parseOccurrenceInput(
  rawInput: string,
  clipboardHtml?: string,
  sourceName?: string
): ParseResult {
  const trimmed = (rawInput || '').trim();

  // 1. Se vier HTML rico da área de transferência contendo uma tabela, prioriza o HTML rico
  if (clipboardHtml && /<(table|tr)[\s>]/i.test(clipboardHtml)) {
    const htmlRes = parseOccurrenceHtml(clipboardHtml, sourceName || 'Tabela Colada da Web');
    if (htmlRes.success) return htmlRes;
  }

  if (!trimmed) {
    return {
      success: false,
      errorMessage: 'O campo de dados está vazio. Cole os registros copiados da tabela para continuar.',
    };
  }

  // 2. Se o texto colado for código HTML com tags <table> ou <tr>
  if (/<(table|tr|tbody|thead)[\s>]/i.test(trimmed)) {
    return parseOccurrenceHtml(trimmed, sourceName || 'Código HTML Colado');
  }

  // 3. Detecta o delimitador predominante no texto colado
  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const sampleLines = lines.slice(0, 10);

  const tabCount = sampleLines.reduce((acc, l) => acc + (l.match(/\t/g)?.length || 0), 0);
  const semiCount = sampleLines.reduce((acc, l) => acc + (l.match(/;/g)?.length || 0), 0);
  const pipeCount = sampleLines.reduce((acc, l) => acc + (l.match(/\|/g)?.length || 0), 0);

  if (tabCount >= sampleLines.length) {
    const matrix = parseDelimitedMatrix(trimmed, '\t');
    return buildDatasetFromMatrix(matrix, sourceName || 'Dados Colados (Tabela)', 'tsv');
  }

  if (semiCount >= sampleLines.length * 2) {
    const matrix = parseDelimitedMatrix(trimmed, ';');
    return buildDatasetFromMatrix(matrix, sourceName || 'Dados Colados (CSV)', 'csv');
  }

  if (pipeCount >= sampleLines.length * 2) {
    const matrix = parseDelimitedMatrix(trimmed, '|').map((row) =>
      row.filter((_, idx, arr) => !((idx === 0 || idx === arr.length - 1) && row[idx] === ''))
    );
    return buildDatasetFromMatrix(matrix, sourceName || 'Dados Colados (Texto)', 'csv');
  }

  // Última tentativa com múltiplos espaços (2+ espaços entre colunas)
  const spaceMatrix = lines
    .map((l) => l.trim().split(/\s{2,}/).map((c) => c.trim()))
    .filter((r) => r.length >= 3);

  if (spaceMatrix.length > 0) {
    return buildDatasetFromMatrix(spaceMatrix, sourceName || 'Dados Colados', 'tsv');
  }

  return {
    success: false,
    errorMessage:
      'Formato não reconhecido. Selecione as linhas (ou a tabela inteira) na página de ocorrências, copie com Ctrl+C e cole diretamente no campo acima.',
  };
}

export interface MultiPageInputChunk {
  rawText: string;
  clipboardHtml?: string;
  label?: string;
}

/**
 * Processa múltiplas páginas/blocos colados em um único dataset consolidado,
 * somando todas as ocorrências em um processamento único.
 */
export function parseMultiPageOccurrenceInputs(pages: MultiPageInputChunk[]): ParseResult {
  const nonEmptyPages = pages.filter((p) => p.rawText.trim() || (p.clipboardHtml || '').trim());
  if (nonEmptyPages.length === 0) {
    return {
      success: false,
      errorMessage: 'Nenhum dado foi colado nas páginas. Cole ao menos uma página de ocorrências.',
    };
  }

  if (nonEmptyPages.length === 1) {
    const single = nonEmptyPages[0];
    return parseOccurrenceInput(single.rawText, single.clipboardHtml, single.label || 'Página 1');
  }

  const parsedDatasets: { dataset: OccurrenceDataset; pageLabel: string }[] = [];
  const collectedWarnings: string[] = [];

  for (let i = 0; i < nonEmptyPages.length; i++) {
    const chunk = nonEmptyPages[i];
    const pageLabel = chunk.label || `Página ${i + 1}`;
    const res = parseOccurrenceInput(chunk.rawText, chunk.clipboardHtml, pageLabel);

    if (!res.success || !res.dataset) {
      return {
        success: false,
        errorMessage: `Erro na ${pageLabel}: ${res.errorMessage || 'não foi possível extrair a tabela.'}`,
      };
    }

    parsedDatasets.push({ dataset: res.dataset, pageLabel });
    if (res.warnings && res.warnings.length > 0) {
      res.warnings.forEach((w) => collectedWarnings.push(`${pageLabel}: ${w}`));
    }
  }

  const baseHeaders: ColumnDefinition[] = parsedDatasets[0].dataset.headers.map((h) => ({ ...h }));
  const mergedRows: OccurrenceRow[] = [];

  for (const { dataset } of parsedDatasets) {
    const labelToBaseKey = new Map<string, string>();
    baseHeaders.forEach((bh) => {
      labelToBaseKey.set(bh.label.toUpperCase(), bh.key);
    });

    // Garante eventuais colunas extras que existam apenas em páginas posteriores
    dataset.headers.forEach((dh) => {
      const upper = dh.label.toUpperCase();
      if (!labelToBaseKey.has(upper)) {
        const newKey = `col_${baseHeaders.length}`;
        baseHeaders.push({
          key: newKey,
          label: dh.label,
          visible: dh.visible,
          isStandard: dh.isStandard,
        });
        labelToBaseKey.set(upper, newKey);
      }
    });

    for (const row of dataset.rows) {
      const alignedRow: OccurrenceRow = {};
      baseHeaders.forEach((bh) => {
        alignedRow[bh.key] = '';
      });
      dataset.headers.forEach((dh) => {
        const targetKey = labelToBaseKey.get(dh.label.toUpperCase());
        if (targetKey) {
          alignedRow[targetKey] = row[dh.key] || '';
        }
      });
      mergedRows.push(alignedRow);
    }
  }

  const summaryBreakdown = parsedDatasets
    .map((p) => `${p.pageLabel}: ${p.dataset.rows.length}`)
    .join(' · ');

  return {
    success: true,
    dataset: {
      headers: baseHeaders,
      rows: mergedRows,
      extractedAt: new Date(),
      sourceName: `Multipágina (${parsedDatasets.length} páginas: ${summaryBreakdown})`,
      detectedFormat: parsedDatasets[0].dataset.detectedFormat,
      totalRows: mergedRows.length,
    },
    warnings: collectedWarnings,
  };
}

/**
 * Converte data/hora brasileira (DD/MM/AAAA HH:mm[:ss]) ou ISO (YYYY-MM-DD[T ]HH:mm) em timestamp local
 */
export function parseOccurrenceDateToMs(rawValue: string): number | null {
  const trimmed = (rawValue || '').trim();
  if (!trimmed) return null;

  // Formato DD/MM/YYYY [HH:mm[:ss]]
  const brMatch = trimmed.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:\s*(?:às|-|T)?\s*(\d{2}):(\d{2})(?::(\d{2}))?)?/i
  );
  if (brMatch) {
    const day = Number(brMatch[1]);
    const month = Number(brMatch[2]) - 1;
    const year = Number(brMatch[3]);
    const hour = brMatch[4] ? Number(brMatch[4]) : 0;
    const min = brMatch[5] ? Number(brMatch[5]) : 0;
    const sec = brMatch[6] ? Number(brMatch[6]) : 0;
    const dt = new Date(year, month, day, hour, min, sec, 0);
    return Number.isNaN(dt.getTime()) ? null : dt.getTime();
  }

  // Formato ISO YYYY-MM-DD [HH:mm[:ss]]
  const isoMatch = trimmed.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s]+(\d{2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]) - 1;
    const day = Number(isoMatch[3]);
    const hour = isoMatch[4] ? Number(isoMatch[4]) : 0;
    const min = isoMatch[5] ? Number(isoMatch[5]) : 0;
    const sec = isoMatch[6] ? Number(isoMatch[6]) : 0;
    const dt = new Date(year, month, day, hour, min, sec, 0);
    return Number.isNaN(dt.getTime()) ? null : dt.getTime();
  }

  return null;
}

