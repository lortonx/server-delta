import { SchemaMigrations } from 'parse-server';
import Subscription from '../models/Subscription';
// depedencies

export default SchemaMigrations.makeSchema('_User', {
    fields: {
        email: { type: 'String' },
        emailVerified: { type: 'Boolean' },
        authData: { type: 'Object' },
        picture: { type: 'String' },
        password: { type: 'String' },
        username: { type: 'String' },
        first_name: { type: 'String' },
        last_name: { type: 'String' },
        defaultCurrency: { type: 'String' },
        locale: { type: 'String' },
        clientKey: { type: 'Object' },
        subscriptions: { type: 'Relation', required: false, targetClass: 'Subscription', p: <Subscription>null }
    },
    indexes: {
        username: { username: 1 },
        last_name: { last_name: 1 },
        email: { email: 1 }
    },
    classLevelPermissions: {
        ...SchemaMigrations.CLP.allow({
            '*': ['create'],
            requiresAuthentication: ['update', 'find', 'get', 'count'],
            'role:Moderator': ['get', 'find', 'count', 'update', 'delete']
        }),
        protectedFields: {
            '*': ['authData', 'password', 'username', 'last_name', 'first_name'],
            'role:Moderator': ['authData', 'password'],
            'role:Administrator': []
        }
    }
});
