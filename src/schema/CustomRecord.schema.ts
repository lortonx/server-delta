import { SchemaMigrations } from 'parse-server';

export default SchemaMigrations.makeSchema('CustomRecord', {
    fields: {
        data: { type: 'Object' },
        ip: { type: 'String' },
        name: { type: 'String' },
        objectType: { type: 'String' }
    },
    indexes: {},
    classLevelPermissions: {
        ...SchemaMigrations.CLP.allow({
            '*': ['create', 'update', 'find', 'get', 'count']
        }),
        protectedFields: {
            '*': []
        }
    }
});
