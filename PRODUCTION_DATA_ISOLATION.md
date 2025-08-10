# Production Data Isolation Guide

## Overview
The fractOWN platform implements comprehensive data isolation between development and production environments to ensure:
- Development data never migrates to production
- Production data remains unaffected by development changes
- Production systems can gracefully handle schema changes made in development

## Environment Detection

### Automatic Environment Detection
```typescript
const isProduction = process.env.NODE_ENV === 'production' || 
                    window.location.hostname.includes('.replit.app');
```

### Environment-Specific Behaviors
- **Development**: Uses `customFieldDefinitions_dev` localStorage key
- **Production**: Uses `customFieldDefinitions_prod` localStorage key
- **Database**: Separate connection pools and isolation

## Data Isolation Mechanisms

### 1. Custom Fields Isolation
- **Storage Keys**: Environment-specific localStorage keys prevent cross-contamination
- **Field Definitions**: Dev and prod maintain separate custom field schemas
- **Graceful Handling**: Production can handle new fields without breaking

### 2. Database Isolation
- **Seeding Protection**: Seed scripts detect production and prevent execution
- **Migration Safety**: Development migrations don't affect production data
- **Schema Flexibility**: Production handles new custom fields gracefully

### 3. Frontend Data Protection
- **Real-time Isolation**: WebSocket connections are environment-aware
- **State Management**: TanStack Query respects environment boundaries
- **Cache Separation**: Query caches are environment-specific

## Production Resilience Features

### Custom Field Compatibility
```typescript
// Production gracefully handles missing custom fields
const fieldValue = PRODUCTION_SAFETY_CONFIG.getFieldValueSafely(
  customFields, 
  fieldId, 
  fieldType
);
```

### Schema Evolution Support
- New custom field types are automatically supported
- Missing fields return appropriate defaults
- Field removals don't break existing properties

### Error Recovery
- Invalid custom field data is sanitized
- Missing field definitions are handled gracefully
- Production continues to function even with schema mismatches

## Implementation Details

### Environment Detection
```typescript
// Comprehensive environment detection
isProduction: () => {
  return process.env.NODE_ENV === 'production' || 
         (typeof window !== 'undefined' && window.location.hostname.includes('.replit.app'));
}
```

### Data Validation
```typescript
// Production-safe field value retrieval
getFieldValueSafely: (customFields, fieldId, fieldType) => {
  if (!customFields?.[fieldId]) {
    return getDefaultValueForType(fieldType);
  }
  return customFields[fieldId];
}
```

### Migration Prevention
```typescript
// Prevents dev data from contaminating production
shouldPreventMigration: () => {
  return PRODUCTION_SAFETY_CONFIG.isProduction();
}
```

## Best Practices

### For Developers
1. **Always test in development first**
2. **Use environment-specific storage keys**
3. **Handle missing fields gracefully**
4. **Validate data before production deployment**

### For Production Deployments
1. **Production data is never overwritten**
2. **New features are backward compatible**
3. **Custom fields are additive, never destructive**
4. **Rollback capability is maintained**

## Safety Guarantees

### Development → Production
- ✅ New custom field types are supported
- ✅ New field definitions are handled gracefully
- ✅ Existing production data remains unchanged
- ✅ Production functionality continues uninterrupted

### Production → Development
- ✅ Development environment can access production schema patterns
- ✅ Development testing doesn't affect production
- ✅ Custom field experiments are isolated
- ✅ Development rollbacks don't impact production

## Monitoring and Alerts

### Environment Status
- Real-time environment detection
- Automatic data isolation warnings
- Production safety confirmations

### Data Integrity Checks
- Custom field compatibility validation
- Schema evolution monitoring
- Production resilience verification

## Emergency Procedures

### Data Recovery
1. Environment-specific backups are maintained
2. Custom field definitions can be restored independently
3. Production data integrity is always preserved

### Schema Conflicts
1. Production takes precedence in conflicts
2. Development adapts to production requirements
3. Gradual schema evolution is supported

This isolation system ensures that development work never impacts production stability while maintaining full functionality across both environments.