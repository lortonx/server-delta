// import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
// const auth = new GoogleAuth({
//     scopes: 'https://www.googleapis.com/auth/cloud-platform'
// });
Parse.Cloud.define('GoogleSignIn', async (request) => {
    const oAuth2Client = new OAuth2Client({
        clientId: process.env.client_id,
        clientSecret: process.env.client_secret,
        redirectUri: process.env.redirect_uris
    });
    const loginLink = oAuth2Client.generateAuthUrl({
        // Indicates that we need to be able to access data continously without the user constantly giving us consent
        access_type: 'offline',
        // Using the access scopes from our config file
        scope: ['email', 'openid', 'profile'], // @ts-ignore
        state: request.params
    });
    return loginLink;

    // Google's OAuth2 client
    // const OAuth2 = google.auth.OAuth2;

    // // Create an OAuth2 client object from the credentials in our config file
    // const oauth2Client = new OAuth2(process.env.client_id, process.env.client_secret, process.env.redirect_uris);
    // // Obtain the google login link to which we'll send our users to give us access
    // const loginLink = oauth2Client.generateAuthUrl({
    //     // Indicates that we need to be able to access data continously without the user constantly giving us consent
    //     access_type: 'offline',
    //     // Using the access scopes from our config file
    //     scope: ['email', 'openid', 'profile'], // @ts-ignore
    //     state: request.params
    // });
    // return loginLink;
});

Parse.Cloud.define('GoogleToken', async (request) => {
    const oAuth2Client = new OAuth2Client({
        clientId: process.env.client_id,
        clientSecret: process.env.client_secret,
        redirectUri: request.params.redirect || process.env.redirect_uris
    });
    // console.log(request.params);

    if (request['error']) {
        // The user did not give us permission.
        return request['error'];
    } else {
        // try {
        const { tokens } = await oAuth2Client.getToken(request.params.code);
        oAuth2Client.setCredentials(tokens);
        const usr_info = JSON.parse(Buffer.from(tokens.id_token.split('.')[1], 'base64').toString());

        // Auth data for Parse
        // console.log(usr_info);
        const authData = {
            id: usr_info.sub,
            email: usr_info.email,
            name: usr_info.name,
            id_token: tokens.id_token,
            access_token: tokens.access_token,
            code: request.params.code,
            picture: usr_info.picture
        };
        return authData;
    }

    // Google's OAuth2 client
    // const OAuth2 = google.auth.OAuth2;
    // // Create an OAuth2 client object from the credentials in our config file
    // const oauth2Client = new OAuth2(
    //     process.env.client_id,
    //     process.env.client_secret,
    //     request.params.redirect || process.env.redirect_uris
    // );

    // if (request['error']) {
    //     // The user did not give us permission.
    //     return request['error'];
    // } else {
    //     // try {
    //     const { tokens } = await oauth2Client.getToken(request.params.code);
    //     oauth2Client.setCredentials(tokens);
    //     const oauth2 = google.oauth2({
    //         auth: oauth2Client,
    //         version: 'v2'
    //     });
    //     const usr_info = await oauth2.userinfo.get();
    //     // Auth data for Parse
    //     console.log(usr_info);
    //     const authData = {
    //         id: usr_info.data.id,
    //         email: usr_info.data.email,
    //         name: usr_info.data.name,
    //         id_token: tokens.id_token,
    //         access_token: tokens.access_token,
    //         code: request.params.code,
    //         picture: usr_info.data.picture
    //     };
    //     return authData;
    // }
});

// Parse.Cloud.afterFind<Parse.User>(Parse.User, async (req) => {
//     console.log('afterFind ACCOUNT 0', req);
//     const user: Parse.User = req.user;

//     // @ts-ignore
//     const plans = req.objects;
//     if (plans) {
//         for (const object of plans) {
//             object.unset('email');
//             object.unset('first_name');
//             object.unset('last_name');
//             // object.attributes.email.toJSON = () => undefined;
//             // object.attributes.first_name.toJSON = () => undefined;
//             // object.attributes.last_name.toJSON = () => undefined;
//             // @ts-ignore
//             object.toJSON = () => {
//                 const dummy = {};
//                 const holder = new Proxy(dummy, {
//                     get: (target, prop) => {
//                         if (prop === 'email' || prop === 'first_name' || prop === 'last_name') {
//                             return undefined;
//                         }
//                         return object[prop];
//                     },
//                     set: (target, prop, value) => {
//                         object[prop] = value;
//                         return true;
//                     }
//                 });

//                 return holder;
//             };
//         }
//     }
//     return [...plans];
// });
// Parse.Cloud.afterLogin(async (req) => {
//     console.log('afterLogin ACCOUNT 0', req);
//     const user: Parse.User = req.user;
//     // @ts-ignore
//     const plans = req.objects;
//     if (plans) {
//         for (const object of plans) {
//             object.unset('email');
//             object.unset('first_name');
//             object.unset('last_name');
//             // object.attributes.email.toJSON = () => undefined;
//             // object.attributes.first_name.toJSON = () => undefined;
//             // object.attributes.last_name.toJSON = () => undefined;
//         }
//     }
// });
// Parse.Cloud.beforeFind<Parse.User>(Parse.User, async (req) => {
//     console.log('beforeFind ACCOUNT 0', req);
//     const user: Parse.User = req.user;
//     // @ts-ignore
//     // @ts-ignore
//     const plans = req.objects;
//     const query = req.query;
//     query.exclude('email', 'first_name', 'last_name');
//     query.exclude('email,first_name,last_name');
//     query.exclude('picture');
// });
// // Parse.Cloud.afterSave<Parse.User>('_User', async (req) => {
// //     console.log('afterSave ACCOUNT 0', req);
// //     const user: Parse.User = req.user;
// //     // @ts-ignore
// //     const plans = req.objects;
// //     if (plans) {
// //         for (const object of plans) {
// //             object.unset('email');
// //             object.unset('first_name');
// //             object.unset('last_name');
// //             // object.attributes.email.toJSON = () => undefined;
// //             // object.attributes.first_name.toJSON = () => undefined;
// //             // object.attributes.last_name.toJSON = () => undefined;
// //         }
// //     }
// // });
