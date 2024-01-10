import 'module-alias/register';
import express from 'express';
import config from './parse/config';
import { dashboard } from './parse/parse-dashboard';
import { graphqlServer, parseServer } from './parse/parse-server';
import { displayEnvironment, filesCacheControl, handleErrors, requireHTTPS } from './parse/express-utils';
import ParseServer from 'parse-server';
import { Cloud, Jobs, Webhooks } from './cloud/cloud2';
import path from 'path';
import cors from 'cors';
import logger from './parse/logger';

const start = () => {
    const app = express();

    // app.use(requireHTTPS);
    app.use(filesCacheControl);
    app.use(
        express.json({
            verify: (req, res, buffer) => {
                // @ts-ignore
                req.rawBody = buffer;
            }
        })
    );
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());
    app.use('/public', express.static(path.join(__dirname, '/public')));
    app.use('/dashboard', dashboard);
    //@ts-ignore
    app.use(config.MOUNT_PATH, parseServer.app);

    //@ts-ignore
    graphqlServer.applyGraphQL(app);

    //@ts-ignore
    parseServer.start().then(() => {
        logger.info('Parse Server started successfully');
    });

    Cloud.init();
    Jobs.init();
    Webhooks.init(app);

    const server = app.listen(config.PORT, displayEnvironment).on('error', handleErrors);

    ParseServer.createLiveQueryServer(server);
};

start();
