// const Parse = require('parse');
Parse.initialize("myAppId", "myClientKey", "myMasterKey");
//javascriptKey is required only if you have it on server.
Parse.serverURL = 'http://localhost:1337/parse'


const Client = new class Client{
    constructor(){
        this.init();
    }
    async init(){
        let query = new Parse.Query('GameScore');
        // query.equalTo('name', 'Mengyan');
        let subscription = await query.subscribe();
        subscription.on('update', people => {
            console.log('update', people); // This should output 100
        })    
        subscription.on('create', people => {
            console.log('create',people); // This should output Mengyan
        })
    }
}
