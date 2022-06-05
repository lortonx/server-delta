// Объект в корзине
// @ts-check
const params = {
    /**@type {import("./Product.js")} */
    product: null,
    /**@type {import("./Cart.js")} */
    cart:null,
    amount: 0,
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

module.exports = CartItem;

const Schema = new Parse.Schema('CartItem');
Schema.get().catch(() => {
    Schema.addPointer('product', 'Product')
    Schema.addPointer('cart', 'Cart')
    Schema.addNumber('amount')
    Schema.save()
})