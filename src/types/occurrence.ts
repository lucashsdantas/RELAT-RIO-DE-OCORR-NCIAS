export interface ColumnDefinition {
  key: string;
  label: string;
  visible: boolean;
  isStandard?: boolean;
}

export type OccurrenceRow = Record<string, string>;

export type ServiceWing = 'A' | 'B' | 'C' | 'D';

export interface LogoOption {
  id: string;
  name: string;
  dataUrl: string;
  isBuiltIn?: boolean;
  sourceUrl?: string;
  addedAt?: string;
}

export interface OccurrenceDataset {
  headers: ColumnDefinition[];
  rows: OccurrenceRow[];
  extractedAt: Date;
  sourceName?: string;
  detectedFormat?: 'html' | 'tsv' | 'csv';
  totalRows: number;
}

export interface ReportConfig {
  title: string;
  subtitle: string;
  department: string;
  serviceWing: ServiceWing;
  startDateTime: string;
  endDateTime: string;
  orientation: 'landscape' | 'portrait';
  selectedLogoId: string;
  logoBase64: string | null;
  showZebra: boolean;
  repeatHeader: boolean;
  compactMode: boolean;
  confidentialityText: string;
  filterStatuses: string[];
  filterOccurrences: string[];
  filterNatures: string[];
  filterMunicipalities: string[];
  filterDateField: 'any' | 'fact' | 'register';
  filterStartDateTime: string;
  filterEndDateTime: string;
  searchQuery: string;
}

export interface ParseResult {
  success: boolean;
  dataset?: OccurrenceDataset;
  errorMessage?: string;
  warnings?: string[];
  tablesFoundCount?: number;
}
