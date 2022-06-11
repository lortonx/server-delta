// @ts-ignore
const Cart = require('../Models/Cart.js');
const CartItem = require('../Models/CartItem.js');
const Plan = require('../Models/Plan.js');
const Product = require('../Models/Product.js');
const Subscription = require('../Models/Subscription.js');
const UserSubscription = require('../Models/UserSubscription.js');
const Wallet = require('../Models/Wallet.js')



class UserWallet {
	/**
	 * @param {Parse.User} user 
	 */
	
	constructor(user) {
		this.user = user;
		// Parse.Cloud.define('addProduct', async req => {
		// 	if(!req.user) throw new Error('Not authorized')
		// 	const requestId = req.functionName + req.user.id
		// 	const { user, params: {productId, amount} } = req;
		// 	await this.addProduct({user, productId, amount})
		// },{
		// 	fields : ['productId', 'amount'],
		// 	requireUser: true
		// })
		Parse.Cloud.define('getPayLink', async req => {
			if(!req.user) throw new Error('Not authorized')
			const requestId = req.functionName + req.user.id
			const { user, params: {objectId, amount} } = req;
			await this.getPayLink({user, objectId, amount})
		},{
			fields : ['objectId'],
		})
		// Parse.Cloud.define('addPlan', async req => {
		// 	if(!req.user) throw new Error('Not authorized')
		// 	const requestId = req.functionName + req.user.id
		// 	// const { user, params: {productId, duration} } = req;
		// 	await this.addPlan(req.user, req.params.name, req.params.duration, req.params.remaining)
		// },{
		// 	fields : ['name', 'duration','remaining'],
		// 	requireUser: true
		// })
		Parse.Cloud.define('getPlans', async req => {
			if(!req.user) throw new Error('Not authorized')
			const requestId = req.functionName + req.user.id
			return await this.getPlans(req.user)
		},{
			requireUser: true
		})
		Parse.Cloud.define('usePlan', async req => {
			if(!req.user) throw new Error('Not authorized')
			const requestId = req.functionName + req.user.id
			return await this.usePlan(req.user, req.params.name)
		},{
			fields : ['name'],
			requireUser: true
		})

		Parse.Cloud.define('createUserSubscription', async req => {
			// if(!req.user) throw new Error('Not authorized')
			// const requestId = req.functionName + req.user.id
			return await this.createUserSubscription(req.params.userId, req.params.planId)
		},{
			fields : ['userId', 'planId'],
			requireUser: true,
			requireAnyUserRoles: ['Administrator']
		})
	}
	// /**
	//  * @param {Parse.User} param.user
	//  * @param {string} param.productId
	//  * @param {number} param.amount 
	//  */
	// async addProduct({user, productId, amount}) {
	// 	const product = await new Parse.Query(Product).equalTo('objectId', productId).first()
	// 	if(!product) throw new Error(`Product ${productId} not found`)

	// 	let productWallet = await new Parse.Query(Wallet)
	// 		.equalTo('user', user)
	// 		.equalTo('product', product)
	// 		.first();

	// 	if(!productWallet) {
	// 		productWallet = new Wallet()
	// 		productWallet.set('user', user)
	// 		productWallet.set('product', product)
	// 		productWallet.set('amount', 0)
	// 	}
	// 	if(productWallet.get('amount') + amount > 0){
	// 		if(amount > 0) productWallet.increment('amount', amount)
	// 		else productWallet.decrement('amount', -amount)
	// 	}else{
	// 		productWallet.set('amount', 0)
	// 	}
	// 	await productWallet.save()
	// }
	/**
	 * @param {Parse.User} param.user
	 * @param {string} param.objectId
	 * @param {number} param.amount 
	 */
	async getPayLink({user, objectId, amount}) {
		const cartId = objectId
		const cart = await new Parse.Query(Cart).equalTo('objectId', cartId).first()
		if(!cart) throw new Error('Cart not found')
		
		{
			const cartItem = new CartItem
			cartItem.set('cart', cart)
			cartItem.set('product', await new Parse.Query(Product).equalTo('productId', 'coin').first() )
			cartItem.set('amount', 60)
			cart.add('cartItems', cartItem)
		}
		// {
		//   const cartItem = new CartItem
		//   cartItem.set('cart', cart)
		//   cartItem.set('product', await new Parse.Query(Product).equalTo('productId', 'fullmap1h').first() )
		//   cartItem.set('amount', 2)
		//   cart.addUnique('cartItems', cartItem)
		// }

		await cart.save()

		console.log(cart)
	}
	// async addPlan(user, name, duration, remaining) {
	// 	const availableNames = ['spect1x','spect4x','spect16x']
	// 	if(!name) throw new Error(`Name "${name}" is not specified`)
	// 	if(!availableNames.includes(name)) throw new Error(`Name "${name}" is not available`)
	// 	{
	// 		const plan = new Plan()
	// 		plan.init()
	// 		plan.set('user', user)
	// 		plan.set('duration', duration)
	// 		plan.set('remaining', remaining)
	// 		plan.set('name', name)
	// 		plan.start()
	// 		plan.save()
	// 	}

