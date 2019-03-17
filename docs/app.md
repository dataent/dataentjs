# Creating a new App

## Install Dataent.js

```
yarn add dataentjs
```

dataentJS comes with an Express Server on the backend, VueJS for the front-end and a CLI to run these things with built-in webpack configs.

## Config

dataentJS requires a file named `dataent.conf.js` to be present in the root of your directory. Minimum configuration looks like:

```
module.exports = {
  staticPath: './static', // uploaded files are served from this directory
  distPath: './dist', // bundled assets are built and served here
  dev: {
    // your client side entry files
    entry: {
      app: './src/main.js'
    },
    outputDir: './dist',
    assetsPublicPath: '/',
    devServerPort: 8000,
    env: {
      PORT: process.env.PORT || 8000
    }
  },
  node: {
    paths: {
      main: 'server/index.js' // your server entry file
    }
  },
  electron: {
    // wip
  }
}

```

You also need an `index.html` located in the `src` directory. It can look like

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>My Awesome App</title>
</head>
<body>
    <div id="app"></div>
</body>
</html>
```

### Server

Assuming you have a `server/index.js` file, you can start the dataentjs server in just a few lines of code.

```js
const server = require('dataentjs/server');

server.start({
    backend: 'sqlite',
    connection_params: {
        db_path: 'test.db'
    }
});
```

### Client

In your client file you will have to initialize `dataent` and `models`.

`dataentjs/client` lib will initialize your server and user interface with the Desk.

Example starting point for an app:

```js

import dataent from 'dataentjs';
import io from 'socket.io-client';
import HTTPClient from 'dataentjs/backends/http';
import common from 'dataentjs/common';
import coreModels from 'dataentjs/models';

dataent.init();
dataent.registerLibs(common);
dataent.registerModels(coreModels);

const server = 'localhost:8000';
dataent.fetch = window.fetch.bind();
dataent.db = new HTTPClient({ server });
const socket = io.connect(`http://${server}`);
dataent.db.bindSocketClient(socket);

```

## Start

To start the server and build webpack simultaneously you can use the cli command

```bash
./node_modules/.bin/dataent start
```
