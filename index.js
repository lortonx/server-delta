// Example express application adding the parse-server module to expose Parse
// compatible API routes.
require('dotenv').config();
const express = require('express');
const ParseServer = require('parse-server').ParseServer;
const path = require('path');
const args = process.argv || [];
const test = args.some(arg => arg.includes('jasmine'));

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('> DATABASE_URI not specified, falling back to localhost.');
}
const config = {
	// allowOrigin:'*',
	// allowClientClassCreation: false,
	appName: 'Delta Backend',
	databaseURI:  databaseUri ,
	// directAccess: true,
	cloud: process.env.CLOUD_CODE_MAIN || './cloud/main.js',
	appId: 'myAppId',
	masterKey:  'myMasterKey', //Add your master key here. Keep it secret!
	serverURL: process.env.SERVER_URL, // Don't forget to change to https if needed
	liveQuery: {
		classNames: ['Posts', 'Comments', 'GameScore','MonitorRestrictionRules'], // List of classes to support for query subscriptions
	},
	auth: {
		// "google": {
		// 	"id": "random UUID with lowercase hexadecimal digits"
		// },
		// "anonymous": {
		// 	"id": "random UUID with lowercase hexadecimal digits"
		// }
	}
};
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

const app = express();

// Serve static assets from the /public folder
app.use('/', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
const mountPath = process.env.PARSE_MOUNT || '/parse';
if (!test) {
  const api = new ParseServer(config);
  app.use(mountPath, api);
}

// Parse Server plays nicely with the rest of your web routes
// app.get('/', function (req, res) {
//   res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
// });

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function (req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

const port = process.env.PORT || 1337;
if (!test) {
  const httpServer = require('http').createServer(app);
  httpServer.listen(port, function () {
    console.log('parse-server-example running on port ' + port + '.');
  });
  // This will enable the Live Query real-time server
  ParseServer.createLiveQueryServer(httpServer);
}

module.exports = {
  app,
  config,
};

// Пример отправки POST запроса:

// async function postData(url = '', data = {}) {
// 	// Default options are marked with *
// 	const response = await fetch(url, {
// 	  method: 'POST', // *GET, POST, PUT, DELETE, etc.
// 	//   mode: 'cors', // no-cors, *cors, same-origin
// 	//   cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
// 	//   credentials: 'same-origin', // include, *same-origin, omit
// 	  headers: {
// 		'X-Parse-Application-Id':'myAppId',
// 		'X-Parse-Master-Key':'myMasterKey',
// 		'Content-Type': 'application/json'
// 		// 'Content-Type': 'application/x-www-form-urlencoded',
// 	  },
// 	//   redirect: 'follow', // manual, *follow, error
// 	//   referrerPolicy: 'no-referrer', // no-referrer, *client
// 	  body: JSON.stringify(data) // body data type must match "Content-Type" header
// 	});
// 	return response // parses JSON response into native JavaScript objects
//   }
//   var data = {
// 	// classLevelPermissions:
// 	// {
// 	//   "find": {
// 	// 	"requiresAuthentication": true,
// 	// 	"role:admin": true
// 	//   },
// 	//   "get": {
// 	// 	"requiresAuthentication": true,
// 	// 	"role:admin": true
// 	//   },
// 	//   "create": { "role:admin": true },
// 	//   "update": { "role:admin": true },
// 	//   "delete": { "role:admin": true }
// 	// }
//   }
  
//   setTimeout(() => {

// 	postData('http://localhost:1337/parse/schemas/Announcement', data)
// 	.then((data) => {
// 		console.log(data); // JSON data parsed by `response.json()` call
// 	});

//   },2000)
