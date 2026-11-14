import { ColumnDefinition, OccurrenceRow } from '../types/occurrence';
import {
  NATURE_CATALOG,
  NatureCatalogEntry,
  OccurrenceClassification,
  OccurrenceSummaryReport,
  GroupSummaryRow,
  NatureSummaryRow,
  SubGroupSummaryBlock,
  ProductivitySummaryRow,
  detectNatureCandidates,
} from './natureCatalog';

const PRODUCTIVITY_GROUP = 'PRODUTIVIDADE';

export function isProductivityEntry(entry: NatureCatalogEntry): boolean {
  return entry.group.trim().toUpperCase() === PRODUCTIVITY_GROUP;
}

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
    const operationalCandidates = candidates.filter((c) => !isProductivityEntry(c));
    const productivityEntries = candidates.filter((c) => isProductivityEntry(c));
    const isExclusiveProductivity =
      productivityEntries.length > 0 && operationalCandidates.length === 0;

    // Candidatos que concorrem para a natureza predominante da ocorrência
    const primaryPool =
      operationalCandidates.length > 0 ? operationalCandidates : productivityEntries;

    const overrideId = overrides[rowIndex];
    const overriddenEntry = overrideId
      ? NATURE_CATALOG.find((e) => e.id === overrideId) || null
      : null;

    const hasMultiple = candidates.length > 1;

    if (overriddenEntry) {
      return {
        rowIndex,
        rawText,
        candidates,
        operationalCandidates,
        productivityEntries,
        isExclusiveProductivity,
        selectedEntry: overriddenEntry,
        hasMultipleCandidates: hasMultiple,
        isUnclassified: false,
        isManuallyOverridden: true,
      };
    }

    if (primaryPool.length === 1) {
      return {
        rowIndex,
        rawText,
        candidates,
        operationalCandidates,
        productivityEntries,
        isExclusiveProductivity,
        selectedEntry: primaryPool[0],
        hasMultipleCandidates: false,
        isUnclassified: false,
        isManuallyOverridden: false,
      };
    }

    if (primaryPool.length > 1) {
      return {
        rowIndex,
        rawText,
        candidates,
        operationalCandidates,
        productivityEntries,
        isExclusiveProductivity,
        selectedEntry: primaryPool[0],
        hasMultipleCandidates: true,
        isUnclassified: false,
        isManuallyOverridden: false,
      };
    }

    return {
      rowIndex,
      rawText,
      candidates: [],
      operationalCandidates: [],
      productivityEntries: [],
      isExclusiveProductivity: false,
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
  const groupCounts = new Map<string, { predominant: number; concurrent: number }>();
  const natureCounts = new Map<string, NatureSummaryRow>();
  const productivityCounts = new Map<string, ProductivitySummaryRow>();

  let unclassifiedCount = 0;
  let multiplePendingCount = 0;
  let totalConcurrentNatures = 0;
  let multiNatureOccurrencesCount = 0;

  let productivityTotalCount = 0;
  let productivityExclusiveCount = 0;
  let productivityMixedCount = 0;

  const ensureGroup = (grp: string) => {
    const existing = groupCounts.get(grp);
    if (existing) return existing;
    const created = { predominant: 0, concurrent: 0 };
    groupCounts.set(grp, created);
    return created;
  };

  const ensureNature = (entry: {
    id: string;
    code: string;
    group: string;
    subGroup: string;
    nature: string;
  }) => {
    const existing = natureCounts.get(entry.id);
    if (existing) return existing;
    const created: NatureSummaryRow = {
      id: entry.id,
      code: entry.code,
      group: entry.group,
      subGroup: entry.subGroup,
      nature: entry.nature,
      count: 0,
      percentage: 0,
      concurrentCount: 0,
      concurrentPercentage: 0,
    };
    natureCounts.set(entry.id, created);
    return created;
  };

  for (const item of classifications) {
    if (item.hasMultipleCandidates && !item.isManuallyOverridden) {
      multiplePendingCount++;
    }

    // 1. Contabilização de Produtividade no Quadro à Parte
    if (item.productivityEntries.length > 0) {
      const isMixed = item.operationalCandidates.length > 0;
      for (const prodEntry of item.productivityEntries) {
        productivityTotalCount += 1;
        if (isMixed) {
          productivityMixedCount += 1;
        } else {
          productivityExclusiveCount += 1;
        }

        const existingProd = productivityCounts.get(prodEntry.id);
        if (existingProd) {
          existingProd.totalCount += 1;
          if (isMixed) existingProd.mixedCount += 1;
          else existingProd.exclusiveCount += 1;
        } else {
          productivityCounts.set(prodEntry.id, {
            id: prodEntry.id,
            code: prodEntry.code,
            subGroup: prodEntry.subGroup,
            nature: prodEntry.nature,
            exclusiveCount: isMixed ? 0 : 1,
            mixedCount: isMixed ? 1 : 0,
            totalCount: 1,
            percentage: 0,
          });
        }
      }
    }

    // 2. Contabilização Predominante (1 por atendimento)
    if (item.selectedEntry) {
      const entry = item.selectedEntry;
      ensureGroup(entry.group).predominant += 1;
      ensureNature(entry).count += 1;
    } else {
      unclassifiedCount++;
      const fallbackGroup = 'NÃO CLASSIFICADO';
      const fallbackText = (item.rawText || 'Sem natureza informada').trim();
      const fallbackId = `UNCLASSIFIED__${fallbackText.toUpperCase()}`;

      ensureGroup(fallbackGroup).predominant += 1;
      ensureNature({
        id: fallbackId,
        code: '—',
        group: fallbackGroup,
        subGroup: 'A DEFINIR',
        nature: fallbackText,
      }).count += 1;
    }

    // 3. Contabilização de Todas as Naturezas Atendidas no Quadro Principal (incluindo Produtividade)
    //    - Se houver 2+ naturezas detectadas (operacionais e/ou Produtividade), todas são contabilizadas no quadro analítico.
    //    - Se houver ajuste manual para uma natureza fora das candidatas ou em item único/sem classificação, respeita a escolha manual.
    const isCustomManualReplacement =
      item.isManuallyOverridden &&
      item.selectedEntry &&
      (item.candidates.length <= 1 ||
        !item.candidates.some((c) => c.id === item.selectedEntry!.id));

    const concurrentList: NatureCatalogEntry[] = isCustomManualReplacement
      ? [item.selectedEntry!]
      : item.candidates.length > 0
      ? [...item.candidates]
      : item.selectedEntry
      ? [item.selectedEntry]
      : [];

    if (concurrentList.length > 1) {
      multiNatureOccurrencesCount += 1;
    }

    if (concurrentList.length > 0) {
      for (const cEntry of concurrentList) {
        totalConcurrentNatures += 1;
        ensureGroup(cEntry.group).concurrent += 1;
        ensureNature(cEntry).concurrentCount += 1;
      }
    } else {
      const fallbackGroup = 'NÃO CLASSIFICADO';
      const fallbackText = (item.rawText || 'Sem natureza informada').trim();
      const fallbackId = `UNCLASSIFIED__${fallbackText.toUpperCase()}`;
      totalConcurrentNatures += 1;
      ensureGroup(fallbackGroup).concurrent += 1;
      ensureNature({
        id: fallbackId,
        code: '—',
        group: fallbackGroup,
        subGroup: 'A DEFINIR',
        nature: fallbackText,
      }).concurrentCount += 1;
    }
  }

  const byGroup: GroupSummaryRow[] = Array.from(groupCounts.entries())
    .map(([group, counts]) => ({
      group,
      count: counts.predominant,
      percentage: totalOccurrences > 0 ? (counts.predominant / totalOccurrences) * 100 : 0,
      concurrentCount: counts.concurrent,
      concurrentPercentage:
        totalConcurrentNatures > 0 ? (counts.concurrent / totalConcurrentNatures) * 100 : 0,
    }))
    .sort((a, b) => {
      if (a.group === 'NÃO CLASSIFICADO') return 1;
      if (b.group === 'NÃO CLASSIFICADO') return -1;
      if (b.concurrentCount !== a.concurrentCount) return b.concurrentCount - a.concurrentCount;
      if (b.count !== a.count) return b.count - a.count;
      return a.group.localeCompare(b.group, 'pt-BR');
    });

  const groupOrder = new Map(byGroup.map((g, i) => [g.group, i]));

  const allNaturesWithPct: NatureSummaryRow[] = Array.from(natureCounts.values())
    .filter((n) => n.concurrentCount > 0)
    .map((n) => ({
      ...n,
      percentage: totalOccurrences > 0 ? (n.count / totalOccurrences) * 100 : 0,
      concurrentPercentage:
        totalConcurrentNatures > 0 ? (n.concurrentCount / totalConcurrentNatures) * 100 : 0,
    }));

  // Agrupa por Grupo + Sub-grupo e calcula os subtotais de cada Sub-grupo
  const subGroupMap = new Map<string, SubGroupSummaryBlock>();

  for (const item of allNaturesWithPct) {
    const key = `${item.group}|||${item.subGroup}`;
    const block = subGroupMap.get(key);
    if (block) {
      block.items.push(item);
      block.subtotalCount += item.count;
      block.subtotalConcurrentCount += item.concurrentCount;
    } else {
      subGroupMap.set(key, {
        group: item.group,
        subGroup: item.subGroup,
        items: [item],
        subtotalCount: item.count,
        subtotalPercentage: 0,
        subtotalConcurrentCount: item.concurrentCount,
        subtotalConcurrentPercentage: 0,
      });
    }
  }

  const bySubGroup: SubGroupSummaryBlock[] = Array.from(subGroupMap.values())
    .map((block) => ({
      ...block,
      subtotalPercentage: totalOccurrences > 0 ? (block.subtotalCount / totalOccurrences) * 100 : 0,
      subtotalConcurrentPercentage:
        totalConcurrentNatures > 0
          ? (block.subtotalConcurrentCount / totalConcurrentNatures) * 100
          : 0,
      items: block.items.sort((a, b) => {
        if (b.concurrentCount !== a.concurrentCount) return b.concurrentCount - a.concurrentCount;
        if (b.count !== a.count) return b.count - a.count;
        return a.code.localeCompare(b.code, 'pt-BR');
      }),
    }))
    .sort((a, b) => {
      const gA = groupOrder.get(a.group) ?? 999;
      const gB = groupOrder.get(b.group) ?? 999;
      if (gA !== gB) return gA - gB;
      if (b.subtotalConcurrentCount !== a.subtotalConcurrentCount) {
        return b.subtotalConcurrentCount - a.subtotalConcurrentCount;
      }
      if (b.subtotalCount !== a.subtotalCount) return b.subtotalCount - a.subtotalCount;
      return a.subGroup.localeCompare(b.subGroup, 'pt-BR');
    });

  const byNature: NatureSummaryRow[] = bySubGroup.flatMap((block) => block.items);

  const productivitySummary: ProductivitySummaryRow[] = Array.from(productivityCounts.values())
    .map((p) => ({
      ...p,
      percentage: productivityTotalCount > 0 ? (p.totalCount / productivityTotalCount) * 100 : 0,
    }))
    .sort((a, b) => {
      if (b.totalCount !== a.totalCount) return b.totalCount - a.totalCount;
      return a.code.localeCompare(b.code, 'pt-BR');
    });

  return {
    totalOccurrences,
    totalClassified: totalOccurrences - unclassifiedCount,
    totalConcurrentNatures,
    multiNatureOccurrencesCount,
    byGroup,
    bySubGroup,
    byNature,
    productivitySummary,
    productivityTotalCount,
    productivityExclusiveCount,
    productivityMixedCount,
    unclassifiedCount,
    multiplePendingCount,
  };
}
