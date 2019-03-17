const BaseList = require('dataentjs/client/view/list');

module.exports = class ToDoList extends BaseList {
    getFields(list)  {
        return ['name', 'subject', 'status'];
    }
}
