import { RecordToType } from 'parse-server';
import schema from '../schema/Subscription.schema';
import moment from 'moment';

type t = RecordToType<typeof schema.fields>;
const className = 'Subscription';
export default class Subscription extends Parse.Object<t> {
    constructor() {
        super(className, {});
    }
}

Parse.Object.registerSubclass(className, Subscription);

const DefaultSubscriptions = {
    free: {
        name: 'free',
        price: 0,
        period: 'infinity',
        quotas: {
            spect1x: {
                remaining: moment.duration('PT20H').asMilliseconds(),
                duration: moment.duration('PT1H').asMilliseconds()
            },
            spect4x: {
                remaining: moment.duration('PT20H').asMilliseconds(),
                duration: moment.duration('PT20M').asMilliseconds()
            },
            spect16x: {
                remaining: moment.duration('PT20H').asMilliseconds(),
                duration: moment.duration('PT5M').asMilliseconds()
            }
        }
    },
    pro: {
        name: 'pro',
        price: 10,
        period: '1month',
        quotas: {
            spect1x: {
                remaining: moment.duration('PT20H').asMilliseconds(),
                duration: moment.duration('PT10H').asMilliseconds()
            },
            spect4x: {
                remaining: moment.duration('PT20H').asMilliseconds(),
                duration: moment.duration('PT4H').asMilliseconds()
            },
            spect16x: {
                remaining: moment.duration('PT20H').asMilliseconds(),
                duration: moment.duration('PT1H').asMilliseconds()
            }
        }
    },
    vip: {
        name: 'vip',
        price: 20,
        period: '1month',
        quotas: {
            spect1x: {
                remaining: moment.duration('P1D').asMilliseconds(),
                duration: moment.duration('P1D').asMilliseconds()
            },
            spect4x: {
                remaining: moment.duration('P1D').asMilliseconds(),
                duration: moment.duration('P1D').asMilliseconds()
            },
            spect16x: {
                remaining: moment.duration('P1D').asMilliseconds(),
                duration: moment.duration('P1D').asMilliseconds()
            }
        }
    }
};

const installDepends = async () => {
    for (const key in DefaultSubscriptions) {
        const sub = DefaultSubscriptions[key];
        const subscription = new Subscription();
        subscription.set('name', sub.name);
        subscription.set('price', sub.price);
        subscription.set('period', sub.period);
        subscription.set('description', sub.description);
        subscription.set('quotas', sub.quotas);
        await subscription.save();
    }
};
