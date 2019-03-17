# Metadata

Metadata are first class objects in Dataent.js. You can get a metadata object by `dataent.getMeta`. All objects from the `models` folders of all modules are loaded.

### Example

```js
let todo_meta = dataent.getMeta('ToDo');

// get all fields of type "Data"
let data_fields = todo_meta.fields.map(d => d.fieldtype=='Data' ? d : null);
```