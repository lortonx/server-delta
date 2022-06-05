/** Назначение возможности роли которая может редактировать редактирования */

Parse.masterKey = 'masterkey'
const role = await new Parse.Query('_Role').equalTo('name','UserEditor').first()
// role.getUsers().add()
function updateAllRows(skip) {

  let query = new Parse.Query(Parse.User);
  query.limit(1);
  query.skip(skip);
  query.find().then(function(results) {
    if (results.length == 0) return
    for(let user of results){
        // console.log(user)
        const acl = user.getACL()
        acl.setRoleReadAccess('UserEditor',true)
        acl.setRoleWriteAccess('UserEditor',true)
        // user.setACL(acl, { useMasterKey: true })
    }
        
      results[0].save(null,{ useMasterKey: true }).then(function() {
        if (results.length >= 1) {
          updateAllRows(skip + 1);
        }

      }, function(err) {
        // error occured 
      });
    
  }, function(error) {
    // error occured while trying to fetch data 
  });
}
updateAllRows(0)