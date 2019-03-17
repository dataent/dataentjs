const dataent = require('dataentjs');
const nunjucks = require('nunjucks/browser/nunjucks');

async function getHTML(doctype, name) {
    const meta = dataent.getMeta(doctype);
    const printFormat = await dataent.getDoc('PrintFormat', meta.print.printFormat);
    let doc = await dataent.getDoc(doctype, name);
    let context = {doc: doc, dataent: dataent};

    let html;
    try {
        html = nunjucks.renderString(printFormat.template, context);
    } catch (error) {
        console.log(error);
        html = '';
    }

    return `
        <div class="print-page">
            ${html}
        </div>
    `;
}

module.exports = {
    getHTML
}
