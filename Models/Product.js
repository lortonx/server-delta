// @ts-check
const Parse = require('parse/node');
const params = {
    productId: 'noname',
    type: 0,
    price: 0,
    /**@type {Parse.User} */
    createdAt: null,
    /**@type {Date} */
    updatedAt: null,
}
// @ts-ignore
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