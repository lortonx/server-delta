// @ts-ignore
const CryptoJS = require('crypto-js');
const Cart = require('../Models/Cart.js');
const CartItem = require('../Models/CartItem.js');
const Plan = require('../Models/Plan.js');
const Product = require('../Models/Product.js');
const Subscription = require('../Models/Subscription.js');
const UserSubscription = require('../Models/UserSubscription.js');
const Wallet = require('../Models/Wallet.js');


const BMC = require('../Payments/BMC.js');
const coffee = new BMC(process.env.BMC_TOKEN||'null'); // add your token here

global.BMC = coffee;

Parse.Cloud.define('useBmcSupport', async req => {
    const requestId = req.functionName + req.user.id
    let all = [];
    let last_page = 1;
    let max_page = 2;
    for( let current_page = 1; current_page <= last_page; current_page++ ) {
        if( current_page > max_page ) break;
        await new Promise(resolve => setTimeout(resolve, 1000));
        // const {data: supporters} = await coffee.Subscriptions('all',current_page)
        // const {data: supporters} = await coffee.Supporters(current_page)
        const {data: supporters} = await coffee.Extras(current_page)
        console.log(supporters.current_page, supporters)
        if(!supporters) throw new Error('Cant get supporters')
        last_page = supporters.last_page
        all = all.concat(supporters.data)
    }
    return {
        // status: status,
        data: all
    }

},{
    requireUser: true,
    // fields : ['objectId'],
})

// ;((async () => {
//     let data
//     data = await coffee.getSubscriptionById(128616)
//     console.log(data)

// })())

// coffee.Supporters().then(data => console.log('Supporters',data));
// coffee.Subscriptions().then(data => console.log('Subscriptions',data));
// coffee.Extras().then(data => console.log('Extras',data));

Parse.Cloud.define('getWallet', async req => {
    const requestId = req.functionName + req.user.id
    const wallet = await new Parse.Query(Wallet)
        .select('product.productId,amount,type')
        .equalTo('user', req.user)
        .include('product')
        .find()
    return wallet.map(item => {
        return {
            productId: item.get('product').get('productId'),
            amount: item.get('amount'),
            type: item.get('type')
        }
    })
},{
    requireUser: true
})

/** JSON вид */
Parse.Cloud.define('getPlan', async req => {
    const requestId = req.functionName + req.user.id
    const plans = await new Parse.Query(Plan)
        .select('product.productId,product.type,expirationAt,duration,status')
        .include('product')
        .equalTo('user', req.user)
        .find()
    return plans.map(item => {
        return {
            id: item.id,
            productId: item.get('product').get('productId'),
            duration: item.get('duration'),
            expirationAt: item.get('expirationAt').toISOString(),
            type: item.get('product').get('type'),
            status: item.get('status')
        }
    })
},{
    requireUser: true
})


Parse.Cloud.define('exchangeCoffeeForSubscription', async req => {
    const requestId = req.functionName + req.user.id
    const user = req.user

    {
        const userActiveSubscriptions = await new Parse.Query('UserSubscription')
            .equalTo('user', user)
            .equalTo('status', 'active')
            .greaterThan('de', new Date())
            .count()
        if(userActiveSubscriptions > 0) throw new Error('You already have an active subscription')
    }
    
    const sp = await new Parse.Query(Subscription).equalTo('name', 'Vip').first()
    const usersubscription = new UserSubscription();
    usersubscription.set('user', user);
    usersubscription.set('sp', sp);
    usersubscription.activate()
    await usersubscription.save()
},{
    requireUser: true
})


Parse.Cloud.beforeFind('Plan', async (req, res) =>{
    /** @type {Parse.Query} */
    const query = req.query
    if(query._select?.includes('sig')) query.select('user','name')
    if(query._select?.includes('duration')) query.select('de')
    if(query._select?.includes('remaining')) query.select('dr')
})

/** Доцепляем duration, remaining, sig */
Parse.Cloud.afterLiveQueryEvent('Plan', (request) => {
    /** @type {Plan}*/
    const object = request.object;
    const user = request.user
    const original = request.original

    object.set('duration', object.getDurationLeft())
    object.set('remaining', object.getRemainingLeft())
    object.set('sig',  
        CryptoJS.HmacMD5(
            [
                object.id, 
                object.get('name'),
                object.get('user')?.id,
                object.get('duration'),
                object.get('remaining'),
            ].join(':'),
            process.env.SIGNATURE_KEY + user.id
        ).toString()
    )
    // console.log(request, object.id, object.get('name'), object.get('user')?.id, object.get('duration'), object.get('remaining'), process.env.SIGNATURE_KEY + user.id)
  });
  

Parse.Cloud.afterFind('Plan', async (req, res) =>{
    /** @type {Plan[]}*/
    const plans = req.objects
    /** @type {Parse.User} */
    const user = req.user
    const enableSignature = req.query._select?.includes('sig')
    for(const object of plans){
        
        if(object.attributes.de) object.set('duration', object.getDurationLeft())
        if(object.attributes.dr) object.set('remaining', object.getRemainingLeft())
        object.attributes.updatedAt.toJSON = () => undefined
        object.attributes.createdAt.toJSON = () => undefined
        if(enableSignature){
            object.set('sig',  
                CryptoJS.HmacMD5(
                    [
                        object.id, 
                        object.get('name'),
                        object.get('user')?.id,
                        object.get('duration'),
                        object.get('remaining'),
                    ].join(':'),
                    process.env.SIGNATURE_KEY + user.id
                ).toString()
            )
            // console.log(object.id, object.get('name'), object.get('user')?.id, object.get('de'), object.get('dr'), process.env.SIGNATURE_KEY + user.id)
            /** @type {Parse.User} */
            // const owner = object.get('user')?.id
        }

    }
  })

