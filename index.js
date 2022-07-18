// @ts-check
require('dotenv').config();
const gql = require('graphql-tag');
const cors = require('cors');
const fs = require('fs');
const express = require('express');
const {/* default: ParseServer, */ParseGraphQLServer }  = require('parse-server')
const ParseServer = require('parse-server/lib/ParseServer').default;
const ParseDashboard = require('parse-dashboard');
const path = require('path');
const BMC = require('./Payments/BMC.js');
const parseServer = require('./ParseServer.js');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));


if(!('SIGNATURE_KEY' in process.env)){
	throw Error('SIGNATURE_KEY is not defined')
}

const app = express();

app.use(express.json( { verify: ( req, res, buffer ) => {
	// @ts-ignore
	req.rawBody = buffer
}}));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.post('/webhook/BmcHook/' ,(req, res)=>{
	const BMC_WEBHOOK_SECRET = process.env.BMC_SECRET
	/** @type {string} */
	// @ts-ignore
	const header_signature = req.headers['x-bmc-signature']
	/** @type {string} */
	// @ts-ignore
	const rawBody = req.rawBody.toString()
	if(process.env.NODE_ENV !== 'dev' && !BMC.verifyWebhook(rawBody, header_signature, BMC_WEBHOOK_SECRET)){
		return res.sendStatus( 401 )
	}
	res.sendStatus( 200 );

	/** @type {import("./Payments/BMC.js").BmcHookEvent} */
	const body = req.body
	console.log('APP WEBHOOKED BY BMC', body)
	srv.api.handleBmcEvent(body)
})

app.use('/', express.static(path.join(__dirname, '/public')));


// if (!test) {
// const api = new ParseServer(config);
// console.log(api.config.loggerController)
// }

// const parseGraphQLServer = new ParseGraphQLServer(parseServer,{
// 		graphQLPath: '/graphql',
// 		playgroundPath: '/playground',
// 		graphQLCustomTypeDefs: gql`${fs.readFileSync('./cloud/schema.graphql')}`,
// 	}
// );
app.use('/parse', parseServer.app);

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
const httpServer = require('http').createServer(app);
httpServer.listen(PORT, function () {
	console.log('Parse Server running on port ' + PORT + '.');
});
  // This will enable the Live Query real-time server
const parseLiveQueryServer = ParseServer.createLiveQueryServer(httpServer);
// console.log(parseLiveQueryServer)
// }


const dashboard_config = {
	"apps": [
		{
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
			  "user":process.env.DASHBOARD_USER,
			  "pass":process.env.DASHBOARD_PASS
		}]
		if(process.env.DASHBOARD_USER) return users
		return undefined
	}
}
let dashboard = ParseDashboard(dashboard_config);
app.use('/dashboard', dashboard);

const srv = {
	app,
	api: new (require('./apis/api')),
}
global.srv = srv;

module.exports = {
  app,
  config: parseServer.config
};
