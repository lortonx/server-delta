import ParseServer from 'parse-server';

const databaseUri = process.env.DATABASE_URI
if (!databaseUri) {
  throw Error('DATABASE_URI not specified');
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