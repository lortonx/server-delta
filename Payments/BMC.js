const cryptoJs = require('crypto-js');

/**
 * Buy Me A Coffee JS | Main File
 * by Waren Gonzaga
 * modified by Alex L
 */
 const axios = require('axios').default;
 const toughCookie = require('tough-cookie');
// https://developers.buymeacoffee.com/#/apireference
// https://www.buymeacoffee.com/webhook
// https://developers.buymeacoffee.com/dashboard
// https://pipedream.com/@lortonx/requestbin-p_2gCmo23/inspect/299TEV7J2jV5kS1iiGbPUlWJhDE
// https://zapier.com/apps/buy-me-a-coffee/integrations
/**
 * TODO
 * New Support - Triggers when you have a new supporter.
 * New Extra Purchase - Triggers when you have a new purchase on your extra.
 * New Purchase - Triggers when there is a new purchase on your shop item.
 * New Member - Triggers when you have a new monthly or yearly member.
 * **************************************************************************
 * New Post - Triggers when you create a new post.
 * New Extra - Triggers when you create a new extra.
 * New Product - Triggers when you add a new product to shop.
 */
class BMC {
    constructor(access_token) {
        this.access_token = access_token;
        this.author_name_string = 'alex.lylko'
        this.cookieJar = new toughCookie.CookieJar();
        this.bmccsrftoken = '572c2a24a9e8ff17f92f61161a93a299'
    }
    /**
     * @param {string} string 
     */
    static normalizeDate(string) {
        let value = null
        if(string.indexOf('Z') === -1){
            value = new Date(string).getTime() - new Date().getTimezoneOffset() * 60000
        }else{
            value = string
        }
        return new Date(value)
    }
    /**
     * @param {string} string 
     */
    normalizeDate(string) {
        return BMC.normalizeDate(string)
    }
    get_bmccsrftoken(url) {
        // return '572c2a24a9e8ff17f92f61161a93a299'
        return new Promise((resolve, reject) => {
            this.cookieJar.getCookies(url, {}, (err,cookies) => {
                const key = cookies.find((cookie)=>{ return cookie.key === 'bmccsrftoken' })
                console.log(key, cookies)
                if(key === undefined) return resolve(this.bmccsrftoken)
                this.bmccsrftoken = key.value
                resolve(this.bmccsrftoken)
            })
        })
    }

