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
  section: string;
  order: number;
  options?: string[]; // For select/radio fields
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export const FIELD_SECTIONS = {
  BASIC: 'basic',
  LOCATION: 'location',
  INVESTMENT: 'investment',
  FEATURES: 'features',
  LEGAL: 'legal'
} as const;

export const SECTION_CONFIG = {
  [FIELD_SECTIONS.BASIC]: {
    label: 'Basic Information',
    description: 'Core property details and characteristics',
    icon: '🏠'
  },
  [FIELD_SECTIONS.LOCATION]: {
    label: 'Location Details',
    description: 'Address, neighborhood and area information',
    icon: '📍'
  },
  [FIELD_SECTIONS.INVESTMENT]: {
    label: 'Investment Details',
    description: 'Financial metrics and investment information',
    icon: '💰'
  },
  [FIELD_SECTIONS.FEATURES]: {
    label: 'Property Features',
    description: 'Amenities, facilities and special features',
    icon: '✨'
  },
  [FIELD_SECTIONS.LEGAL]: {
    label: 'Legal & Documentation',
    description: 'Permits, approvals and legal requirements',
    icon: '📋'
  }
} as const;

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