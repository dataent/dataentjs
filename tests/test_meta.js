const assert = require('assert');
const dataent = require('dataentjs');
const helpers = require('./helpers');

describe('Meta', () => {
    before(async function() {
        await helpers.initSqlite();
    });

    it('should get init from json file', () => {
        let todo = dataent.getMeta('ToDo');
        assert.equal(todo.isSingle, 0);
    });

    it('should get fields from meta', () => {
        let todo = dataent.getMeta('ToDo');
        let fields = todo.fields.map((df) => df.fieldname);
        assert.ok(fields.includes('subject'));
        assert.ok(fields.includes('description'));
        assert.ok(fields.includes('status'));
    });
});