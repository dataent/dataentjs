const assert = require('assert');
const dataent = require('dataentjs');
const helpers = require('./helpers');

describe('Single Documents', () => {
    before(async function() {
        await helpers.initSqlite();
    });

    it('should set a single value', async () => {
        let systemSettings = await dataent.getSingle('SystemSettings');
        systemSettings.dateFormat = 'dd/mm/yyyy';
        await systemSettings.update();

        systemSettings = await dataent.getSingle('SystemSettings');
        assert.equal(systemSettings.dateFormat, 'dd/mm/yyyy');

        systemSettings.dateFormat = 'mm/dd/yyyy';
        await systemSettings.update();

        systemSettings = await dataent.getSingle('SystemSettings');
        assert.equal(systemSettings.dateFormat, 'mm/dd/yyyy');
    });
});