const dataent = require('dataentjs');
const Observable = require('dataentjs/utils/observable');
const naming = require('./naming');

module.exports = class BaseDocument extends Observable {
    constructor(data) {
        super();
        this.fetchValuesCache = {};
        this.flags = {};
        this.setup();
        Object.assign(this, data);

        // clear fetch-values cache
        dataent.db.on('change', (params) => this.fetchValuesCache[`${params.doctype}:${params.name}`] = {});
    }

    setup() {
        // add listeners
    }

    get meta() {
        if (!this._meta) {
            this._meta = dataent.getMeta(this.doctype);
        }
        return this._meta;
    }

    async getSettings() {
        if (!this._settings) {
            this._settings = await dataent.getSingle(this.meta.settings);
        }
        return this._settings;
    }

    // set value and trigger change
    async set(fieldname, value) {
        if (typeof fieldname === 'object') {
            const valueDict = fieldname;
            for (let fieldname in valueDict) {
                await this.set(fieldname, valueDict[fieldname]);
            }
            return;
        }

        if (this[fieldname] !== value) {
            this._dirty = true;
            this[fieldname] = await this.validateField(fieldname, value);
            await this.applyChange(fieldname);
        }
    }

    async applyChange(fieldname) {
        if (await this.applyFormula()) {
            // multiple changes
            await this.trigger('change', {
                doc: this
            });
        } else {
            // no other change, trigger control refresh
            await this.trigger('change', {
                doc: this,
                fieldname: fieldname
            });
        }
    }

    setDefaults() {
        for (let field of this.meta.fields) {
            if (this[field.fieldname] === null || this[field.fieldname] === undefined) {

                let defaultValue = null;

                if (field.fieldtype === 'Table') {
                    defaultValue = [];
                }
                if (field.default) {
                    defaultValue = field.default;
                }

                this[field.fieldname] = defaultValue;
            }
        }
    }

    setKeywords() {
        let keywords = [];
        for (let fieldname of this.meta.getKeywordFields()) {
            keywords.push(this[fieldname]);
        }
        this.keywords = keywords.join(', ');
    }

    append(key, document) {
        if (!this[key]) {
            this[key] = [];
        }
        this[key].push(this.initDoc(document));
    }

    initDoc(data) {
        if (data.prototype instanceof Document) {
            return data;
        } else {
            return new Document(data);
        }
    }

    async validateField(key, value) {
        let field = this.meta.getField(key);
        if (field && field.fieldtype == 'Select') {
            return this.meta.validateSelect(field, value);
        }
        return value;
    }

    getValidDict() {
        let data = {};
        for (let field of this.meta.getValidFields()) {
            data[field.fieldname] = this[field.fieldname];
        }
        return data;
    }

    getFullDict() {
        let data = this.getValidDict();
        return data;
    }

    setStandardValues() {
        // set standard values on server-side only
        if (dataent.isServer) {
            let now = (new Date()).toISOString();
            if (!this.submitted) {
                this.submitted = 0;
            }

            if (!this.owner) {
                this.owner = dataent.session.user;
            }

            if (!this.creation) {
                this.creation = now;
            }

            if (!this.modifiedBy) {
                this.modifiedBy = dataent.session.user;
            }
            this.modified = now;
        }
    }

    async load() {
        let data = await dataent.db.get(this.doctype, this.name);
        if (data.name) {
            this.syncValues(data);
            if (this.meta.isSingle) {
                this.setDefaults();
            }
        } else {
            throw new dataent.errors.NotFound(`Not Found: ${this.doctype} ${this.name}`);
        }
    }

    syncValues(data) {
        this.clearValues();
        Object.assign(this, data);
        this._dirty = false;
        this.trigger('change', {
            doc: this
        });
    }

    clearValues() {
        for (let field of this.meta.getValidFields()) {
            if (this[field.fieldname]) {
                delete this[field.fieldname];
            }
        }
    }

    setChildIdx() {
        // renumber children
        for (let field of this.meta.getValidFields()) {
            if (field.fieldtype === 'Table') {
                for (let i = 0; i < (this[field.fieldname] || []).length; i++) {
                    this[field.fieldname][i].idx = i;
                }
            }
        }
    }

    async compareWithCurrentDoc() {
        if (dataent.isServer && !this.isNew()) {
            let currentDoc = await dataent.db.get(this.doctype, this.name);

            // check for conflict
            if (currentDoc && this.modified != currentDoc.modified) {
                throw new dataent.errors.Conflict(dataent._('Document {0} {1} has been modified after loading', [this.doctype, this.name]));
            }

            if (this.submitted && !this.meta.isSubmittable) {
                throw new dataent.errors.ValidationError(dataent._('Document type {1} is not submittable', [this.doctype]));
            }

            // set submit action flag
            if (this.submitted && !currentDoc.submitted) {
                this.flags.submitAction = true;
            }

            if (currentDoc.submitted && !this.submitted) {
                this.flags.revertAction = true;
            }

        }
    }

    async applyFormula() {
        if (!this.meta.hasFormula()) {
            return false;
        }

        let doc = this;

        // children
        for (let tablefield of this.meta.getTableFields()) {
            let formulaFields = dataent.getMeta(tablefield.childtype).getFormulaFields();
            if (formulaFields.length) {

                // for each row
                for (let row of this[tablefield.fieldname]) {
                    for (let field of formulaFields) {
                        if (shouldApplyFormula(field, row)) {
                            const val = await field.formula(row, doc);
                            if (val !== false && val !== undefined) {
                                row[field.fieldname] = val;
                            }
                        }
                    }
                }
            }
        }

        // parent
        for (let field of this.meta.getFormulaFields()) {
            if (shouldApplyFormula(field, doc)) {
                const val = await field.formula(doc);
                if (val !== false && val !== undefined) {
                    doc[field.fieldname] = val;
                }
            }
        }

        return true;

        function shouldApplyFormula(field, doc) {
            if (field.readOnly) {
                return true;
            }

            if (!dataent.isServer || dataent.isElectron) {
                if (doc[field.fieldname] == null || doc[field.fieldname] == '') {
                    return true;
                }
            }
            return false;
        }
    }

    async commit() {
        // re-run triggers
        this.setStandardValues();
        this.setKeywords();
        this.setChildIdx();
        await this.applyFormula();
        await this.trigger('validate');
    }

    async insert() {
        await naming.setName(this);
        await this.commit();
        await this.trigger('beforeInsert');

        const data = await dataent.db.insert(this.doctype, this.getValidDict());
        this.syncValues(data);

        await this.trigger('afterInsert');
        await this.trigger('afterSave');

        return this;
    }

    async update() {
        await this.compareWithCurrentDoc();
        await this.commit();
        await this.trigger('beforeUpdate');

        // before submit
        if (this.flags.submitAction) await this.trigger('beforeSubmit');
        if (this.flags.revertAction) await this.trigger('beforeRevert');

        const data = await dataent.db.update(this.doctype, this.getValidDict());
        this.syncValues(data);

        await this.trigger('afterUpdate');
        await this.trigger('afterSave');

        // after submit
        if (this.flags.submitAction) await this.trigger('afterSubmit');
        if (this.flags.revertAction) await this.trigger('afterRevert');

        return this;
    }

    async delete() {
        await this.trigger('beforeDelete');
        await dataent.db.delete(this.doctype, this.name);
        await this.trigger('afterDelete');
    }

    async submit() {
        this.submitted = 1;
        this.update();
    }

    async revert() {
        this.submitted = 0;
        this.update();
    }

    // trigger methods on the class if they match
    // with the trigger name
    async trigger(event, params) {
        if (this[event]) {
            await this[event](params);
        }
        await super.trigger(event, params);
    }

    // helper functions
    getSum(tablefield, childfield) {
        return this[tablefield].map(d => (d[childfield] || 0)).reduce((a, b) => a + b, 0);
    }

    async getFrom(doctype, name, fieldname) {
        if (!name) return '';
        let _values = this.fetchValuesCache[`${doctype}:${name}`] || (this.fetchValuesCache[`${doctype}:${name}`] = {});
        if (!_values[fieldname]) {
            _values[fieldname] = await dataent.db.getValue(doctype, name, fieldname);
        }
        return _values[fieldname];
    }

    isNew() {
        return this._notInserted;
    }
};