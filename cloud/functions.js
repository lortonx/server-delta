Parse.Cloud.define('hello', req => {
  req.log.info(req);
  return 'Hi';
});

Parse.Cloud.define('asyncFunction', async req => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  req.log.info(req);
  return 'Hi async';
});

Parse.Cloud.beforeSave('Test', () => {
  throw new Parse.Error(9001, 'Saving test objects is not available.');
});




Parse.Cloud.define("GoogleSignIn", async (request) => {
  const google = require("googleapis").google;
  // Google's OAuth2 client
  const OAuth2 = google.auth.OAuth2;

  // Create an OAuth2 client object from the credentials in our config file
  const oauth2Client = new OAuth2(
    process.env.client_id,
    process.env.client_secret,
    process.env.redirect_uris
  );
  // Obtain the google login link to which we'll send our users to give us access
  const loginLink = oauth2Client.generateAuthUrl({
    // Indicates that we need to be able to access data continously without the user constantly giving us consent
    access_type: "offline",
    // Using the access scopes from our config file
    scope: ["email", "openid", "profile"],
    state: request.params,
  });
  return loginLink;
});

Parse.Cloud.define("GoogleToken", async (request) => {
  const google = require("googleapis").google;

  // Google's OAuth2 client
  const OAuth2 = google.auth.OAuth2;

  // Create an OAuth2 client object from the credentials in our config file
  const oauth2Client = new OAuth2(
    process.env.client_id,
    process.env.client_secret,
    process.env.redirect_uris
  );

  if (request.error) {
    // The user did not give us permission.
    return request.error;
  } else {
    // try {
      const { tokens } = await oauth2Client.getToken(request.params.code);
      oauth2Client.setCredentials(tokens);
      var oauth2 = google.oauth2({
        auth: oauth2Client,
        version: "v2",
      });
      const usr_info = await oauth2.userinfo.get();
      // Auth data for Parse
      const authData = {
        id: usr_info.data.id,
        email: usr_info.data.email,
        name: usr_info.data.name,
        id_token: tokens.id_token,
        access_token: tokens.id_token,
        picture: usr_info.data.picture,
      };
      
      return authData;
    // } catch (error) {
    //   return error;
    // }
  }
});

Parse.Cloud.beforeLogin((data) => {
  // работает со второго раза
  console.log(data.object.isNew(),data.object)
  // data.object.set("secretData", 'secretdated');
  // data.object.save({},{ useMasterKey: true })
  // headers
  // object ParseUser
  // headers
  // ip
  return
})

Parse.Cloud.afterLogin(()=>{
  console.log('after login',Parse.User.current())
})

Parse.Cloud.beforeSave('_User', function(data) {
  // не работет
  console.log("BEFORE NEW SAVED ACCOUNT 0",data.object.isNew(), data.object);
  if(data.object.isNew()){ // is new user
    console.log("BEFORE NEW SAVED ACCOUNT",data.object.isNew(), data.object);
    data.object.attributes.authData
  }
  //create admin role
  // var adminRoleACL = new Parse.ACL();
  // adminRoleACL.setPublicReadAccess(false);
  // adminRoleACL.setPublicWriteAccess(false);
  // var adminRole = new Parse.Role(accountName + "_Administrator", adminRoleACL);
  // adminRole.save();

  // //create user role
  // var userRoleACL = new Parse.ACL();
  // userRoleACL.setPublicReadAccess(false);
  // userRoleACL.setPublicWriteAccess(false);
  // var userRole = new Parse.Role(accountName + "_User", userRoleACL);
  // userRole.save();
});

Parse.Cloud.afterSave('_User',async (data)=>{
  const isNewUser = data.object.createdAt == data.object.updatedAt
  const user = data.object
  if(isNewUser){ // is new user
    console.log('isnewuser 2',isNewUser)

    {// Какие роли у пользователя
      const q = new Parse.Query(Parse.Role)
      q.equalTo('name','UsersAdmin')
      const role = await q.first()
      if(!role) throw new Parse.Error(9001, 'Cant set ACL for new user. Role not found');
      role.getUsers().add(data.object)
      await role.save()
    }
    
    // {// Какая роль может модифицировать объект?
    //   const q = new Parse.Query(Parse.Role)
    //   q.equalTo('name','UsersAdmin')
    //   const role = await q.first()
    //   if(!role) throw new Parse.Error(9001, 'Cant set ACL for new user. Role not found');
    //   /**@type {Parse.User}*/
    //   const user = data.object
    //   const acl = user.getACL()
    //   acl.setRoleReadAccess(role,true)
    //   acl.setRoleWriteAccess(role,true)
    //   user.save({},{useMasterKey: true})
    // }

    // Создание роли
    // var roleAcl = new Parse.ACL();
    // roleAcl.setPublicReadAccess(true);
    // roleAcl.setPublicWriteAccess(true)
    // var role = new Parse.Role("UsersAdmin", roleAcl);
    // role.save()

    {
      class Wallet extends Parse.Object {className = "Wallet"}
      const wallet = new Wallet();

      const acl = new Parse.ACL()
      acl.setPublicWriteAccess(false)
      acl.setReadAccess(user, true)
      acl.setWriteAccess(user, true)

      wallet.setACL(acl)
      wallet.set('owner', user)
      wallet.save({
        ownerId: user.id,
        coins: 0,
        gems: 0,
      })
    }


    data.object.attributes.authData
  }
})


Parse.Cloud.beforeSave('MonitorRestrictionRules', (req, res) =>{
    req.object.set('authorId', req.user.id);
    // req.object.save()
});


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