    getCookie(url){
        return new Promise((resolve, reject) => {
            this.cookieJar.getCookies(url, {}, (err,cookies) => {
                const string = cookies.map(cookie => cookie.cookieString()).join(';')
                resolve(string)
            });
            // bmc_csrf_token:
        })
        const key = cookies.find((cookie)=>{ return cookie.key === 'bmccsrftoken' })
    }
    /**
     * @param {number} page 
     * @returns {Promise<import('axios').AxiosResponse & {data: BmcSupportersResponse}>}
     */
    Supporters(page = 1) {
        const params = new URLSearchParams({
            page: page
        })
        return this._sendRequest('supporters', params);
    }
    /**
     * @param {"active"|"inactive"|"all"} status 
     * @returns {Promise<{data: BmcSubscriptionsResponse}>}
     */
    Subscriptions(status = 'all', page = 1) {
        const params = new URLSearchParams({
            status: status,
            page: page
        })
        return this._sendRequest('subscriptions', params);
    }
    /**
     * @param {number} page 
     * @returns {Promise<import('axios').AxiosResponse & {data: BmcExtrasResponse}>}
     */
    Extras(page = 1) {
        const params = new URLSearchParams({
            page: page
        })
        return this._sendRequest('extras', params);
    }
    /**
     * @param {number} id 
     * @returns {Promise<import('axios').AxiosResponse & {data: BmcSupport}>}
     */
    getSupportById(id) {
        if(id == undefined) throw new Error('Argument "id" is required')
        return this._sendRequest(`supporters/${id}`);
    }
    /**
     * @param {number} id 
     * @returns {Promise<import('axios').AxiosResponse & {data: BmcSubscription}>}
     */
    getSubscriptionById(id) {
        if(id == undefined) throw new Error('Argument "id" is required')
        return this._sendRequest(`subscriptions/${id}`);
    }
    /**
     * @param {number} id 
     * @returns {Promise<import('axios').AxiosResponse & {data: BmcExtras}>}
     */
    getExtrasById(id) {
        if(id == undefined) throw new Error('Argument "id" is required')
        return this._sendRequest(`extras/${id}`);
    }
    /**
     * 
     * @param {string} path 
     * @returns {Promise<*>}
     */
    _sendRequest(path, params = '') {
        const url = `https://developers.buymeacoffee.com/api/v1/${path}?${params}`;
        // const url = `https://httpbin.org/headers?${path}?${params}`;
        return new Promise(async (resolve, reject) => {
            axios({
                method: 'get',
                url: url,
                headers: {
                    'Authorization': 'Bearer ' + this.access_token
                },
                timeout: 1000,
            })
            .then(res => {
                // по факту до 43 запросов в n времени
                if(Number(res.headers['x-ratelimit-remaining']) < 47) throw Error('Critical: BMC Rate limit exceeded')
                res.headers['x-ratelimit-remaining'] == '0' ? reject(res) : resolve(res);
                // resolve(res)
            })
            .catch((error) => {
                reject(error);
            })
        })
    }
    /**
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
    /**
     * @returns {Promise<number>}
     */
    getSupportersCount() {
        return new Promise(async (resolve, reject) => {
            axios({
                method: 'get',
                url: `https://www.buymeacoffee.com/${this.author_name_string}`,
                headers: {
                    'User-Agent': 'Custom Periodic Checker Bot',
                },
                timeout: 1000,
            })
            .then(res => {
                let count = null
                res.data.replace(/>(\d+) supporters<\/div>/,($0, $1) => {
                    count = $1
                })
                if(count == null) throw new Error('Can\'t find supporters count. Probably regexp is broken')
                resolve(Number(count))
            })
            .catch((error) => {
                reject(error);
            })
        })
    }
    async getTimeline() {
        const k = '9f86b43ee41253fb743761ea69400e36'//await this.get_bmccsrftoken("https://www.buymeacoffee.com/v1/Home/getTimeLine/1825392")
        console.log('getTimeline', `bmc_csrf_token=${k}`)
        return new Promise(async (resolve, reject) => {
            axios({
                method: 'POST',
                url: "https://www.buymeacoffee.com/v1/Home/getTimeLine/1825392",
                headers: {
                    "accept": "*/*",
                    "accept-language": "ru-RU,ru;q=0.9",
                    "accept-encoding": "gzip, deflate, br",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.72 Safari/537.36",
                    "sec-ch-ua": "\"Chromium\";v=\"102\", \" Not A;Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "x-requested-with": "XMLHttpRequest",
                    "referrer": "https://www.buymeacoffee.com/alex.lylko",
                    "referrerPolicy": "strict-origin-when-cross-origin",
                    "content-length": "47",
                    // cookie: await this.getCookie("https://www.buymeacoffee.com/v1/Home/getTimeLine/1825392")
                    Origin: "https://www.buymeacoffee.com",
                    Cookie: "bmccsrftoken="+k+"; _gcl_au=1.1.361378431.1654684177; _fbp=fb.1.1654684177163.1087254760; __stripe_mid=248c7360-a918-4579-8ea9-32669968fb99adfa34; intercom-id-zkn2qu6k=03709943-a529-457e-b942-cf4fbd121127; intercom-session-zkn2qu6k=; _gid=GA1.2.389963024.1654685377; XSRF-TOKEN=eyJpdiI6IkNTNmJtK1RRMkloSlZCbjRjZ0haTHc9PSIsInZhbHVlIjoiUzFFUWVmd0wzZ3VHZnc4NGpSY0xsclNrT3k5L2tQZmlPUEdNeTJMVDdMQ09JVzlGR0J6eEIvd1VZdXJ5T0pzdWtnTW5NVDRmSlZYZXk2QnEwQWNhYzE4aXp3T3U4VUxhRWd4RXVGM3NVcDNETU1UdXpLUlNMR3dlelV1Ti9GZXciLCJtYWMiOiJiYzdlZDRmMTc3ZTJiZTljNGNjY2VlMjM5ZmRjYzI4OWVhZTJhYzczMTBmNWE5OGJjZmQ4M2UyZDkyOGNjMzQ3IiwidGFnIjoiIn0%3D; bmc_api_production_session=eyJpdiI6IjJrblYrV3EyeWpaWlpBeDE4R3pCM1E9PSIsInZhbHVlIjoiM3M3VitrdGdKRkplNDRWaUVlQVc1NUtnM0tWdFQ5bUpmRThJbXpvb2NNU3NjN2xIdHQ2dDBWZWhYNG1ZZjY4T1RuQkVwdE1IMUJNRTE2NjhxYnNtdC9kWU9wUGVncTkvTDl0KzZXemltRElmTHlrYnAzOW96RlBBYUk5OWFBcWEiLCJtYWMiOiIzYjQ1YzBlZGE1NjgxMDhmOGFmMDdkODgwMjk4NDQwNDkxZjZiZGI3ODZjZDBlZjc3MWJjZTg1ZTMyYTZjYzg2IiwidGFnIjoiIn0%3D; _ga=GA1.1.243435750.1654684177; buymeacoffee_session=3c6aohb7fkllqbjq6jfc38gf4pgfjtvn; _ga_4220TB38WC=GS1.1.1654716090.4.1.1654716179.60"
                },
                // "referrer": "https://www.buymeacoffee.com/alex.lylko",
                // "referrerPolicy": "strict-origin-when-cross-origin",
                timeout: 5000,
                body: `bmc_csrf_token=${k}`
            })
            .then(res => {
                console.log('resolved',res)
                resolve(res)
            })
            .catch((error) => {
                reject(error);

                const res = error.response
                const setCookie = toughCookie.parse(res.headers['set-cookie'][0])
                // console.log(setCookie, res)
                this.cookieJar.setCookie(setCookie, res.config.url, () => {})
                
                // console.log(this.cookieJar)
                // this.cookieJar.getCookies(res.config.url, {}, (err,cookies) => {
                //     const coo = cookies.map(cookie => cookie.cookieString()).join(';')
                //     // res.headers['cookie'] = cookies.join('; ');
                //     console.log('into new request',coo)
                // });
                
            })
        })
    }
    
}
 
