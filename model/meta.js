const BaseDocument = require('./document');
const dataent = require('dataentjs');
const model = require('./index')
const indicatorColor = require('dataentjs/ui/constants/indicators');

module.exports = class BaseMeta extends BaseDocument {
    constructor(data) {
        super(data);
        this.setDefaultIndicators();
        if (this.setupMeta) {
            this.setupMeta();
        }
        if (!this.titleField) {
            this.titleField = 'name';
        }
    }

    hasField(fieldname) {
        return this.getField(fieldname) ? true : false;
    }

    getField(fieldname) {
        if (!this._field_map) {
            this._field_map = {};
            for (let field of this.fields) {
                this._field_map[field.fieldname] = field;
            }
        }
        return this._field_map[fieldname];
    }

    /**
     * Get fields filtered by filters
     * @param {Object} filters
     *
     * Usage:
     *   meta = dataent.getMeta('ToDo')
     *   dataFields = meta.getFieldsWith({ fieldtype: 'Data' })
     */
    getFieldsWith(filters) {
      return this.fields.filter(df => {
        let match = true;
        for (const key in filters) {
          const value = filters[key];
          match = df[key] === value;
        }
        return match;
      });
    }

    getLabel(fieldname) {
        return this.getField(fieldname).label;
    }

    getTableFields() {
        if (this._tableFields===undefined) {
            this._tableFields = this.fields.filter(field => field.fieldtype === 'Table');
        }
        return this._tableFields;
    }

    getFormulaFields() {
        if (this._formulaFields===undefined) {
            this._formulaFields = this.fields.filter(field => field.formula);
        }
        return this._formulaFields;
    }

    hasFormula() {
        if (this._hasFormula===undefined) {
            this._hasFormula = false;
            if (this.getFormulaFields().length) {
                this._hasFormula = true;
            } else {
                for (let tablefield of this.getTableFields()) {
                    if (dataent.getMeta(tablefield.childtype).getFormulaFields().length) {
                        this._hasFormula = true;
                        break;
                    }
                }
            }
        }
        return this._hasFormula;
    }

    async set(fieldname, value) {
        this[fieldname] = value;
        await this.trigger(fieldname);
    }

    get(fieldname) {
        return this[fieldname];
    }

    getValidFields({ withChildren = true } = {}) {
        if (!this._validFields) {

            this._validFields = [];
            this._validFieldsWithChildren = [];

            const _add = (field) => {
                this._validFields.push(field);
                this._validFieldsWithChildren.push(field);
            }

            const doctype_fields = this.fields.map((field) => field.fieldname);

            // standard fields
            for (let field of model.commonFields) {
                if (dataent.db.typeMap[field.fieldtype] && !doctype_fields.includes(field.fieldname)) {
                    _add(field);
                }
            }

            if (this.isSubmittable) {
                _add({fieldtype:'Check', fieldname: 'submitted', label: dataent._('Submitted')})
            }

            if (this.isChild) {
                // child fields
                for (let field of model.childFields) {
                    if (dataent.db.typeMap[field.fieldtype] && !doctype_fields.includes(field.fieldname)) {
                        _add(field);
                    }
                }
            } else {
                // parent fields
                for (let field of model.parentFields) {
                    if (dataent.db.typeMap[field.fieldtype] && !doctype_fields.includes(field.fieldname)) {
                        _add(field);
                    }
                }
            }

            if (this.isTree) {
                // tree fields
                for (let field of model.treeFields) {
                    if (dataent.db.typeMap[field.fieldtype] && !doctype_fields.includes(field.fieldname)) {
                        _add(field);
                    }
                }
            }

            // doctype fields
            for (let field of this.fields) {
                let include = dataent.db.typeMap[field.fieldtype];

                if (include) {
                    _add(field);
                }

                // include tables if (withChildren = True)
                if (!include && field.fieldtype === 'Table') {
                    this._validFieldsWithChildren.push(field);
                }
            }
        }

        if (withChildren) {
            return this._validFieldsWithChildren;
        } else {
            return this._validFields;
        }
    }

    getKeywordFields() {
        if (!this._keywordFields) {
            this._keywordFields = this.keywordFields;
            if (!(this._keywordFields && this._keywordFields.length && this.fields)) {
                this._keywordFields = this.fields.filter(field => field.fieldtype !== 'Table' && field.required).map(field => field.fieldname);
            }
            if (!(this._keywordFields && this._keywordFields.length)) {
                this._keywordFields = ['name']
            }
        }
        return this._keywordFields;
    }

    validateSelect(field, value) {
        let options = field.options;
        if (!options) return;

        if (typeof options === 'string') {
            // values given as string
            options = field.options.split('\n');
        }
        if (!options.includes(value)) {
            throw new dataent.errors.ValueError(`${value} must be one of ${options.join(", ")}`);
        }
        return value;
    }

    async trigger(event, params = {}) {
        Object.assign(params, {
            doc: this,
            name: event
        });

        await super.trigger(event, params);
    }

    setDefaultIndicators() {
        if (!this.indicators) {
            if (this.isSubmittable) {
                this.indicators = {
                    key: 'submitted',
                    colors: {
                        0: indicatorColor.GRAY,
                        1: indicatorColor.BLUE
                    }
                }
            }
        }
    }

    getIndicatorColor(doc) {
        if (dataent.isDirty(this.name, doc.name)) {
            return indicatorColor.ORANGE;
        } else {
            if (this.indicators) {
                let value = doc[this.indicators.key];
                if (value) {
                    return this.indicators.colors[value] || indicatorColor.GRAY;
                } else {
                    return indicatorColor.GRAY;
                }
            } else {
                return indicatorColor.GRAY;
            }
        }
    }
}