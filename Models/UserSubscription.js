// Подписка пользователя
// @ts-check
const params = {
    /**@type {Parse.User} */
    user:null,
    /**@type {import("./Subscription")} */
    sp: null,
    /**@type {Date} */ ds: null,
    /**@type {Date} */ de: null,
    /**@type {Date} */ dc: null,
    /**@type {boolean} */ cde: true,
    /**@type {"canceled"|"stopped"|"active"} */
    status: 'stopped',
    /**@type {"way4pay"|"buymeacoffee"|"none"} */
    pm: 'none',
    /**@type {Date} */ startedAt: null,
    /**@type {Date} */ expirationAt: null,
}
/**
 * @extends {Parse.Object<params>}
 */
class UserSubscription extends Parse.Object {
    constructor() {
        super('UserSubscription', Object.assign({},params));
        /** @type {params} */
        this.attributes
    }
    /**
     * 
     * @param {Parse.User} user 
     * @param {import("./Subscription")} subscription 
     */
    static createRecord(user, subscription) {
        if(!user) throw new Error('User param must be set')
        if(!subscription) throw new Error('Subscription param must be set')
        const record = new UserSubscription()
        record.activate()
        record.set('user', user)
        record.set('sp', subscription)
        return record
    }
    // static getActualUserSubscriptions(user) {
    //     if(!user) throw new Error('User param must be set')
    //     return new Parse.Query('UserSubscription')
    //         .equalTo('user', user)
    //         .equalTo('status', 'active')
    //         .include('sp')
    //         .find()
    // }
    activate() {
        if(this.get('status') == 'active') throw new Error('Subscription "status" already "active"')
        this.set('status', 'active')
        this.set('ds', new Date())
        this.setExpirationDate(new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 24)))
        return this
    }
    /**
     * @param {Date} date 
     */
    setExpirationDate(date) {
        this.set('de', date)
    }
    сancel() {
        this.set('status', 'canceled')
        this.set('dc', new Date())
    }
    isExpired() {
        return this.get('de') < new Date()
    }
    cancelOnEnd(bool = true) {
        this.set('cde', bool)
        // this.save()
    }
    reactivate() {
        if(this.get('status') !== 'canceled') throw new Error('Subscription "status" must be "canceled"')
        throw new Error('Not implemented')
    }
}

module.exports = UserSubscription;

const Schema = new Parse.Schema('UserSubscription');
Schema.get().catch(() => {
    Schema.addPointer('user', '_User', {required: true})
    Schema.addPointer('sp', 'Subscription', {required: true})
    Schema.addDate('ds') // start
    Schema.addDate('de') // end
    Schema.addDate('dc') // canceled
    Schema.addBoolean('cde', {defaultValue: false}) // cancel to date end
    Schema.addString('status',{defaultValue: 'stopped'}) // status
    Schema.addString('pm', {defaultValue:'none'}) // payment method
    Schema.save()
})