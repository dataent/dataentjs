const assert = require('assert');
const dataent = require('dataentjs');
const helpers = require('./helpers');

describe('Controller', () => {
    before(async function() {
        await helpers.initSqlite();
    });

    it('should call controller method', async () => {
        let doc = dataent.newDoc({
            doctype:'ToDo',
            subject: 'test'
        });
        doc.trigger('validate');
        assert.equal(doc.status, 'Open');
    });
});