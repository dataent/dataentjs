const BaseForm = require('dataentjs/client/view/form');
const dataent = require('dataentjs');

module.exports = class FilterSelectorForm extends BaseForm {
    makeSaveButton() {
        this.saveButton = this.container.addButton(dataent._("Apply"), 'primary', async (event) => {
            if (this.doc.filterGroupName || (this.doc.filterGroup && this.doc._dirty)) {
                // new filter, call update
                await this.save();
            }
            this.trigger('apply-filters');
        });
    }
}