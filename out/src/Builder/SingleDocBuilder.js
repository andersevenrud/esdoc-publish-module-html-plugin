'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _iceCap = require('ice-cap');

var _iceCap2 = _interopRequireDefault(_iceCap);

var _DocBuilder = require('./DocBuilder.js');

var _DocBuilder2 = _interopRequireDefault(_DocBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Single output builder class.
 * "single" means function, variable, typedef, external, etc...
 */
class SingleDocBuilder extends _DocBuilder2.default {
  exec(writeFile, copyDir) {
    const ice = this._buildLayoutDoc();
    ice.autoClose = false;

    const kinds = ['function', 'variable', 'typedef'];
    for (const kind of kinds) {
      const docs = this._find({ kind: kind });
      if (!docs.length) continue;

      const moduleGroups = {};

      for (const doc of docs) {
        const docPath = doc.memberof;

        moduleGroups[docPath] = moduleGroups[docPath] || [];
        moduleGroups[docPath].push(doc);
      }

      for (const moduleGroup in moduleGroups) {
        const docs = moduleGroups[moduleGroup];
        const fileName = this._getOutputFileName(docs[0]);
        const baseUrl = this._getBaseUrl(fileName);
        let title = kind.replace(/^(\w)/, c => c.toUpperCase());
        title = this._getTitle(title);

        ice.load('content', this._buildSingleDoc(kind, docs), _iceCap2.default.MODE_WRITE);
        ice.attr('baseUrl', 'href', baseUrl, _iceCap2.default.MODE_WRITE);
        ice.text('title', title, _iceCap2.default.MODE_WRITE);
        writeFile(fileName, ice.html);
      }
    }
  }

  /**
   * build single output.
   * @param {string} kind - target kind property.
   * @returns {string} html of single output
   * @private
   */
  _buildSingleDoc(kind, docs) {
    const title = kind.replace(/^(\w)/, c => c.toUpperCase());
    const ice = new _iceCap2.default(this._readTemplate('single.html'));

    const link = this._buildFileDocLinkHTML(docs[0], docs[0].importPath);
    ice.into('importPath', `import * from '${link}'`, (code, ice) => {
      ice.load('importPathCode', code);
    });

    ice.text('title', title);
    ice.load('summaries', this._buildSummaryHTML(docs, kind, 'Summary'), 'append');
    ice.load('details', this._buildDetailHTML(docs, kind, ''));
    return ice.html;
  }

  _buildSummaryHTML(docs, kind, title, isStatic = true) {
    let html = '';
    let prefix = '';

    if (docs[0].static) prefix = 'Static ';
    const _title = `${prefix}${kind} ${title}`;

    const result = this._buildSummaryDoc(docs, _title);
    if (result) {
      html += result.html;
    }

    return html;
  }

  _buildDetailHTML(docs, kind, title, isStatic = true) {
    let html = '';
    let prefix = '';

    if (docs[0].static) prefix = 'Static ';
    const _title = `${prefix}${kind} ${title}`;

    const result = this._buildDetailDocs(docs, _title);
    if (result) html += result.html;

    return html;
  }
}
exports.default = SingleDocBuilder;