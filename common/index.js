const utils = require('../utils');
const numberFormat = require('../utils/numberFormat');
const format = require('../utils/format');
const errors = require('./errors');
const BaseDocument = require('dataentjs/model/document');
const BaseMeta = require('dataentjs/model/meta');

module.exports = {
    initLibs(dataent) {
        Object.assign(dataent, utils);
        Object.assign(dataent, numberFormat);
        Object.assign(dataent, format);
        dataent.errors = errors;
        dataent.BaseDocument = BaseDocument;
        dataent.BaseMeta = BaseMeta;
    }
}