import type {SmartSearchConfig} from '../../types/smartSearch';

const SHARED_OPERATORS = [
  {id: 'equals', label: 'Equals'},
  {id: 'not-equals', label: 'Does not equal'},
  {id: 'contains', label: 'Contains'},
  {id: 'starts-with', label: 'Starts with'},
  {id: 'greater-than', label: 'Greater than'},
  {id: 'less-than', label: 'Less than'},
];

export const SMART_SEARCH_CONFIG: SmartSearchConfig = {
  copy: {
    title: 'Smart Search',
    searchByLabel: 'SEARCH BY',
    filtersLabel: 'Choose filters',
    filterCardLabel: 'FILTER',
    addFilterLabel: '+ Add another',
    removeLabel: 'Remove',
    cancelLabel: 'Cancel',
    clearLabel: 'Clear all',
    applyLabel: 'Apply',
    operatorPlaceholder: 'Select operator',
    valuePlaceholder: 'Enter value',
  },
  modes: [
    {
      id: 'claim',
      label: 'Claim',
      icon: 'document',
      kind: 'filters',
      helperText: 'Select an operator to configure this filter.',
      fields: [
        {id: 'incident-number', label: 'Incident Number', type: 'text'},
        {
          id: 'claim-status',
          label: 'Claim Status',
          type: 'select',
          options: [
            {id: 'open', label: 'Open'},
            {id: 'closed', label: 'Closed'},
            {id: 'pending', label: 'Pending'},
          ],
        },
        {id: 'claimant', label: 'Claimant Name', type: 'text'},
        {id: 'state', label: 'State', type: 'text'},
        {id: 'created-date', label: 'Created Date', type: 'date'},
        {id: 'amount', label: 'Amount', type: 'number'},
      ],
      operators: SHARED_OPERATORS,
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: 'dollar',
      kind: 'filters',
      helperText: 'Select an operator to configure this filter.',
      fields: [
        {
          id: 'payee-type',
          label: 'Payee Type',
          type: 'select',
          options: [
            {id: 'claimant', label: 'Claimant'},
            {id: 'vendor', label: 'Vendor'},
            {id: 'contractor', label: 'Contractor'},
          ],
        },
        {
          id: 'payment-status',
          label: 'Payment Status',
          type: 'select',
          options: [
            {id: 'issued', label: 'Issued'},
            {id: 'void', label: 'Void'},
            {id: 'pending', label: 'Pending'},
          ],
        },
        {id: 'amount', label: 'Amount', type: 'number'},
        {id: 'payment-date', label: 'Payment Date', type: 'date'},
        {id: 'check-number', label: 'Check Number', type: 'text'},
      ],
      operators: SHARED_OPERATORS,
    },
    {
      id: 'ai',
      label: 'AI',
      icon: 'sparkle',
      kind: 'ai',
      greeting:
        "I help you search claims and funds only. For example: 'Open claims in California from last month' or 'Void payments over $5000'.",
      placeholder: 'Ask about claims or payments...',
      disclaimer:
        'Claim & funds search only. Press Enter to search. Voice listens up to 18 seconds.',
    },
  ],
};
