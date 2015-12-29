'use strict';

import autobind from 'autobind-decorator';
import RepStatus from './rep-status';
import {
    createContentUrl,
    prefetchAssets,
    loadStylesheets,
    loadScripts,
    createAssetUrlCreator
} from './util';

@autobind
class AssetLoader {

    /**
     * Determines if this loader can be used
     *
     * @public
     * @param {Object} file box file
     * @param {Array|void} [disabledViewers] List of disabled viewers
     * @returns {Boolean} Is file supported
     */
    canLoad(file, disabledViewers = []) {
        return !!this.determineViewer(file, disabledViewers);
    }

    /**
     * Returns the available viewers
     *
     * @public
     * @returns {Array} list of supported viewers
     */
    getViewers() {
        return this.viewers;
    }

    /**
     * Chooses a viewer based on file extension.
     *
     * @public
     * @param {Object} file box file
     * @param {Array|void} [disabledViewers] List of disabled viewers
     * @returns {Object} the viewer to use
     */
    determineViewer(file, disabledViewers = []) {
        return this.viewers.find((viewer) => {
            if (disabledViewers.indexOf(viewer.CONSTRUCTOR) > -1) {
                return false;
            }
            return viewer.EXTENSIONS.indexOf(file.extension) > -1 && file.representations.entries.some((entry) => viewer.REPRESENTATION === entry.representation);
        });
    }

    /**
     * Chooses a representation. Assumes that there will be only
     * one specific representation. In other words we will not have
     * two png representation entries with different properties.
     *
     * @public
     * @param {Object} file box file
     * @param {Object} viewer the chosen viewer
     * @returns {Object} the representation to load
     */
    determineRepresentation(file, viewer) {
        return file.representations.entries.find((entry) => viewer.REPRESENTATION === entry.representation);
    }

    /**
     * Gets the status of a representation asset
     *
     * @public
     * @param {Object} representation box representation
     * @param {Object} headers request headers
     * @returns {Promise} Promise to load a preview
     */
    determineRepresentationStatus(representation, headers) {
        let repStatus = new RepStatus();
        return repStatus.status(representation, headers);
    }

    /**
     * Loads assets needed for a preview and finally loads the viewer
     *
     * @public
     * @param {Object} viewer chosen viewer
     * @param {String} assetTemplate template of assets
     * @returns {Promise} Promise to load scripts
     */
    load(viewer, assetTemplate) {

        // Create an asset path creator function
        let assetUrlCreator = createAssetUrlCreator(assetTemplate);

        // 1st load the stylesheets needed for this preview
        loadStylesheets(viewer.STYLESHEETS.map(assetUrlCreator));

        // Then load the scripts needed for this preview
        return loadScripts(viewer.SCRIPTS.map(assetUrlCreator));
    }

    /**
     * Prefetches assets
     *
     * @public
     * @param {Object} file box file
     * @param {Object} [options] optional options
     * @returns {void}
     */
    prefetch(file, options) {
        // Create an asset path creator function
        let assetUrlCreator = createAssetUrlCreator(options.location.hrefTemplate);

        // Determine the viewer to use
        let viewer = this.determineViewer(file);

        // Determine the representation to use
        let representation = this.determineRepresentation(file, viewer);

        // Prefetch the stylesheets needed for this preview
        prefetchAssets(viewer.STYLESHEETS.map(assetUrlCreator));

        // Prefetch the scripts needed for this preview
        prefetchAssets(viewer.SCRIPTS.map(assetUrlCreator));

        if (viewer.PREFETCH === 'xhr') {
            fetch(representation.links.content.url, {
                headers: {
                    'Authorization': 'Bearer ' + this.options.token
                }
            });
        } else {
            let img = document.createElement('img');
            img.crossOrigin = 'anonymous';
            img.src = createContentUrl(representation.links.content.url, options.token);
        }
    }

    /**
     * An empty function that can be overriden just incase
     * some loader wants to do some initialization stuff
     *
     * @public
     * @param {Object} options options
     * @returns {void}
     */
    preload(options) {
        // empty
    }
}

export default AssetLoader;