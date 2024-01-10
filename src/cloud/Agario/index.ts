import Aguser from '../../models/Aguser';
import cloudConfig from './config';
Parse.Cloud.define(
    'cloudConfig',
    () => {
        return cloudConfig;
    },
    {
        requireUser: false
    }
);

// const Aguser = 'aguser';

Parse.Cloud.define('processUserData', async (req) => {
    const users = req.params;
    const allUserIds = [];
    const usersToCreate = new Set<string>();
    const usersToUpdate = new Set<string>();
    for (const key in users) {
        allUserIds.push(users[key].guid);
        usersToCreate.add(users[key].guid);
        usersToUpdate.add(users[key].guid);
    }
    // console.log('step 0', allUserIds, usersToCreate, usersToUpdate)
    // Проверяем наличие ID в базе
    Parse.masterKey = process.env.MASTER_KEY;
    const alreadyInDatabaseUsers = await new Parse.Query(Aguser).aggregate(
        [{ $match: { objectId: { $in: allUserIds } } }, { $project: { 0: '$objectId' } }],
        // @ts-ignore
        { useMasterKey: true }
    );
    // Формирование массива для создания
    for (const { objectId } of alreadyInDatabaseUsers) usersToCreate.delete(objectId);
    // Формирование массива для обновления
    for (const guid of usersToCreate) usersToUpdate.delete(guid);

    const outdatedRecords = new Set<string>();
    if (users.length > 1) {
        const possibleToUpdate = await new Parse.Query(Aguser).aggregate([
            {
                // @ts-ignore
                $match: {
                    objectId: { $in: Array.from(usersToUpdate) },
                    updatedAt: {
                        $gte: new Date(0), // start
                        $lt: new Date(new Date().getTime() - cloudConfig.processUserDataInterval /*1*12*60*60*1000*/) // end
                    }
                }
            }, // @ts-ignore
            { $project: { 0: '$objectId' } }
        ]);
        for (const { objectId } of possibleToUpdate) outdatedRecords.add(objectId);
    } else {
        const possibleToUpdate = await new Parse.Query(Aguser).aggregate([
            {
                // @ts-ignore
                $match: {
                    objectId: { $in: Array.from(usersToUpdate) },
                    updatedAt: {
                        $gte: new Date(0), // start
                        $lt: new Date(new Date().getTime() - 1 * 60 * 60 * 1000) // end
                    }
                }
            },
            // @ts-ignore
            { $project: { 0: '$objectId' } }
        ]);
        for (const { objectId } of possibleToUpdate) outdatedRecords.add(objectId);
        // for(let guid of usersToUpdate) outdatedRecords.add(guid)
    }

    {
        // CREATE OBJECTS
        const batchedObjects: Aguser[] = [];
        for (const key in users) {
            if (!usersToCreate.has(users[key].guid)) continue;
            // @ts-ignore
            const aguser = new Aguser();
            aguser.set(users[key]);
            batchedObjects.push(aguser);
        }
        // console.log('Будет создано', batchedObjects.length, 'объектов')
        await Parse.Object.saveAll(batchedObjects, { useMasterKey: true });
    }
    {
        // UPDATE OBJECTS
        const findArray = Array.from(outdatedRecords);
        const query = new Parse.Query(Aguser).limit(1000).skip(0).containedIn('objectId', findArray);

        const batchedObjects = await query.find();
        for (const aguser of batchedObjects) {
            // @ts-ignore
            aguser.set(users[aguser]);
        }
        // console.log('Будет обновлено', batchedObjects.length, 'объектов')
        await Parse.Object.saveAll(batchedObjects, { useMasterKey: true });
    }
});
Parse.Cloud.beforeSave(
    Aguser,
    (req) => {
        if (req.object.get('guid')) {
            req.object.set('objectId', req.object.attributes.guid);
            req.object.unset('guid');
        }

        if (req.object.get('accountAge')) {
            req.object.set(
                'accountBirthDate',
                new Date(new Date().getTime() - req.object.attributes.accountAge * 1000)
            );
            req.object.unset('accountAge');
        }

        if (req.object.get('avatarUrl').includes('https://configs')) {
            req.object.unset('avatarUrl');
        }
    },
    { requireUser: false }
);
