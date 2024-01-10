import { SchemaMigrations } from 'parse-server';

export default SchemaMigrations.makeSchema('Subscription', {
    fields: {
        name: { type: 'String', required: true },
        price: { type: 'Number' },
        period: { type: 'String' },
        description: { type: 'String' },
        quotas: { type: 'Object' }
    },
    indexes: {},
    classLevelPermissions: {
        ...SchemaMigrations.CLP.allow({
            ['role:Administrator']: ['count', 'create', 'delete', 'find', 'get', 'update']
        })
    }
});

// Роли под вопросом
