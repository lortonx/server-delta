Parse.Cloud.define('BmcHook', async req => {
    /** @type {import("../Payments/BMC.js").BmcHookEvent} */
    const event = req.params
    // req.headers['x-bmc-event'] == 'coffee-purchase'
    console.log(req)
    
    console.log('BmcHook', event)
},{
})