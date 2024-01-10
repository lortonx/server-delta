import { SchemaMigrations } from 'parse-server';

export default SchemaMigrations.makeSchema('Plan', {
    fields: {
        name: { type: 'String' },
        user: { type: 'Pointer', targetClass: '_User', p: <User>null },
        ds: { type: 'Date' },
        de: { type: 'Date' },
        dr: { type: 'Date' }
    },
    indexes: {
        user: { user: 1 },
        name: { name: 1 }
    },
    classLevelPermissions: {
        ...SchemaMigrations.CLP.allow({
            requiresAuthentication: ['find', 'get'],
            ['role:Moderator']: ['count', 'create', 'delete', 'find', 'get', 'update']
        })
    }
});

import User from '../models/User';
