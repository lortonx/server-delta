import { RecordToType } from 'parse-server';
import { IBmcDonationCreated, IBmcDonationRefunded } from '../providers/BMC/BMC.types';
import BmcEventSchema from '../schema/BmcDonation.schema';
import BMC from '../providers/BMC/BMC';

type t = RecordToType<typeof BmcEventSchema.fields>;
export default class BmcDonation extends Parse.Object<t> {
    constructor() {
        super('BmcDonation', {});
    }

    findUserByEmail(email) {
        return new Parse.Query(Parse.User).equalTo('email', email).first({ useMasterKey: true });
    }
    // findMyExtra() {
    //     return BmcExtra.findRecord(this.get('supporter_email'), null, this.get('amount'), this.get('created_at'));
    // }
    // async findMySupport() {
    //     return await BmcSupport.findRecord(
    //         this.get('supporter_email'),
    //         null,
    //         this.get('amount'),
    //         this.get('created_at')
    //     );
    // }
    createRecord(event: IBmcDonationCreated) {
        const support = event.data;
        this.set('id', support.id);
        this.set('amount', support.amount);
        this.set('status', support.status);
        this.set('message', support.message);
        this.set('currency', support.currency);
        this.set('refunded', BMC.istru(support.refunded));
        this.set('created_at', BMC.secondsToDate(support.created_at));
        this.set('note_hidden', support.note_hidden);
        this.set('refunded_at', BMC.secondsToDate(support.refunded_at));
        this.set('support_note', support.support_note);
        this.set('support_type', support.support_type);
        this.set('supporter_name', support.supporter_name);
        this.set('transaction_id', support.transaction_id);
        this.set('application_fee', parseFloat(support.application_fee));
        this.set('supporter_email', support.supporter_email);
        this.set('total_amount_charged', parseFloat(support.total_amount_charged));
        return this;
    }
    refunded(event: IBmcDonationRefunded) {
        const support = event.data;
        this.set('status', support.status);
        this.set('refunded', BMC.istru(support.refunded));
        this.set('refunded_at', BMC.secondsToDate(support.refunded_at));
        this.set('support_note', support.support_note);
        return this;
    }
}

Parse.Object.registerSubclass('BmcDonation', BmcDonation);
