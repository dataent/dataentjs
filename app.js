const server = require('dataentjs/server');

server.start({
    backend: 'sqllite',
    connectionParams: {dbPath: 'test.db'}
});