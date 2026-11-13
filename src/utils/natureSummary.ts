import { ColumnDefinition, OccurrenceRow } from '../types/occurrence';
import {
  NATURE_CATALOG,
  NatureCatalogEntry,
  OccurrenceClassification,
  OccurrenceSummaryReport,
  GroupSummaryRow,
  NatureSummaryRow,
  detectNatureCandidates,
} from './natureCatalog';

export function findColumnKeyByKeyword(
  headers: ColumnDefinition[],
  keywords: string[]
): string | null {
  const found = headers.find((h) => {
    const upper = h.label.toUpperCase();
    return keywords.some((kw) => upper.includes(kw));
  });
  return found ? found.key : null;
}

export function classifyFilteredRows(
  allRows: OccurrenceRow[],
  filteredRows: OccurrenceRow[],
  headers: ColumnDefinition[],
  overrides: Record<number, string>
): OccurrenceClassification[] {
  const natureColKey = findColumnKeyByKeyword(headers, ['NATUREZA']);

  return filteredRows.map((row, idx) => {
    const originalIdx = allRows.indexOf(row);
    const rowIndex = originalIdx >= 0 ? originalIdx : idx;
    const rawText = natureColKey ? row[natureColKey] || '' : '';

    const candidates = detectNatureCandidates(rawText);
    const overrideId = overrides[rowIndex];
    const overriddenEntry = overrideId
      ? NATURE_CATALOG.find((e) => e.id === overrideId) || null
      : null;

    if (overriddenEntry) {
      return {
        rowIndex,
        rawText,
        candidates,
        selectedEntry: overriddenEntry,
        hasMultipleCandidates: candidates.length > 1,
        isUnclassified: false,
        isManuallyOverridden: true,
      };
    }

    if (candidates.length === 1) {
      return {
        rowIndex,
        rawText,
        candidates,
        selectedEntry: candidates[0],
        hasMultipleCandidates: false,
        isUnclassified: false,
        isManuallyOverridden: false,
      };
    }

    if (candidates.length > 1) {
      // Pré-seleciona a primeira candidata como sugestão inicial, mas sinaliza para revisão
      return {
        rowIndex,
        rawText,
        candidates,
        selectedEntry: candidates[0],
        hasMultipleCandidates: true,
        isUnclassified: false,
        isManuallyOverridden: false,
      };
    }

    return {
      rowIndex,
      rawText,
      candidates: [],
      selectedEntry: null,
      hasMultipleCandidates: false,
      isUnclassified: true,
      isManuallyOverridden: false,
    };
  });
}

export function buildOccurrenceSummary(
  classifications: OccurrenceClassification[]
): OccurrenceSummaryReport {
  const totalOccurrences = classifications.length;
  const groupCounts = new Map<string, number>();
  const natureCounts = new Map<string, NatureSummaryRow>();

  let unclassifiedCount = 0;
  let multiplePendingCount = 0;

  for (const item of classifications) {
    if (item.hasMultipleCandidates && !item.isManuallyOverridden) {
      multiplePendingCount++;
    }

    if (item.selectedEntry) {
      const entry = item.selectedEntry;
      groupCounts.set(entry.group, (groupCounts.get(entry.group) || 0) + 1);

      const existing = natureCounts.get(entry.id);
      if (existing) {
        existing.count += 1;
      } else {
        natureCounts.set(entry.id, {
          id: entry.id,
          code: entry.code,
          group: entry.group,
          subGroup: entry.subGroup,
          nature: entry.nature,
          count: 1,
          percentage: 0,
        });
      }
    } else {
      unclassifiedCount++;
      const fallbackGroup = 'NÃO CLASSIFICADO';
      const fallbackText = (item.rawText || 'Sem natureza informada').trim();
      const fallbackId = `UNCLASSIFIED__${fallbackText.toUpperCase()}`;

      groupCounts.set(fallbackGroup, (groupCounts.get(fallbackGroup) || 0) + 1);

      const existing = natureCounts.get(fallbackId);
      if (existing) {
        existing.count += 1;
      } else {
        natureCounts.set(fallbackId, {
          id: fallbackId,
          code: '—',
          group: fallbackGroup,
          subGroup: 'A DEFINIR',
          nature: fallbackText,
          count: 1,
          percentage: 0,
        });
      }
    }
  }

  const byGroup: GroupSummaryRow[] = Array.from(groupCounts.entries())
    .map(([group, count]) => ({
      group,
      count,
      percentage: totalOccurrences > 0 ? (count / totalOccurrences) * 100 : 0,
    }))
    .sort((a, b) => {
      if (a.group === 'NÃO CLASSIFICADO') return 1;
      if (b.group === 'NÃO CLASSIFICADO') return -1;
      if (b.count !== a.count) return b.count - a.count;
      return a.group.localeCompare(b.group, 'pt-BR');
    });

  const groupOrder = new Map(byGroup.map((g, i) => [g.group, i]));

  const byNature: NatureSummaryRow[] = Array.from(natureCounts.values())
    .map((n) => ({
      ...n,
      percentage: totalOccurrences > 0 ? (n.count / totalOccurrences) * 100 : 0,
    }))
    .sort((a, b) => {
      const gA = groupOrder.get(a.group) ?? 999;
      const gB = groupOrder.get(b.group) ?? 999;
      if (gA !== gB) return gA - gB;
      if (b.count !== a.count) return b.count - a.count;
      return a.code.localeCompare(b.code, 'pt-BR');
    });

  return {
    totalOccurrences,
    totalClassified: totalOccurrences - unclassifiedCount,
    byGroup,
    byNature,
    unclassifiedCount,
    multiplePendingCount,
  };
}
