// @ts-check
const Parse = require('parse/node');
const params = {
    /**@type {import("./Product.js")} */
    product: null,
    amount: 0,
    /**@type {Cart} */
    cart: null,
    /**@type {Date} */
    createdAt: null,
    /**@type {Date} */
    updatedAt: null,
}
// @ts-ignore
class CartItem extends Parse.Object {
    constructor() {
        super('CartItem', Object.assign({},params));
        /** @type {params} */
        this.attributes
    }
}

const params2 = {
    /**@type {Parse.User} */
    customer: null,
    status: '',
    /**@type {Date} */
    createdAt: null,
    /**@type {Date} */
    updatedAt: null,
}
// @ts-ignore
class Cart extends Parse.Object {
    constructor() {
        super('Cart', Object.assign({},params2));
        /** @type {params} */
        this.attributes
    }
}

module.exports = {CartItem, Cart};

// const Schema = new Parse.Schema('Product');
// Schema.get().catch(() => {
//     Schema.addString('productId')
//     Schema.addNumber('type')
//     Schema.addNumber('price')
//     Schema.save()
// })