const Parse = require('parse/node');
// @ts-check
class Installer {
    constructor(){
        // this.install()
    }
    async install(){
        let owners = null
        {
            const NAME = 'Owner'
            await Parse.Object.destroyAll(
                await new Parse.Query(Parse.Role).equalTo('name', NAME).find({ useMasterKey: true })
            , { useMasterKey: true })
            const ACL = new Parse.ACL()
            ACL.setPublicReadAccess(true)
            const Role = owners = new Parse.Role(NAME, ACL)
            await Role.save(null, { useMasterKey: true });
        }
        let administrators = null
        {
            const NAME = 'Administrator'
            await Parse.Object.destroyAll(
                await new Parse.Query(Parse.Role).equalTo('name', NAME).find({ useMasterKey: true })
            , { useMasterKey: true })
            const ACL = new Parse.ACL()
            ACL.setPublicReadAccess(true)
            const Role = administrators = new Parse.Role(NAME, ACL)
            Role.getRoles().add(owners) // Создатели могут администрировать
            await Role.save(null, { useMasterKey: true });
        }
        let moderators = null
        {
            const NAME = 'Moderator'
            await Parse.Object.destroyAll(
                await new Parse.Query(Parse.Role).equalTo('name', NAME).find({ useMasterKey: true })
            , { useMasterKey: true })
            const ACL = new Parse.ACL()
            ACL.setPublicReadAccess(true)
            const Role = moderators = new Parse.Role(NAME, ACL)
            Role.getRoles().add(administrators) // Администраторы могут модерировать
            await Role.save(null, { useMasterKey: true });
        }
        let userEditors = null
        {
            const NAME = 'UserEditor'
            await Parse.Object.destroyAll(
                await new Parse.Query(Parse.Role).equalTo('name', NAME).find({ useMasterKey: true })
            , { useMasterKey: true })
            const ACL = new Parse.ACL()
            ACL.setPublicReadAccess(true)
            const Role = userEditors = new Parse.Role(NAME, ACL)
            Role.getRoles().add(administrators) // Администраторы могут редактировать пользователей
            await Role.save(null, { useMasterKey: true });
        }

    }
}
new Installer()