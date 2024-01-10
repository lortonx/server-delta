import { SchemaMigrations } from 'parse-server';

export default SchemaMigrations.makeSchema('aguser', {
    fields: {
        displayName: { type: 'String' },
        paying: { type: 'Boolean' },
        mass: { type: 'Number' },
        totalMass: { type: 'Number' },
        guid: { type: 'String' },
        quests: { type: 'Number' },
        potions: { type: 'Number' },
        skins: { type: 'Number' },
        accountAge: { type: 'Number' },
        alive: { type: 'Number' },
        countryCode: { type: 'String' },
        score: { type: 'Number' },
        realmId: { type: 'Number' },
        played: { type: 'Number' },
        level: { type: 'Number' },
        avatarUrl: { type: 'String' },
        realm: { type: 'Number' },
        cellsEaten: { type: 'Number' },
        accountBirthDate: { type: 'Date' },
        trophies: { type: 'Number' }
    },
    indexes: {
        displayName: { displayName: 1 },
        played: { played: 1 },
        score: { score: 1 },
        guid: { guid: 1 }
    },
    classLevelPermissions: {
        ...SchemaMigrations.CLP.allow({
            '*': ['create', 'update', 'find', 'get', 'count']
        }),
        protectedFields: {
            '*': []
        }
    }
});
