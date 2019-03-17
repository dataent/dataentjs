# Backends

Dataent.js comes with built-in backends for data storage. These can be client-side or server-side

- SQLite
- REST

There can be only one backend at a time that can be accessed by the `dataent.db` property.

## API

The backend will implement the following `async` methods

- `get_doc`
- `get_all`
- `get_value`
- `insert`
- `update`

## sqlite Backend

Connection paramter required for the sqlite backend is the path of the file

```js
sqllite = require('dataentjs/dataent/backends/sqlite');

dataent.db = await new sqlite.Database({dbPath: dbPath})
```

### SQL Queries

You can also directly write SQL with `dataent.db.sql`

```js
all_todos = dataent.db.sql('select name from todo');
```

## REST Backend

For the client, the backend is the REST API that executes calls with web-requests.

Before using, you must initialize the `dataent.fetch` property with `window.fetch` or `node-fetch`

```js
const Database = require('dataentjs/dataent/backends/rest_client').Database;

dataent.fetch = window.fetch.bind();
dataent.db = await new Database({server: server});
```