export type ClaimDetailTabId =
  | 'info'
  | 'location'
  | 'persons'
  | 'payments'
  | 'notes';

export type ClaimDetailTab = {
  id: ClaimDetailTabId;
  label: string;
  icon: string;
  background: string;
  foreground: string;
};

export type ClaimFormFieldKind =
  | 'text'
  | 'textarea'
  | 'select'
  | 'date'
  | 'time'
  | 'phone';

export type ClaimFormField = {
  id: string;
  label: string;
  rowKey: string;
  kind: ClaimFormFieldKind;
  copyable?: boolean;
  required?: boolean;
  helper?: string;
  span?: 'half' | 'full';
};

export type ClaimFormSection = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  fields: ClaimFormField[];
  kind?: 'form' | 'triage';
};

export type TriageQuestion = {
  id: string;
  label: string;
};

export const CLAIM_DETAIL_TABS: ClaimDetailTab[] = [
  {
    id: 'info',
    label: 'Info',
    icon: 'document',
    background: '#E8F1FF',
    foreground: '#2B74FF',
  },
  {
    id: 'location',
    label: 'Location',
    icon: 'pin',
    background: '#F3E6D4',
    foreground: '#A16207',
  },
  {
    id: 'persons',
    label: 'Persons',
    icon: 'users',
    background: '#DCFCE7',
    foreground: '#16A34A',
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: 'dollar',
    background: '#EDE4FF',
    foreground: '#7C3AED',
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: 'notes',
    background: '#FCE7F3',
    foreground: '#DB2777',
  },
];

export const INFO_SECTIONS: ClaimFormSection[] = [
  {
    id: 'incident',
    title: 'Incident Information',
    subtitle: 'Basic details about this claim.',
    icon: 'document',
    fields: [
      {
        id: 'incident_number',
        label: 'Incident Number',
        rowKey: 'incident_number',
        kind: 'text',
        copyable: true,
        span: 'half',
      },
      {
        id: 'dol',
        label: 'Date of incident',
        rowKey: 'dol',
        kind: 'date',
        span: 'half',
      },
      {
        id: 'time_of_incident',
        label: 'Time of incident',
        rowKey: 'time_of_incident',
        kind: 'time',
        span: 'half',
      },
      {
        id: 'dor',
        label: 'Date of report',
        rowKey: 'dor',
        kind: 'date',
        span: 'half',
      },
      {
        id: 'time_of_report',
        label: 'Time of report',
        rowKey: 'time_of_report',
        kind: 'time',
        span: 'half',
      },
      {
        id: 'time_zone',
        label: 'Time zone',
        rowKey: 'time_zone',
        kind: 'select',
        span: 'half',
      },
    ],
  },
  {
    id: 'accident',
    title: 'Accident & status',
    subtitle: 'Details about the accident and current status.',
    icon: 'document',
    fields: [
      {
        id: 'accident_details',
        label: 'Accident Details',
        rowKey: 'accident_details',
        kind: 'textarea',
        span: 'full',
      },
      {
        id: 'claim_type',
        label: 'Claim Type',
        rowKey: 'claim_type',
        kind: 'select',
        span: 'half',
      },
      {
        id: 'issue_type',
        label: 'Issue Type',
        rowKey: 'issue_type',
        kind: 'select',
        span: 'half',
      },
      {
        id: 'status',
        label: 'Status',
        rowKey: 'status',
        kind: 'select',
        span: 'half',
      },
      {
        id: 'closure_code',
        label: 'Closure Code',
        rowKey: 'closure_code',
        kind: 'select',
        span: 'half',
      },
      {
        id: 'adjuster',
        label: 'Adjuster',
        rowKey: 'adjuster',
        kind: 'select',
        span: 'half',
      },
    ],
  },
  {
    id: 'caller',
    title: 'Caller',
    subtitle: 'Who reported this incident.',
    icon: 'users',
    fields: [
      {
        id: 'driver_type',
        label: 'Driver Type',
        rowKey: 'driver_type',
        kind: 'select',
        span: 'half',
      },
      {
        id: 'caller_title',
        label: 'Caller Title',
        rowKey: 'caller_title',
        kind: 'text',
        span: 'half',
      },
      {
        id: 'caller_name',
        label: 'Caller Name',
        rowKey: 'caller_name',
        kind: 'text',
        span: 'half',
      },
      {
        id: 'caller_email',
        label: 'Caller Email',
        rowKey: 'caller_email',
        kind: 'text',
        span: 'half',
      },
      {
        id: 'caller_phone',
        label: 'Caller Phone',
        rowKey: 'caller_phone',
        kind: 'phone',
        helper: 'Exactly 10 digits for the selected country.',
        span: 'full',
      },
      {
        id: 'customer_delivery_instructions',
        label: 'Customer Delivery Instructions',
        rowKey: 'customer_delivery_instructions',
        kind: 'textarea',
        span: 'full',
      },
    ],
  },
  {
    id: 'loss',
    title: 'Loss details',
    subtitle: 'What was lost or damaged.',
    icon: 'document',
    fields: [
      {
        id: 'loss_description',
        label: 'Loss Description',
        rowKey: 'loss_description',
        kind: 'select',
        span: 'half',
      },
      {
        id: 'roadway',
        label: 'Roadway',
        rowKey: 'roadway',
        kind: 'select',
        span: 'half',
      },
      {
        id: 'weather',
        label: 'Weather',
        rowKey: 'weather',
        kind: 'select',
        span: 'half',
      },
      {
        id: 'vehicles_involved_no',
        label: 'Number of vehicles involved',
        rowKey: 'vehicles_involved_no',
        kind: 'text',
        span: 'half',
      },
      {
        id: 'people_involved_no',
        label: 'Number of people involved',
        rowKey: 'people_involved_no',
        kind: 'text',
        span: 'half',
      },
    ],
  },
  {
    id: 'reporting',
    title: 'Reporting',
    subtitle: 'How this claim was reported.',
    icon: 'document',
    fields: [
      {
        id: 'action_items',
        label: 'Action Items',
        rowKey: 'action_items',
        kind: 'textarea',
        span: 'full',
      },
      {
        id: 'intake_by',
        label: 'Intake By',
        rowKey: 'created_by',
        kind: 'select',
        span: 'half',
      },
      {
        id: 'reported_by',
        label: 'Reported By',
        rowKey: 'reported_by',
        kind: 'select',
        span: 'half',
      },
      {
        id: 'incident_happened',
        label: 'Incident Happened',
        rowKey: 'incident_happened',
        kind: 'select',
        span: 'half',
      },
    ],
  },
  {
    id: 'triage',
    title: 'Triage Questions',
    subtitle: 'Required incident flags.',
    icon: 'document',
    kind: 'triage',
    fields: [],
  },
];

