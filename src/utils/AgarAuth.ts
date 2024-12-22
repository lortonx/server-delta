import * as cheerio from 'cheerio';

async function main() {
    const cookies = {
        c_user: '11%3Ax8Vb76HWXIkmyA%3A2%3A1719096610%3A-1%3A1556',
        datr: 'dBVbZk2_ZCWtm0vhT5Gl4nKH',
        xs: '11%3Ax8Vb76HWXIkmyA%3A2%3A1719096610%3A-1%3A1556'
    };

    const dtsg_req = fetch(
        'https://m.facebook.com/v3.2/dialog/oauth?access_token=&app_id=677505792353827&client_id=677505792353827&display=popup&domain=agar.io&e2e={}&fallback_redirect_uri=https://agar.io/&locale=en_US&origin=1&redirect_uri=https://staticxx.facebook.com/x/connect/xd_arbiter/?version=46#cb=2f3p30zc7t1hm78w9m1cp&domain=agar.io&is_canvas=false&origin=https%3A%2F%2Fagar.io%2Fx4f289lpc69ivmsol4vlk&relation=opener&frame=fec7a6ef6c0e63db2&response_type=token,signed_request,graph_domain&scope=public_profile,+email&sdk=joey&version=v3.2',
        {
            headers: {
                dpr: '1',
                'viewport-width': '500',
                'sec-ch-ua': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-ch-ua-platform-version': '"10.0.0"',
                'sec-ch-ua-model': '""',
                'sec-ch-ua-full-version-list':
                    '"Not)A;Brand";v="99.0.0.0", "Google Chrome";v="127.0.6533.88", "Chromium";v="127.0.6533.88"',
                'sec-ch-prefers-color-scheme': 'light',
                'Upgrade-Insecure-Requests': '1',
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-User': '?1',
                'Sec-Fetch-Dest': 'document',
                host: 'm.facebook.com',
                Cookie: Object.entries(cookies)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('; ')
            }
        }
    );

    const dtsg_text = await dtsg_req.then(async (res) => res.text());
    const dtsg = dtsg_text.match(/"dtsg":\{"token":"(.*?)"/)?.[1];

    console.log('DTSG RESULT', dtsg);

    const access_token_req = fetch(
        'https://m.facebook.com/v14.0/dialog/oauth/games_service/save/?app_id=677505792353827&redirect_uri=https%3A%2F%2Fstaticxx.facebook.com%2Fx%2Fconnect%2Fxd_arbiter%2F%3Fversion%3D46%23cb%3Doz3hwrmnny0pxvp1ofqrw%26domain%3Dagar.io%26is_canvas%3Dfalse%26origin%3Dhttps%253A%252F%252Fagar.io%252Fv0odgk49w8w6eaam86h4r%26relation%3Dopener%26frame%3Dfec7a6ef6c0e63db2&response_type=token%2Csigned_request%2Cgraph_domain&return_format[0]=signed_request&return_format[1]=graph_domain&return_format[2]=access_token&return_format[3]=base_domain&return_scopes=false&sdk=joey&fallback_redirect_uri=https%3A%2F%2Fagar.io%2Fdev&scope[0]=gaming_profile&scope[1]=email&display=touch&seen_scopes[0]=gaming_profile&seen_scopes[1]=email&logger_id=6e2bxo4lr9ycbaohdvrlg&is_new_user_flow=false&app_vis=3&profile_type=gaming&tp=unspecified&is_limited_login_shim=false',
        {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'sec-fetch-site': 'same-origin',
                Cookie: Object.entries(cookies)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('; ')
                // Referer:
                //     'https://m.facebook.com/v3.2/dialog/oauth?access_token=&app_id=677505792353827&cbt=1722470264094&client_id=677505792353827&display=popup&domain=agar.io&e2e=%7B%7D&fallback_redirect_uri=https%3A%2F%2Fagar.io%2Fdev&locale=en_US&logger_id=6e2bxo4lr9ycbaohdvrlg&origin=1&redirect_uri=https%3A%2F%2Fstaticxx.facebook.com%2Fx%2Fconnect%2Fxd_arbiter%2F%3Fversion%3D46%23cb%3Doz3hwrmnny0pxvp1ofqrw%26domain%3Dagar.io%26is_canvas%3Dfalse%26origin%3Dhttps%253A%252F%252Fagar.io%252Fv0odgk49w8w6eaam86h4r%26relation%3Dopener%26frame%3Dfec7a6ef6c0e63db2&response_type=token%2Csigned_request%2Cgraph_domain&scope=public_profile%2C+email&sdk=joey&version=v3.2',
            },
            body: `fb_dtsg=${encodeURIComponent(dtsg)}`,
            method: 'POST'
        }
    );
    const access_token_res = await access_token_req.then(async (res) => res.text());
    const access_token = access_token_res.match(/access_token=([^&]+)/)?.[1];

    console.log('TOKEN RESULT', access_token_res);

    const isCookieConsent = access_token_res.includes('cookie/consent');
    if (isCookieConsent) {
        const $ = cheerio.load(access_token_res, null, false);
        const form = $('form')
            .map((i, el) => {
                const inputs = ['input', 'button'].flatMap((tag) => {
                    return $(el)
                        .find(tag)
                        .map((i, el) => ({
                            name: $(el).attr('name'),
                            value: $(el).attr('value')
                        }))
                        .get();
                });

                return {
                    action: $(el).attr('action'),
                    inputs: inputs.filter((input) => !(input.name == 'accept_only_essential' && input.value == '0'))
                };
            })
            .get()[0];
        // console.log('FORM', form);
        const consent_req = fetch('https://m.facebook.com' + form.action, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                Cookie: Object.entries(cookies)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('; ')
            },
            body: (() => {
                const d = new FormData();
                form.inputs.forEach((input) => {
                    d.append(input.name, input.value);
                });
                return d;
            })(),
            method: 'POST'
        });
        const consent_res = await consent_req.then(async (res) => res.text());
        console.log('CONSENT RES', consent_res);
    }
}
main();
