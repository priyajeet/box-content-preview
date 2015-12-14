'use strict';

import AssetLoader from '../asset-loader';

// Order of the viewers matters. Prefer original before others. Go from specific to general.
// For example, a gif file can be previewed both natively (majority use case) using the original
// representation but can fallback to using the png representation (for watermarked versions).
const VIEWERS = [
    {
        REPRESENTATION: 'original',
        EXTENSIONS: [ 'gif' ],
        SCRIPTS: [ 'image.js' ],
        STYLESHEETS: [ 'image.css' ],
        CONSTRUCTOR: 'Image'
    },
    {
        REPRESENTATION: 'multi-image',
        EXTENSIONS: [ 'tif', 'tiff' ],
        SCRIPTS: [ 'multi-image.js' ],
        STYLESHEETS: [ 'multi-image.css' ],
        CONSTRUCTOR: 'MultiImage'
    },
    {
        REPRESENTATION: 'jpg',
        EXTENSIONS: [ 'jpeg', 'jpg' ],
        SCRIPTS: [ 'image.js' ],
        STYLESHEETS: [ 'image.css' ],
        CONSTRUCTOR: 'Image'
    },
    {
        REPRESENTATION: 'png',
        EXTENSIONS: [ 'ai', 'bmp', 'eps', 'gif', 'png', 'ps', 'psd', 'svg', 'svs', 'tga', 'tif', 'tiff' ],
        SCRIPTS: [ 'image.js' ],
        STYLESHEETS: [ 'image.css' ],
        CONSTRUCTOR: 'Image'
    }
];

class ImageLoader extends AssetLoader {

    /**
     * [constructor]
     * @returns {ImageLoader} ImageLoader instance
     */
    constructor() {
        super();
        this.viewers = VIEWERS;
    }

    /**
     * A unique identifier for this loader
     *
     * @public
     * @returns {String} id of this loader
     */
    get id() {
        return 'box-image';
    }
}

export default new ImageLoader();