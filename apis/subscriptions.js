const Subscription = require('../Models/Subscription.js');
const UserSubscription = require('../Models/UserSubscription.js');

const subscriptions = new class subscriptionsApi {
	constructor() {
	}
	/**
	 * @param {string} userId 
	 * @param {string} subscriptionId 
	 * @returns 
	 */
	async createUserSubscription(userId, subscriptionId) {
		const subscription = await new Parse.Query(Subscription).equalTo('objectId', subscriptionId).first({useMasterKey: true})
		if(!subscription) throw new Error(`Subscription ${subscriptionId} not found`)
		const user = await new Parse.Query(Parse.User).equalTo('objectId', userId).first({useMasterKey: true})
		if(!user) throw new Error(`User ${userId} not found`)
		const userSubscription = UserSubscription.createRecord(user, subscription)
		return await userSubscription.save({}, {useMasterKey: true})
	}
}




module.exports = subscriptions;