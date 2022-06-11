// @ts-check
const BMC = require('../Payments/BMC.js');

const params = {
    payer_name: '',
    payer_email: '',
    
    purchase_amount:  '',
    /** full price */
    purchase_amount_number:  0,
    purchase_currency: '',
    purchase_id: 0,
    purchase_is_revoked: false,
    purchase_question: '',
    purchased_on: new Date(),
    purchase_updated_on: new Date(),

    reward_id: 0,
    reward_title: '',

    /** @type {Date} */
    usedAt: undefined,
    /** @type {Parse.User=} */
    usedBy: undefined,
    /** @type {Parse.User=} */
    user: undefined,
    /** @type {BmcSupport=} */
    support: undefined,
}

/**
 * @extends {Parse.Object<params>}
 */
class BmcExtra extends Parse.Object {
    constructor() {
        // @ts-ignore
        super('BmcExtra',/** @type {params}*/{});
    }
    /**
     * @param {string|undefined} email 
     * @param {string|undefined} name 
     * @param {number|undefined} purchase_amount_number 
     * @param {Date|undefined} date 
     * @returns {Promise<BmcExtra>}
     */
    static async findRecord(email, name, purchase_amount_number, date){
        const record = new Parse.Query(BmcExtra)
        record.equalTo('payer_email', email)
        if(name || name == '') record.equalTo('payer_name', name)
        record.equalTo('purchase_amount_number', purchase_amount_number)
        record.greaterThanOrEqualTo('purchased_on', new Date( date.getTime() - 1000*30 ))
        record.lessThanOrEqualTo('purchased_on', new Date( date.getTime() + 1000*30 ))
        return await record.first({useMasterKey: true});
    }
    async findMySupport(){
        const support = await BmcSupport.findRecord(
            this.get('payer_email'),
            this.get('payer_name'),
            this.get('purchase_amount_number'),
            this.get('purchased_on')
        )
        return support
    }
    /**
     * @param {import('../Payments/BMC').BmcExtras} extra 
     */
    createRecord(extra){
        this.set({
            payer_name: extra.payer_name||undefined,
            payer_email: extra.payer_email||undefined,
            purchase_amount: extra.purchase_amount,
            purchase_amount_number: parseFloat(extra.purchase_amount),
            purchase_currency: extra.purchase_currency||undefined,
            purchase_id: extra.purchase_id,
            purchase_is_revoked: !!extra.purchase_is_revoked,
            purchase_question: extra.purchase_question,
            purchased_on: BMC.normalizeDate(extra.purchased_on),
            purchase_updated_on: BMC.normalizeDate(extra.purchase_updated_on),
            reward_id: extra.extra.reward_id,
            reward_title: extra.extra.reward_title,
        })
    }
}
Parse.Object.registerSubclass('BmcExtra', BmcExtra);


const Schema = new Parse.Schema('BmcExtra');
Schema.get().catch(() => {
    Schema.addString('payer_name')
    Schema.addString('payer_email')
    Schema.addString('purchase_amount')
    Schema.addNumber('purchase_amount_number',{defaultValue: 0})
    Schema.addString('purchase_currency')
    Schema.addNumber('purchase_id',{defaultValue: 0})
    Schema.addBoolean('purchase_is_revoked', {defaultValue: false})
    Schema.addString('purchase_question')
    Schema.addNumber('reward_id',{defaultValue: 0})
    Schema.addString('reward_title')

    Schema.addDate('purchased_on')
    Schema.addDate('purchase_updated_on')
    
    
    Schema.addDate('usedAt')
    Schema.addPointer('usedBy', '_User')
    Schema.addPointer('user', '_User')
    Schema.addPointer('support', 'BmcSupport')
    Schema.save()
})

global.BmcExtra = BmcExtra;
module.exports = BmcExtra;

const BmcSupport = require('./BmcSupport.js');