	// }
	/**
	 * @param {Parse.User} param.user
	 */
	async getPlans(user) {
		/** @type {Plan} */
		const response = 
		await new Parse.Query(Plan)
		.select('name,ds,de,dr')
		.equalTo('user', user)
		.find()
		// console.log(response)
		return response.map(plan => {
			return {
				name: plan.get('name'),
				duration: plan.getDurationLeft(),
				remaining: plan.getRemainingLeft(),
			}
		})
	}
	async createUserSubscription(userId, subscriptionId) {
		const subscription = await new Parse.Query(Subscription).equalTo('objectId', subscriptionId).first({useMasterKey: true})
		if(!subscription) throw new Error(`Subscription ${subscriptionId} not found`)
		const user = await new Parse.Query(Parse.User).equalTo('objectId', userId).first({useMasterKey: true})
		if(!user) throw new Error(`User ${userId} not found`)
		const userSubscription = UserSubscription.createRecord(user, subscription)
		return await userSubscription.save({}, {useMasterKey: true})
	}
	async usePlan(user, planName) {
		const availableNames = ['spect1x','spect4x','spect16x']
		if(!availableNames.includes(planName)) throw new Error(`Name "${planName}" is not available`)
		/**
		 * Поиск имени плана пользователя
		 * Проверка возможности продления плана
		 * Поиск актуальной подписки пользователя
		 * Активация плана
		 */
		let plan = await Plan.getUserPlanByName(user, planName)
		if(!plan) {
			try{
				plan = Plan.createRecord(user, planName)
			}catch(e){
				throw new Error(`Plan "${planName}" not found`)
			}
			
		}

		if(plan.getRemainingLeft() != 0) throw new Error('Remaining is not ready')
		if(plan.getDurationLeft() != 0) throw new Error('Plan is not expired')
			

		const activeUserSubscription = await new Parse.Query(UserSubscription)
			.equalTo('user', user)
			.greaterThanOrEqualTo('de', new Date())
			.include('sp')
			.first()
		if(!activeUserSubscription) throw new Error('No active subscriptions')

		/**@type {Subscription} */
		const sp = activeUserSubscription.get('sp')
		if(!sp) throw new Error('No attached sp (Subscription) in UserSubscription')
		const quotas = sp.get('quotas')
		if(!quotas) throw new Error('No attached quotas in Subscription')
		if(!quotas[planName]) throw new Error(`No quota for plan name "${planName}"`)
		plan.setDuration(quotas[planName].duration)
		plan.setRemaining(quotas[planName].remaining)
		plan.start()
		plan.save()
		

	}
}
  new UserWallet(null)

// Parse.Cloud.run('addProduct',{
//     productId: 'kqslinYkDw',
//     amount: 5000
// })

//   async deposit(amount) {
//     const transaction = new Parse.Object('Transaction');
//     transaction.set('userId', this.userId);
//     transaction.set('type', 'deposit');
//     transaction.set('amount', amount);
//     await transaction.save();
//     this.balance += amount;
//   }

//   async withdraw(amount) {
//     const transaction = new Parse.Object('Transaction');
//     transaction.set('userId', this.userId);
//     transaction.set('type', 'withdraw');
//     transaction.set('amount', amount);
//     await transaction.save();
//     this.balance -= amount;
//   }


// Parse.masterKey = 'masterkey'
// await (new Parse.Query('Wallet')).aggregate([
//         { $match: { _p_product:  "Product$3xJ1KfMh9Z" }},
// 		// { $group: { _id: null, total: { $sum: 1 } } },
//         { $project: { _id: 0 , product: 0, user: 0} }
// 			], { useMasterKey: true })


// var visitQuery = new Parse.Query('Visit');
// visitQuery.equalTo('user', { "__type": "Pointer", "className": "_User", "objectId": userId });
// return visitQuery.find();