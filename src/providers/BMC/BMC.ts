import cryptoJs from 'crypto-js';
import { URLSearchParams } from 'url';

/**
 * Buy Me A Coffee JS | Main File
 * by Waren Gonzaga
 * modified by Alex L
 */
import axios, { AxiosResponse } from 'axios';
// @ts-ignore
import toughCookie from 'tough-cookie';
// import fetch from 'node-fetch';
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
export default class BMC {
    access_token: string;
    author_name_string: string;
    cookieJar: any;
    bmccsrftoken: string;
    constructor(access_token = '') {
        this.access_token = access_token;
        this.author_name_string = 'alex.lylko';
        this.cookieJar = new toughCookie.CookieJar();
        this.bmccsrftoken = '572c2a24a9e8ff17f92f61161a93a299';
    }

    static normalizeDate(string: string) {
        let value = null;
        if (string.indexOf('Z') === -1) {
            value = new Date(string).getTime() - new Date().getTimezoneOffset() * 60000;
        } else {
            value = string;
        }
        return new Date(value);
    }
    static secondsToDate(seconds) {
        return new Date(seconds * 1000);
    }

    static istru(value: string | boolean) {
        return value === 'true';
    }
    normalizeDate(string: string) {
        return BMC.normalizeDate(string);
    }
    get_bmccsrftoken(url) {
        // return '572c2a24a9e8ff17f92f61161a93a299'
        return new Promise((resolve) => {
            this.cookieJar.getCookies(url, {}, (err, cookies) => {
                const key = cookies.find((cookie) => {
                    return cookie.key === 'bmccsrftoken';
                });
                console.log(key, cookies);
                if (key === undefined) return resolve(this.bmccsrftoken);
                this.bmccsrftoken = key.value;
                resolve(this.bmccsrftoken);
            });
        });
    }

