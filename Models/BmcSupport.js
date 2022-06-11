// @ts-check
const BMC = require('../Payments/BMC.js');


const params = {
    payer_name: '',
    payer_email: '',
    
    supporter_name: '',
    /** Probably null */
    support_email: '',
    
    country: '',
    payment_platform: '',
    referer: '',
    support_coffee_price_number:  0,
    /** Price per coffee*/
    support_coffee_price:  '',
    /** Multiplier */
    support_coffees: 0,
    /** full price */
    total_amount:  0,
    support_created_on: new Date(),
    support_updated_on: new Date(),
    support_currency: '',
    support_hidden: false,
    support_visibility: true,
    support_id: 0,
    support_note: '',
    /** @type {string|"FREE_REWARD"}*/
    transaction_id: '',
    transfer_id: undefined,

    /** @type {Date} */
    usedAt: undefined,
    /** @type {Parse.User=} */
    usedBy: undefined,

    // /** @type {BmcExtra=} */
    extra: undefined,
    /** @type {Parse.User=} */
    user: undefined
}
/**
 * @extends {Parse.Object<params>}
 */
const BmcSupport = class BmcSupport extends Parse.Object {
    constructor() {
        // @ts-ignore
        super('BmcSupport', /** @type {params}*/{})
    }
    /**
     * @param {string|undefined} email 
     * @param {string|undefined} name 
     * @param {number|undefined} purchase_amount_number full price
     * @param {Date|undefined} date 
     * @returns {Promise<BmcSupport>}
     */
     static async findRecord(email, name, purchase_amount_number, date){
        const record = new Parse.Query(BmcSupport)
        record.equalTo('payer_email', email)
        if(name || name == '') record.equalTo('payer_name', name)
        record.equalTo('total_amount', purchase_amount_number)
        record.greaterThanOrEqualTo('support_created_on', new Date( date.getTime() - 1000*30 ))
        record.lessThanOrEqualTo('support_created_on', new Date( date.getTime() + 1000*30 ))
        return await record.first({useMasterKey: true});
    }
    /**
     * @param {number} support_id 
     */
    static findById(support_id){
        return new Parse.Query(BmcSupport)
        .equalTo('support_id', support_id)
    }
    async findMyExtra(){
        return await BmcExtra.findRecord(
            this.get('payer_email'),
            this.get('payer_name'),
            this.get('support_coffee_price_number'),
            this.get('support_created_on')
        )
    }
    /**
     * @param {import('../Payments/BMC').BmcSupport} support 
     */
    createRecord(support){
        this.set({
            payer_name: support.payer_name,
            payer_email: support.payer_email,
            supporter_name: support.supporter_name,
            support_email: support.support_email||'',
            country: support.country,
            payment_platform: support.payment_platform,
            referer: support.referer||'',
            support_coffee_price_number: parseFloat(support.support_coffee_price),
            support_coffee_price: support.support_coffee_price,
            support_coffees: support.support_coffees,
            total_amount: parseFloat(support.support_coffees+'') * parseFloat(support.support_coffee_price),
            support_created_on: BMC.normalizeDate(support.support_created_on),
            support_updated_on: BMC.normalizeDate(support.support_updated_on),
            support_currency: support.support_currency,
            support_hidden: !!support.support_hidden,
            support_visibility: !!support.support_visibility,
            support_id: support.support_id,
            support_note: support.support_note||'',
            transaction_id: support.transaction_id,
            transfer_id: support.transfer_id||'',
        })
        return this
    }
    // /**
    //  * @template {string} K
    //  * @param {{[ K in keyof params]?: params[K]} | keyof params} attrs 
    //  * @param {*} options 
    //  */
    // set(attrs, options) {
    //     super.set(attrs, options)
    //     return this
    // }
    // /**
    //  * @template {string} T
    //  * @param {T} attr
    //  * @returns {keyof Parse.BaseAttributes[T]: [T]}
    //  */
    // get(attr) {
    //     return super.get(attr)
    // }
}
Parse.Object.registerSubclass('BmcSupport', BmcSupport);


const Schema = new Parse.Schema('BmcSupport');
Schema.get().catch(() => {
    Schema.addString('payer_name')
    Schema.addString('payer_email')
    Schema.addString('supporter_name')
    Schema.addString('support_email')
    Schema.addString('country')
    Schema.addString('payment_platform')
    Schema.addString('referer')
    Schema.addNumber('support_coffee_price_number')
    Schema.addString('support_coffee_price')
    Schema.addNumber('support_coffees')
    Schema.addNumber('total_amount')
    Schema.addDate('support_created_on')
    Schema.addDate('support_updated_on')
    Schema.addString('support_currency')
    Schema.addBoolean('support_hidden', {defaultValue: false})
    Schema.addBoolean('support_visibility', {defaultValue: true})
    Schema.addNumber('support_id')
    Schema.addString('support_note')
    Schema.addString('transaction_id')
    Schema.addString('transfer_id')

    Schema.addDate('usedAt')
    Schema.addPointer('usedBy', '_User')
    Schema.addPointer('extra', 'BmcExtra')
    Schema.addPointer('user', '_User')
    Schema.save()
})

global.BmcSupport = BmcSupport;
module.exports = BmcSupport;

const BmcExtra = require('./BmcExtra.js');