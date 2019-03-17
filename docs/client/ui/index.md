# UI

Dataent.js UI library helps create elements from the Native DOM

### dataent.ui.add

Add a new HTMLElement

```js
let div = dataent.ui.add('div', 'box', parentElement);
```

### dataent.ui.remove

Remove a new HTMLElement from its parent

```js
dataent.ui.remove(element);
```

### dataent.ui.add_class

Add a class to an existing document

```js
dataent.ui.add_class(element, 'box');
```

### dataent.ui.make_dropdown

Create and return a new dropdown element

```js
let dropdown = dataent.ui.make_dropdown('Actions', this.toolbar);
```