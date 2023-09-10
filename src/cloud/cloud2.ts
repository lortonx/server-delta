import { Request, Response, Application, raw } from 'express';

export class Cloud {
    static async init(): Promise<void> {
        Parse.Cloud.define('threadTest', () => {
            return 'test';
        });
        import('./Cloud/agario/index');
    }
}

export class Webhooks {
    static async init(app: Application): Promise<void> {
        app.post('/webhooks/test', raw({ type: 'application/json' }), (request: Request, response: Response) => {
            response.status(200).json({});
        });
        import('./WebHook/bmc/index').then((m) => m.default.init(app));
    }
}

export class Jobs {
    static async init(): Promise<void> {
        Parse.Cloud.job('test', async () => {
            return;
        });
    }
}
