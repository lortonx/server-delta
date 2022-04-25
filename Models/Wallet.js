// @ts-check
const Parse = require('parse/node');
const params = {
    /**@type {import("./Product.js")} */
    product: null,
    type: 0,
    amount: 0,
    /**@type {Parse.User} */
    user: null,
    /**@type {Date} */
    createdAt: null,
    /**@type {Date} */
    updatedAt: null,
}
// @ts-ignore
class Wallet extends Parse.Object {
    constructor() {
        super('Wallet', Object.assign({},params));
        /** @type {params} */
        this.attributes
    }
}

module.exports = Wallet;

const Schema = new Parse.Schema('Wallet');
Schema.get().then(()=>{
    console.log('Schema Wallet is already created', Schema)
}).catch(() => {
    Schema.addNumber('amount')
    // Schema.addString('product')
    Schema.addPointer('user', '_User')
    Schema.addPointer('product', 'Product')
    
    Schema.save()
})

// /** @type {<T>(x: T, y: T): keyof T} */
// function getKey(x, y) {
//     // Proposed: This should be OK
//     return Object.keys(x)[0];
// }
// const obj1 = { name: "", x: 0, y: 0 };
// const obj2 = { x: 0, y: 0 };
// // Value "name" inhabits variable with type "x" | "y"
// const s = getKey(obj1, obj2);