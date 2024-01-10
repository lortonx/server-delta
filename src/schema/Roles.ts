export default class Roles {
    static async install() {
        const roles = ['Owner', 'Administrator', 'Moderator', 'UserEditor'];

        let parentRole: Parse.Role<Partial<Parse.Attributes>>;
        for (const roleName of roles) {
            const acl = new Parse.ACL();
            acl.setPublicReadAccess(true);
            const role = new Parse.Role(roleName, acl);
            if (parentRole) {
                role.getRoles().add(parentRole);
            }
            parentRole = role;
            try {
                await role.save(null, { useMasterKey: true });
            } catch (e) {
                break;
            }
        }

        // Parse.Cloud.beforeSave('_Role', (req) => {
        //     if (req.object.get('name')) {
        //         req.object.set('objectId', req.object.attributes.name);
        //     }
        // });
    }
}
Roles.install();
