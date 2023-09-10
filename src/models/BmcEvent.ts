const params = {
    id: 0,
    amount: 0,
    object: '',
    status: '',
    message: '',
    currency: '',
    refunded: false, 
    created_at: new Date(),
    note_hidden: 'false',
    refunded_at: new Date(0),
    /** @example "Thanks for the good work" */
    support_note: '',
    support_type: '',
    supporter_name: '',
    /** @example "pi_3Mc51bJEtINljGAa0zVykgUE"*/
    transaction_id: '',
    application_fee: 0,
    supporter_email: '',
    total_amount_charged: 0,

    support: undefined,
    /** @type {Date} */
    usedAt: new Date(0),
    /** @type {Parse.User=} */
    usedBy: undefined,
    /** @type {Parse.User=} */
    user: undefined
};

export default class BmcEvent extends Parse.Object<typeof params> {
    constructor() {
        super('BmcEvent', params);
    }
    createRecord(support) {
        this.set('id', support.id);
        this.set('amount', support.amount);
        this.set('object', support.object);
        this.set('status', support.status);
        this.set('message', support.message);
        this.set('currency', support.currency);
        this.set('refunded', support.refunded === 'true');
        // this.set('created_at', BMC.secondsToDate(support.created_at));
        this.set('note_hidden', support.note_hidden);
        // this.set('refunded_at', BMC.secondsToDate(support.refunded_at));
        this.set('support_note', support.support_note);
        this.set('support_type', support.support_type);
        this.set('supporter_name', support.supporter_name);
        this.set('transaction_id', support.transaction_id);
        this.set('application_fee', parseFloat(support.application_fee));
        this.set('supporter_email', support.supporter_email);
        this.set('total_amount_charged', parseFloat(support.total_amount_charged));
        return this;
    }
}
Parse.Object.registerSubclass('BmcEvent', BmcEvent);

// const Schema = new Parse.Schema('BmcEvent');
// Schema.get().catch(() => {
//     for (const key in params) {
//         const type = typeof params[key];
//         if (type == 'number') Schema.addNumber(key, { defaultValue: params[key] });
//         else if (type == 'string') Schema.addString(key);
//         else if (type == 'boolean') Schema.addBoolean(key, { defaultValue: params[key] });
//         else if (params[key] && 'getDate' in params[key]) Schema.addDate(key);
//         else if (key == 'user') Schema.addPointer(key, '_User');
//         else if (key == 'usedBy') Schema.addPointer(key, '_User');
//         else if (key == 'support') Schema.addPointer(key, 'BmcSupport');
//     }
//     Schema.save();
// });

// global.BmcEvent = BmcEvent;
