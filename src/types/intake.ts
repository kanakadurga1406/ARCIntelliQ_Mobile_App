export type IntakeDraft = Record<string, string>;

export type IntakeFieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'phone'
  | 'email'
  | 'date'
  | 'time'
  | 'portal';

export type IntakeValidation = 'required' | 'email' | 'phone10' | 'date' | 'time';

export type IntakeOption = {
  id: string;
  label: string;
};

export type IntakeField = {
  id: string;
  label: string;
  type: IntakeFieldType;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  defaultValue?: string;
  options?: IntakeOption[];
  row?: string;
  visibleWhen?: {
    field: string;
    equals: string;
  };
  validation?: IntakeValidation[];
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export type IntakeReviewRow = {
  id: string;
  label: string;
  fieldIds: string[];
  separator?: string;
};

export type IntakeStep = {
  id: string;
  title: string;
  cardTitle: string;
  subtitle: string;
  fields: IntakeField[];
  review?: {
    title: string;
    hint: string;
    rows: IntakeReviewRow[];
  };
};

export type IntakeConfig = {
  kicker?: string;
  requiredHint: string;
  nextLabel: string;
  previousLabel: string;
  submitLabel: string;
  submitTitle: string;
  submitMessage: string;
  discardTitle: string;
  discardMessage: string;
  steps: IntakeStep[];
};

export type AddClaimDraft = IntakeDraft;
