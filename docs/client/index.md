# Client

Dataent.js comes with built in single-page-application (SPA) with routing, views, list and form objects.

In building the client, you can use the REST API to query data, and use the models and controllers declared in your module.

You can use the same document API in the client as in the server, the only difference being that the data will be fetched via REST API in the background.

## Routing

- [Router](router.md)

## Views

- [Page](page.md)
- [List](list.md)
- [Form](form.md)

## Starting

You can setup your client by setting up the server and then importing your controllers with `require`

### Example

```js
const client = require('dataentjs/dataent/client');

client.start({
	server: 'localhost:8000',
	container: document.querySelector('.container'),
}).then(() => {
	const todo = require('dataentjs/dataent/models/doctype/todo/todo.js');
	dataent.init_controller('todo', todo);

	// ....
});
```

## REST Client

Dataent.js comes with a built in REST client so you can also use REST as a database backend with the Dataent.js API

### Create, Read, Update, Delete

You can manage documents, using the same Document API as if it were a local database

### Example

```js
await dataent.init();
await dataent.initDb('rest', {server: 'localhost:8000'});

let doc = await dataent.getDoc({doctype:'ToDo', subject:'test rest insert 1'});
await doc.insert();

doc.subject = 'subject changed';
await doc.update();

let data = await dataent.db.getAll({doctype:'ToDo'});
```
