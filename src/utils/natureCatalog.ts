export interface NatureCatalogEntry {
  id: string;
  code: string;
  group: string;
  subGroup: string;
  nature: string;
}

export interface OccurrenceClassification {
  rowIndex: number;
  rawText: string;
  candidates: NatureCatalogEntry[];
  operationalCandidates: NatureCatalogEntry[];
  productivityEntries: NatureCatalogEntry[];
  isExclusiveProductivity: boolean;
  selectedEntry: NatureCatalogEntry | null;
  hasMultipleCandidates: boolean;
  isUnclassified: boolean;
  isManuallyOverridden: boolean;
}

export interface GroupSummaryRow {
  group: string;
  count: number;
  percentage: number;
  concurrentCount: number;
  concurrentPercentage: number;
}

export interface NatureSummaryRow {
  id: string;
  code: string;
  group: string;
  subGroup: string;
  nature: string;
  count: number;
  percentage: number;
  concurrentCount: number;
  concurrentPercentage: number;
}

export interface SubGroupSummaryBlock {
  group: string;
  subGroup: string;
  items: NatureSummaryRow[];
  subtotalCount: number;
  subtotalPercentage: number;
  subtotalConcurrentCount: number;
  subtotalConcurrentPercentage: number;
}

export interface ProductivitySummaryRow {
  id: string;
  code: string;
  subGroup: string;
  nature: string;
  exclusiveCount: number;
  mixedCount: number;
  totalCount: number;
  percentage: number;
}

export interface OccurrenceSummaryReport {
  totalOccurrences: number;
  totalClassified: number;
  totalConcurrentNatures: number;
  multiNatureOccurrencesCount: number;
  byGroup: GroupSummaryRow[];
  bySubGroup: SubGroupSummaryBlock[];
  byNature: NatureSummaryRow[];
  productivitySummary: ProductivitySummaryRow[];
  productivityTotalCount: number;
  productivityExclusiveCount: number;
  productivityMixedCount: number;
  unclassifiedCount: number;
  multiplePendingCount: number;
}

