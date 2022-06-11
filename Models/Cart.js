// Корзина пользователя
const params = {
    /**@type {Parse.User} */
    customer: null,
    /**@type {import("./CartItem.js")} */
    cartItems: null,
    status: '',
    /**@type {Date} */
    createdAt: null,
    /**@type {Date} */
    updatedAt: null,
}
/**
 * @extends {Parse.Object<params>}
 */
class Cart extends Parse.Object {
    constructor() {
        super('Cart', Object.assign({},params));
        /** @type {params} */
        this.attributes
    }
}

module.exports = Cart

const Schema = new Parse.Schema('Cart');
Schema.get().catch(() => {
    Schema.addPointer('customer', '_User')
    Schema.addRelation('cartItems', 'CartItem')
    Schema.addString('status')
    Schema.addNumber('price')
    Schema.save()
})