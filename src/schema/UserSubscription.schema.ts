import { SchemaMigrations } from 'parse-server';
// depedencies
import User from '../models/User';
import Subscription from '../models/Subscription';

export default SchemaMigrations.makeSchema('UserSubscription', {
    fields: {
        name: { type: 'String', required: true },
        user: { type: 'Pointer', targetClass: '_User', required: true, p: <User>null },
        sp: { type: 'Pointer', targetClass: 'Subscription', required: true, p: <Subscription>null },
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
            ['role:Moderator']: ['count', 'create', 'delete', 'update']
        }),
        protectedFields: {
            '*': []
        }
    }
});
