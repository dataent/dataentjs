const assert = require('assert');
const dataent = require('dataentjs');
const helpers = require('./helpers');

describe('Models', () => {
    before(async function() {
        await helpers.initSqlite();
    });

    it('should get todo json', () => {
        let todo = dataent.getMeta('ToDo');
        assert.equal(todo.isSingle, 0);
    });
});