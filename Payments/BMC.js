const cryptoJs = require('crypto-js');

/**
 * Buy Me A Coffee JS | Main File
 * by Waren Gonzaga
 * modified by Alex L
 */
 const axios = require('axios').default;
// https://developers.buymeacoffee.com/#/apireference
// https://www.buymeacoffee.com/webhook
// https://developers.buymeacoffee.com/dashboard
// https://pipedream.com/@lortonx/requestbin-p_2gCmo23/inspect/299TEV7J2jV5kS1iiGbPUlWJhDE
class BMC {
    constructor(access_token) {
        this.access_token = access_token;
    }
    /**
     * 
     * @param {number} page 
     */
    Supporters(page) {
        const params = new URLSearchParams({
            page: page
        })
        return this._sendRequest('supporters', params);
    }
    /**
     * @param {"active"|"inactive"|"all"} status 
     */
    Subscriptions(status = 'all', page = 1) {
        const params = new URLSearchParams({
            status: status,
            page: page
        })
        return this._sendRequest('subscriptions', params);
    }

    Extras() {
        return this._sendRequest('extras');
    }
    /**
     * 
     * @param {number} supporterId 
     * @returns 
     */
    OnetimeSupporterId(supporterId) {
        if(supporterId == undefined) throw new Error('Argument "supporterId" is required')
        return this._sendRequest(`supporters/${supporterId}`);
    }
    /**
     * 
     * @param {*} path 
     * @returns {Promise<BmcSupportersPage>}
     */
    _sendRequest(path, params = '') {
        const url = `https://developers.buymeacoffee.com/api/v1/${path}?${params}`;
        // const url = `https://httpbin.org/headers?${path}?${params}`;
        return new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: url,
                headers: {
                    'Authorization': 'Bearer ' + this.access_token
                },
                timeout: 1000,
            })
            .then(res => resolve(res))
            .catch(err => reject(err))
        })
    }
    /**
     * 
     * @param {string} bodyString received post data
     * @param {string} header_signature received header signature
     * @param {string} BMC_WEBHOOK_SECRET  webhook secret from bmc
     * @returns {boolean}
     */
    static verifyWebhook(bodyString, header_signature, BMC_WEBHOOK_SECRET) {
        const signature = cryptoJs.HmacSHA256(
            bodyString,
            BMC_WEBHOOK_SECRET
        ).toString()
        return signature === header_signature;
    }
}
 
module.exports = BMC;

/**
    @memberof window
    @typedef {Object} BmcHookEvent
    @property {Object} response
    @property {string=} response.supporter_name ex "name"
    @property {string} response.supporter_email ex "example@email.com"
    @property {string} response.number_of_coffees ex "1"
    @property {string} response.total_amount ex "3"
    @property {string} response.support_created_on ex "2022-06-04T17:47:04.000000Z"
 */

/**
    @typedef BmcSupportersPage
    @property {number} current_page page of the result set
    @property {BmcSupport[]} data
    @property {string} first_page_url ex "https://developers.buymeacoffee.com/api/v1/supporters?page=1"
    @property {number} from ex 6
    @property {number} last_page ex 11
    @property {string} last_page_url ex "https://developers.buymeacoffee.com/api/v1/supporters?page=11"
    @property {string} next_page_url ex "https://developers.buymeacoffee.com/api/v1/supporters?page=3"
    @property {string} path ex "https://developers.buymeacoffee.com/api/v1/supporters"
    @property {number} per_page ex 5
    @property {string} prev_page_url: "https://developers.buymeacoffee.com/api/v1/supporters?page=1"
    @property {number} to ex 10
    @property {number} total ex 53
 */


/**
    @typedef BmcSupport
    @property {string} country Country code (2 letters)
    @property {null|*} is_refunded null
    @property {null|*} order_payload: null
    @property {string} payer_email emal
    @property {string} payer_name: "Alex Io"
    @property {string} payment_platform ex "stripe"
    @property {null|*} referer  null
    @property {string} support_coffee_price ex "0.0000"
    @property {number} support_coffees ex 5
    @property {string} support_created_on: "2022-05-14 10:29:48"
    @property {string} support_currency ex "EUR"
    @property {string} support_email
    @property {0|1} support_hidden
    @property {number} support_id
    @property {string} support_note Message from the supporter
    @property {string} support_updated_on ex "2022-05-14 10:29:48"
    @property {0|1} support_visibility
    @property {string} supporter_name ex "Alex Io"
    @property {string} transaction_id
    @property {null|*} transfer_id
 */