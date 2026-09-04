export type SearchFieldType = 'text' | 'number' | 'date' | 'select';

export type SearchOption = {
  id: string;
  label: string;
};

export type SearchField = {
  id: string;
  label: string;
  type: SearchFieldType;
  options?: SearchOption[];
};

export type SearchOperator = {
  id: string;
  label: string;
  needsValue?: boolean;
};

export type SmartSearchMode = {
  id: string;
  label: string;
  icon: string;
  kind: 'filters' | 'ai';
  fields?: SearchField[];
  operators?: SearchOperator[];
  helperText?: string;
  greeting?: string;
  placeholder?: string;
  disclaimer?: string;
};

export type SmartSearchCopy = {
  title: string;
  searchByLabel: string;
  filtersLabel: string;
  filterCardLabel: string;
  addFilterLabel: string;
  removeLabel: string;
  cancelLabel: string;
  clearLabel: string;
  applyLabel: string;
  operatorPlaceholder: string;
  valuePlaceholder: string;
};

export type SmartSearchConfig = {
  copy: SmartSearchCopy;
  modes: SmartSearchMode[];
};

export type SmartSearchFilter = {
  id: string;
  fieldId: string;
  operatorId: string;
  value: string;
};

export type SmartSearchApplyPayload = {
  modeId: string;
  filters: SmartSearchFilter[];
};

export type SmartSearchApplyResult = {
  message: string;
  resultCount: number;
};

export type SmartSearchChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

export type SmartSearchAskPayload = {
  modeId: string;
  message: string;
};

export type SmartSearchAskResult = {
  reply: string;
};
