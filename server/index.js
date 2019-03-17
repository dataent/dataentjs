const backends = {};
backends.sqlite = require('dataentjs/backends/sqlite');
//backends.mysql = require('dataentjs/backends/mysql');
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const dataent = require('dataentjs');
const restAPI = require('./restAPI');
const dataentModels = require('dataentjs/models');
const common = require('dataentjs/common');
const bodyParser = require('body-parser');
const fs = require('fs');
const { setupExpressRoute: setRouteForPDF } = require('dataentjs/server/pdf');
const auth = require('./../auth/auth')();
const morgan = require('morgan');
const { addWebpackMiddleware } = require('../webpack/serve');
const { getAppConfig, resolveAppDir } = require('../webpack/utils');
const { thumbnailMiddleware } = require('./utils');

dataent.conf = getAppConfig();

require.extensions['.html'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

module.exports = {
    async start({backend, connectionParams, models, authConfig=null}) {
        await this.init();

        if (models) {
            dataent.registerModels(models, 'server');
        }

        // database
        await this.initDb({backend:backend, connectionParams:connectionParams});

        // app
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        app.use(express.static(dataent.conf.distPath));
        app.use('/static', thumbnailMiddleware(resolveAppDir(dataent.conf.staticPath)));

        app.use(morgan('tiny'));

        if (connectionParams.enableCORS) {
            app.use(cors());
        }

        if(authConfig) {
            this.setupAuthentication(app, authConfig);
        }

        // socketio
        io.on('connection', function (socket) {
            dataent.db.bindSocketServer(socket);
        });
        // routes
        restAPI.setup(app);

        if (process.env.NODE_ENV === 'development') {
            // webpack dev server
            addWebpackMiddleware(app);
        }

        dataent.config.port = dataent.conf.dev.devServerPort;

        // listen
        server.listen(dataent.config.port, () => {
            console.log(`dataentJS server running on http://localhost:${dataent.config.port}`)
        });

        dataent.app = app;
        dataent.server = server;

        setRouteForPDF();
    },

    async init() {
        dataent.isServer = true;
        await dataent.init();
        dataent.registerModels(dataentModels, 'server');
        dataent.registerLibs(common);

        await dataent.login('Administrator');
    },

    async initDb({backend, connectionParams}) {
        dataent.db = await new backends[backend](connectionParams);
        await dataent.db.connect();
        await dataent.db.migrate();
    },

    setupAuthentication(app, authConfig) {
        app.post("/api/signup", auth.signup);
        app.post("/api/login", auth.login);
        app.use(auth.initialize(authConfig));
        app.all("/api/resource/*", auth.authenticate());
    }
}