export const NATURE_CATALOG: NatureCatalogEntry[] = [
  {
    "id": "10101__0",
    "code": "10101",
    "group": "ACIDENTES COM VIATURAS",
    "subGroup": "ADM.",
    "nature": "ADMINISTRATIVA"
  },
  {
    "id": "10201__1",
    "code": "10201",
    "group": "ACIDENTES COM VIATURAS",
    "subGroup": "OPERACIONAL",
    "nature": "APOIO (AT, AE, APA, ATC, AG)"
  },
  {
    "id": "10202__2",
    "code": "10202",
    "group": "ACIDENTES COM VIATURAS",
    "subGroup": "OPERACIONAL",
    "nature": "INCÊNDIO"
  },
  {
    "id": "10204__3",
    "code": "10204",
    "group": "ACIDENTES COM VIATURAS",
    "subGroup": "OPERACIONAL",
    "nature": "RESGATE (UR, USA, MOB, AA)"
  },
  {
    "id": "10205__4",
    "code": "10205",
    "group": "ACIDENTES COM VIATURAS",
    "subGroup": "OPERACIONAL",
    "nature": "SALVAMENTO"
  },
  {
    "id": "10206__5",
    "code": "10206",
    "group": "ACIDENTES COM VIATURAS",
    "subGroup": "OPERACIONAL",
    "nature": "EMBARCAÇÃO (MN, BIS, BS. LS)"
  },
  {
    "id": "10207__6",
    "code": "10207",
    "group": "ACIDENTES COM VIATURAS",
    "subGroup": "OPERACIONAL",
    "nature": "MISTA"
  },
  {
    "id": "10203__7",
    "code": "10203",
    "group": "ACIDENTES COM VIATURAS",
    "subGroup": "OPERACIONAL",
    "nature": "AERONAVE"
  },
  {
    "id": "20101__8",
    "code": "20101",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "ABASTECIMENTO COM ÁGUA"
  },
  {
    "id": "20102__9",
    "code": "20102",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "BOMBEIROS MIRINS"
  },
  {
    "id": "20103__10",
    "code": "20103",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "CONDUÇÃO DE ATAÚDE"
  },
  {
    "id": "20104__11",
    "code": "20104",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "DESFILE COM EQUIPES ESPORTIVAS"
  },
  {
    "id": "20105__12",
    "code": "20105",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "DESFILE COM PERSONALIDADES"
  },
  {
    "id": "20106__13",
    "code": "20106",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "ENCHENTE (PROTEÇÃO)"
  },
  {
    "id": "20107__14",
    "code": "20107",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "ESCOAMENTO (PROTEÇÃO)"
  },
  {
    "id": "20108__15",
    "code": "20108",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "FUNERAIS"
  },
  {
    "id": "20109__16",
    "code": "20109",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "IDENTIFICAÇÃO/SINALIZAÇÃO DE ÁREA DE RISCO"
  },
  {
    "id": "20110__17",
    "code": "20110",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "INCLUSÃO SOCIAL"
  },
  {
    "id": "20111__18",
    "code": "20111",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "LIMPEZA DE PISTA"
  },
  {
    "id": "20112__19",
    "code": "20112",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "PARTICIPAÇÃO CÍVICO MILITAR"
  },
  {
    "id": "20113__20",
    "code": "20113",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "REPARO OU COLOCAÇÃO DE OBJETO EM NÍVEL SUPERIOR"
  },
  {
    "id": "20114__21",
    "code": "20114",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "REPLANTIO DE ÁRVORE"
  },
  {
    "id": "20115__22",
    "code": "20115",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "TRANSPORTE DE BENS OU PRODUTOS"
  },
  {
    "id": "20116__23",
    "code": "20116",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "ABASTECIMENTO DE AERONAVE"
  },
  {
    "id": "20117__24",
    "code": "20117",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "BALIZAMENTO DE EMERGÊNCIA"
  },
  {
    "id": "20118__25",
    "code": "20118",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "EMBARQUE/DESEMBARQUE DE PASSAGEIROS"
  },
  {
    "id": "20119__26",
    "code": "20119",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "POSICIONAMENTO PARA INTERVENÇÃO"
  },
  {
    "id": "20120__27",
    "code": "20120",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "ACEIROS / QUEIMADA CONTROLADA"
  },
  {
    "id": "20121__28",
    "code": "20121",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "TREINAMENTO COM CÃES EM MEIO RURAL"
  },
  {
    "id": "20123__29",
    "code": "20123",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "TREINAMENTO COM CÃES OBEDIÊNCIA"
  },
  {
    "id": "20199__30",
    "code": "20199",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "DIVERSAS",
    "nature": "OUTRAS / A.P DIVERSAS"
  },
  {
    "id": "20122__31",
    "code": "20122",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSAS",
    "nature": "TREINAMENTO COM CÃES EM MEIO URBANO"
  },
  {
    "id": "20213__32",
    "code": "20213",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "SOCIALIZAÇÃO COM CÃES"
  },
  {
    "id": "20201__33",
    "code": "20201",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "AQUÁTICA"
  },
  {
    "id": "20202__34",
    "code": "20202",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "TERRESTRE"
  },
  {
    "id": "20203__35",
    "code": "20203",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "AÉREA"
  },
  {
    "id": "20204__36",
    "code": "20204",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "RESGATE"
  },
  {
    "id": "20205__37",
    "code": "20205",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "ACIDENTE DOMÉSTICO"
  },
  {
    "id": "20206__38",
    "code": "20206",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "ACIDENTE DE TRÁFEGO"
  },
  {
    "id": "20207__39",
    "code": "20207",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "ACIDENTE DE TRABALHO"
  },
  {
    "id": "20208__40",
    "code": "20208",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "DESABAMENTO / SOTERRAMENTO"
  },
  {
    "id": "20209__41",
    "code": "20209",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "INCÊNDIO URBANO"
  },
  {
    "id": "20210__42",
    "code": "20210",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "INCÊNDIO FLORESTAL"
  },
  {
    "id": "20211__43",
    "code": "20211",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "FESTAS E EVENTOS"
  },
  {
    "id": "20212__44",
    "code": "20212",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "ACEIRO / QUEIMADA CONTROLADA"
  },
  {
    "id": "20299__45",
    "code": "20299",
    "group": "AÇÕES PREVENTIVAS",
    "subGroup": "COMUNITÁRIAS",
    "nature": "OUTRAS / A.P COMUNITÁRIAS"
  },
  {
    "id": "30503__46",
    "code": "30503",
    "group": "RESGATE",
    "subGroup": "AFOGAMENTO",
    "nature": "PISCINA"
  },
  {
    "id": "30502__47",
    "code": "30502",
    "group": "RESGATE",
    "subGroup": "AFOGAMENTO",
    "nature": "LAGO"
  },
  {
    "id": "30501__48",
    "code": "30501",
    "group": "RESGATE",
    "subGroup": "AFOGAMENTO",
    "nature": "CÓRREGO"
  },
  {
    "id": "30599__49",
    "code": "30599",
    "group": "RESGATE",
    "subGroup": "AFOGAMENTO",
    "nature": "OUTRO"
  },
  {
    "id": "30504__50",
    "code": "30504",
    "group": "RESGATE",
    "subGroup": "AFOGAMENTO",
    "nature": "RIO"
  },
  {
    "id": "30505__51",
    "code": "30505",
    "group": "RESGATE",
    "subGroup": "AFOGAMENTO",
    "nature": "CACHOEIRA"
  },
  {
    "id": "30101__52",
    "code": "30101",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "ATROPELAMENTO"
  },
  {
    "id": "30102__53",
    "code": "30102",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "BICICLETA X BICICLETA"
  },
  {
    "id": "30103__54",
    "code": "30103",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "BICICLETA X OBJETO FIXO"
  },
  {
    "id": "30104__55",
    "code": "30104",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "CAPOTAMENTO/ TOMBAMENTO"
  },
  {
    "id": "30105__56",
    "code": "30105",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "CARRO X BICICLETA"
  },
  {
    "id": "30106__57",
    "code": "30106",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "CARRO X CARRO"
  },
  {
    "id": "30107__58",
    "code": "30107",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "CARRO X MOTO"
  },
  {
    "id": "30108__59",
    "code": "30108",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "CARRO X OBJETO FIXO"
  },
  {
    "id": "30109__60",
    "code": "30109",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "MOTO X BICICLETA"
  },
  {
    "id": "30110__61",
    "code": "30110",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "MOTO X MOTO"
  },
  {
    "id": "30111__62",
    "code": "30111",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "MOTO X OBJETO FIXO"
  },
  {
    "id": "30112__63",
    "code": "30112",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "QUEDA DE BICICLETA"
  },
  {
    "id": "30113__64",
    "code": "30113",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "QUEDA DE MOTO"
  },
  {
    "id": "30114__65",
    "code": "30114",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "VEÍCULO DE GRANDE PORTE X BICICLETA"
  },
  {
    "id": "30115__66",
    "code": "30115",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "VEÍCULO DE GRANDE PORTE X CARRO"
  },
  {
    "id": "30116__67",
    "code": "30116",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "VEÍCULO DE GRANDE PORTE X MOTO"
  },
  {
    "id": "30117__68",
    "code": "30117",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "VEÍCULO DE GRANDE PORTE X OBJETO FIXO"
  },
  {
    "id": "30118__69",
    "code": "30118",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "VEÍCULO DE GRANDE PORTE X VEÍCULO DE GRANDE PORTE"
  },
  {
    "id": "30119__70",
    "code": "30119",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "ANIMAL X BICICLETA"
  },
  {
    "id": "30120__71",
    "code": "30120",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "ANIMAL X CARRO"
  },
  {
    "id": "30121__72",
    "code": "30121",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "ANIMAL X MOTO"
  },
  {
    "id": "30122__73",
    "code": "30122",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "ANIMAL X VEÍCULO DE GRANDE PORTE"
  },
  {
    "id": "30123__74",
    "code": "30123",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "EMBARCAÇÃO"
  },
  {
    "id": "30124__75",
    "code": "30124",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "EMBARCAÇÃO X EMBARCAÇÃO"
  },
  {
    "id": "30125__76",
    "code": "30125",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "QUEDA DE EMBARCAÇÃO"
  },
  {
    "id": "30126__77",
    "code": "30126",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "AERONÁUTICO"
  },
  {
    "id": "30127__78",
    "code": "30127",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "VEÍCULO DE TRAÇÃO ANIMAL X BICICLETA"
  },
  {
    "id": "30128__79",
    "code": "30128",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "VEÍCULO DE TRAÇÃO ANIMAL X CARRO"
  },
  {
    "id": "30129__80",
    "code": "30129",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "VEÍCULO DE TRAÇÃO ANIMAL X MOTO"
  },
  {
    "id": "30130__81",
    "code": "30130",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "VEÍCULO DE TRAÇÃO ANIMAL X VEÍCULO DE GRANDE PORTE"
  },
  {
    "id": "30131__82",
    "code": "30131",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "VEÍCULO DE TRAÇÃO ANIMAL X VEÍCULO DE TRAÇÃO ANIMAL"
  },
  {
    "id": "30132__83",
    "code": "30132",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "VEÍCULO DE TRAÇÃO ANIMAL X OBJETO FIXO"
  },
  {
    "id": "30133__84",
    "code": "30133",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "SAÍDA DE PISTA / COLISÃO MISTERIOSA"
  },
  {
    "id": "30199__85",
    "code": "30199",
    "group": "RESGATE",
    "subGroup": "ACIDENTE DE TRÂNSITO",
    "nature": "OUTROS/ ACIDENTE DE TRÂNSITO"
  },
  {
    "id": "30201__86",
    "code": "30201",
    "group": "RESGATE",
    "subGroup": "ACIDENTE ESPORTIVO",
    "nature": "ARTES MARCIAIS"
  },
  {
    "id": "30202__87",
    "code": "30202",
    "group": "RESGATE",
    "subGroup": "ACIDENTE ESPORTIVO",
    "nature": "ATLETISMO"
  },
  {
    "id": "30203__88",
    "code": "30203",
    "group": "RESGATE",
    "subGroup": "ACIDENTE ESPORTIVO",
    "nature": "BASQUETE"
  },
  {
    "id": "30204__89",
    "code": "30204",
    "group": "RESGATE",
    "subGroup": "ACIDENTE ESPORTIVO",
    "nature": "ESPORTES RADICAIS"
  },
  {
    "id": "30205__90",
    "code": "30205",
    "group": "RESGATE",
    "subGroup": "ACIDENTE ESPORTIVO",
    "nature": "FUTEBOL"
  },
  {
    "id": "30206__91",
    "code": "30206",
    "group": "RESGATE",
    "subGroup": "ACIDENTE ESPORTIVO",
    "nature": "HANDEBOL"
  },
  {
    "id": "30207__92",
    "code": "30207",
    "group": "RESGATE",
    "subGroup": "ACIDENTE ESPORTIVO",
    "nature": "HIPISMO"
  },
  {
    "id": "30208__93",
    "code": "30208",
    "group": "RESGATE",
    "subGroup": "ACIDENTE ESPORTIVO",
    "nature": "NATAÇÃO"
  },
  {
    "id": "30209__94",
    "code": "30209",
    "group": "RESGATE",
    "subGroup": "ACIDENTE ESPORTIVO",
    "nature": "VÔLEI"
  },
  {
    "id": "30299__95",
    "code": "30299",
    "group": "RESGATE",
    "subGroup": "ACIDENTE ESPORTIVO",
    "nature": "OUTROS / ACIDENTE ESPORTIVO"
  },
  {
    "id": "30301__96",
    "code": "30301",
    "group": "RESGATE",
    "subGroup": "AGRESSÃO",
    "nature": "FÍSICA"
  },
  {
    "id": "30302__97",
    "code": "30302",
    "group": "RESGATE",
    "subGroup": "AGRESSÃO",
    "nature": "POR ANIMAL (PICADA, MORDIDA, ETC)"
  },
  {
    "id": "30303__98",
    "code": "30303",
    "group": "RESGATE",
    "subGroup": "AGRESSÃO",
    "nature": "POR ARMA BRANCA"
  },
  {
    "id": "30304__99",
    "code": "30304",
    "group": "RESGATE",
    "subGroup": "AGRESSÃO",
    "nature": "POR ARMA DE FOGO"
  },
  {
    "id": "30305__100",
    "code": "30305",
    "group": "RESGATE",
    "subGroup": "AGRESSÃO",
    "nature": "POR OBJETO"
  },
  {
    "id": "30306__101",
    "code": "30306",
    "group": "RESGATE",
    "subGroup": "AGRESSÃO",
    "nature": "SEXUAL"
  },
  {
    "id": "30307__102",
    "code": "30307",
    "group": "RESGATE",
    "subGroup": "AGRESSÃO",
    "nature": "CEROL"
  },
  {
    "id": "30399__103",
    "code": "30399",
    "group": "RESGATE",
    "subGroup": "AGRESSÃO",
    "nature": "OUTRA / AGRESSÃO"
  },
  {
    "id": "30401__104",
    "code": "30401",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "ACIDENTE VASCULAR CEREBRAL (A.V.C)"
  },
  {
    "id": "30402__105",
    "code": "30402",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "CONVULSÃO"
  },
  {
    "id": "30403__106",
    "code": "30403",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "CRISE HIPERTENSIVA"
  },
  {
    "id": "30404__107",
    "code": "30404",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "DESMAIO (SÍNCOPE)"
  },
  {
    "id": "30405__108",
    "code": "30405",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "DISTÚRBIO MENTAL/PASCIENTE PSIQUIÁTRICO/QBU"
  },
  {
    "id": "30406__109",
    "code": "30406",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "HEMORRAGIA"
  },
  {
    "id": "30407__110",
    "code": "30407",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "OBSTÉTRICO (GRAVIDEZ, ASSISTÊNCIA AO PARTO)"
  },
  {
    "id": "30408__111",
    "code": "30408",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "PARADA CARDIORRESPIRATÓRIA"
  },
  {
    "id": "30409__112",
    "code": "30409",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "PROBLEMAS CARDIACOS"
  },
  {
    "id": "30410__113",
    "code": "30410",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "PROBLEMAS RESPIRATÓRIOS"
  },
  {
    "id": "30411__114",
    "code": "30411",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "PROBLEMAS NO SISTEMA DIGESTIVO"
  },
  {
    "id": "30412__115",
    "code": "30412",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "PROBLEMAS NO SISTEMA URINÁRIO"
  },
  {
    "id": "30413__116",
    "code": "30413",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "DOENÇAS CRÔNICAS DEGENERATIVAS"
  },
  {
    "id": "30414__117",
    "code": "30414",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "PROBLEMAS OSTEOMUSCULARES"
  },
  {
    "id": "30415__118",
    "code": "30415",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "OBSTRUÇÃO DE VIAS AÉREAS / ENGASGAMENTO"
  },
  {
    "id": "30499__119",
    "code": "30499",
    "group": "RESGATE",
    "subGroup": "EMERGÊNCIA CLÍNICA",
    "nature": "OUTRO / EMERGÊNCIA CLÍNICA"
  },
  {
    "id": "30601__120",
    "code": "30601",
    "group": "RESGATE",
    "subGroup": "INTOXICAÇÃO EXÓGENA",
    "nature": "AGROTÓXICOS"
  },
  {
    "id": "30602__121",
    "code": "30602",
    "group": "RESGATE",
    "subGroup": "INTOXICAÇÃO EXÓGENA",
    "nature": "ALCOOL"
  },
  {
    "id": "30603__122",
    "code": "30603",
    "group": "RESGATE",
    "subGroup": "INTOXICAÇÃO EXÓGENA",
    "nature": "DROGAS ILÍCITAS/ENTORPECENTES"
  },
  {
    "id": "30604__123",
    "code": "30604",
    "group": "RESGATE",
    "subGroup": "INTOXICAÇÃO EXÓGENA",
    "nature": "FUMAÇA"
  },
  {
    "id": "30605__124",
    "code": "30605",
    "group": "RESGATE",
    "subGroup": "INTOXICAÇÃO EXÓGENA",
    "nature": "MEDICAMENTOS"
  },
  {
    "id": "30699__125",
    "code": "30699",
    "group": "RESGATE",
    "subGroup": "INTOXICAÇÃO EXÓGENA",
    "nature": "OUTRA / INTOXICAÇÃO EXÓGENA"
  },
  {
    "id": "30701__126",
    "code": "30701",
    "group": "RESGATE",
    "subGroup": "LESÃO TÉRMICA",
    "nature": "CHOQUE ELÉTRICO"
  },
  {
    "id": "30702__127",
    "code": "30702",
    "group": "RESGATE",
    "subGroup": "LESÃO TÉRMICA",
    "nature": "DESCARGA ATMOSFÉRICA"
  },
  {
    "id": "30703__128",
    "code": "30703",
    "group": "RESGATE",
    "subGroup": "LESÃO TÉRMICA",
    "nature": "FOGOS DE ARTIFÍCIO"
  },
  {
    "id": "30704__129",
    "code": "30704",
    "group": "RESGATE",
    "subGroup": "LESÃO TÉRMICA",
    "nature": "TÉRMICA (CALOR, FRIO)"
  },
  {
    "id": "30705__130",
    "code": "30705",
    "group": "RESGATE",
    "subGroup": "LESÃO TÉRMICA",
    "nature": "RADIAÇÃO IONIZANTE"
  },
  {
    "id": "30706__131",
    "code": "30706",
    "group": "RESGATE",
    "subGroup": "LESÃO TÉRMICA",
    "nature": "SUBSTÂNCIAS QUÍMICAS"
  },
  {
    "id": "30799__132",
    "code": "30799",
    "group": "RESGATE",
    "subGroup": "LESÃO TÉRMICA",
    "nature": "OUTRA / LESÃO TÉRMICA"
  },
  {
    "id": "30801__133",
    "code": "30801",
    "group": "RESGATE",
    "subGroup": "QUEDA DE ALTURA",
    "nature": "DA PRÓPRIA ALTURA"
  },
  {
    "id": "30802__134",
    "code": "30802",
    "group": "RESGATE",
    "subGroup": "QUEDA DE ALTURA",
    "nature": "DE ALTURA < 3 METROS"
  },
  {
    "id": "30803__135",
    "code": "30803",
    "group": "RESGATE",
    "subGroup": "QUEDA DE ALTURA",
    "nature": "DE ALTURA > 3 METROS"
  },
  {
    "id": "30901__136",
    "code": "30901",
    "group": "RESGATE",
    "subGroup": "TENTATIVA DE AUTO-EXTERMÍNIO",
    "nature": "ALTURA"
  },
  {
    "id": "30902__137",
    "code": "30902",
    "group": "RESGATE",
    "subGroup": "TENTATIVA DE AUTO-EXTERMÍNIO",
    "nature": "ENFORCAMENTO"
  },
  {
    "id": "30903__138",
    "code": "30903",
    "group": "RESGATE",
    "subGroup": "TENTATIVA DE AUTO-EXTERMÍNIO",
    "nature": "ENVENENAMENTO"
  },
  {
    "id": "30904__139",
    "code": "30904",
    "group": "RESGATE",
    "subGroup": "TENTATIVA DE AUTO-EXTERMÍNIO",
    "nature": "POR ARMA BRANCA"
  },
  {
    "id": "30905__140",
    "code": "30905",
    "group": "RESGATE",
    "subGroup": "TENTATIVA DE AUTO-EXTERMÍNIO",
    "nature": "POR ARMA DE FOGO"
  },
  {
    "id": "30999__141",
    "code": "30999",
    "group": "RESGATE",
    "subGroup": "TENTATIVA DE AUTO-EXTERMÍNIO",
    "nature": "OUTRA / TENTATIVA DE AUTO - EXTERMÍNIO"
  },
  {
    "id": "31001__142",
    "code": "31001",
    "group": "RESGATE",
    "subGroup": "TRANSPORTE",
    "nature": "DE PACIENTE OBESO"
  },
  {
    "id": "31002__143",
    "code": "31002",
    "group": "RESGATE",
    "subGroup": "TRANSPORTE",
    "nature": "DE RECÉM NASCIDO"
  },
  {
    "id": "31003__144",
    "code": "31003",
    "group": "RESGATE",
    "subGroup": "TRANSPORTE",
    "nature": "HOSPITAL X RESIDÊNCIA (CIVIL)"
  },
  {
    "id": "31004__145",
    "code": "31004",
    "group": "RESGATE",
    "subGroup": "TRANSPORTE",
    "nature": "HOSPITAL X RESIDÊNCIA (MILITAR)"
  },
  {
    "id": "31005__146",
    "code": "31005",
    "group": "RESGATE",
    "subGroup": "TRANSPORTE",
    "nature": "INTRA HOSPITALAR (CIVIL)"
  },
  {
    "id": "31006__147",
    "code": "31006",
    "group": "RESGATE",
    "subGroup": "TRANSPORTE",
    "nature": "INTRA HOSPITALAR (MILITAR)"
  },
  {
    "id": "31099__148",
    "code": "31099",
    "group": "RESGATE",
    "subGroup": "TRANSPORTE",
    "nature": "OUTRO / TRANSPORTE"
  },
  {
    "id": "31101__149",
    "code": "31101",
    "group": "RESGATE",
    "subGroup": "ACIDENTES PESSOAIS",
    "nature": "UTENSÍLIOS"
  },
  {
    "id": "31102__150",
    "code": "31102",
    "group": "RESGATE",
    "subGroup": "ACIDENTES PESSOAIS",
    "nature": "MAQUINAS"
  },
  {
    "id": "31103__151",
    "code": "31103",
    "group": "RESGATE",
    "subGroup": "ACIDENTES PESSOAIS",
    "nature": "FERRAMENTAS"
  },
  {
    "id": "31104__152",
    "code": "31104",
    "group": "RESGATE",
    "subGroup": "ACIDENTES PESSOAIS",
    "nature": "ANEL / SIMILAR"
  },
  {
    "id": "31199__153",
    "code": "31199",
    "group": "RESGATE",
    "subGroup": "ACIDENTES PESSOAIS",
    "nature": "OBJETOS DIVERSOS"
  },
  {
    "id": "31201__154",
    "code": "31201",
    "group": "RESGATE",
    "subGroup": "ACIDENTES DIVERSOS",
    "nature": "SOTERRAMENTO/DESABAMENTO"
  },
  {
    "id": "31202__155",
    "code": "31202",
    "group": "RESGATE",
    "subGroup": "ACIDENTES DIVERSOS",
    "nature": "AFOGAMENTO"
  },
  {
    "id": "31203__156",
    "code": "31203",
    "group": "RESGATE",
    "subGroup": "ACIDENTES DIVERSOS",
    "nature": "ENGOLFAMENTO"
  },
  {
    "id": "31204__157",
    "code": "31204",
    "group": "RESGATE",
    "subGroup": "ACIDENTES DIVERSOS",
    "nature": "QUEDA DE ESTRUTURA / OBJETO DIVERSO"
  },
  {
    "id": "31299__158",
    "code": "31299",
    "group": "RESGATE",
    "subGroup": "ACIDENTES DIVERSOS",
    "nature": "OUTRO/ACIDENTES DIVERSOS"
  },
  {
    "id": "40101__159",
    "code": "40101",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "ANIMAIS",
    "nature": "ABELHA/MARIMBONDO/SIMILAR"
  },
  {
    "id": "40102__160",
    "code": "40102",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "ANIMAIS",
    "nature": "BOVINO"
  },
  {
    "id": "40103__161",
    "code": "40103",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "ANIMAIS",
    "nature": "DOMÉSTICO"
  },
  {
    "id": "40104__162",
    "code": "40104",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "ANIMAIS",
    "nature": "EQÜINO"
  },
  {
    "id": "40105__163",
    "code": "40105",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "ANIMAIS",
    "nature": "SILVESTRE"
  },
  {
    "id": "40106__164",
    "code": "40106",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "ANIMAIS",
    "nature": "CAPRINO"
  },
  {
    "id": "40199__165",
    "code": "40199",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "ANIMAIS",
    "nature": "OUTROS / ANIMAIS"
  },
  {
    "id": "40201__166",
    "code": "40201",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "BENS",
    "nature": "RESGATE DE VEÍCULO SUBMERSO"
  },
  {
    "id": "40202__167",
    "code": "40202",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "BENS",
    "nature": "RESGATE DE BENS (RIO/ LAGO/ REPRESA/ ETC.)"
  },
  {
    "id": "40203__168",
    "code": "40203",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "BENS",
    "nature": "RESGATE DE BENS EM LOCAIS DIVERSOS"
  },
  {
    "id": "40204__169",
    "code": "40204",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "BENS",
    "nature": "RESGATE DE EMBARCAÇÃO/ MOTOR DE POPA"
  },
  {
    "id": "40299__170",
    "code": "40299",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "BENS",
    "nature": "OUTROS / BENS"
  },
  {
    "id": "40301__171",
    "code": "40301",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "PESSOAS",
    "nature": "ACIDENTE COM MÁQUINAS E EQUIPAMENTOS"
  },
  {
    "id": "40302__172",
    "code": "40302",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "PESSOAS",
    "nature": "COM RISCO DE VIDA EM LOCAL DIVERSO"
  },
  {
    "id": "40303__173",
    "code": "40303",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "PESSOAS",
    "nature": "DESAPARECIDA - BUSCA"
  },
  {
    "id": "40304__174",
    "code": "40304",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "PESSOAS",
    "nature": "EM ELEVADOR"
  },
  {
    "id": "40305__175",
    "code": "40305",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "PESSOAS",
    "nature": "EM POÇO/ CISTERNA"
  },
  {
    "id": "40306__176",
    "code": "40306",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "PESSOAS",
    "nature": "EM SOTERRAMENTO/ DESABAMENTO/ DESMORONAMENTO"
  },
  {
    "id": "40307__177",
    "code": "40307",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "PESSOAS",
    "nature": "PRESAS EM FERRAGENS VEÍCULOS"
  },
  {
    "id": "40308__178",
    "code": "40308",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "PESSOAS",
    "nature": "RETIRADA DE ANEL / SIMILAR"
  },
  {
    "id": "40309__179",
    "code": "40309",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "PESSOAS",
    "nature": "CONTENÇÃO FORÇADA / ABORDAGEM FÍSICA"
  },
  {
    "id": "40399__180",
    "code": "40399",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "PESSOAS",
    "nature": "OUTRAS / PESSOAS"
  },
  {
    "id": "40401__181",
    "code": "40401",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "ACIDENTE AERONÁUTICO"
  },
  {
    "id": "40402__182",
    "code": "40402",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "ACIDENTE COM EMBARCAÇÕES"
  },
  {
    "id": "40403__183",
    "code": "40403",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "ACIDENTE FERROVIÁRIO"
  },
  {
    "id": "40404__184",
    "code": "40404",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "ACIDENTE RODOVIÁRIO"
  },
  {
    "id": "40405__185",
    "code": "40405",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "AÇÕES DE ESGOTAMENTO"
  },
  {
    "id": "40406__186",
    "code": "40406",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "ALAGAMENTO"
  },
  {
    "id": "40407__187",
    "code": "40407",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "ANIMAL RAIVOSO OU AGRESSIVO"
  },
  {
    "id": "40408__188",
    "code": "40408",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "AUXÍLIO A EMBARCAÇÕES"
  },
  {
    "id": "40409__189",
    "code": "40409",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "DESOBSTRUÇÃO DE VIA PÚBLICA"
  },
  {
    "id": "40410__190",
    "code": "40410",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "EDIFICAÇÃO COM RISCO DE DESABAMENTO"
  },
  {
    "id": "40411__191",
    "code": "40411",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "EVENTOS ENVOLVENDO ÁRVORES"
  },
  {
    "id": "40412__192",
    "code": "40412",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "ENCHENTE/INUNDAÇÃO"
  },
  {
    "id": "40499__193",
    "code": "40499",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "DIVERSOS",
    "nature": "OUTROS / B.S DIVERSOS"
  },
  {
    "id": "40501__194",
    "code": "40501",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "CADÁVER",
    "nature": "LOCALIZAÇÃO E REMOÇÃO DE CADÁVER"
  },
  {
    "id": "40502__195",
    "code": "40502",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "CADÁVER",
    "nature": "EM MEIO LIQUIDO"
  },
  {
    "id": "40503__196",
    "code": "40503",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "CADÁVER",
    "nature": "EM POÇO/ CISTERNA /SIMILAR"
  },
  {
    "id": "40599__197",
    "code": "40599",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "CADÁVER",
    "nature": "EM LOCAIS DIVERSOS"
  },
  {
    "id": "40506__198",
    "code": "40506",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "CADÁVER",
    "nature": "COM CÃES EM MEIO LIQUIDO"
  },
  {
    "id": "40509__199",
    "code": "40509",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "CADÁVER",
    "nature": "EM PISCINA"
  },
  {
    "id": "40508__200",
    "code": "40508",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "CADÁVER",
    "nature": "EM LAGO"
  },
  {
    "id": "40505__201",
    "code": "40505",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "CADÁVER",
    "nature": "COM CÃES EM MATAS E SIMILARES"
  },
  {
    "id": "40510__202",
    "code": "40510",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "CADÁVER",
    "nature": "EM RIO"
  },
  {
    "id": "40511__203",
    "code": "40511",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "CADÁVER",
    "nature": "EM CACHOEIRA"
  },
  {
    "id": "40507__204",
    "code": "40507",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "CADÁVER",
    "nature": "EM CÓRREGO"
  },
  {
    "id": "40504__205",
    "code": "40504",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "CADÁVER",
    "nature": "COM CÃES EM SOTERRAMENTO/DESABAMENTO/DESMORONAMENTO"
  },
  {
    "id": "40311__206",
    "code": "40311",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "PESSOAS",
    "nature": "COM CÂES EM MATAS E SIMILARES"
  },
  {
    "id": "40310__207",
    "code": "40310",
    "group": "BUSCA E SALVAMENTO",
    "subGroup": "PESSOAS",
    "nature": "COM CÃES EM SOTERRAMENTO/DESABAMENTO/DESMORONAMENTO"
  },
  {
    "id": "50000__208",
    "code": "50000",
    "group": "DEFESA CIVIL",
    "subGroup": "DEFESA CIVIL",
    "nature": "DEFESA CIVIL"
  },
  {
    "id": "5.1.3.2.1.2__209",
    "code": "5.1.3.2.1.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "METEOROLÓGICO/TEMPESTADES/TEMPESTADE LOCAL/CONVECTIVA/TEMPESTADE DE RAIOS"
  },
  {
    "id": "5.1.3.2.1.3__210",
    "code": "5.1.3.2.1.3",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "METEOROLÓGICO/TEMPESTADES/TEMPESTADE LOCAL/CONVECTIVA/GRANIZO"
  },
  {
    "id": "5.1.3.2.1.4__211",
    "code": "5.1.3.2.1.4",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "METEOROLÓGICO/TEMPESTADES/TEMPESTADE LOCAL/CONVECTIVA/CHUVAS INTENSAS"
  },
  {
    "id": "5.1.3.2.1.5__212",
    "code": "5.1.3.2.1.5",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "METEOROLÓGICO/TEMPESTADES/TEMPESTADE LOCAL/CONVECTIVA/VENDAVAL"
  },
  {
    "id": "5.1.3.3.1__213",
    "code": "5.1.3.3.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "METEOROLÓGICO/TEMPERATURAS EXTREMAS/ONDA DE CALOR"
  },
  {
    "id": "5.1.3.3.2.1__214",
    "code": "5.1.3.3.2.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "METEOROLÓGICO/TEMPERATURAS EXTREMAS/ONDA DE FRIO/FRIAGEM"
  },
  {
    "id": "5.1.3.3.2.2__215",
    "code": "5.1.3.3.2.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "METEOROLÓGICO/TEMPERATURAS EXTREMAS/ONDA DE FRIO/GEADAS"
  },
  {
    "id": "5.1.1.3.1.4__216",
    "code": "5.1.1.3.1.4",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/MOVIMENTO DE MASSA/QUEDAS, TOMBAMENTOS E ROLAMENTOS/LAJES"
  },
  {
    "id": "5.1.4.1.3.1__217",
    "code": "5.1.4.1.3.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "CLIMATOLÓGICO/SECA/INCÊNDIO FLORESTAL/INCÊNDIOS EM PARQUES, ÁREAS DE PROTEÇÃO AMBIENTAL E ÁREAS DE PRESERVAÇÃO PERMANENTE NACIONAIS, ESTADUAIS OU MUNICIPAIS"
  },
  {
    "id": "5.1.4.1.3.2__218",
    "code": "5.1.4.1.3.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "CLIMATOLÓGICO/SECA/INCÊNDIO FLORESTAL/INCÊNDIOS EM ÁREAS NÃO PROTEGIDAS, COM REFLEXOS NA QUALIDADE DO AR"
  },
  {
    "id": "5.1.2.1__219",
    "code": "5.1.2.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "HIDROLÓGICO/INUNDAÇÕES"
  },
  {
    "id": "5.1.2.2__220",
    "code": "5.1.2.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "HIDROLÓGICO/ENXURRADAS"
  },
  {
    "id": "5.1.2.3__221",
    "code": "5.1.2.3",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "HIDROLÓGICO/ALAGAMENTOS"
  },
  {
    "id": "5.1.1.3.2.1__222",
    "code": "5.1.1.3.2.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/MOVIMENTO DE MASSA/DESLIZAMENTOS/DESLIZAMENTOS DE SOLO E/OU ROCHA"
  },
  {
    "id": "5.1.1.3.4__223",
    "code": "5.1.1.3.4",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/MOVIMENTO DE MASSA/SUBSIDÊNCIAS E COLAPSOS"
  },
  {
    "id": "5.1.1.4.1__224",
    "code": "5.1.1.4.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/EROSÃO/COSTEIRA/MARINHA"
  },
  {
    "id": "5.1.1.4.2__225",
    "code": "5.1.1.4.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/EROSÃO/EROSÃO DE MARGEM FLUVIAL"
  },
  {
    "id": "5.1.1.3.1.2__226",
    "code": "5.1.1.3.1.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/MOVIMENTO DE MASSA/QUEDAS, TOMBAMENTOS E ROLAMENTOS/LASCAS"
  },
  {
    "id": "5.1.1.3.3.1__227",
    "code": "5.1.1.3.3.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/MOVIMENTO DE MASSA/CORRIDAS DE MASSA/SOLO/LAMA"
  },
  {
    "id": "5.1.1.4.3.2__228",
    "code": "5.1.1.4.3.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/EROSÃO/EROSÃO CONTINENTAL/RAVINAS"
  },
  {
    "id": "5.1.3.2.1.1__229",
    "code": "5.1.3.2.1.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "METEOROLÓGICO/TEMPESTADES/TEMPESTADE LOCAL/CONVECTIVA/TORNADOS"
  },
  {
    "id": "5.1.1.3.1.1__230",
    "code": "5.1.1.3.1.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/MOVIMENTO DE MASSA/QUEDAS, TOMBAMENTOS E ROLAMENTOS/BLOCOS"
  },
  {
    "id": "5.1.1.4.3.1__231",
    "code": "5.1.1.4.3.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/EROSÃO/EROSÃO CONTINENTAL/LAMINAR"
  },
  {
    "id": "5.1.4.1.4__232",
    "code": "5.1.4.1.4",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "CLIMATOLÓGICO/SECA/BAIXA UMIDADE DO AR"
  },
  {
    "id": "5.1.1.4.3.3__233",
    "code": "5.1.1.4.3.3",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/EROSÃO/EROSÃO CONTINENTAL/VOÇOROCAS"
  },
  {
    "id": "5.1.4.1.1__234",
    "code": "5.1.4.1.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "CLIMATOLÓGICO/SECA/ESTIAGEM"
  },
  {
    "id": "5.1.4.1.2__235",
    "code": "5.1.4.1.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "CLIMATOLÓGICO/SECA/SECA"
  },
  {
    "id": "5.1.5.1.1__236",
    "code": "5.1.5.1.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "BIOLÓGICO/EPIDEMIAS/DOENÇAS INFECCIOSAS VIRAIS"
  },
  {
    "id": "5.1.5.1.2__237",
    "code": "5.1.5.1.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "BIOLÓGICO/EPIDEMIAS/DOENÇAS INFECCIOSAS BACTERIANAS"
  },
  {
    "id": "5.1.5.1.3__238",
    "code": "5.1.5.1.3",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "BIOLÓGICO/EPIDEMIAS/DOENÇAS INFECCIOSAS PARASÍTICAS"
  },
  {
    "id": "5.1.5.1.4__239",
    "code": "5.1.5.1.4",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "BIOLÓGICO/EPIDEMIAS/DOENÇAS INFECCIOSAS FÚNGICAS"
  },
  {
    "id": "5.1.1.3.1.3__240",
    "code": "5.1.1.3.1.3",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/MOVIMENTO DE MASSA/QUEDAS, TOMBAMENTOS E ROLAMENTOS/MATACÕES"
  },
  {
    "id": "5.1.1.1.1__241",
    "code": "5.1.1.1.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/TERREMOTO/TREMOR DE TERRA"
  },
  {
    "id": "5.1.1.1.2__242",
    "code": "5.1.1.1.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/TERREMOTO/TSUNAMI"
  },
  {
    "id": "5.1.1.2__243",
    "code": "5.1.1.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/EMANAÇÃO VULCÂNICA"
  },
  {
    "id": "5.1.3.1.1.1__244",
    "code": "5.1.3.1.1.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "METEOROLÓGICO/SISTEMAS DE GRANDE ESCALA/ESCALA REGIONAL/CICLONES/VENTOS COSTEIROS (MOBILIDADE DE DUNAS)"
  },
  {
    "id": "5.1.3.1.1.2__245",
    "code": "5.1.3.1.1.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "METEOROLÓGICO/SISTEMAS DE GRANDE ESCALA/ESCALA REGIONAL/CICLONES/MARÉS DE TEMPESTADE (RESSACAS)"
  },
  {
    "id": "5.1.3.1.2__246",
    "code": "5.1.3.1.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "METEOROLÓGICO/SISTEMAS DE GRANDE ESCALA/ESCALA REGIONAL/FRENTES FRIAS/ZONAS DE CONVERGÊNCIA"
  },
  {
    "id": "5.1.5.2.1__247",
    "code": "5.1.5.2.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "BIOLÓGICO/INFESTAÇÕES/PRAGAS/INFESTAÇÕES DE ANIMAIS"
  },
  {
    "id": "5.1.5.2.2.1__248",
    "code": "5.1.5.2.2.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "BIOLÓGICO/INFESTAÇÕES/PRAGAS/INFESTAÇÕES DE ALGAS/MARÉS VERMELHAS"
  },
  {
    "id": "5.1.5.2.2.2__249",
    "code": "5.1.5.2.2.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "BIOLÓGICO/INFESTAÇÕES/PRAGAS/INFESTAÇÕES DE ALGAS/CIANO BACTÉRIAS EM RESERVATÓRIOS"
  },
  {
    "id": "5.1.5.2.3__250",
    "code": "5.1.5.2.3",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "BIOLÓGICO/INFESTAÇÕES/PRAGAS/OUTRAS INFESTAÇÕES"
  },
  {
    "id": "5.1.1.3.3.2__251",
    "code": "5.1.1.3.3.2",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "GEOLÓGICO/MOVIMENTO DE MASSA/CORRIDAS DE MASSA/ROCHA/DETRITO"
  },
  {
    "id": "5.2.3.1.1__252",
    "code": "5.2.3.1.1",
    "group": "DEFESA CIVIL",
    "subGroup": "NATURAIS",
    "nature": "DESASTRES RELACIONADOS A INCÊNDIOS URBANOS/INCÊNDIOS URBANOS/INCÊNDIOS EM PLANTAS E DISTRITOS INDUSTRIAIS, PARQUES E DEPÓSITOS"
  },
  {
    "id": "5.2.1.1.1__253",
    "code": "5.2.1.1.1",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A SUBSTÂNCIAS RADIOATIVAS/DESATRES SIDERAIS COM RISCOS RADIOATIVOS/QUEDA DE SATÉLITE (RADIONUCLÍDEOS)"
  },
  {
    "id": "5.2.4.1__254",
    "code": "5.2.4.1",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A OBRAS CIVIS/COLAPSO DE EDIFICAÇÕES"
  },
  {
    "id": "5.2.1.2.1__255",
    "code": "5.2.1.2.1",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A SUBSTÂNCIAS RADIOATIVAS/DESATRES COM SUBSTÂNCIAS E EQUIPAMENTOS RADIOATIVOS DE USO EM PESQUISAS, INDÚSTRIAS E USINAS NUCLEARES/FONTES RADIOATIVAS EM PROCESSOS DE PRODUÇÃO"
  },
  {
    "id": "5.2.4.2__256",
    "code": "5.2.4.2",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A OBRAS CIVIS/ROMPIMENTO/COLAPSO DE BARRAGENS"
  },
  {
    "id": "5.2.2.4.1__257",
    "code": "5.2.2.4.1",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A PRODUTOS PERIGOSOS/DESASTRES RELACIONADOS A TRANSPORTE DE PRODUTOS PERIGOSOS/TRANSPORTE RODOVIÁRIO"
  },
  {
    "id": "5.2.2.4.2__258",
    "code": "5.2.2.4.2",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A PRODUTOS PERIGOSOS/DESASTRES RELACIONADOS A TRANSPORTE DE PRODUTOS PERIGOSOS/TRANSPORTE FERROVIÁRIO"
  },
  {
    "id": "5.2.2.4.3__259",
    "code": "5.2.2.4.3",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A PRODUTOS PERIGOSOS/DESASTRES RELACIONADOS A TRANSPORTE DE PRODUTOS PERIGOSOS/TRANSPORTE AÉREO"
  },
  {
    "id": "5.2.2.4.4__260",
    "code": "5.2.2.4.4",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A PRODUTOS PERIGOSOS/DESASTRES RELACIONADOS A TRANSPORTE DE PRODUTOS PERIGOSOS/TRANSPORTE DUTOVIÁRIO"
  },
  {
    "id": "5.2.2.4.5__261",
    "code": "5.2.2.4.5",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A PRODUTOS PERIGOSOS/DESASTRES RELACIONADOS A TRANSPORTE DE PRODUTOS PERIGOSOS/TRANSPORTE MARÍTIMO"
  },
  {
    "id": "5.2.2.4.6__262",
    "code": "5.2.2.4.6",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A PRODUTOS PERIGOSOS/DESASTRES RELACIONADOS A TRANSPORTE DE PRODUTOS PERIGOSOS/TRANSPORTE AQUAVIÁRIO"
  },
  {
    "id": "5.2.3.1.2__263",
    "code": "5.2.3.1.2",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A INCÊNDIOS URBANOS/INCÊNDIOS URBANOS/INCÊNDIOS EM AGLOMERADOS RESIDENCIAIS"
  },
  {
    "id": "5.2.2.3.1__264",
    "code": "5.2.2.3.1",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A PRODUTOS PERIGOSOS/DESASTRES RELACIONADOS A CONFLITOS BÉLICOS/LIBERAÇÃO DE PRODUTOS QUÍMICOS E CONTAMINAÇÃO COMO CONSEQUÊNCIA DE AÇÕES MILITARES"
  },
  {
    "id": "5.2.2.2.2__265",
    "code": "5.2.2.2.2",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A PRODUTOS PERIGOSOS/DESASTRES RELACIONADOS À CONTAMINAÇÃO DA ÁGUA/DERRAMAMENTO DE PRODUTOS QUÍMICOS EM AMBIENTE LACUSTRE, FLUVIAL, MARINHO E AQUÍFEROS"
  },
  {
    "id": "5.2.2.2.1__266",
    "code": "5.2.2.2.1",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A PRODUTOS PERIGOSOS/DESASTRES RELACIONADOS À CONTAMINAÇÃO DA ÁGUA/LIBERAÇÃO DE PRODUTOS QUÍMICOS NOS SISTEMAS DE ÁGUA POTÁVEL"
  },
  {
    "id": "5.2.2.1.1__267",
    "code": "5.2.2.1.1",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "DESASTRES RELACIONADOS A PRODUTOS PERIGOSOS/DESASTRES EM PLANTAS E DISTRITOS INDUSTRIAIS, PARQUES E ARMAZENAMENTOS COM EXTRAVASAMENTO DE PRODUTOS PERIGOSOS/LIBERAÇÃO DE PRODUTOS QUÍMICOS PARA A ATMOSFERA CAUSADA POR EXPLOSÃO OU INCÊNDIO"
  },
  {
    "id": "5.3.1.1__268",
    "code": "5.3.1.1",
    "group": "DEFESA CIVIL",
    "subGroup": "TECNOLÓGICOS",
    "nature": "INSTITUCIONAIS/OPERAÇÕES CBM-GO/GOIÁS CONTRA O AEDES"
  },
  {
    "id": "5.3.1.2__269",
    "code": "5.3.1.2",
    "group": "DEFESA CIVIL",
    "subGroup": "INSTITUCIONAIS",
    "nature": "INSTITUCIONAIS/OPERAÇÕES CBM-GO/CAPACITAR PARA SALVAR"
  },
  {
    "id": "5.3.1.3.2__270",
    "code": "5.3.1.3.2",
    "group": "DEFESA CIVIL",
    "subGroup": "INSTITUCIONAIS",
    "nature": "INSTITUCIONAIS/OPERAÇÕES CBM-GO/ENXENTES E ALAGAMENTOS/LEVANTAMENTO DE PONTOS DE RISCO"
  },
  {
    "id": "5.3.1.3.1__271",
    "code": "5.3.1.3.1",
    "group": "DEFESA CIVIL",
    "subGroup": "INSTITUCIONAIS",
    "nature": "INSTITUCIONAIS/OPERAÇÕES CBM-GO/ENXENTES E ALAGAMENTOS/LEVANTAMENTO DE ÁREA DE RISCO"
  },
  {
    "id": "60101__272",
    "code": "60101",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Academia de ginástica ou de dança ou similar"
  },
  {
    "id": "60102__273",
    "code": "60102",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Auditório ou similar"
  },
  {
    "id": "60103__274",
    "code": "60103",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Autódromo ou similar"
  },
  {
    "id": "60104__275",
    "code": "60104",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Bar, lanchonete ou similar"
  },
  {
    "id": "60105__276",
    "code": "60105",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Biblioteca"
  },
  {
    "id": "60106__277",
    "code": "60106",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Boate, casa noturna ou similar"
  },
  {
    "id": "60107__278",
    "code": "60107",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Centro de convenções ou de exposições, feira ou similar"
  },
  {
    "id": "60108__279",
    "code": "60108",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Cinema"
  },
  {
    "id": "60109__280",
    "code": "60109",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Circo, parque de diversões ou similar"
  },
  {
    "id": "60110__281",
    "code": "60110",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Clube, salão de festas ou similar"
  },
  {
    "id": "60111__282",
    "code": "60111",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Estádio/Campo"
  },
  {
    "id": "60112__283",
    "code": "60112",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Galeria de exposições ou similar"
  },
  {
    "id": "60113__284",
    "code": "60113",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Ginásio de esportes"
  },
  {
    "id": "60114__285",
    "code": "60114",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Igreja, templo ou similar"
  },
  {
    "id": "60115__286",
    "code": "60115",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Museu"
  },
  {
    "id": "60116__287",
    "code": "60116",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Playground"
  },
  {
    "id": "60117__288",
    "code": "60117",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Restaurante"
  },
  {
    "id": "60118__289",
    "code": "60118",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Shopping ou similar"
  },
  {
    "id": "60119__290",
    "code": "60119",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Teatro"
  },
  {
    "id": "60120__291",
    "code": "60120",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "Terminal de passageiros"
  },
  {
    "id": "60199__292",
    "code": "60199",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Concentração de público",
    "nature": "OUTRO / CONCENTRAÇÃO DE PÚBLICO"
  },
  {
    "id": "60201__293",
    "code": "60201",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Açougue, frigorífico, matadouro ou similar"
  },
  {
    "id": "60202__294",
    "code": "60202",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Agência bancária"
  },
  {
    "id": "60203__295",
    "code": "60203",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Agência de câmbio ou similar"
  },
  {
    "id": "60204__296",
    "code": "60204",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Agência de emprego ou similar"
  },
  {
    "id": "60205__297",
    "code": "60205",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Agência de veículo"
  },
  {
    "id": "60206__298",
    "code": "60206",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Agência de viagem, turismo ou similar"
  },
  {
    "id": "60207__299",
    "code": "60207",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Alfaiataria"
  },
  {
    "id": "60208__300",
    "code": "60208",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Barbearia, salão de beleza ou similar"
  },
  {
    "id": "60209__301",
    "code": "60209",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Cartório"
  },
  {
    "id": "60210__302",
    "code": "60210",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Casa lotérica"
  },
  {
    "id": "60211__303",
    "code": "60211",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Copiadora, reprografia ou similar"
  },
  {
    "id": "60212__304",
    "code": "60212",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Empresa de segurança ou similar"
  },
  {
    "id": "60213__305",
    "code": "60213",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Empresa de transporte de passageiro ou de carga"
  },
  {
    "id": "60214__306",
    "code": "60214",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Empresa importadora ou exportadora"
  },
  {
    "id": "60215__307",
    "code": "60215",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Escritório"
  },
  {
    "id": "60216__308",
    "code": "60216",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Farmácia, perfumaria ou similar"
  },
  {
    "id": "60217__309",
    "code": "60217",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Funerária"
  },
  {
    "id": "60218__310",
    "code": "60218",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Livraria, papelaria ou similar"
  },
  {
    "id": "60219__311",
    "code": "60219",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Loja de departamentos/mercado"
  },
  {
    "id": "60220__312",
    "code": "60220",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Padaria ou similar"
  },
  {
    "id": "60221__313",
    "code": "60221",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Posto de combustível"
  },
  {
    "id": "60222__314",
    "code": "60222",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Posto de revenda de gás liquefeito de petróleo (GLP)"
  },
  {
    "id": "60223__315",
    "code": "60223",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "Vídeo Locadora"
  },
  {
    "id": "60299__316",
    "code": "60299",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Comercial",
    "nature": "OUTRA / COMERCIAL"
  },
  {
    "id": "60301__317",
    "code": "60301",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Armazém, hangar, galpão ou similar"
  },
  {
    "id": "60302__318",
    "code": "60302",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Arquivo público ou privado"
  },
  {
    "id": "60303__319",
    "code": "60303",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Canteiro de obras"
  },
  {
    "id": "60304__320",
    "code": "60304",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Cemitério"
  },
  {
    "id": "60305__321",
    "code": "60305",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Central de processamento de dados (CPD)"
  },
  {
    "id": "60306__322",
    "code": "60306",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Composição ferroviária"
  },
  {
    "id": "60307__323",
    "code": "60307",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Empresa de comunicação"
  },
  {
    "id": "60308__324",
    "code": "60308",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Estação de tratamento ou distribuição de água"
  },
  {
    "id": "60309__325",
    "code": "60309",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Estação ou subestação de distribuição de energia elétrica"
  },
  {
    "id": "60310__326",
    "code": "60310",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Estacionamento, garagem ou similar"
  },
  {
    "id": "60311__327",
    "code": "60311",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Fábrica ou revenda de fogos de artifício ou artefato explosivo"
  },
  {
    "id": "60312__328",
    "code": "60312",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Instituição militar"
  },
  {
    "id": "60313__329",
    "code": "60313",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Laboratório"
  },
  {
    "id": "60314__330",
    "code": "60314",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Lixão, entulho ou similar"
  },
  {
    "id": "60315__331",
    "code": "60315",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Parque de tancagem ou tanque isolado"
  },
  {
    "id": "60316__332",
    "code": "60316",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "Pátio/pista aeroportuária"
  },
  {
    "id": "60399__333",
    "code": "60399",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação Especial",
    "nature": "OUTRA / ESPECIAL"
  },
  {
    "id": "60401__334",
    "code": "60401",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação hospitalar",
    "nature": "Asilo, casa geriátrica ou similar"
  },
  {
    "id": "60402__335",
    "code": "60402",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação hospitalar",
    "nature": "Clínica veterinária ou similar"
  },
  {
    "id": "60403__336",
    "code": "60403",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação hospitalar",
    "nature": "Hospital"
  },
  {
    "id": "60404__337",
    "code": "60404",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação hospitalar",
    "nature": "Policlínica, clínica ou similar"
  },
  {
    "id": "60499__338",
    "code": "60499",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação hospitalar",
    "nature": "OUTRA / HOSPITALAR"
  },
  {
    "id": "60501__339",
    "code": "60501",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação residencial",
    "nature": "Coletiva asilo"
  },
  {
    "id": "60502__340",
    "code": "60502",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação residencial",
    "nature": "Coletiva orfanato"
  },
  {
    "id": "60503__341",
    "code": "60503",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação residencial",
    "nature": "Coletiva penitenciária ou afim"
  },
  {
    "id": "60504__342",
    "code": "60504",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação residencial",
    "nature": "Coletiva pensionato"
  },
  {
    "id": "60505__343",
    "code": "60505",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação residencial",
    "nature": "Multifamiliar apartamento (Até 2 Pavimentos)"
  },
  {
    "id": "60506__344",
    "code": "60506",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação residencial",
    "nature": "Multifamiliar apartamento (Acima de 2 Pavimentos)"
  },
  {
    "id": "60507__345",
    "code": "60507",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação residencial",
    "nature": "Multifamiliar casa"
  },
  {
    "id": "60508__346",
    "code": "60508",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação residencial",
    "nature": "Unifamiliar apartamento"
  },
  {
    "id": "60509__347",
    "code": "60509",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação residencial",
    "nature": "Unifamiliar casa"
  },
  {
    "id": "60599__348",
    "code": "60599",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação residencial",
    "nature": "OUTRA / RESIDENCIAL"
  },
  {
    "id": "60601__349",
    "code": "60601",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação escolar",
    "nature": "Creche"
  },
  {
    "id": "60602__350",
    "code": "60602",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação escolar",
    "nature": "Ensino fundamental ou médio"
  },
  {
    "id": "60603__351",
    "code": "60603",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação escolar",
    "nature": "Ensino superior"
  },
  {
    "id": "60604__352",
    "code": "60604",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação escolar",
    "nature": "Ensino profissionalizante"
  },
  {
    "id": "60699__353",
    "code": "60699",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação escolar",
    "nature": "OUTRA / ESCOLAR"
  },
  {
    "id": "60701__354",
    "code": "60701",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação transitória",
    "nature": "Hotel ou apart hotel"
  },
  {
    "id": "60702__355",
    "code": "60702",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação transitória",
    "nature": "Motel"
  },
  {
    "id": "60703__356",
    "code": "60703",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação transitória",
    "nature": "Pousada"
  },
  {
    "id": "60799__357",
    "code": "60799",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação transitória",
    "nature": "OUTRA / TRANSITÓRIA"
  },
  {
    "id": "60801__358",
    "code": "60801",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Depósito",
    "nature": "Algodão, tecido, estopa ou similar"
  },
  {
    "id": "60802__359",
    "code": "60802",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Depósito",
    "nature": "Borracha, pneu ou similar"
  },
  {
    "id": "60803__360",
    "code": "60803",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Depósito",
    "nature": "Eletrodoméstico ou similar"
  },
  {
    "id": "60804__361",
    "code": "60804",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Depósito",
    "nature": "Explosivo, munição ou similar"
  },
  {
    "id": "60805__362",
    "code": "60805",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Depósito",
    "nature": "Gás liquefeito de petróleo (GLP)"
  },
  {
    "id": "60806__363",
    "code": "60806",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Depósito",
    "nature": "Líquido inflamável"
  },
  {
    "id": "60807__364",
    "code": "60807",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Depósito",
    "nature": "Madeira"
  },
  {
    "id": "60808__365",
    "code": "60808",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Depósito",
    "nature": "Plástico ou similar"
  },
  {
    "id": "60899__366",
    "code": "60899",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Depósito",
    "nature": "OUTRO / DEPÓSITO"
  },
  {
    "id": "60901__367",
    "code": "60901",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação industrial",
    "nature": "Destilaria, refinaria ou similar"
  },
  {
    "id": "60902__368",
    "code": "60902",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação industrial",
    "nature": "Eletroeletrônica"
  },
  {
    "id": "60903__369",
    "code": "60903",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação industrial",
    "nature": "Metalúrgica"
  },
  {
    "id": "60904__370",
    "code": "60904",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação industrial",
    "nature": "Náutica"
  },
  {
    "id": "60905__371",
    "code": "60905",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação industrial",
    "nature": "Química"
  },
  {
    "id": "60906__372",
    "code": "60906",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação industrial",
    "nature": "Siderúrgica"
  },
  {
    "id": "60907__373",
    "code": "60907",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação industrial",
    "nature": "Têxtil"
  },
  {
    "id": "60999__374",
    "code": "60999",
    "group": "INCÊNDIO URBANO",
    "subGroup": "Edificação industrial",
    "nature": "OUTRA /INDUSTRIAL"
  },
  {
    "id": "61001__375",
    "code": "61001",
    "group": "INCÊNDIO URBANO",
    "subGroup": "VEÍCULOS",
    "nature": "AERONAVES"
  },
  {
    "id": "61002__376",
    "code": "61002",
    "group": "INCÊNDIO URBANO",
    "subGroup": "VEÍCULOS",
    "nature": "EMBARCAÇÕES"
  },
  {
    "id": "61003__377",
    "code": "61003",
    "group": "INCÊNDIO URBANO",
    "subGroup": "VEÍCULOS",
    "nature": "FERROVIÁRIOS"
  },
  {
    "id": "61004__378",
    "code": "61004",
    "group": "INCÊNDIO URBANO",
    "subGroup": "VEÍCULOS",
    "nature": "VEÍCULO DE CARGA"
  },
  {
    "id": "61005__379",
    "code": "61005",
    "group": "INCÊNDIO URBANO",
    "subGroup": "VEÍCULOS",
    "nature": "VEÍCULO DE CARGA PERIGOSA"
  },
  {
    "id": "61006__380",
    "code": "61006",
    "group": "INCÊNDIO URBANO",
    "subGroup": "VEÍCULOS",
    "nature": "VEÍCULO DE PASSEIO"
  },
  {
    "id": "61007__381",
    "code": "61007",
    "group": "INCÊNDIO URBANO",
    "subGroup": "VEÍCULOS",
    "nature": "VEÍCULO DE TRANSPORTE COLETIVO"
  },
  {
    "id": "61099__382",
    "code": "61099",
    "group": "INCÊNDIO URBANO",
    "subGroup": "VEÍCULOS",
    "nature": "OUTRO / VEÍCULO"
  },
  {
    "id": "61101__383",
    "code": "61101",
    "group": "INCÊNDIO URBANO",
    "subGroup": "DIVERSOS",
    "nature": "LATA DE LIXO/ CONTAINER/ SIMILAR"
  },
  {
    "id": "61102__384",
    "code": "61102",
    "group": "INCÊNDIO URBANO",
    "subGroup": "DIVERSOS",
    "nature": "OBRAS DE ARTE (PONTES, VIADULTOS, ETC)"
  },
  {
    "id": "61201__385",
    "code": "61201",
    "group": "INCÊNDIO URBANO",
    "subGroup": "VEGETAÇÃO",
    "nature": "TERRENO BALDIO, LOTE VAGO OU SIMILAR"
  },
  {
    "id": "61202__386",
    "code": "61202",
    "group": "INCÊNDIO URBANO",
    "subGroup": "VEGETAÇÃO",
    "nature": "ÁREA VERDE URBANA"
  },
  {
    "id": "61199__387",
    "code": "61199",
    "group": "INCÊNDIO URBANO",
    "subGroup": "DIVERSOS",
    "nature": "OUTRO / INCÊNDIOS DIVERSOS"
  },
  {
    "id": "70402__388",
    "code": "70402",
    "group": "INCÊNDIO FLORESTAL",
    "subGroup": "ÁREA PÚBLICAS E PARTICULARES",
    "nature": "FAIXA DE DOMÍNIO (ESTRADA/RODOVIA)"
  },
  {
    "id": "70401__389",
    "code": "70401",
    "group": "INCÊNDIO FLORESTAL",
    "subGroup": "ÁREA PÚBLICAS E PARTICULARES",
    "nature": "PROPRIEDADE RURAL"
  },
  {
    "id": "70302__390",
    "code": "70302",
    "group": "INCÊNDIO FLORESTAL",
    "subGroup": "ÁREAS PROTEGIDAS",
    "nature": "UNIDADE DE CONSERVAÇÃO"
  },
  {
    "id": "70403__391",
    "code": "70403",
    "group": "INCÊNDIO FLORESTAL",
    "subGroup": "ÁREA PÚBLICAS E PARTICULARES",
    "nature": "TERRAS DEVOLUTAS"
  },
  {
    "id": "70301__392",
    "code": "70301",
    "group": "INCÊNDIO FLORESTAL",
    "subGroup": "ÁREAS PROTEGIDAS",
    "nature": "TERRA INDÍGENA"
  },
  {
    "id": "80101__393",
    "code": "80101",
    "group": "PRODUTOS PERIGOSOS",
    "subGroup": "PP",
    "nature": "EXPLOSÕES"
  },
  {
    "id": "80102__394",
    "code": "80102",
    "group": "PRODUTOS PERIGOSOS",
    "subGroup": "PP",
    "nature": "TRANSPORTE"
  },
  {
    "id": "80103__395",
    "code": "80103",
    "group": "PRODUTOS PERIGOSOS",
    "subGroup": "PP",
    "nature": "VAZAMENTO"
  },
  {
    "id": "80104__396",
    "code": "80104",
    "group": "PRODUTOS PERIGOSOS",
    "subGroup": "PP",
    "nature": "INTERVENÇÃO PREVENTIVA"
  },
  {
    "id": "80199__397",
    "code": "80199",
    "group": "PRODUTOS PERIGOSOS",
    "subGroup": "PP",
    "nature": "OUTROS"
  },
  {
    "id": "100101__398",
    "code": "100101",
    "group": "PRODUTIVIDADE",
    "subGroup": "REGISTRO",
    "nature": "DUPLICIDADE DE OCORRÊNCIA BM"
  },
  {
    "id": "100102__399",
    "code": "100102",
    "group": "PRODUTIVIDADE",
    "subGroup": "REGISTRO",
    "nature": "FALSO AVISO DE OCORRÊNCIA / TROTE"
  },
  {
    "id": "100103__400",
    "code": "100103",
    "group": "PRODUTIVIDADE",
    "subGroup": "REGISTRO",
    "nature": "AVISO DE OCORRÊNCIA FALSA / ENGANO"
  },
  {
    "id": "100201__401",
    "code": "100201",
    "group": "PRODUTIVIDADE",
    "subGroup": "DESPACHO",
    "nature": "ENCAMINHADA - SERVIÇOS DE EMERGÊNCIA"
  },
  {
    "id": "100201__402",
    "code": "100201",
    "group": "PRODUTIVIDADE",
    "subGroup": "DESPACHO",
    "nature": "ENCAMINHADA - SERVIÇOS DE SALVAMENTO/INCÊNDIO"
  },
  {
    "id": "100203__403",
    "code": "100203",
    "group": "PRODUTIVIDADE",
    "subGroup": "DESPACHO",
    "nature": "ENCAMINHADA - DEFESA CIVIL MUNICIPAL"
  },
  {
    "id": "100204__404",
    "code": "100204",
    "group": "PRODUTIVIDADE",
    "subGroup": "DESPACHO",
    "nature": "MÉDICO REGULADOR NÃO AUTORIZOU VTR"
  },
  {
    "id": "100205__405",
    "code": "100205",
    "group": "PRODUTIVIDADE",
    "subGroup": "DESPACHO",
    "nature": "OCORRÊNCIA NÃO ATENDIDA"
  },
  {
    "id": "100206__406",
    "code": "100206",
    "group": "PRODUTIVIDADE",
    "subGroup": "DESPACHO",
    "nature": "DEMANDA REPRIMIDA - RESGATE"
  },
  {
    "id": "100207__407",
    "code": "100207",
    "group": "PRODUTIVIDADE",
    "subGroup": "DESPACHO",
    "nature": "DEMANDA REPRIMIDA - BUSCA E SALVAMENTO"
  },
  {
    "id": "100208__408",
    "code": "100208",
    "group": "PRODUTIVIDADE",
    "subGroup": "DESPACHO",
    "nature": "DEMANDA REPRIMIDA - INCÊNDIO URBANO"
  },
  {
    "id": "100211__409",
    "code": "100211",
    "group": "PRODUTIVIDADE",
    "subGroup": "DESPACHO",
    "nature": "SOLICITANTE FOI ORIENTADO PELO MÉDICO REGULADOR E VAI REALIZAR TRANSPORTE POR MEIOS PRÓPRIOS"
  },
  {
    "id": "100210__410",
    "code": "100210",
    "group": "PRODUTIVIDADE",
    "subGroup": "DESPACHO",
    "nature": "MÉDICO REGULADOR APÓS ATENDIMENTO VERIFICOU QUE NÃO HÁ NECESSIDADE DE EMPENHO DE VIATURA"
  },
  {
    "id": "100209__411",
    "code": "100209",
    "group": "PRODUTIVIDADE",
    "subGroup": "DESPACHO",
    "nature": "DEMANDA REPRIMIDA - INCÊNDIO EM VEGETAÇÃO"
  },
  {
    "id": "99999__412",
    "code": "99999",
    "group": "HIDRANTES",
    "subGroup": "VISTORIA EM HIDRANTES",
    "nature": "CADASTRAMENTO"
  },
  {
    "id": "99999__413",
    "code": "99999",
    "group": "HIDRANTES",
    "subGroup": "VISTORIA EM HIDRANTES",
    "nature": "INSPEÇÃO"
  },
  {
    "id": "99999__414",
    "code": "99999",
    "group": "HIDRANTES",
    "subGroup": "VISTORIA EM HIDRANTES",
    "nature": "OUTRAS/VISTORIA"
  },
  {
    "id": "99999__415",
    "code": "99999",
    "group": "HIDRANTES",
    "subGroup": "VISTORIA EM HIDRANTES",
    "nature": "MANUTENÇÃO"
  },
  {
    "id": "90101__416",
    "code": "90101",
    "group": "VISTORIA EM HIDRANTES",
    "subGroup": "HIDRANTES",
    "nature": "CADASTRAMENTO"
  },
  {
    "id": "90102__417",
    "code": "90102",
    "group": "VISTORIA EM HIDRANTES",
    "subGroup": "HIDRANTES",
    "nature": "INSPEÇÃO"
  },
  {
    "id": "90103__418",
    "code": "90103",
    "group": "VISTORIA EM HIDRANTES",
    "subGroup": "HIDRANTES",
    "nature": "MANUTENÇÃO"
  },
  {
    "id": "90104__419",
    "code": "90104",
    "group": "VISTORIA EM HIDRANTES",
    "subGroup": "HIDRANTES",
    "nature": "OUTRAS/VISTORIA"
  },
  {
    "id": "90199__420",
    "code": "90199",
    "group": "VISTORIA EM HIDRANTES",
    "subGroup": "HIDRANTES",
    "nature": "TESTE"
  },
  {
    "id": "90101__421",
    "code": "90101",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "AVIÃO",
    "nature": "RESGATE SECUNDÁRIO"
  },
  {
    "id": "90102__422",
    "code": "90102",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "AVIÃO",
    "nature": "TRANSPORTE DE AUTORIDADES/DIGNATÁRIOS"
  },
  {
    "id": "90103__423",
    "code": "90103",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "AVIÃO",
    "nature": "TRANSPORTE AEROMÉDICO"
  },
  {
    "id": "90104__424",
    "code": "90104",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "AVIÃO",
    "nature": "MONITORAMENTO A COMBATE A INCÊNDIO"
  },
  {
    "id": "90105__425",
    "code": "90105",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "AVIÃO",
    "nature": "APOIO A COMBATE A INCÊNDIO"
  },
  {
    "id": "90106__426",
    "code": "90106",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "AVIÃO",
    "nature": "COMBATE A INCÊNDIO"
  },
  {
    "id": "90107__427",
    "code": "90107",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "AVIÃO",
    "nature": "DEFESA CIVIL"
  },
  {
    "id": "90108__428",
    "code": "90108",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "AVIÃO",
    "nature": "TRANSPORTE DE ESQUIFE"
  },
  {
    "id": "90109__429",
    "code": "90109",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "AVIÃO",
    "nature": "TRANSPORTE DE ÓRGÃOS"
  },
  {
    "id": "90110__430",
    "code": "90110",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "AVIÃO",
    "nature": "INSTRUÇÃO DE PILOTO"
  },
  {
    "id": "90111__431",
    "code": "90111",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "AVIÃO",
    "nature": "INSTRUÇÃO DE TRIPULAÇÃO"
  },
  {
    "id": "90112__432",
    "code": "90112",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "AVIÃO",
    "nature": "INSTRUÇÃO DE TROPA"
  },
  {
    "id": "90201__433",
    "code": "90201",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "RESGATE PRIMÁRIO"
  },
  {
    "id": "90202__434",
    "code": "90202",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "RESGATE SECUNDÁRIO"
  },
  {
    "id": "90203__435",
    "code": "90203",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "TRANSPORTE DE AUTORIDADES/DIGNATÁRIOS"
  },
  {
    "id": "90204__436",
    "code": "90204",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "TRANSPORTE AEROMÉDICO"
  },
  {
    "id": "90205__437",
    "code": "90205",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "MONITORAMENTO A COMBATE A INCÊNDIO"
  },
  {
    "id": "90206__438",
    "code": "90206",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "APOIO A COMBATE A INCÊNDIO"
  },
  {
    "id": "90207__439",
    "code": "90207",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "COMBATE A INCÊNDIO"
  },
  {
    "id": "90208__440",
    "code": "90208",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "DEFESA CIVIL"
  },
  {
    "id": "90209__441",
    "code": "90209",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "TRANSPORTE DE ESQUIFE"
  },
  {
    "id": "90210__442",
    "code": "90210",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "TRANSPORTE DE ÓRGÃOS"
  },
  {
    "id": "90211__443",
    "code": "90211",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "INSTRUÇÃO DE PILOTO"
  },
  {
    "id": "90212__444",
    "code": "90212",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "INSTRUÇÃO DE TRIPULAÇÃO"
  },
  {
    "id": "90213__445",
    "code": "90213",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "HELICÓPTERO",
    "nature": "INSTRUÇÃO DE TROPA"
  },
  {
    "id": "90301__446",
    "code": "90301",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "DRONE",
    "nature": "MONITORAMENTO/BUSCA"
  },
  {
    "id": "90302__447",
    "code": "90302",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "DRONE",
    "nature": "MONITORAMENTO DE INCÊNDIO"
  },
  {
    "id": "90303__448",
    "code": "90303",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "DRONE",
    "nature": "MONITORAMENTO DE EVENTOS"
  },
  {
    "id": "90304__449",
    "code": "90304",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "DRONE",
    "nature": "SALVAMENTO AQUÁTICO"
  },
  {
    "id": "90305__450",
    "code": "90305",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "DRONE",
    "nature": "DEFESA CIVIL"
  },
  {
    "id": "90306__451",
    "code": "90306",
    "group": "SERVIÇO ÁEREO",
    "subGroup": "DRONE",
    "nature": "BUSCA COM CÃES"
  }
];

