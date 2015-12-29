'use strict';

import AssetLoader from '../asset-loader';
import { createAssetUrlCreator, prefetchAssets } from '../util';

// Order of the viewers matters. Prefer original before others. Go from specific to general.
// For example, a pdf file can be previewed both natively (majority use case) using the original
// representation but can fallback to using the pdf representation (for watermarked versions).
const VIEWERS = [
    {
        REPRESENTATION: 'original',
        EXTENSIONS: [ 'pdf' ],
        SCRIPTS: [ 'compatibility.js', 'pdf.js', 'pdf_viewer.js', 'document.js' ],
        STYLESHEETS: [ 'pdf_viewer.css', 'document.css' ],
        CONSTRUCTOR: 'Document',
        PREFETCH: 'xhr'
    },
    {
        REPRESENTATION: 'pdf',
        EXTENSIONS: [ 'ppt', 'pptx' ],
        SCRIPTS: [ 'compatibility.js', 'pdf.js', 'pdf_viewer.js', 'presentation.js' ],
        STYLESHEETS: [ 'pdf_viewer.css', 'presentation.css' ],
        CONSTRUCTOR: 'Presentation',
        PREFETCH: 'xhr'
    },
    {
        REPRESENTATION: 'pdf',
        EXTENSIONS: [ 'doc', 'docx', 'gdoc', 'gsheet', 'msg', 'odp', 'odt', 'ods', 'pdf', 'ppt', 'pptx', 'rtf', 'wpd', 'xhtml', 'xls', 'xlsm', 'xlsx', 'xml', 'xsd', 'xsl' ],
        SCRIPTS: [ 'compatibility.js', 'pdf.js', 'pdf_viewer.js', 'document.js' ],
        STYLESHEETS: [ 'pdf_viewer.css', 'document.css' ],
        CONSTRUCTOR: 'Document',
        PREFETCH: 'xhr'
    }
];

class DocLoader extends AssetLoader {

    /**
     * [constructor]
     * @returns {DocLoader} DocLoader instance
     */
    constructor() {
        super();
        this.viewers = VIEWERS;
    }

    /**
     * Some pre loading stuff
     *
     * @override
     * @param {Object} options some options
     * @returns {void}
     */
    preload(options) {
        // Since the pdf worker is pretty big, lets prefetch it
        let assetUrlCreator = createAssetUrlCreator(options.location.hrefTemplate);
        let pdfWorkerUrl = assetUrlCreator('pdf.worker.js');
        prefetchAssets([ pdfWorkerUrl ]);
    }
}

export default new DocLoader();
