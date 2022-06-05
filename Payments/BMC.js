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

    Supporters(page) {
        const params = new URLSearchParams({
            page: page
        })
        return this._sendRequest('supporters', params);
    }
    /**
     * @param {"active"|"inactive"|"all"} status 
     * @returns 
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
}
 
 module.exports = BMC;