export const NATURE_GROUPS: string[] = Array.from(
  new Set(NATURE_CATALOG.map((item) => item.group))
);

export function normalizeNatureText(text: string): string {
  return (text || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9.\/\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Formata uma entrada do catálogo para exibição corporativa padrão
 */
export function formatNatureLabel(entry: NatureCatalogEntry): string {
  return `${entry.code} - ${entry.nature}`;
}

/**
 * Detecta todas as naturezas candidatas dentro do texto da coluna NATUREZAS de uma ocorrência.
 * Suporta:
 * - Códigos de 5 dígitos (ex: 30113, 61201, 99999)
 * - Códigos pontuados da Defesa Civil (ex: 5.1.2.1, 5.1.3.2.1.4)
 * - Múltiplas naturezas separadas por ; | / quebra de linha ou +
 * - Busca textual por descrição quando não há código numérico
 */
export function detectNatureCandidates(rawText: string): NatureCatalogEntry[] {
  const text = (rawText || "").trim();
  if (!text) return [];

  const found: NatureCatalogEntry[] = [];
  const addedIds = new Set<string>();

  const addEntry = (entry: NatureCatalogEntry) => {
    if (!addedIds.has(entry.id)) {
      addedIds.add(entry.id);
      found.push(entry);
    }
  };

  // 1. Procura códigos pontuados de Defesa Civil (ex: 5.1.3.2.1.4)
  const dottedMatches = text.match(/\b5(?:\.\d+){2,6}\b/g) || [];
  for (const code of dottedMatches) {
    const matches = NATURE_CATALOG.filter((e) => e.code === code);
    matches.forEach(addEntry);
  }

  // 2. Procura códigos numéricos de 5 ou 6 dígitos (ex: 30113, 61201, 100101)
  const normRaw = normalizeNatureText(text);
  const fiveDigitMatches = text.match(/\b\d{5,6}\b/g) || [];
  for (const code of fiveDigitMatches) {
    const matches = NATURE_CATALOG.filter((e) => e.code === code);
    if (matches.length === 1) {
      addEntry(matches[0]);
    } else if (matches.length > 1) {
      // Desambigua usando texto (ex: 90101 pode ser HIDRANTES ou SERVIÇO ÁEREO; 99999 tem 4 tipos)
      const scored = matches
        .map((m) => {
          let score = 0;
          if (normRaw.includes(normalizeNatureText(m.nature))) score += 10;
          if (normRaw.includes(normalizeNatureText(m.group))) score += 5;
          if (normRaw.includes(normalizeNatureText(m.subGroup))) score += 3;
          return { m, score };
        })
        .sort((a, b) => b.score - a.score);

      if (scored[0].score > 0) {
        // Adiciona os empatados com pontuação máxima
        const topScore = scored[0].score;
        scored.filter((s) => s.score === topScore).forEach((s) => addEntry(s.m));
      } else {
        matches.forEach(addEntry);
      }
    }
  }

  if (found.length > 0) {
    return found;
  }

  // 3. Sem códigos numéricos: divide por separadores de múltiplas naturezas e compara por texto
  const segments = text
    .split(/[;|\n+]+|\s+\/\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 3);

  const targets = segments.length > 0 ? segments : [text];

  for (const seg of targets) {
    const normSeg = normalizeNatureText(seg);
    if (!normSeg) continue;

    // Correspondência exata de natureza
    const exact = NATURE_CATALOG.filter((e) => normalizeNatureText(e.nature) === normSeg);
    if (exact.length > 0) {
      exact.forEach(addEntry);
      continue;
    }

    // Correspondência parcial forte (ex: "QUEDA DE MOTO" ou "RESGATE / QUEDA DE MOTO")
    let bestMatches: { entry: NatureCatalogEntry; score: number }[] = [];
    for (const entry of NATURE_CATALOG) {
      const normNat = normalizeNatureText(entry.nature);
      const normSub = normalizeNatureText(entry.subGroup);
      const normGrp = normalizeNatureText(entry.group);
      let score = 0;

      if (normSeg.includes(normNat) && normNat.length >= 4) {
        score += 10 + normNat.length;
      } else if (normNat.includes(normSeg) && normSeg.length >= 5) {
        score += 6 + normSeg.length;
      }

      if (normSeg.includes(normSub) && normSub.length >= 4) score += 4;
      if (normSeg.includes(normGrp) && normGrp.length >= 4) score += 2;

      if (score > 0) {
        bestMatches.push({ entry, score });
      }
    }

    if (bestMatches.length > 0) {
      bestMatches.sort((a, b) => b.score - a.score);
      const maxScore = bestMatches[0].score;
      bestMatches
        .filter((x) => x.score >= maxScore - 1)
        .slice(0, 3)
        .forEach((x) => addEntry(x.entry));
    }
  }

  return found;
}
