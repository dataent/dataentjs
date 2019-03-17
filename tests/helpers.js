const server = require('dataentjs/server');
const dataent = require('dataentjs');

module.exports = {
    async initSqlite({dbPath = '_test.db', models} = {}) {
        server.init();
        if (models) {
            dataent.registerModels(models, 'server');
        }
        await server.initDb({
            backend: 'sqlite',
            connectionParams: {dbPath: dbPath},
        });
    }
}