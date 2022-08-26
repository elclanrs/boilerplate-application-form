export interface Application {
  id: string;
  category: ApplicationCategory;
  title: string;
  steps: Step[];
}

export type ApplicationCategory = 'workers-compensation' | 'cyber-insurance' | 'farm-insurance';

export interface Step {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
}

export type Field = ValueField | CheckboxField | RadioField;

export interface ValueField extends FieldCommon {
  kind: 'text';
  type: 'text' | 'textarea' | 'number';
  placeholder?: string;
  value?: string | number;
  rules?: Rule[];
}

export interface CheckboxField extends FieldCommon {
  kind: 'checkbox';
  value?: boolean;
}

export interface RadioField extends FieldCommon {
  kind: 'radio';
  value: string;
  checked?: boolean;
}

export interface FieldCommon {
  id: string;
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  disabled?: boolean;
  dependsOn?: {
    fieldName: Field['name'];
    fieldValue: Field['value'];
  };
}

export interface Rule {
  type: 'email' | 'phone';
  error: string;
}

// For HTTP errors
export interface Error {
  code: number;
  description?: string;
}
