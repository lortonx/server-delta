// Продукт
// @ts-check
const params = {
    productId: 'noname',
    type: 0,
    price: 0,
    /**@type {Parse.User} */
    createdAt: null,
    /**@type {Date} */
    updatedAt: null,
}
/**
 * @extends {Parse.Object<params>}
 */
class Product extends Parse.Object {
    constructor() {
        super('Product', Object.assign({},params));
        /** @type {params} */
        this.attributes
    }
}

module.exports = Product;

const Schema = new Parse.Schema('Product');
Schema.get().catch(() => {
    Schema.addString('productId')
    Schema.addNumber('type')
    Schema.addNumber('price')
    Schema.save()
})