export const LOCATION_SECTION: ClaimFormSection = {
  id: 'incident-location',
  title: 'Incident Location',
  subtitle: 'Where the incident occurred.',
  icon: 'pin',
  fields: [
    {
      id: 'location_street',
      label: 'Street',
      rowKey: 'location_street',
      kind: 'text',
      span: 'full',
    },
    {
      id: 'location_city',
      label: 'City',
      rowKey: 'location_city',
      kind: 'text',
      span: 'half',
    },
    {
      id: 'state',
      label: 'State',
      rowKey: 'state',
      kind: 'text',
      span: 'half',
    },
    {
      id: 'location_zip',
      label: 'ZIP',
      rowKey: 'location_zip',
      kind: 'text',
      span: 'half',
    },
    {
      id: 'location_country',
      label: 'Country',
      rowKey: 'location_country',
      kind: 'text',
      span: 'half',
    },
  ],
};

export const PERSONS_SECTION: ClaimFormSection = {
  id: 'persons-involved',
  title: 'Persons Involved',
  subtitle: 'People related to this incident.',
  icon: 'users',
  fields: [
    {
      id: 'insured_driver_name',
      label: 'Insured driver name',
      rowKey: 'insured_driver_name',
      kind: 'text',
      span: 'half',
    },
    {
      id: 'insured_driver_contact',
      label: 'Insured driver contact',
      rowKey: 'insured_driver_contact',
      kind: 'text',
      span: 'half',
    },
    {
      id: 'claimant_name',
      label: 'Claimant name',
      rowKey: 'claimant_name',
      kind: 'text',
      span: 'half',
    },
    {
      id: 'claimant_contact',
      label: 'Claimant contact',
      rowKey: 'claimant_contact',
      kind: 'text',
      span: 'half',
    },
    {
      id: 'adjuster',
      label: 'Adjuster',
      rowKey: 'adjuster',
      kind: 'text',
      span: 'full',
    },
  ],
};

export const TRIAGE_QUESTIONS: TriageQuestion[] = [
  {id: 'cargo_damage', label: 'Confirmed Cargo/Package Damage?'},
  {id: 'hazmat', label: 'Environmental Issue/Hazmat/Exposure?'},
  {id: 'fire', label: 'Fire?'},
  {id: 'media', label: 'Media?'},
  {id: 'rollover', label: 'Rollover?'},
  {id: 'fatality', label: 'Fatality?'},
  {id: 'ambulance', label: 'Ambulance Presence/Transport?'},
  {id: 'injuries', label: 'Any Injuries Reported?'},
];
