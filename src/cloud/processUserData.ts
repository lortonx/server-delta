// @ts-check
import cloudConfig from './Cloud/agario/config';

export default cloudConfig;
Parse.Cloud.define('cloudConfig', (req) => {
    return cloudConfig;
});

const AGUSER = 'aguser';
const attributes = {
    countryCode: 'US',
    displayName: '',
    // lvl: 0,
    accountAge: 0,
    accountBirthDate: new Date(),
    paying: false,
    potions: 0,
    skins: 0,
    quests: 0,
    trophies: 0,
    guid: '',
    realm: 0,
    realmId: '',
    avatarUrl: '',
    score: 0,
    played: 0,
    mass: 0,
    alive: 0,
    totalMass: 0,
    cellsEaten: 0
};

/**
 * @extends {Parse.Object<attributes>}
 */
class AGUser extends Parse.Object {
    constructor(className, attrs, options) {
        super(AGUSER, attributes);
    }
}
Parse.Cloud.define('processUserData', async (req) => {
    return;
    const users = req.params;
    const allUserIds = [];
    const usersToCreate = new Set();
    const usersToUpdate = new Set();
    for (const key in users) {
        allUserIds.push(users[key].guid);
        usersToCreate.add(users[key].guid);
        usersToUpdate.add(users[key].guid);
    }
    // console.log('step 0', allUserIds, usersToCreate, usersToUpdate)
    // Проверяем наличие ID в базе
    Parse.masterKey = process.env.MASTER_KEY;
    const alreadyInDatabaseUsers = await new Parse.Query(AGUSER).aggregate(
        [{ $match: { objectId: { $in: allUserIds } } }, { $project: { 0: '$objectId' } }],
        // @ts-ignore
        { useMasterKey: true }
    );
    // Формирование массива для создания
    for (const { objectId } of alreadyInDatabaseUsers) usersToCreate.delete(objectId);
    // Формирование массива для обновления
    for (const guid of usersToCreate) usersToUpdate.delete(guid);

    const outdatedRecords = new Set();
    if (users.length > 1) {
        const possibleToUpdate = await new Parse.Query(AGUSER).aggregate(
            [
                {
                    $match: {
                        objectId: { $in: Array.from(usersToUpdate) },
                        updatedAt: {
                            $gte: new Date(0), // start
                            $lt: new Date(
                                new Date().getTime() - cloudConfig.processUserDataInterval /*1*12*60*60*1000*/
                            ) // end
                        }
                    }
                },
                { $project: { 0: '$objectId' } }
            ],
            // @ts-ignore
            { useMasterKey: true }
        );
        for (const { objectId } of possibleToUpdate) outdatedRecords.add(objectId);
    } else {
        const possibleToUpdate = await new Parse.Query(AGUSER).aggregate(
            [
                {
                    $match: {
                        objectId: { $in: Array.from(usersToUpdate) },
                        updatedAt: {
                            $gte: new Date(0), // start
                            $lt: new Date(new Date().getTime() - 1 * 60 * 60 * 1000) // end
                        }
                    }
                },
                { $project: { 0: '$objectId' } }
            ],
            // @ts-ignore
            { useMasterKey: true }
        );
        for (const { objectId } of possibleToUpdate) outdatedRecords.add(objectId);
        // for(let guid of usersToUpdate) outdatedRecords.add(guid)
    }
    // console.log('step 1',{/*possibleToUpdate, */usersToUpdate, outdatedRecords})

    {
        // CREATE OBJECTS
        const batchedObjects = [];
        for (const key in users) {
            if (!usersToCreate.has(users[key].guid)) continue;
            // @ts-ignore
            const aguser = new AGUser();
            aguser.set(users[key]);
            batchedObjects.push(aguser);
        }
        // console.log('Будет создано', batchedObjects.length, 'объектов')
        await Parse.Object.saveAll(batchedObjects);
    }

    {
        // UPDATE OBJECTS
        const findArray = Array.from(outdatedRecords);
        const query = new Parse.Query(AGUSER).limit(1000).skip(0).containedIn('objectId', findArray);

        const batchedObjects = await query.find();
        for (const aguser of batchedObjects) {
            // @ts-ignore
            aguser.set(users[aguser]);
        }
        // console.log('Будет обновлено', batchedObjects.length, 'объектов')
        await Parse.Object.saveAll(batchedObjects);
    }
});
Parse.Cloud.beforeSave(AGUSER, (req) => {
    req.object.set('objectId', req.object.attributes.guid);
    req.object.set('accountBirthDate', new Date(new Date().getTime() - req.object.attributes.accountAge * 1000));
});
