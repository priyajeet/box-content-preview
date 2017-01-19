import AssetLoader from '../asset-loader';

// Order of the viewers matters. Prefer original before others. Go from specific to general.
// For example, a gif file can be previewed both natively (majority use case) using the original
// representation but can fallback to using the png representation (for watermarked versions).
const VIEWERS = [
    {
        REPRESENTATION: 'ORIGINAL',
        EXTENSIONS: ['svg', 'gif'],
        SCRIPTS: ['image.js'],
        STYLESHEETS: ['image.css'],
        CONSTRUCTOR: 'Image',
        PREFETCH: 'img'
    },
    {
        REPRESENTATION: 'multi-image',
        EXTENSIONS: ['tif', 'tiff'],
        SCRIPTS: ['multi-image.js'],
        STYLESHEETS: ['multi-image.css'],
        CONSTRUCTOR: 'MultiImage',
        PREFETCH: 'img'
    },
    {
        REPRESENTATION: 'jpg',
        EXTENSIONS: ['jpeg', 'jpg'],
        SCRIPTS: ['image.js'],
        STYLESHEETS: ['image.css'],
        CONSTRUCTOR: 'Image',
        PREFETCH: 'img'
    },
    {
        REPRESENTATION: 'png',
        EXTENSIONS: ['ai', 'bmp', 'dcm', 'eps', 'gif', 'png', 'ps', 'psd', 'svs', 'tga', 'tif', 'tiff'],
        SCRIPTS: ['image.js'],
        STYLESHEETS: ['image.css'],
        CONSTRUCTOR: 'Image',
        PREFETCH: 'img'
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
}

export default new ImageLoader();
