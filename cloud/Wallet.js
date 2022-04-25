// @ts-check
// @ts-ignore
const Product = require('../Models/Product.js');
const Wallet = require('../Models/Wallet.js')

class UserWallet {
    /**
     * @param {Parse.User} user 
     */
    
  constructor(user) {
    this.user = user;
    Parse.Cloud.define('addProduct', req => {
        if(!req.user) throw new Error('Not authorized')
        // @ts-ignore
        const requestId = req.functionName + req.user.id
        const { user, params: {productId, amount} } = req;
        // @ts-ignore
        this.addProduct({user, productId, amount})
    },{
        fields : ['productId', 'amount'],
        requireUser: true
      },)
  }
  checkRequiredParams(obj, params){
    for(let param of params) if(obj[param] === undefined) throw new Error(`Param "${param}" is required`)
  }
//   async getOwnItem(itemName) {
//     const query = new Parse.Query(Wallet);
//     query.equalTo('user', this.user);
//     query.equalTo('productId', itemName);
//     const results = await query.find();
//     // const depositAmount = results.reduce((sum, transaction) => sum + transaction.get('amount'), 0);
//     // const query2 = new Parse.Query('Transaction');
//     // query2.equalTo('userId', this.userId);
//     // query2.equalTo('type', 'withdraw');
//     // const withdraws = await query2.find();
//     // const withdrawAmount = withdraws.reduce((sum, transaction) => sum + transaction.get('amount'), 0);
//     // return depositAmount - withdrawAmount;
//   }
//   async buyProduct(itemName, amount = 1, master = false) {
//     let userCoins = 0
//     {
//         const query = new Parse.Query(Wallet);
//         query.equalTo('user', this.user);
//         query.equalTo('productId', 'coin');
//         const results = await query.find();
//         console.log(results)
//     }
    
//   }
  
  /**
   * @param {Object} param
   * @param {Parse.User} param.user
   * @param {string} param.productId
   * @param {number} param.amount 
   */
  async addProduct({user, productId, amount}) {
        // this.checkRequiredParams(arguments[0], ['user','productId', 'amount'])
        const product = await new Parse.Query(Product)
            .equalTo('productId', productId)
            .first()

        let productWallet = await new Parse.Query(Wallet)
            .equalTo('user', user)
            .equalTo('product', product)
            .first();

        if(!productWallet) {
            productWallet = new Wallet()
            productWallet.set('user', user)
            productWallet.set('product', product)
            productWallet.set('amount', 0)
        }
        if(productWallet.get('amount') + amount > 0){
            if(amount > 0) productWallet.increment('amount', amount)
            else productWallet.decrement('amount', -amount)
        }else{
            productWallet.set('amount', 0)
        }
        await productWallet.save()
  }
}
  new UserWallet(null)
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