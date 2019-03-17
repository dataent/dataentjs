const dataent = require('dataentjs');

module.exports = {
    convertFieldsToDatatableColumns(fields, layout = 'fixed') {
        return fields.map(field => {
            if (!field.width) {
                if (layout==='ratio') {
                    field.width = 1;
                } else if (layout==='fixed') {
                    field.width = 120;
                }
            }
            return {
                id: field.fieldname || dataent.slug(field.label),
                field: field,
                content: field.label,
                editable: true,
                sortable: false,
                resizable: true,
                dropdown: false,
                width: field.width,
                align: ['Int', 'Float', 'Currency'].includes(field.fieldtype) ? 'right' : 'left',
                format: (value) => dataent.format(value, field)
            }
        });

    },

    addButton(label, parent, action, unhide = true) {
        const link = dataent.ui.add('button', 'btn btn-sm btn-outline-secondary', parent, label);
        link.type = 'button';
        link.addEventListener('click', action);
        if (unhide) {
            parent.classList.remove('hide');
        }
        return link;
    },

    // https://css-tricks.com/snippets/javascript/loop-queryselectorall-matches/
    forEachNode(nodeList, callback, scope) {
        if(!nodeList) return;
        for (var i = 0; i < nodeList.length; i++) {
            callback.call(scope, nodeList[i], i);
        }
    },

    activate($parent, $child, commonSelector, activeClass='active', index = -1) {
        let $children = $parent.querySelectorAll(`${commonSelector}.${activeClass}`);

        if (typeof $child === 'string') {
            $child = $parent.querySelector($child);
        }

        this.forEachNode($children, (node, i) => {
            if(index >= 0 && i <= index) return;
            node.classList.remove(activeClass);
        })

		$child.classList.add(activeClass);
	}
}
