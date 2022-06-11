// Объект в корзине
// @ts-check
const params = {
    /**@type {import("./Product")} */
    product: null,
    /**@type {import("./Cart")} */
    cart:null,
    amount: 0,
    /**@type {Date} */
    createdAt: null,
    /**@type {Date} */
    updatedAt: null,
}
/**
 * @extends {Parse.Object<params>}
 */

const CartItem = class CartItem extends Parse.Object {
    constructor() {
        super('CartItem', Object.assign({},params));
    }
}

const Schema = new Parse.Schema('CartItem');
Schema.get().catch(() => {
    Schema.addPointer('product', 'Product')
    Schema.addPointer('cart', 'Cart')
    Schema.addNumber('amount')
    Schema.save()
})

module.exports = CartItem;