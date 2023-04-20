// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// console.log(__dirname)
const __dirname = path.resolve();
import dotenv from 'dotenv';
Object.assign(process.env, dotenv.config().parsed);

import gpl, { gql } from 'graphql-tag';
import fs from 'fs';

import cors from 'cors';
import express from 'express';
import { ParseServer, ParseGraphQLServer } from 'parse-server';
// import ParseServer from 'parse-server/lib/ParseServer';
import ParseDashboard from 'parse-dashboard';
import path from 'path';
import BMC from './Payments/BMC.js';
// import {parseServer} from './ParseServer.js';
import { fileURLToPath } from 'url';
import http from 'http';

const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));




if(!('SIGNATURE_KEY' in process.env)){
	throw Error('SIGNATURE_KEY is not defined')
}


export const app = express();

app.use(express.json( { verify: ( req, res, buffer ) => {
	// @ts-ignore
	req.rawBody = buffer
}}));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post('/webhook/BmcHook/', (req, res)=>{
	const BMC_WEBHOOK_SECRET = process.env.BMC_SECRET
	const header_signature = String(req.headers['x-signature-sha256'])
	// @ts-ignore
	const rawBody = String(req.rawBody.toString())
	const isVerified = BMC.verifyWebhook(rawBody, header_signature, BMC_WEBHOOK_SECRET)
	// console.log('incoming webhook', { isVerified })
	if(BMC_WEBHOOK_SECRET !== 'NONE' && !isVerified){
		return res.sendStatus( 401 )
	}
	res.sendStatus( 200 );

	/** @type {IBmcHookBase} */
	const body = req.body
	console.log('APP WEBHOOKED BY BMC', body)
	srv.api.handleBmcEvent(body)
})

app.use('/public', express.static(path.join(__dirname, '/public')));


// if (!test) {
// const api = new ParseServer(config);
// console.log(api.config.loggerController)
// }


// await parseServer.start()

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
if (!databaseUri) {
  console.log('> DATABASE_URI not specified, falling back to localhost.');
}
/** @typedef {import('parse-server/lib/Options/Definitions')['ParseServerOptions']} ParseServerOption */ // @ts-ignore
/** @type {{ [K in keyof ParseServerOption]?: ReturnType<ParseServerOption[K]['action']> | ParseServerOption[K]['default']}} */
const config = {
	// logLevel: 'info',
	// silent: true,
	allowOrigin:'*', 
	// allowClientClassCreation: false,
	logLevel: "error",
	appName: 'Delta Backend',
	databaseURI:  databaseUri ,
	// directAccess: true,
	cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
	appId: 'myAppId',
	masterKey:  process.env.MASTER_KEY || 'myMasterKey', //Add your master key here. Keep it secret!
	serverURL: process.env.SERVER_URL, // Don't forget to change to https if needed
	liveQuery: {
		classNames: ['Plan', 'Comments', 'GameScore','MonitorRestrictionRules','Product','UserSubscription'], // List of classes to support for query subscriptions
	},
	jsonLogs: false,
	masterKeyIps: ['0.0.0.0/0', '::1']
};

const parseServer =  ParseServer(config);

const parseGraphQLServer = new ParseGraphQLServer(parseServer,{
	graphQLPath: '/graphql',
	playgroundPath: '/playground',
	graphQLCustomTypeDefs: gql`${fs.readFileSync('./cloud/schema.graphql')}`,
});

/**
 * Parse govnocode fix
 */
const real_resolve = path.resolve
if(process.platform.includes('win')) path.resolve = function(){
	if(arguments[1]?.includes?.(config.cloud)) {
		path.resolve = real_resolve
		return 'file://' + real_resolve.apply(this, arguments)
	}
	return real_resolve.apply(this, arguments)
}
// @ts-ignore
await parseServer.start()

app.use('/parse', parseServer.app);
// console.log(parseLiveQueryServer)
// }


// parseGraphQLServer.applyGraphQL(app);
// parseGraphQLServer.applyPlayground(app);
// Parse Server plays nicely with the rest of your web routes
// app.get('/', function (req, res) {
//   res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
// });

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});



const PORT = process.env.PORT || 1337;
// if (!test) {
const httpServer = http.createServer(app);
httpServer.listen(PORT, function () {
	console.log('Parse Server running on port ' + PORT + '.');
});

const parseLiveQueryServer = ParseServer.createLiveQueryServer(httpServer);


{
	const config = {
		"apps": [
			{
				"graphQLServerURL": parseServer.config.serverURL.replace('parse', 'graphql'),
				"serverURL": parseServer.config.serverURL,
				"appId": parseServer.config.appId,
				"masterKey": parseServer.config.masterKey,
				"appName": parseServer.config.appName
			}
		],
		"trustProxy": 1,
		allowInsecureHTTP: false,
		get users(){
			const users = [{
				  "user": process.env.DASHBOARD_USER,
				  "pass": process.env.DASHBOARD_PASS
			}]
			if(process.env.DASHBOARD_USER) return users
			return undefined
		}
	}
	const dashboard = ParseDashboard(config);
	app.use('/dashboard', dashboard);
}

// import Api from './apis/api.js';

const srv = {
	app,
	// @ts-ignore
	api: new (await import('./apis/api.js').then(m=>m.default)),
	// api: new Api,
}
global.srv = srv;