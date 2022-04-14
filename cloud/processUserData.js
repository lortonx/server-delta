const cloudConfig = require('./config.js');
Parse.Cloud.define('cloudConfig', req => {
    return cloudConfig;
});

class AGUser extends Parse.Object {constructor(id){
    super('aguser',{
        countryCode: 'US',
        displayName: '',
        // lvl: 0,
        accountAge: 0,
        accountBithDate: new Date(),
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
    // Проверяем наличие ID в базе
    Parse.masterKey = 'myMasterKey'

    const alreadyInDatabaseUsers = await (new Parse.Query('aguser')).aggregate([
        {$match: { objectId: {$in: allUserIds} }},
        {$project: { 0: '$objectId'}}
    ], { useMasterKey: true })
    // Найти ID которых нету в бд
    for(let {objectId} of alreadyInDatabaseUsers) usersToCreate.delete(objectId)
    // Найти ID которые могут быть обновлены
    for(let guid of usersToCreate) usersToUpdate.delete(guid) // удалить из обновления тех кто будет создан
    const alreadyInDatabaseUsers_old = await (new Parse.Query('aguser')).aggregate([
        {$match: {
            objectId: {$in: Array.from(usersToUpdate)},
            updatedAt: { 
                $gte: new Date(0), // start
                $lt: new Date((new Date()).getTime() - cloudConfig.processUserDataInterval /*1*12*60*60*1000*/) // end
            }
        }},
        {$project: { 0: '$objectId'}}
    ], { useMasterKey: true })

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
        const findArray = Object.keys(alreadyInDatabaseUsers_old).map(key => alreadyInDatabaseUsers_old[key].objectId)
        const query = new Parse.Query('aguser')
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
Parse.Cloud.beforeSave('aguser', (req) => {
    // console.log(req.object)
    req.object.set('objectId', req.object.attributes.guid)
    req.object.set('accountBirthDate', new Date(new Date() -  req.object.attributes.accountAge*1000))
    // throw new Parse.Error(9001, 'Saving test objects is not available.');
});