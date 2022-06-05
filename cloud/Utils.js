const UserSubscription = require("../Models/UserSubscription");

const checkRights = (user, obj) => {
    const acl = obj.getACL();
    if (!acl)
      return true;
  
    const read = acl.getReadAccess(user.id);
    const write = acl.getWriteAccess(user.id);
  
    const pRead = acl.getPublicReadAccess();
    const pWrite = acl.getPublicWriteAccess();
  
    return read && write || pRead && pWrite;
};
const getUserSubscriptions = (user) => {
	const query = new Parse.Query(UserSubscription);
	query.equalTo("user", user)
	return query.find({ useMasterKey: true })
}