'use strict';

import autobind from 'autobind-decorator';
import AnnotationService from './annotation-service';

const ANONYMOUS_USER = {
    name: 'Anonymous',
    avatarUrl: 'http://evansheline.com/wp-content/uploads/2011/02/facebook-Storm-Trooper.jpg'
};

/**
 * Annotator base class. Viewer-specific annotators should extend this.
 */
@autobind
class Annotator {

    /**
     * @constructor
     * @param {string} fileID File ID for annotations
     * @param {Object} [options] Optional parameters
     * @param {Object} [options.user] Optional user for annotations
     * @param {AnnotationService} [options.annotationService] Optional
     * annotations service for annotations persistence
     * @param {function} [getScale] Optional function that returns zoom scale
     * @returns {void}
     */
    constructor(fileID, options) {
        this.fileID = fileID;
        // Default to anonymous user
        this.user = options.user || ANONYMOUS_USER;
        // @TODO(tjin): new LocalStorageAnnotationService
        // Default to local storage annotations service
        this.annotationService = options.annotationService || new AnnotationService();
        // Default to return always returning scale of 1
        this.getScale = options.getScaleFunc || () => {
            return 1;
        };
    }

}

export default Annotator;
