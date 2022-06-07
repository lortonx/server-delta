// Example express application adding the parse-server module to expose Parse
// compatible API routes.
require('dotenv').config();
const gql = require('graphql-tag');
const cors = require('cors');
const bodyParser = require('body-parser')
const fs = require('fs');
const express = require('express');
const { default: ParseServer, ParseGraphQLServer }  = require('parse-server')
const ParseDashboard = require('parse-dashboard');
const path = require('path');
const cryptoJs = require('crypto-js');
const BMC = require('./Payments/BMC.js');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('> DATABASE_URI not specified, falling back to localhost.');
}
const config = {
	// logLevel: 'info',
	// silent: true,
	allowOrigin:'*', 
	// allowClientClassCreation: false,
	logLevel: "error",
	appName: 'Delta Backend',
	databaseURI:  databaseUri ,
	// directAccess: true,
	cloud: process.env.CLOUD_CODE_MAIN || './cloud/main.js',
	appId: 'myAppId',
	masterKey:  process.env.MASTER_KEY || 'myMasterKey', //Add your master key here. Keep it secret!
	serverURL: process.env.SERVER_URL, // Don't forget to change to https if needed
	liveQuery: {
		classNames: ['Plan', 'Comments', 'GameScore','MonitorRestrictionRules','Product'], // List of classes to support for query subscriptions
	},
};

const app = express();

app.use(express.json( { verify: ( req, res, buffer ) => { req.rawBody = buffer; } } ));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.post('/webhook/BmcHook/' ,(req, res)=>{
	const BMC_WEBHOOK_SECRET = process.env.BMC_SECRET
	const header_signature = req.headers['x-bmc-signature']
	if(!BMC.verifyWebhook(req.rawBody.toString(), header_signature, BMC_WEBHOOK_SECRET)){
		return res.sendStatus( 401 )
	}
	res.sendStatus( 200 );

	/** @type {import("./Payments/BMC.js").BmcHookEvent} */
	/** @type {BmcHookEvent} */
	const body = req.body
	const data = body.response
	console.log('APP WEBHOOKED BY BMC', data)
})

app.use('/', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
// if (!test) {
const api = new ParseServer(config);

// }

const parseGraphQLServer = new ParseGraphQLServer(api,{
		graphQLPath: '/graphql',
		playgroundPath: '/playground',
		graphQLCustomTypeDefs: gql`${fs.readFileSync('./cloud/schema.graphql')}`,
	}
);
  app.use(mountPath, api.app);

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


// Parse.Cloud.define('BmcHook', async req => {
//     /** @type {import("../Payments/BMC.js").BmcHookEvent} */
//     const event = req.params
//     // req.headers['x-bmc-event'] == 'coffee-purchase'
//     console.log(req)
    
//     console.log('BmcHook', event)
// },{
//     requireUser: false,
//     requireMaster: false,
// })

const port = process.env.PORT || 1337;
// if (!test) {
const httpServer = require('http').createServer(app);
httpServer.listen(port, function () {
	console.log('parse-server-example running on port ' + port + '.');
});
  // This will enable the Live Query real-time server
const parseLiveQueryServer = ParseServer.createLiveQueryServer(httpServer);
console.log(parseLiveQueryServer)
// }


const dashboard_config = {
	"apps": [
		{
			"serverURL": config.serverURL,
			"appId": config.appId,
			"masterKey": config.masterKey,
			"appName": config.appName
		}
	],
	"trustProxy": 1,
	allowInsecureHTTP: false
}
if(process.env.DASHBOARD_USER){
	dashboard_config["users"] = [
		{
		  "user":process.env.DASHBOARD_USER,
		  "pass":process.env.DASHBOARD_PASS
		}
	]
}
let dashboard = new ParseDashboard(dashboard_config);
app.use('/dashboard', dashboard);


module.exports = {
  app,
  config,
};
