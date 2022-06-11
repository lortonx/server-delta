// @ts-check
const BMC = require('../Payments/BMC');


const params = { 
    number_of_coffees:  0,
    support_created_on: new Date(),
    supporter_email: '',
    /** full price */
    total_amount:  0,
    /** @type {Parse.User=} */
    user: undefined,
    /** @type {BmcSupport=} */
    support: undefined,
    /** @type {BmcExtra=} */
    extra: undefined,
    processed: false,
}

/**
 * @extends {Parse.Object<params>}
 */

const BmcEvent = class BmcEvent extends Parse.Object {
    constructor() {
        // @ts-ignore
        super('BmcEvent',/** @type {params}*/{});
    }
    async findMyExtra(){
        return await BmcExtra.findRecord(
            this.get('supporter_email'),
            null,
            this.get('total_amount'),
            this.get('support_created_on')
        )
    }
    async findMySupport(){
        return await BmcSupport.findRecord(
            this.get('supporter_email'),
            null,
            this.get('total_amount'),
            this.get('support_created_on')
        )
    }
    /**
     * @param {import('../Payments/BMC').BmcHookEvent['response']} extra 
     */
    createRecord(extra){
        this.set({
            number_of_coffees: parseFloat(extra.number_of_coffees+''),
            support_created_on: BMC.normalizeDate(extra.support_created_on),
            supporter_email: extra.supporter_email||undefined,
            total_amount: parseFloat(extra.total_amount+'')
        })
    }
}
Parse.Object.registerSubclass('BmcEvent', BmcEvent);
global.BmcEvent = BmcEvent;
module.exports = BmcEvent;

const Schema = new Parse.Schema('BmcEvent');
Schema.get().catch(() => {
    Schema.addBoolean('processed',{defaultValue: false});
    Schema.addNumber('number_of_coffees',{defaultValue: 0})
    Schema.addDate('support_created_on')
    Schema.addString('supporter_email')
    Schema.addNumber('total_amount',{defaultValue: 0})
    Schema.addPointer('user', '_User')
    Schema.addPointer('support', 'BmcSupport')
    Schema.addPointer('extra', 'BmcExtra')
    Schema.save()
})


const BmcExtra = require('./BmcExtra');
const BmcSupport = require('./BmcSupport');