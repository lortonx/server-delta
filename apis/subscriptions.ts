import Subscription from '../Models/Subscription';
import UserSubscription from '../Models/UserSubscription';

export default new (class subscriptionsApi {
    constructor() {}
    /**
     * @param {string} userId
     * @param {string} subscriptionId
     * @returns
     */
    async createUserSubscription(userId, subscriptionId) {
        const subscription = await new Parse.Query(Subscription)
            .equalTo('objectId', subscriptionId)
            .first({ useMasterKey: true });
        if (!subscription) throw new Error(`Subscription ${subscriptionId} not found`);
        const user = await new Parse.Query(Parse.User).equalTo('objectId', userId).first({ useMasterKey: true });
        if (!user) throw new Error(`User ${userId} not found`);
        const userSubscription = UserSubscription.createRecord(user, subscription);
        return await userSubscription.save({}, { useMasterKey: true });
    }
})();
