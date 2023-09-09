import subscriptions from './subscriptions';

import { default as lol } from '../src/cloud/processUserData';
lol;
import _BMC from '../Payments/BMC';
import BmcSupport from '../Models/BmcSupport';
import BmcExtra from '../Models/BmcExtra';
import BmcEvent from '../Models/BmcEvent';
const BMC = new _BMC(process.env.BMC_TOKEN || 'null');
export default class Api {
    subscriptions = subscriptions;
    constructor() {}
    /**
     * @param {IBmcHookBase} event
     */
    async handleBmcEvent(event) {
        if (!event || !event.data) throw new Error('Bmc event is empty');

        if (event.type in this) {
            this[event.type](event.data);
        } else {
            console.log('Bmc event type not found', event.type);
        }

        /*const bmcEvent = new BmcEvent()
		bmcEvent.createRecord(event.response)
		
		await this.syncAll()

		const promise1 = bmcEvent.findMySupport().then( obj =>{
			if(obj){
				bmcEvent.set('support', obj)
			}else{

			}
		})
		const promise2 = bmcEvent.findMyExtra().then( obj =>{
			bmcEvent.set('extra', obj)
		})
		await Promise.all([promise1,promise2])
		await bmcEvent.save({processed: true}, { useMasterKey: true })*/
    }
    /** @param {IBmcDonationCreated['data']} data*/
    async ['donation.created'](data) {
        const bmcEvent = new BmcEvent();
        bmcEvent.createRecord(data);
        const user = await bmcEvent.findUserByEmail(data.supporter_email);
        if (user) bmcEvent.set('user', user);

        await this.syncAll();
        const promise1 = bmcEvent.findMySupport().then((obj) => {
            if (obj) {
                bmcEvent.set('support', obj);
            } else {
            }
        });

        await Promise.all([promise1, bmcEvent.save()]);
    }
    async syncAll(syncOnlyLatest = true) {
        const addedBmcSupport = await this.syncBmcSupports(syncOnlyLatest, async (arr) => {
            await this.asociateBmcSupportsWithUsers(arr);
        });
        const addedBmcExtra = await this.syncBmcExtras(syncOnlyLatest, async (arr) => {
            // console.log('addedBmcExtra', arr)
            await this.asociateBmcExtrasWithUsersAndSupports(arr);
        });
    }
    /**
     * @param {BmcSupport[]=} array
     * @returns {Promise<BmcSupport[]>}
     */
    async asociateBmcSupportsWithUsers(array) {
        const email_list = array.map((support) => support.get('payer_email'));
        const emails_ids = await this.searchUserIdsByEmails(email_list);
        array.forEach((support) => {
            // if(support.get('user')) return
            const i = emails_ids.emails.indexOf(support.get('payer_email'));
            //@ts-ignore
            if (i == -1) support.set('user', { __type: 'Pointer', className: '_User', objectId: emails_ids.ids[i] });
        });
        return array;
    }
    /**
     * @param {BmcExtra[]=} array
     * @returns {Promise<BmcExtra[]>}
     */
    async asociateBmcExtrasWithUsersAndSupports(array) {
        const email_list = array.map((support) => support.get('payer_email'));
        const emails_ids = await this.searchUserIdsByEmails(email_list);
        // console.log('array array', array)
        await Promise.all(
            array.map(async (extra) => {
                // if(support.get('user')) return
                const i = emails_ids.emails.indexOf(extra.get('payer_email'));
                //@ts-ignore
                if (i !== -1) extra.set('user', { __type: 'Pointer', className: '_User', objectId: emails_ids.ids[i] });
                const support = await extra.findMySupport();
                extra.set('support', support);
            })
        );

        return array;
    }
    /**
     * @param {boolean} syncOnlyLatest
     * @param {function( BmcSupport[] ): any|undefined} perIteration
     * @returns
     */
    async syncBmcSupports(syncOnlyLatest = true, perIteration = (supports_page) => {}) {
        /** @type {BmcSupport[]} */
        let addedObjects = [];
        /**@param {IBmcSupport[]} supports*/
        const per_page_iteration = async (supports) => {
            const to_create = new Set(supports.map((support) => support.support_id));
            /** @type {Array<object>}*/
            const alreadyInDatabaseUsers = await new Parse.Query(BmcSupport).aggregate([
                // @ts-ignore
                { $match: { support_id: { $in: Array.from(to_create) } } },
                // @ts-ignore
                { $project: { support_id: 1, objectId: 0 } }
            ]);
            alreadyInDatabaseUsers.forEach((support) => to_create.delete(support.support_id));

            /** @type {BmcSupport[]} */
            let addedInIterationObjects = [];
            for (const support of supports) {
                if (!to_create.has(support.support_id)) continue;
                const bmcSupport = new BmcSupport();
                bmcSupport.createRecord(support);
                addedObjects.push(bmcSupport);
                addedInIterationObjects.push(bmcSupport);
            }

            perIteration(addedInIterationObjects);
            await Parse.Object.saveAll(addedObjects, { useMasterKey: true });

            return {
                hasAlreadyInDatabase: alreadyInDatabaseUsers.length > 0,
                addedObjects: addedInIterationObjects
            };
        };
        /** @type {BmcSupport[]} */
        let all = [];

        let last_page = 1;
        let max_page = Infinity;
        for (let current_page = 1; current_page <= last_page; current_page++) {
            if (current_page > max_page) break;
            const response = await BMC.Supporters(current_page);
            const data = response.data;
            if (!data) throw new Error("Can't get data");
            const resultOfUpdate = await per_page_iteration(data.data);
            // console.log('resultOfUpdate', resultOfUpdate)
            last_page = data.last_page;
            all = all.concat(data.data);
            addedObjects.push(...resultOfUpdate.addedObjects);
            if (syncOnlyLatest && resultOfUpdate.hasAlreadyInDatabase) break;
            if (Number(response.headers['x-ratelimit-remaining']) < 47) {
                console.log('Rate limit reached');
                break;
            }
            if (Number(response.headers['x-ratelimit-remaining']) < 51)
                await new Promise((resolve) => setTimeout(resolve, 10000));
            if (Number(response.headers['x-ratelimit-remaining']) < 50)
                await new Promise((resolve) => setTimeout(resolve, 10000));
            if (Number(response.headers['x-ratelimit-remaining']) < 49)
                await new Promise((resolve) => setTimeout(resolve, 10000));
            if (Number(response.headers['x-ratelimit-remaining']) < 48)
                await new Promise((resolve) => setTimeout(resolve, 10000));
        }

        return addedObjects;
    }
    /**
     * @param {boolean} syncOnlyLatest
     * @param {function( BmcExtra[] ): any|undefined} perIteration
     * @returns
     */
    async syncBmcExtras(syncOnlyLatest = true, perIteration = (extras_page) => {}) {
        /** @type {BmcExtra[]} */
        let addedObjects = [];

        /**@param {IBmcExtras[]} extras*/
        const per_page_iteration = async (extras) => {
            /** @type {BmcExtra[]} */ let addedInIterationObjects = [];
            /** @type {Set<number>}*/ const to_create = new Set();
            extras.forEach((extra) => to_create.add(extra.purchase_id));
            /** @type {Array<{purchase_id: number}>}*/
            const alreadyInDatabaseUsers = await new Parse.Query(BmcExtra).aggregate([
                // @ts-ignore
                { $match: { purchase_id: { $in: Array.from(to_create) } } },
                // @ts-ignore
                { $project: { purchase_id: 1, objectId: 0 } }
            ]);
            alreadyInDatabaseUsers.forEach((support) => to_create.delete(support.purchase_id));
            for (const extra of extras) {
                if (!to_create.has(extra.purchase_id)) continue;
                const bmcExtra = new BmcExtra();
                bmcExtra.createRecord(extra);
                addedObjects.push(bmcExtra);
                addedInIterationObjects.push(bmcExtra);
            }
            perIteration(addedInIterationObjects);
            await Parse.Object.saveAll(addedObjects, { useMasterKey: true });
            return {
                hasAlreadyInDatabase: alreadyInDatabaseUsers.length > 0,
                addedObjects: addedInIterationObjects
            };
        };
        /** @type {IBmcExtras[]} */
        let all = [];
        let last_page = 1;
        let max_page = Infinity;
        for (let current_page = 1; current_page <= last_page; current_page++) {
            if (current_page > max_page) break;
            const response = await BMC.Extras(current_page);
            const data = response.data;
            // console.log('data', data)
            if (!data) throw new Error("Can't get data");
            const resultOfUpdate = await per_page_iteration(data.data);
            last_page = data.last_page;
            all = all.concat(data.data);
            addedObjects.push(...resultOfUpdate.addedObjects);
            if (syncOnlyLatest && resultOfUpdate.hasAlreadyInDatabase) break;
            if (Number(response.headers['x-ratelimit-remaining']) < 47) {
                console.log('Rate limit reached');
                break;
            }
            if (Number(response.headers['x-ratelimit-remaining']) < 51)
                await new Promise((resolve) => setTimeout(resolve, 10000));
            if (Number(response.headers['x-ratelimit-remaining']) < 50)
                await new Promise((resolve) => setTimeout(resolve, 10000));
            if (Number(response.headers['x-ratelimit-remaining']) < 49)
                await new Promise((resolve) => setTimeout(resolve, 10000));
            if (Number(response.headers['x-ratelimit-remaining']) < 48)
                await new Promise((resolve) => setTimeout(resolve, 10000));
        }

        return addedObjects;
    }
    /**
     * @param {Array<string>} emails
     * @returns {Promise< { emails: string[] , ids: string[] } >}
     */
    async searchUserIdsByEmails(emails) {
        const data = await new Parse.Query('_User').aggregate([
            // @ts-ignore
            { $match: { email: { $in: emails } } },
            {
                // @ts-ignore
                $group: {
                    _id: '',
                    ids: { $addToSet: '$_id' },
                    emails: { $addToSet: '$email' }
                }
            }
        ]);
        if (data.length === 1) return data[0];
        return { emails: [], ids: [] };
    }
    // /**
    //  * @param {import('../Payments/BMC').BmcSupport[]} bmcSupporters
    //  * @returns
    //  */
    // async asociateBmcSupportersWithUser(bmcSupporters){}
}

// async function per

// module.exports = Api;

// const alreadyInDatabaseUsers = await (new Parse.Query('_User')).aggregate([
// 	{match: { email: {$in: ['lorton.x@gmail.com','alex.lylko@gmail.com','kitikuou114514@gmail.com'] } }},
// 	{$group:{
//         _id:'',
//         kv: {
//           $push: {
//             k: "$_id",
//             v: "$email"
//         }},
//         // vk: {
//         //   $push: {
//         //     k: "$_id",
//         //     v: "$email"

//         // }},
//         vk: {$addToSet:{v:'$email',k:'$_id' }}
//     }},
//     {"$replaceRoot":{
//     "newRoot": {"$arrayToObject":"$vk"}
//   }},

// ])
// alreadyInDatabaseUsers
