// План использования продукта

const UserSubscription = require("./UserSubscription")

// @ts-check
const params = {
    // /**@type {import("./Product.js")} */
    // product: null,
    /**@type {string} */
    name: '',
    /**@type {Parse.User} */
    user:null,
    /** Duration of availibility plan */
    // duration: 0,
    /**@type {"stopped"|"started"} */
    // status: 'stopped',
    /**@type {Date} */
    ds: null, // Date start
    /**@type {Date} */
    de: null, // Date expiration
    /**@type {Date} */
    dr: null, // Date remaining
    /**@type {Date} */
    createdAt: null,
    /**@type {Date} */
    updatedAt: null,
}
/**
 * @extends {Parse.Object<params>}
 */
class Plan extends Parse.Object {
    /**
     * 
     * @param {Parse.User} user 
     */
    static query(user) {
        return new Parse.Query(Plan)
        // @ts-ignore
		.select('name,ds,de,dr')
		.equalTo('user', user)
    }
    /**
     * @param {Parse.User} user
     * @param {'spect1x'|'spect4x'|'spect16x'} name
     */
    static createRecord(user, name){
        const availableNames = ['spect1x','spect4x','spect16x']
		if(!name) throw new Error(`Name "${name}" is not specified`)
		if(!availableNames.includes(name)) throw new Error(`Name "${name}" is not available`)
		{
			const plan = new Plan()
			plan.init()
			plan.set('user', user)
			plan.set('name', name)
            plan.setDuration(0)
            plan.setRemaining(0)
			plan.start()
            return plan
		}
    }
    /**
     * @param {Parse.User} user 
     * @param {string} name 
     * @returns 
     */
    static async getUserPlanByName(user, name) {
        if(!user) throw new Error('User must be set')
        if(!name) throw new Error('Name of plan must be set')
        const plan = new Parse.Query(Plan)
		.select('name,ds,de,dr,user')
		.equalTo('user', user)
        .equalTo('name', name)
        .first()
        return await plan
    }
    /**
     * @param {UserSubscription} userSubscription 
     */
    renewAccordingSubscription(userSubscription){

    }
    constructor() {
        super('Plan')
        /** @type {params} */
        this.attributes
    }
    init() {
        this.set(params)
    }
    /**
     * Для верного старта необходимо установить
     * duration in seconds,
     * remaining in seconds,
     * user
     */
    start() {
        // if(!(this.get('duration') > 0)) throw new Error('"duration" must be greater than 0')
        // if(!(this.get('remaining') > 0)) throw new Error('"remaining" must be greater than 0')
        // if(this.get('status') !== 'stopped') throw new Error('Plan "status" must be "stopped"')
        if(!this.get('name')) throw new Error('Plan "name" must be set')
        if(!this.get('user')) throw new Error('Plan "user" must be set')
        // this.set('status', 'started')
        this.set('ds', new Date())
        // this.set('de', new Date(new Date().getTime() + (this.get('duration') * 1000)))
        // this.set('dr', new Date(new Date().getTime() + (this.get('remaining') * 1000)))
    }
    /** @returns {number} in seconds*/
    getDurationLeft() {
        return Math.max(0, 0|((this.get('de').getTime() - new Date().getTime()) / 1000))
    }
    /** @returns {number} in seconds*/
    getRemainingLeft() {
        return Math.max(0, 0|((this.get('dr').getTime() - new Date().getTime()) / 1000))
    }
    setDuration(miliseconds) {
        this.set('de', new Date(new Date().getTime() + miliseconds))
    }
    setRemaining(miliseconds) {
        this.set('dr', new Date(new Date().getTime() + miliseconds))
    }
    // stop() {
    //     if(this.get('status') !== 'started') throw new Error('Plan "status" must be "started"')
    //     this.set('status', 'stopped')
    //     this.set('duration', Math.round(this.getDurationLeft()))
    //     this.set('ds', null)
    //     this.set('de', null)
    // }
}
Parse.Object.registerSubclass('Plan', Plan);
module.exports = Plan;

const Schema = new Parse.Schema('Plan');
Schema.get().catch(() => {
    Schema.addString('name')
    Schema.addIndex('name_', {
        // @ts-ignore
        'name': 1
    })
    Schema.addPointer('user', '_User')
    Schema.addDate('ds')
    Schema.addDate('de')
    Schema.addDate('dr')
    Schema.save()
})