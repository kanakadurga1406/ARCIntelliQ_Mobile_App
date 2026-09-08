import type {StatCard} from '../../types/claimPortals';
import type {
  ClaimHistoryConfig,
  ClaimHistoryResult,
  ClaimListQuery,
  ClaimRecord,
} from '../../types/claims';
import {
  applyClaimFilters,
  paginateClaims,
} from '../../utils/claimList';

type ClaimSeed = {
  id: string;
  portalId: string;
  incidentNumber: string;
  location: string;
  doi: string;
  dor: string;
  driver: string;
  claimant: string;
  status: 'open' | 'closed' | 'voided';
  statusHint?: string;
  claimType: string;
  lossType: string;
  closureCode: string;
};

const STATUS_META = {
  open: {label: 'Open', tone: 'primary' as const},
  closed: {label: 'Closed', tone: 'danger' as const},
  voided: {label: 'Voided', tone: 'warning' as const},
};

const CLAIM_SEEDS: ClaimSeed[] = [
  {
    id: 'cl-3842',
    portalId: 'cp-1011',
    incidentNumber: 'ARC202633842',
    location: 'AZ - Arizona',
    doi: '2026-09-06',
    dor: '2026-09-30',
    driver: 'Jordan Hale',
    claimant: 'Maya Chen',
    status: 'open',
    claimType: 'Injury to Flex driver',
    lossType: 'Dog bite',
    closureCode: 'none',
  },
  {
    id: 'cl-3843',
    portalId: 'cp-1011',
    incidentNumber: 'ARC202633843',
    location: 'TX - Texas',
    doi: '2026-08-21',
    dor: '2026-08-22',
    driver: 'Luis Ortega',
    claimant: 'Priya Shah',
    status: 'closed',
    statusHint: 'Paid Full Estimate Amount',
    claimType: 'Property damage',
    lossType: 'Damage to driveway',
    closureCode: 'paid-full',
  },
  {
    id: 'cl-3844',
    portalId: 'cp-1011',
    incidentNumber: 'ARC202633844',
    location: 'FL - Florida',
    doi: '2026-07-14',
    dor: '2026-07-15',
    driver: 'Elena Rossi',
    claimant: 'Chris Patel',
    status: 'voided',
    claimType: 'Auto collision',
    lossType: 'Rear-end',
    closureCode: 'voided',
  },
  {
    id: 'cl-3845',
    portalId: 'cp-1001',
    incidentNumber: 'ARC202633845',
    location: 'GA - Georgia',
    doi: '2026-09-02',
    dor: '2026-09-03',
    driver: 'Sam Wright',
    claimant: 'Nina Park',
    status: 'open',
    claimType: 'Cargo delay',
    lossType: 'Weather delay',
    closureCode: 'none',
  },
  {
    id: 'cl-3846',
    portalId: 'cp-1001',
    incidentNumber: 'ARC202633846',
    location: 'CA - California',
    doi: '2026-06-18',
    dor: '2026-06-19',
    driver: 'Ava Brooks',
    claimant: 'Tom Nguyen',
    status: 'closed',
    statusHint: 'Paid Full Estimate Amount',
    claimType: 'Liability',
    lossType: 'Slip and fall',
    closureCode: 'paid-full',
  },
  {
    id: 'cl-3847',
    portalId: 'cp-1004',
    incidentNumber: 'ARC202633847',
    location: 'NY - New York',
    doi: '2026-09-01',
    dor: '2026-09-01',
    driver: 'Omar Diallo',
    claimant: 'Hannah Kim',
    status: 'open',
    claimType: 'Injury to Flex driver',
    lossType: 'Dog bite',
    closureCode: 'none',
  },
  {
    id: 'cl-3848',
    portalId: 'cp-1004',
    incidentNumber: 'ARC202633848',
    location: 'IL - Illinois',
    doi: '2026-05-09',
    dor: '2026-05-11',
    driver: 'Riley Cole',
    claimant: 'James Wu',
    status: 'closed',
    statusHint: 'Denied',
    claimType: 'Cargo',
    lossType: 'Theft',
    closureCode: 'denied',
  },
  {
    id: 'cl-3849',
    portalId: 'cp-1007',
    incidentNumber: 'ARC202633849',
    location: 'WA - Washington',
    doi: '2026-08-30',
    dor: '2026-08-31',
    driver: 'Noah Bennett',
    claimant: 'Sofia Alvarez',
    status: 'open',
    claimType: 'Auto',
    lossType: 'Side swipe',
    closureCode: 'none',
  },
  {
    id: 'cl-3850',
    portalId: 'cp-1007',
    incidentNumber: 'ARC202633850',
    location: 'CO - Colorado',
    doi: '2026-04-22',
    dor: '2026-04-23',
    driver: 'Grace Lin',
    claimant: 'Ben Carter',
    status: 'voided',
    claimType: 'Property',
    lossType: 'Fence damage',
    closureCode: 'voided',
  },
  {
    id: 'cl-3851',
    portalId: 'cp-1008',
    incidentNumber: 'ARC202633851',
    location: 'AZ - Arizona',
    doi: '2026-09-03',
    dor: '2026-09-04',
    driver: 'Ethan Moore',
    claimant: 'Leah Scott',
    status: 'open',
    claimType: 'QA Master Data Long Name Validation',
    lossType: 'Damage to driveway',
    closureCode: 'none',
  },
  {
    id: 'cl-3852',
    portalId: 'cp-1012',
    incidentNumber: 'ARC202633852',
    location: 'TX - Texas',
    doi: '2026-07-28',
    dor: '2026-07-29',
    driver: 'Mia Torres',
    claimant: 'Owen Blake',
    status: 'closed',
    statusHint: 'Paid Full Estimate Amount',
    claimType: 'Injury',
    lossType: 'Dog bite',
    closureCode: 'paid-full',
  },
  {
    id: 'cl-3853',
    portalId: 'cp-1002',
    incidentNumber: 'ARC202633853',
    location: 'FL - Florida',
    doi: '2026-08-21',
    dor: '2026-08-22',
    driver: 'Caleb Reed',
    claimant: 'Ivy Chen',
    status: 'open',
    claimType: 'Auto collision',
    lossType: 'Rear-end',
    closureCode: 'none',
  },
];

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${month}/${day}/${year}`;
}

function toClaim(seed: ClaimSeed): ClaimRecord {
  const status = STATUS_META[seed.status];
  return {
    id: seed.id,
    portalId: seed.portalId,
    incidentNumber: seed.incidentNumber,
    location: seed.location,
    status: {
      id: seed.status,
      label: status.label,
      tone: status.tone,
      hint: seed.statusHint,
    },
    fields: [
      {id: 'doi', label: 'DOI', value: formatDisplayDate(seed.doi)},
      {id: 'dor', label: 'DOR', value: formatDisplayDate(seed.dor)},
      {id: 'driver', label: 'Insured driver', value: seed.driver, icon: 'users'},
      {id: 'claimant', label: 'Claimant', value: seed.claimant, icon: 'users'},
      {id: 'claimType', label: 'Claim type', value: seed.claimType},
      {id: 'lossType', label: 'Loss type', value: seed.lossType, icon: 'box'},
    ],
    values: {
      doi: seed.doi,
      dor: seed.dor,
      driver: seed.driver,
      claimant: seed.claimant,
      claimType: seed.claimType,
      lossType: seed.lossType,
      status: seed.status,
      closureCode: seed.closureCode,
      location: seed.location,
      incidentNumber: seed.incidentNumber,
    },
  };
}

function fallbackClaims(portalId: string, portalName: string): ClaimRecord[] {
  const samples: Array<Omit<ClaimSeed, 'id' | 'portalId' | 'incidentNumber'>> = [
    {
      location: 'AZ - Arizona',
      doi: '2026-09-04',
      dor: '2026-09-05',
      driver: 'Alex Morgan',
      claimant: 'Jamie Cole',
      status: 'open',
      claimType: 'Auto',
      lossType: 'Rear-end',
      closureCode: 'none',
    },
    {
      location: 'TX - Texas',
      doi: '2026-08-12',
      dor: '2026-08-13',
      driver: 'Chris Lane',
      claimant: 'Taylor Brooks',
      status: 'closed',
      statusHint: 'Paid Full Estimate Amount',
      claimType: 'Property',
      lossType: 'Damage to driveway',
      closureCode: 'paid-full',
    },
    {
      location: 'GA - Georgia',
      doi: '2026-07-08',
      dor: '2026-07-09',
      driver: 'Riley Nash',
      claimant: 'Quinn Adler',
      status: 'voided',
      claimType: 'Cargo',
      lossType: 'Weather delay',
      closureCode: 'voided',
    },
  ];

  return samples.map((sample, index) =>
    toClaim({
      ...sample,
      id: `${portalId}-cl-${index + 1}`,
      portalId,
      incidentNumber: `ARC${portalId.replace(/\D/g, '').slice(-4) || '2000'}${index + 1}`,
      claimant: sample.claimant,
      driver: `${sample.driver} · ${portalName.split(' ')[0]}`,
    }),
  );
}

function claimsForPortal(portalId: string, portalName: string): ClaimRecord[] {
  const matched = CLAIM_SEEDS.filter(seed => seed.portalId === portalId).map(
    toClaim,
  );
  return matched.length > 0 ? matched : fallbackClaims(portalId, portalName);
}

function buildStatCards(claims: ClaimRecord[]): StatCard[] {
  const open = claims.filter(item => item.status.id === 'open').length;
  const closed = claims.filter(item => item.status.id === 'closed').length;
  const voided = claims.filter(item => item.status.id === 'voided').length;
  const thisMonth = claims.filter(item =>
    String(item.values?.doi ?? '').startsWith('2026-09'),
  ).length;
  const paid = claims.filter(
    item => item.values?.closureCode === 'paid-full',
  ).length;

  return [
    {
      id: 'total',
      title: 'Total claims',
      value: claims.length,
      icon: 'document',
      tone: 'primary',
    },
    {
      id: 'open',
      title: 'Open',
      value: open,
      icon: 'layers',
      tone: 'primary',
      destination: 'filter:open',
    },
    {
      id: 'closed',
      title: 'Closed',
      value: closed,
      icon: 'check',
      tone: 'danger',
      destination: 'filter:closed',
    },
    {
      id: 'voided',
      title: 'Voided',
      value: voided,
      icon: 'box',
      tone: 'warning',
      destination: 'filter:voided',
    },
    {
      id: 'month',
      title: 'This month',
      value: thisMonth,
      icon: 'calendar',
      tone: 'purple',
    },
    {
      id: 'paid',
      title: 'Paid in full',
      value: paid,
      icon: 'dollar',
      tone: 'success',
    },
  ];
}

function buildConfig(claims: ClaimRecord[], portalName: string): ClaimHistoryConfig {
  const count = (status: string) =>
    claims.filter(item => item.status.id === status).length;

  return {
    title: 'Claim History',
    subtitle: portalName,
    statCards: buildStatCards(claims),
    statusChips: [
      {id: 'all', label: 'All', count: claims.length},
      {id: 'open', label: 'Open', count: count('open'), filter: {field: 'status', value: 'open'}},
      {
        id: 'closed',
        label: 'Closed',
        count: count('closed'),
        filter: {field: 'status', value: 'closed'},
      },
      {
        id: 'voided',
        label: 'Voided',
        count: count('voided'),
        filter: {field: 'status', value: 'voided'},
      },
    ],
    sortOptions: [
      {id: 'latest', label: 'Latest DOI', field: 'doi', direction: 'desc'},
      {id: 'oldest', label: 'Oldest DOI', field: 'doi', direction: 'asc'},
      {
        id: 'incident-desc',
        label: 'Incident Z-A',
        field: 'incidentNumber',
        direction: 'desc',
      },
      {
        id: 'incident-asc',
        label: 'Incident A-Z',
        field: 'incidentNumber',
        direction: 'asc',
      },
    ],
    dateFilters: [
      {id: 'doi', label: 'DOI'},
      {id: 'dor', label: 'DOR'},
    ],
    filterControls: [
      {
        id: 'closureCode',
        label: 'Closure code',
        options: [
          {id: 'all', label: 'All codes'},
          {id: 'none', label: 'None'},
          {id: 'paid-full', label: 'Paid full estimate'},
          {id: 'denied', label: 'Denied'},
          {id: 'voided', label: 'Voided'},
        ],
      },
    ],
    pageActions: [
      {
        id: 'add-claim',
        label: 'Add Claim',
        destination: 'add-claim',
        icon: 'plus',
        style: 'fab',
      },
    ],
    claimActions: [
      {id: 'view', label: 'View details', icon: 'eye', destination: 'view'},
      {id: 'edit', label: 'Edit claim', icon: 'pencil', destination: 'edit'},
      {id: 'clone', label: 'Clone claim', icon: 'copy', destination: 'clone'},
    ],
  };
}

export function stubClaimHistory(query: ClaimListQuery): ClaimHistoryResult {
  const catalog = claimsForPortal(query.portalId, query.portalName);
  const filtered = applyClaimFilters(catalog, query.search, query.filters);
  return {
    config: buildConfig(catalog, query.portalName),
    list: paginateClaims(filtered, query.page, query.limit),
  };
}
