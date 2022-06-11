// Правила подписок
// @ts-check
const params = {
    sp: null,
    /**@type {string} */ name: 'none',
    /**@type {number} */ price: 0,
    /**@type {string} */ period: 'none',
    /**@type {string} */ description: 'none',
    /**@type {Object} */ quotas: {},

    /**@type {Date} */ startedAt: null,
    /**@type {Date} */ expirationAt: null,
}
/**
 * @extends {Parse.Object<params>}
 */
class Subscription extends Parse.Object {
    constructor() {
        super('Subscription', Object.assign({},params));
        /** @type {params} */
        this.attributes
    }
    // start() {
    //     if(!(this.get('duration') > 0)) throw new Error('"Duration" must be greater than 0')
    //     if(this.get('status') !== 'stopped') throw new Error('Plan "status" must be "stopped"')
    //     if(!this.get('product')) throw new Error('Plan "product" must be set')
    //     if(!this.get('user')) throw new Error('Plan "user" must be set')
    //     this.set('status', 'started')
    //     this.set('startedAt', new Date())
    //     this.set('expirationAt', new Date(new Date().getTime() + (this.get('duration') * 1000)))
    //     this.save()
    // }
    // getDurationLeft() {
    //     return (this.get('expirationAt').getTime() - new Date().getTime()) / 1000
    // }
    // isExpired() {
    //     return this.get('expirationAt').getTime() < new Date().getTime()
    // }
    // stop() {
    //     if(this.get('status') !== 'started') throw new Error('Plan "status" must be "started"')
    //     this.set('status', 'stopped')
    //     this.set('duration', Math.round(this.getDurationLeft()))
    //     this.set('startedAt', null)
    //     this.set('expirationAt', null)
    //     this.save()
    // }
}

module.exports = Subscription;

const Schema = new Parse.Schema('Subscription');
Schema.get().catch(() => {
    Schema.addString('name', {required: true, defaultValue: 'Subscription Name'})
    Schema.addNumber('price', {defaultValue: 0})
    Schema.addString('period', {defaultValue: '1month'})
    Schema.addString('description', {defaultValue: 'Description'})
    Schema.addObject('quotas', {defaultValue: {}})
    Schema.save().then(installDepends)
})


const DefaultSubscriptions = {
    'free': {
        name: 'free',
        price: 0,
        period: 'infinity',
        quotas: {
            'spect1x': {
                remaining: 1000 * 60 * 60 * 20,
                duration: 1000 * 60 * 60 * 1
            },
            'spect4x': {
                remaining: 1000 * 60 * 60 * 20,
                duration: 1000 * 60 * 20,
            },
            'spect16x': {
                remaining: 1000 * 60 * 60 * 20,
                duration: 1000 * 60 * 5,
            },
        },
    },
    'pro': {
        name: 'pro',
        price: 10,
        period: '1month',
        quotas: {
            'spect1x': {
                remaining: 1000 * 60 * 60 * 20,
                duration: 1000 * 60 * 60 * 10
            },
            'spect4x': {
                remaining: 1000 * 60 * 60 * 20,
                duration: 1000 * 60 * 60 * 4,
            },
            'spect16x': {
                remaining: 1000 * 60 * 60 * 20,
                duration: 1000 * 60 * 60 * 1,
            },
        },
    },
    'vip': {
        name: 'vip',
        price: 20,
        period: '1month',
        quotas: {
            'spect1x': {
                remaining: 1000 * 60 * 60 * 20,
                duration: 1000 * 60 * 60 * 20
            },
            'spect4x': {
                remaining: 1000 * 60 * 60 * 20,
                duration: 1000 * 60 * 60 * 20,
            },
            'spect16x': {
                remaining: 1000 * 60 * 60 * 8,
                duration: 1000 * 60 * 60 * 4,
            },
        },
    },
}

const installDepends = async () => {
    for(const key in DefaultSubscriptions) {
        const sub = DefaultSubscriptions[key]
        const subscription = new Subscription();
        subscription.set('name', sub.name)
        subscription.set('price', sub.price)
        subscription.set('period', sub.period)
        subscription.set('description', sub.description)
        subscription.set('quotas', sub.quotas)
        await subscription.save()
    }
}

module.exports = Subscription;