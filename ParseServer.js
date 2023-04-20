// const ParseServer = require('parse-server/lib/ParseServer').default;

// import { ParseServer } from "parse-server";
import dotenv from 'dotenv';
Object.assign(process.env, dotenv.config().parsed);
import ps from 'parse-server';
const ParseServer =  ps.default


// import ps from "parse-server/lib/ParseServer";
// const ParseServer = ps.default;


const databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;
if (!databaseUri) {
  console.log('> DATABASE_URI not specified, falling back to localhost.');
}
/** @type {ParseServerOptions} */
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
		classNames: ['Plan', 'Comments', 'GameScore','MonitorRestrictionRules','Product','UserSubscription'], // List of classes to support for query subscriptions
	},
	jsonLogs: false,
};

export const parseServer = new ParseServer(config);

// /events create -title "@everyopne" -time "in 1 minute" -max 1