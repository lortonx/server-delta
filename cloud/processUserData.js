const cloudConfig = require('./config.js');
const AGUSER = 'aguser';
Parse.Cloud.define('cloudConfig', req => {
    return cloudConfig;
});

class AGUser extends Parse.Object {constructor(id){
    super(AGUSER,{
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
        cellsEaten: 0,
    })

}}
Parse.Cloud.define('processUserData', async req => {

    const users = req.params
    const allUserIds = []
    const usersToCreate = new Set()
    const usersToUpdate = new Set()
    for(let key in users) {
        allUserIds.push(users[key].guid);
        usersToCreate.add(users[key].guid)
        usersToUpdate.add(users[key].guid)
    }
    // console.log('step 0', allUserIds, usersToCreate, usersToUpdate)
    // Проверяем наличие ID в базе
    Parse.masterKey = process.env.MASTER_KEY
    const alreadyInDatabaseUsers = await (new Parse.Query(AGUSER)).aggregate([
        {$match: { objectId: {$in: allUserIds} }},
        {$project: { 0: '$objectId'}}
    ], { useMasterKey: true })
    // Формирование массива для создания
    for(let {objectId} of alreadyInDatabaseUsers) usersToCreate.delete(objectId)
    // Формирование массива для обновления
    for(let guid of usersToCreate) usersToUpdate.delete(guid)

    const outdatedRecords = new Set()
    if(users.length > 1){
        const possibleToUpdate = await (new Parse.Query(AGUSER)).aggregate([
            {$match: {
                objectId: {$in: Array.from(usersToUpdate)},
                updatedAt: { 
                    $gte:new Date(0), // start
                    $lt: new Date((new Date()).getTime() - cloudConfig.processUserDataInterval /*1*12*60*60*1000*/) // end
                }
            }},
            {$project: { 0: '$objectId'}}
        ], { useMasterKey: true })
        for(let {objectId} of possibleToUpdate) outdatedRecords.add(objectId)
    }else{
        const possibleToUpdate = await (new Parse.Query(AGUSER)).aggregate([
            {$match: {
                objectId: {$in: Array.from(usersToUpdate)},
                updatedAt: { 
                    $gte:new Date(0), // start
                    $lt: new Date((new Date()).getTime() - 1*60*60*1000) // end
                }
            }},
            {$project: { 0: '$objectId'}}
        ], { useMasterKey: true })
        for(let {objectId} of possibleToUpdate) outdatedRecords.add(objectId)
        // for(let guid of usersToUpdate) outdatedRecords.add(guid)
    }
    // console.log('step 1',{/*possibleToUpdate, */usersToUpdate, outdatedRecords})

    {  // CREATE OBJECTS
        const batchedObjects = []
        for(let key in users){
            if(!usersToCreate.has(users[key].guid)) continue
            const aguser = new AGUser()
            aguser.set(users[key])
            batchedObjects.push(aguser)
        }
        // console.log('Будет создано', batchedObjects.length, 'объектов')
        await Parse.Object.saveAll(batchedObjects)
    }

    {  // UPDATE OBJECTS
        const findArray = Array.from(outdatedRecords)
        const query = new Parse.Query(AGUSER)
            .limit(1000)
            .skip(0)
            .containedIn('objectId', findArray);

        const batchedObjects = await query.find()
        for(let aguser of batchedObjects){
            aguser.set(users[aguser])
        }
        // console.log('Будет обновлено', batchedObjects.length, 'объектов')
        await Parse.Object.saveAll(batchedObjects)
    }

});
Parse.Cloud.beforeSave(AGUSER, (req) => {
    // console.log(req.object)
    req.object.set('objectId', req.object.attributes.guid)
    req.object.set('accountBirthDate', new Date(new Date() -  req.object.attributes.accountAge*1000))
    // throw new Parse.Error(9001, 'Saving test objects is not available.');
});