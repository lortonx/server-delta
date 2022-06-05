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
    // Schema.addIndex('productId_', {
    //     'productId': 'String'
    // })
    Schema.addNumber('type')
    Schema.addNumber('price')
    Schema.save()
})