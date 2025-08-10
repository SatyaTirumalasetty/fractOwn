// Property custom field data types and validation
export const CUSTOM_FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number', 
  BOOLEAN: 'boolean',
  DATE: 'date',
  EMAIL: 'email',
  URL: 'url',
  CURRENCY: 'currency',
  PERCENTAGE: 'percentage'
} as const;

export type CustomFieldType = typeof CUSTOM_FIELD_TYPES[keyof typeof CUSTOM_FIELD_TYPES];

export interface CustomField {
  id: string;
  name: string;
  displayName: string;
  type: CustomFieldType;
  required: boolean;
  defaultValue?: any;
  options?: string[]; // For select/radio fields
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface PropertyCustomFields {
  [fieldName: string]: any;
}

// Field type configurations
export const FIELD_TYPE_CONFIG = {
  [CUSTOM_FIELD_TYPES.TEXT]: {
    label: 'Text',
    icon: '📝',
    defaultValue: '',
    validation: { maxLength: 255 }
  },
  [CUSTOM_FIELD_TYPES.NUMBER]: {
    label: 'Number',
    icon: '#️⃣',
    defaultValue: 0,
    validation: { min: 0 }
  },
  [CUSTOM_FIELD_TYPES.BOOLEAN]: {
    label: 'Yes/No',
    icon: '✅',
    defaultValue: false
  },
  [CUSTOM_FIELD_TYPES.DATE]: {
    label: 'Date',
    icon: '📅',
    defaultValue: null
  },
  [CUSTOM_FIELD_TYPES.EMAIL]: {
    label: 'Email',
    icon: '📧',
    defaultValue: '',
    validation: { pattern: '^[^@]+@[^@]+\.[^@]+$' }
  },
  [CUSTOM_FIELD_TYPES.URL]: {
    label: 'Website URL',
    icon: '🔗',
    defaultValue: '',
    validation: { pattern: '^https?://' }
  },
  [CUSTOM_FIELD_TYPES.CURRENCY]: {
    label: 'Currency (₹)',
    icon: '💰',
    defaultValue: 0,
    validation: { min: 0 }
  },
  [CUSTOM_FIELD_TYPES.PERCENTAGE]: {
    label: 'Percentage (%)',
    icon: '📊',
    defaultValue: 0,
    validation: { min: 0, max: 100 }
  }
} as const;