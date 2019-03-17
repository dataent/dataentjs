const assert = require('assert');
const dataent = require('dataentjs');
const helpers = require('./helpers');

describe('Database', () => {
    before(async function() {
        await helpers.initSqlite();
    });

    it('should insert and get values', async () => {
        await dataent.db.sql('delete from todo');
        await dataent.insert({doctype:'ToDo', subject: 'testing 1'});
        await dataent.insert({doctype:'ToDo', subject: 'testing 3'});
        await dataent.insert({doctype:'ToDo', subject: 'testing 2'});

        let subjects = await dataent.db.getAll({doctype:'ToDo', fields:['name', 'subject']})
        subjects = subjects.map(d => d.subject);

        assert.ok(subjects.includes('testing 1'));
        assert.ok(subjects.includes('testing 2'));
        assert.ok(subjects.includes('testing 3'));
    });

    it('should filter correct values', async () => {
        let subjects = null;

        await dataent.db.sql('delete from todo');
        await dataent.insert({doctype:'ToDo', subject: 'testing 1', status: 'Open'});
        await dataent.insert({doctype:'ToDo', subject: 'testing 3', status: 'Open'});
        await dataent.insert({doctype:'ToDo', subject: 'testing 2', status: 'Closed'});

        subjects = await dataent.db.getAll({doctype:'ToDo', fields:['name', 'subject'],
            filters:{status: 'Open'}});
        subjects = subjects.map(d => d.subject);

        assert.ok(subjects.includes('testing 1'));
        assert.ok(subjects.includes('testing 3'));
        assert.equal(subjects.includes('testing 2'), false);

        subjects = await dataent.db.getAll({doctype:'ToDo', fields:['name', 'subject'],
            filters:{status: 'Closed'}});
        subjects = subjects.map(d => d.subject);

        assert.equal(subjects.includes('testing 1'), false);
        assert.equal(subjects.includes('testing 3'), false);
        assert.ok(subjects.includes('testing 2'));

    });
});