    getCookie(url) {
        return new Promise((resolve) => {
            this.cookieJar.getCookies(url, {}, (err, cookies) => {
                const string = cookies.map((cookie) => cookie.cookieString()).join(';');
                resolve(string);
            });
            // bmc_csrf_token:
        });
        // const key = cookies.find((cookie)=>{ return cookie.key === 'bmccsrftoken' })
    }
    /**
     * @param {number} page
     * @returns {Promise<import('axios').AxiosResponse & {data: BmcSupportersResponse}>}
     */
    Supporters(page = 1) {
        const params = new URLSearchParams({
            page: String(page)
        });
        return this._sendRequest('supporters', params);
    }
    /**
     * @param {"active"|"inactive"|"all"} status
     * @returns {Promise<{data: IBmcSubscriptionsResponse}>}
     */
    Subscriptions(status = 'all', page = 1) {
        const params = new URLSearchParams({
            status: status,
            page: String(page)
        });
        return this._sendRequest('subscriptions', params);
    }
    /**
     * @param {number} page
     * @returns {Promise<import('axios').AxiosResponse & {data: IBmcExtrasResponse}>}
     */
    Extras(page = 1) {
        const params = new URLSearchParams({
            page: String(page)
        });
        return this._sendRequest('extras', params);
    }
    /**
     * @param {number} id
     * @returns {Promise<import('axios').AxiosResponse & {data: IBmcSupport}>}
     */
    getSupportById(id) {
        if (id == undefined) throw new Error('Argument "id" is required');
        return this._sendRequest(`supporters/${id}`);
    }
    /**
     * @param {number} id
     * @returns {Promise<import('axios').AxiosResponse & {data: IBmcSubscription}>}
     */
    getSubscriptionById(id) {
        if (id == undefined) throw new Error('Argument "id" is required');
        return this._sendRequest(`subscriptions/${id}`);
    }
    getExtrasById(id: number) {
        if (id == undefined) throw new Error('Argument "id" is required');
        return this._sendRequest(`extras/${id}`);
    }
    _sendRequest(path: string, params?: URLSearchParams | string) {
        const url = `https://developers.buymeacoffee.com/api/v1/${path}?${params}`;
        // const url = `https://httpbin.org/headers?${path}?${params}`;
        return new Promise<AxiosResponse>(async (resolve, reject) => {
            axios({
                method: 'get',
                url: url,
                headers: {
                    Authorization: 'Bearer ' + this.access_token
                },
                timeout: 1000
            })
                .then((res) => {
                    // по факту до 43 запросов в n времени
                    if (Number(res.headers['x-ratelimit-remaining']) < 47)
                        throw Error('Critical: BMC Rate limit exceeded');
                    res.headers['x-ratelimit-remaining'] == '0' ? reject(res) : resolve(res);
                    // resolve(res)
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    /**
     * @param {string} bodyString received post data
     * @param {string} header_signature received header signature
     * @param {string} BMC_WEBHOOK_SECRET  webhook secret from bmc
     * @returns {boolean}
     */
    static verifyWebhook(bodyString, header_signature, BMC_WEBHOOK_SECRET) {
        const signature = cryptoJs.HmacSHA256(bodyString, BMC_WEBHOOK_SECRET).toString();
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
                    'User-Agent': 'Custom Periodic Checker Bot'
                },
                timeout: 1000
            })
                .then((res) => {
                    let count = null;
                    res.data.replace(/>(\d+) supporters<\/div>/, ($0, $1) => {
                        count = $1;
                    });
                    if (count == null) throw new Error("Can't find supporters count. Probably regexp is broken");
                    resolve(Number(count));
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    async getTimeline() {
        const k = '9f86b43ee41253fb743761ea69400e36'; //await this.get_bmccsrftoken("https://www.buymeacoffee.com/v1/Home/getTimeLine/1825392")
        console.log('getTimeline', `bmc_csrf_token=${k}`);
        return new Promise(async (resolve, reject) => {
            axios({
                method: 'POST',
                url: 'https://www.buymeacoffee.com/v1/Home/getTimeLine/1825392',
                headers: {
                    accept: '*/*',
                    'accept-language': 'ru-RU,ru;q=0.9',
                    'accept-encoding': 'gzip, deflate, br',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.72 Safari/537.36',
                    'sec-ch-ua': '"Chromium";v="102", " Not A;Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'x-requested-with': 'XMLHttpRequest',
                    referrer: 'https://www.buymeacoffee.com/alex.lylko',
                    referrerPolicy: 'strict-origin-when-cross-origin',
                    'content-length': '47',
                    // cookie: await this.getCookie("https://www.buymeacoffee.com/v1/Home/getTimeLine/1825392")
                    Origin: 'https://www.buymeacoffee.com',
                    Cookie:
                        'bmccsrftoken=' +
                        k +
                        '; _gcl_au=1.1.361378431.1654684177; _fbp=fb.1.1654684177163.1087254760; __stripe_mid=248c7360-a918-4579-8ea9-32669968fb99adfa34; intercom-id-zkn2qu6k=03709943-a529-457e-b942-cf4fbd121127; intercom-session-zkn2qu6k=; _gid=GA1.2.389963024.1654685377; XSRF-TOKEN=eyJpdiI6IkNTNmJtK1RRMkloSlZCbjRjZ0haTHc9PSIsInZhbHVlIjoiUzFFUWVmd0wzZ3VHZnc4NGpSY0xsclNrT3k5L2tQZmlPUEdNeTJMVDdMQ09JVzlGR0J6eEIvd1VZdXJ5T0pzdWtnTW5NVDRmSlZYZXk2QnEwQWNhYzE4aXp3T3U4VUxhRWd4RXVGM3NVcDNETU1UdXpLUlNMR3dlelV1Ti9GZXciLCJtYWMiOiJiYzdlZDRmMTc3ZTJiZTljNGNjY2VlMjM5ZmRjYzI4OWVhZTJhYzczMTBmNWE5OGJjZmQ4M2UyZDkyOGNjMzQ3IiwidGFnIjoiIn0%3D; bmc_api_production_session=eyJpdiI6IjJrblYrV3EyeWpaWlpBeDE4R3pCM1E9PSIsInZhbHVlIjoiM3M3VitrdGdKRkplNDRWaUVlQVc1NUtnM0tWdFQ5bUpmRThJbXpvb2NNU3NjN2xIdHQ2dDBWZWhYNG1ZZjY4T1RuQkVwdE1IMUJNRTE2NjhxYnNtdC9kWU9wUGVncTkvTDl0KzZXemltRElmTHlrYnAzOW96RlBBYUk5OWFBcWEiLCJtYWMiOiIzYjQ1YzBlZGE1NjgxMDhmOGFmMDdkODgwMjk4NDQwNDkxZjZiZGI3ODZjZDBlZjc3MWJjZTg1ZTMyYTZjYzg2IiwidGFnIjoiIn0%3D; _ga=GA1.1.243435750.1654684177; buymeacoffee_session=3c6aohb7fkllqbjq6jfc38gf4pgfjtvn; _ga_4220TB38WC=GS1.1.1654716090.4.1.1654716179.60'
                },
                // "referrer": "https://www.buymeacoffee.com/alex.lylko",
                // "referrerPolicy": "strict-origin-when-cross-origin",
                timeout: 5000,
                // body: `bmc_csrf_token=${k}`
                data: `bmc_csrf_token=${k}`
            })
                .then((res) => {
                    console.log('resolved', res);
                    resolve(res);
                })
                .catch((error) => {
                    reject(error);

                    const res = error.response;
                    const setCookie = toughCookie.parse(res.headers['set-cookie'][0]);
                    // console.log(setCookie, res)
                    this.cookieJar.setCookie(setCookie, res.config.url, () => {});

                    // console.log(this.cookieJar)
                    // this.cookieJar.getCookies(res.config.url, {}, (err,cookies) => {
                    //     const coo = cookies.map(cookie => cookie.cookieString()).join(';')
                    //     // res.headers['cookie'] = cookies.join('; ');
                    //     console.log('into new request',coo)
                    // });
                });
        });
    }
}
