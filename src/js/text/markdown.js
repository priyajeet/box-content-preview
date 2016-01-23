'use strict';

import '../../css/text/text.css';
import autobind from 'autobind-decorator';
import TextBase from './text-base';
import fetch from 'isomorphic-fetch';
import marked from 'marked';

let Box = global.Box || {};
let hljs = global.hljs;

@autobind
class MarkDown extends TextBase {

    /**
     * [constructor]
     * @param {String|HTMLElement} container The container
     * @param {Object} options some options
     * @returns {MarkDown} MarkDown instance
     */
    constructor(container, options) {
        super(container, options);
        this.containerEl.innerHTML = '<pre class="hljs box-preview-text"><code></code></pre>';
        this.preEl = this.containerEl.firstElementChild;
        this.markDownEl = this.preEl.firstElementChild;
        this.preEl.style.visibility = 'hidden'; // Hide the element till data loads
    }

    /**
     * Loads a md file.
     *
     * @param {String} textUrl The text file to load
     * @public
     * @returns {Promise} Promise to load a text file
     */
    load(textUrl) {
        fetch(textUrl, {
            headers: this.appendAuthHeader()
        }).then((response) => {
            return response.text();
        }).then((txt) => {

            if (this.destroyed) {
                return;
            }

            marked.setOptions({
                highlightClass: 'hljs',
                highlight: (code) => hljs.highlightAuto(code).value
            });

            this.markDownEl.innerHTML = marked(txt);

            if (this.options.ui !== false) {
                this.loadUI();
            }

            this.loaded = true;
            this.emit('load');
            this.preEl.style.visibility = 'visible';
        });

        super.load();
    }
}

Box.Preview = Box.Preview || {};
Box.Preview.MarkDown = MarkDown;
global.Box = Box;
export default MarkDown;