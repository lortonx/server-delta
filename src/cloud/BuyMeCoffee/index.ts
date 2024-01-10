import { Application, raw } from 'express';
import BMC from '../../../Payments/BMC';
import config from '../../parse/config';
import { IBmcDonationCreated, IBmcHookBase, IBmcHookType } from '../../providers/BMC/BMC.types';
import BmcDonation from '../../models/BmcDonation';
BmcDonation;
export default class Webhooks {
    static async init(app: Application): Promise<void> {
        app.post('/webhook/BmcHook/', raw({ type: 'application/json' }), (req, res) => {
            const BMC_WEBHOOK_SECRET = config.BMC_SECRET;
            const header_signature = String(req.headers['x-signature-sha256']);
            const rawBody = 'rawBody' in req ? req.rawBody.toString() : '';
            const isVerified = BMC.verifyWebhook(rawBody, header_signature, BMC_WEBHOOK_SECRET);
            if (BMC_WEBHOOK_SECRET !== 'NONE' && !isVerified) {
                return res.sendStatus(401);
            }
            res.sendStatus(200);

            console.log('APP WEBHOOKED BY BMC', req.body);
            handleBmcEvent(req.body);
        });
    }
}

function handleBmcEvent(event: IBmcHookBase) {
    if (!event || !event.data) throw new Error('Bmc event is empty');

    if (event.type in bmcHandlers) {
        bmcHandlers[event.type](event);
    } else {
        console.log('No handler for bmc webhook', event);
    }
}
const bmcHandlers: Partial<Record<IBmcHookType, (data: IBmcHookBase) => void>> = {
    'donation.created'(data: IBmcDonationCreated) {
        console.log(data);
        data.data.refunded_at;
    }
};