module.exports = BMC;

/** pi_3L8qNDJEtINljGAa0ukexNuA
    @typedef {Object} BmcHookEvent events only for Supports and Extras
    @property {Object} response
    @property {string=} response.supporter_name ex "name"
    @property {string} response.supporter_email ex "example@email.com"
    @property {string|number} response.number_of_coffees number of cups of coffee (ex 3)
    @property {string} response.total_amount cash equivalent without currency designation (ex 15)
    @property {string} response.support_created_on ex "2022-06-04T17:47:04.000000Z"
 */

/**
    @typedef BmcPageResponse
    @property {number} current_page page of the result set
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
    @property {null|string} referer ex "https://accounts.google.com/
    @property {string} support_coffee_price ex "5.0000"
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
    @property {string|"FREE_REWARD"} transaction_id ex "pi_3L712mJEtIsfgdfKIokjYYUofdKuJ"
    @property {null|*} transfer_id
 */
/**
 * @typedef {{data: BmcSupport[]} & BmcPageResponse} BmcSupportersResponse
 */


/**
    @typedef BmcExtras
    @property {BmcExtraData} extra
    @property {string} payer_email emal
    @property {string} payer_name: "Alex L"
    @property {string} purchase_amount ex "0.00"
    @property {string} purchase_currency ex "EUR"
    @property {number} purchase_id
    @property {0|1} purchase_is_revoked
    @property {string=} purchase_question "How are you?"
    @property {string} purchase_updated_on  "2022-06-07 08:56:21"
    @property {string} purchased_on  "2022-06-07 08:56:21"
 */

/**
    @typedef BmcExtraData Extra info
    @property {string=} attributes JSON stringified
    @property {string} reward_coffee_price "0.00"
    @property {string} reward_confirmation_message: "Congratulations! Your reward will be credited to the account associated with the email you specified"
    @property {string} reward_created_on: "2022-05-14 10:18:47"
    @property {string|null} reward_deleted_on null
    @property {string} reward_description "Access to additional features .... "
    @property {0|1} reward_has_membership_pricing 0
    @property {number} reward_id 71171
    @property {string} reward_image "https://cdn.buymeacoffee.com/uploads/project_updates/2022/05/5d06315dc725ca284f01558527c1bdb6.jpg"
    @property {0|1} reward_is_active: 0
    @property {string} reward_member_price: "0.00"
    @property {0|1} reward_order: 0
    @property {string} reward_question: "Whats ur email"
    @property {string} reward_slots: null
    @property {string} reward_title "Vip Subscription 1 month"
    @property {string} reward_updated_on: "2022-06-07 08:56:21"
    @property {number} reward_used 26
    @property {0|1} reward_visibility 1
 */
/**
    @typedef {{data: BmcExtras[]} & BmcPageResponse} BmcExtrasResponse
 */




/**
   @typedef BmcSubscription
   @property {string|null} country - null
   @property {0|1}    is_manual_payout - 1
   @property {0|1}    is_paused - 0
   @property {0|1}    is_razorpay - 0
   @property {number} membership_level_id - 81808
   @property {0|1}    message_visibility - 1
   @property {string} payer_email - "test@example.et"
   @property {string} payer_name - "Sanya"
   @property {string|null} referer - null
   @property {string} subscription_cancelled_on - "2022-06-07 15:57:40"
   @property {0|1}    subscription_coffee_num - 1
   @property {string} subscription_coffee_price - "1.000"
   @property {string} subscription_created_on - "2022-06-07 15:57:14"
   @property {string} subscription_currency - "EUR"
   @property {string} subscription_current_period_end - "2022-07-07 15:57:11"
   @property {string} subscription_current_period_start - "2022-06-07 15:57:11"
   @property {string|"month"|"lifetime-giveaway"} subscription_duration_type - "month"|"lifetime-giveaway"
   @property {0|1}    subscription_hidden - 0
   @property {number} subscription_id - 128616
   @property {string|null} subscription_is_cancelled - null
   @property {string|null} subscription_is_cancelled_at_period_end - null
   @property {string|null} subscription_message - "hii"
   @property {string} subscription_updated_on - "2022-06-07 15:57:40"
   @property {string|"GIVE_AWAY"} transaction_id - "sub_1L84mKJEtIN345TGTsBsvzd"|"GIVE_AWAY"
 */
/**
    @typedef {{data: BmcSubscription[]} & BmcPageResponse} BmcSubscriptionsResponse
 */