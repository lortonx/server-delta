import { google } from 'googleapis';
import User from '../../models/User';

Parse.Cloud.define('GoogleSignIn', async (request) => {
    // Google's OAuth2 client
    const OAuth2 = google.auth.OAuth2;

    // Create an OAuth2 client object from the credentials in our config file
    const oauth2Client = new OAuth2(process.env.client_id, process.env.client_secret, process.env.redirect_uris);
    // Obtain the google login link to which we'll send our users to give us access
    const loginLink = oauth2Client.generateAuthUrl({
        // Indicates that we need to be able to access data continously without the user constantly giving us consent
        access_type: 'offline',
        // Using the access scopes from our config file
        scope: ['email', 'openid', 'profile'], // @ts-ignore
        state: request.params
    });
    return loginLink;
});

Parse.Cloud.define('GoogleToken', async (request) => {
    // Google's OAuth2 client
    const OAuth2 = google.auth.OAuth2;
    // Create an OAuth2 client object from the credentials in our config file
    const oauth2Client = new OAuth2(
        process.env.client_id,
        process.env.client_secret,
        request.params.redirect || process.env.redirect_uris
    );

    if (request['error']) {
        // The user did not give us permission.
        return request['error'];
    } else {
        // try {
        const { tokens } = await oauth2Client.getToken(request.params.code);
        oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({
            auth: oauth2Client,
            version: 'v2'
        });
        const usr_info = await oauth2.userinfo.get();
        // Auth data for Parse
        const authData = {
            id: usr_info.data.id,
            email: usr_info.data.email,
            name: usr_info.data.name,
            id_token: tokens.id_token,
            access_token: tokens.access_token,
            code: request.params.code,
            picture: usr_info.data.picture
        };
        return authData;
    }
});

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
(async () => {
    debugger;
    const alreadyInDatabase = await new Parse.Query('_User').aggregate(
        [
            // @ts-ignore
            { $match: { username: { $regex: `^${res.given_name}_` } } }, // @ts-ignore
            { $group: { _id: null, total: { $sum: 1 } } }, // @ts-ignore
            { $project: { _id: 0 } }
        ] /*,{ useMasterKey: true }*/
    );
    console.log(alreadyInDatabase);
})();

Parse.Cloud.beforeSave<User>('_User', async (data) => {
    const user = data.object;
    // не работет
    // console.log("BEFORE SAVED ACCOUNT 0",data.object.isNew(), data);
    if (data.object.isNew()) {
        // is new user
        if (
            data.object.attributes.authData &&
            data.object.attributes.authData.google &&
            data.object.attributes.authData.google.id_token
        ) {
            /* Захват информации с гугла при первой авторизации */
            const req = await fetch(
                `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${data.object.attributes.authData.google.id_token}`
            );

            const res: {
                sub: string;
                email: string;
                name: string;
                given_name: string;
                family_name: string;
                locale: string;
                picture: string;
                verified_email: boolean;
            } = await req.json();

            // Parse.masterKey = process.env.MASTER_KEY;
            const alreadyInDatabase = await new Parse.Query('_User').aggregate(
                [
                    // @ts-ignore
                    { $match: { username: { $regex: `^${escapeRegExp(res.given_name)}_` } } }, // @ts-ignore
                    { $group: { _id: null, total: { $sum: 1 } } }, // @ts-ignore
                    { $project: { _id: 0 } }
                ] /*,{ useMasterKey: true }*/
            );

            // Убедится что имя не занято

            const login_counter = alreadyInDatabase[0]?.total || 0;
            user.set('username', res.given_name + '_' + (login_counter + 1));
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
