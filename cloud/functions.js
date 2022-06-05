const { default: fetch } = require("node-fetch");
// const Parse = require("parse/lib/browser/Parse");

Parse.Cloud.define('hello', req => {
  req.log.info(req);
  return 'Hi';
})
Parse.Cloud.define('asyncFunction', async req => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  req.log.info(req);
  return 'Hi async';
})
Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.');
})



Parse.Cloud.beforeLogin((data) => {
  // работает со второго раза
  // console.log(data.object.isNew(),data.object)
  // data.object.set("secretData", 'secretdated');
  // data.object.save({},{ useMasterKey: true })
  // headers
  // object ParseUser
  // headers
  // ip
  return
})
Parse.Cloud.afterLogin(()=>{
  console.log('after login', Parse.User.current())
})

Parse.Cloud.beforeSave('_User', async function(data) {
	const user = data.object
  // не работет
	// console.log("BEFORE SAVED ACCOUNT 0",data.object.isNew(), data);
	if(data.object.isNew()){ // is new user
		if(data.object.attributes.authData && data.object.attributes.authData.google && data.object.attributes.authData.google.id_token){
			/* Захват информации с гугла при первой авторизации */
			const req = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token='+ data.object.attributes.authData.google.id_token)
			/** @type {sub: string, email: string, name: string, given_name: string, family_name: string, locale: string, picture: string, verified_email: boolean} */
			const res = await req.json()

			Parse.masterKey = process.env.MASTER_KEY
			const alreadyInDatabase = await (new Parse.Query('_User')).aggregate([
        { $match: { username: {$regex: `^${res.name}_` } }},
				{ $group: { _id: null, total: { $sum: 1 } } },
        { $project: { _id: 0 } }
			],{ useMasterKey: true })
			const login_counter = alreadyInDatabase[0]?.total|| 0
			user.set('username', res.given_name + '_' + (login_counter+1));
			user.set('first_name', res.given_name);
			user.set('last_name', res.family_name);
			user.set('email', res.email);
			user.set('picture', res.picture);

      // const ACL = user.getACL()
      // ACL.setRoleReadAccess('UserEditor',true)
      // ACL.setRoleWriteAccess('UserEditor',true)
		}

  }
  // console.log(data.object)

});

Parse.Cloud.afterSave('_User',async (data)=>{
  const isNewUser = data.object.createdAt == data.object.updatedAt
  const user = data.object
  if(data.object.existed()){
    // console.log('data.object.existed()',data)
  }
  if(isNewUser){ // is new user
    
    /**
     * После сохранения нового пользователя
     * Создать сопутствующие данные
     */
    console.log('After Save new _User',isNewUser,data)

    data.object.attributes.authData
  }


  const ACL_TARGET = new Parse.ACL({
    [user.id]: {"read": true,"write": true}, // сам себя может читать и писать
    "*": {"read": true},  // все могут читать
    "role:UserEditor": {"read": true,"write": true} // UserEditor может читать и писать
  })
  const ACL_USER = user.getACL() || new Parse.ACL()
  for(const KEY in ACL_TARGET.permissionsById){
    if(ACL_TARGET.getReadAccess(KEY) != ACL_USER.getReadAccess(KEY) || ACL_TARGET.getWriteAccess(KEY) != ACL_USER.getWriteAccess(KEY)){
      Object.assign(ACL_USER.permissionsById, ACL_TARGET.permissionsById)
      user.setACL(ACL_USER.permissionsById)
      user.save(null, {useMasterKey: true})
      console.log('Fixed ACL for user',user.id,user.get('username'))
      break;
    }
  }
})


Parse.Cloud.beforeSave('MonitorRestrictionRules', (req, res) =>{
    req.object.set('authorId', req.user.id);
    // req.object.save()
});

Parse.Cloud.afterFind('Wallet', async (req, res) =>{
  for(const object of req.objects){
    object.attributes.updatedAt.toJSON = () => undefined
    object.attributes.createdAt.toJSON = () => undefined
  }
})
Parse.Cloud.afterFind('Product', async (req, res) =>{
  for(const object of req.objects){
    object.attributes.updatedAt.toJSON = () => undefined
    object.attributes.createdAt.toJSON = () => undefined
  }
})

const DbStats = async (name = '_User', direction = true)=>{
  class DbStats extends Parse.Object {className = "DbStats"}
  const q = (new Parse.Query(DbStats)).equalTo('name', name)
  let dbstats = await q.first()
  if(!dbstats) dbstats = new DbStats({name: name, count: 0})
  direction?dbstats.increment('count'):dbstats.decrement('count')
  dbstats.save()
}

const onNewUser = (/** @type {Parse.Cloud.AfterSaveRequest}*/ data) => {
  
}

const onDeleteUser = (/** @type {Parse.Cloud.AfterSaveRequest}*/ req,res) => {
  
}

// Защита от записи
// Parse.Cloud.beforeSave(Parse.User, (req) => {
//   if (!req.master && req.object.op(‘adminMode’)) throw ‘Error!’
// });

// Query.eachBatch


// Агрегация 
// Parse.masterKey = ''
// const pipeline = [
//   { project: { name: 1 } }
// ];
// const query = new Parse.Query('aguser');
// await query.aggregate(pipeline, { useMasterKey: true })


// Parse.masterKey = ''
// const pipeline = [
//   // { project: { name: 1 } }
//     {group: { objectId: '$countryCode' }}
// ];
// const query = new Parse.Query('aguser');
// await query.aggregate(pipeline, { useMasterKey: true })

// Parse.masterKey = ''
// const pipeline = [
//     {$match: { countryCode: 'UA' }},
//     {$project: { level: 1 }}
    // {$project: { 0: '$objectId' }}

// ];
// const query = new Parse.Query('aguser');
// await query.aggregate(pipeline, { useMasterKey: true })


//   Все кто ру и проецировать левел
// const pipeline = [
//   {$match: { countryCode: {$in: ['RU']} }},
//   {$project: { 0: '$objectId', level: '$level' }}
// ];