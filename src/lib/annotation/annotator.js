/**
 * @fileoverview Base annotator class that implements point annotations.
 * Viewer-specific annotations should extend this for other annotation types
 * or to modify point annotation behavior.
 * @author tjin
 */

import autobind from 'autobind-decorator';
import AnnotationThread from './annotation-thread';
import Browser from '../browser';
import EventEmitter from 'events';
import LocalStorageAnnotationService from './localstorage-annotation-service';

import * as annotatorUtil from './annotator-util';
import * as constants from './annotation-constants';
import { ICON_ANNOTATION } from '../icons/icons';

const ANONYMOUS_USER = {
    name: 'Kylo Ren',
    avatarUrl: 'https://i.imgur.com/BcZWDIg.png'
};
const POINT_ANNOTATION_TYPE = 'point';
const POINT_STATE_PENDING = 'pending';

@autobind
class Annotator extends EventEmitter {

    //--------------------------------------------------------------------------
    // Typedef
    //--------------------------------------------------------------------------

    /**
     * The data object for constructing an Annotator.
     *
     * @typedef {Object} AnnotatorData
     * @property {HTMLElement} annotatedElement HTML element to annotate on
     * @property {AnnotationService|LocalStorageAnnotationService} [annotationService] Annotations CRUD service
     * @property {String} fileVersionID File version ID
     * @property {Object} [user] User creating the thread
     */

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * [constructor]
     *
     * @param {AnnotatorData} data Data for constructing an Annotator
     * @returns {Annotator} Annotator instance
     */
    constructor(data) {
        super();

        this._annotatedElement = data.annotatedElement;
        this._annotationService = data.annotationService || new LocalStorageAnnotationService();
        this._fileVersionID = data.fileVersionID;
        this._user = data.user || ANONYMOUS_USER;
    }

    /**
     * [destructor]
     *
     * @returns {void}
     */
    destroy() {
        this._destroyControls();

        Object.keys(this._threads).forEach((page) => {
            this._threads[page].forEach((thread) => {
                this._unbindCustomListenersOnThread(thread);
            });
        });
        this._unbindDOMListeners();
    }

    /**
     * Initializes annotator.
     *
     * @returns {void}
     */
    init() {
        this.setScale(1);
        this._setupControls();
        this._setupAnnotations();

        if (Browser.getName() === 'Explorer') {
            this._addIEAnnotationStylesheet();
        }
    }

    /**
     * Fetches and shows saved annotations.
     *
     * @returns {void}
     */
    showAnnotations() {
        // Show annotations after we've generated an in-memory map
        this._fetchAnnotations().then(this.renderAnnotations);
    }

    /**
     * Renders annotations from memory.
     *
     * @returns {void}
     * @private
     */
    renderAnnotations() {
        this._clearAnnotations();
        this._showAnnotations();
    }

    /**
     * Sets the zoom scale.
     *
     * @param {Number} scale
     * @returns {void}
     */
    setScale(scale) {
        this._annotatedElement.setAttribute('data-scale', scale);
    }

    /**
     * Toggles point annotation mode on and off. When point annotation mode is
     * on, clicking an area will create a point annotation at that location.
     *
     * @returns {void}
     */
    togglePointModeHandler() {
        // If in annotation mode, turn it off
        if (this._isInPointMode()) {
            this.emit('pointmodeexit');
            this._annotatedElement.classList.remove(constants.CLASS_ANNOTATION_POINT_MODE);

            this._unbindPointModeListeners(); // Disable point mode
            this._bindDOMListeners(); // Re-enable other annotations

        // Otherwise, enable annotation mode
        } else {
            this.emit('pointmodeenter');
            this._annotatedElement.classList.add(constants.CLASS_ANNOTATION_POINT_MODE);

            this._unbindDOMListeners(); // Disable other annotations
            this._bindPointModeListeners();  // Enable point mode
        }
    }

    //--------------------------------------------------------------------------
    // Private functions
    //--------------------------------------------------------------------------

    /**
     * Sets up annotation controls - this is needed if there is no Preview
     * header, where the controls are normally.
     *
     * @returns {void}
     * @private
     */
    _setupControls() {
        // No need to set up controls if Preview header exists
        if (document.querySelector('.box-preview-header')) {
            return;
        }

        const annotationButtonContainerEl = document.createElement('div');
        annotationButtonContainerEl.classList.add('box-preview-annotation-controls');
        annotationButtonContainerEl.innerHTML = `
            <button class="btn box-preview-btn-annotate">${ICON_ANNOTATION}</button>`.trim();
        const pointAnnotationModeBtnEl = annotationButtonContainerEl.querySelector('.box-preview-btn-annotate');
        pointAnnotationModeBtnEl.addEventListener('click', this.togglePointModeHandler);
        this._annotatedElement.appendChild(annotationButtonContainerEl);
    }

    /**
     * Destroys annotation controls if there are any.
     *
     * @returns {void}
     * @private
     */
    _destroyControls() {
        const annotationButtonContainerEl = document.querySelector('.box-preview-annotation-controls');
        if (annotationButtonContainerEl) {
            const pointAnnotationModeBtnEl = annotationButtonContainerEl.querySelector('.box-preview-btn-annotate');
            pointAnnotationModeBtnEl.removeEventListener('click', this.togglePointModeHandler);
            annotationButtonContainerEl.parentNode.removeChild(annotationButtonContainerEl);
        }
    }

    /**
     * Annotations setup.
     *
     * @returns {void}
     * @private
     */
    _setupAnnotations() {
        // Map of page => [threads on page]
        this._threads = {};
        this._bindDOMListeners();
    }

    /**
     * Fetches persisted annotations, create threads as appropriate, and
     * generate an in-memory map of page to threads.
     *
     * @returns {Promise} Promise for fetching saved annotations
     * @private
     */
    _fetchAnnotations() {
        // @TODO(tjin): Load/unload annotations by page based on pages loaded from document viewer

        return this._annotationService.getThreadMap(this._fileVersionID)
            .then((threadMap) => {
                // Generate map of page to threads
                Object.keys(threadMap).forEach((threadID) => {
                    const annotations = threadMap[threadID];
                    const firstAnnotation = annotations[0];
                    const thread = this._createAnnotationThread(annotations, firstAnnotation.location, firstAnnotation.type);

                    // Bind events on thread
                    this._bindCustomListenersOnThread(thread);
                });
            });
    }

    /**
     * Clears annotations.
     *
     * @returns {void}
     * @private
     */
    _clearAnnotations() {
        Object.keys(this._threads).forEach((page) => {
            this._threads[page].forEach((thread) => {
                thread.hide();
            });
        });
    }

    /**
     * Shows annotations.
     *
     * @returns {void}
     * @private
     */
    _showAnnotations() {
        Object.keys(this._threads).forEach((page) => {
            this._threads[page].forEach((thread) => {
                thread.show();
            });
        });
    }

    /**
     * Binds DOM event listeners.
     *
     * @returns {void}
     * @private
     */
    _bindDOMListeners() {}

    /**
     * Unbinds DOM event listeners.
     *
     * @returns {void}
     * @private
     */
    _unbindDOMListeners() {}

    /**
     * Binds custom event listeners for a thread.
     *
     * @param {AnnotationThread} thread Thread to bind events to
     * @returns {void}
     * @private
     */
    _bindCustomListenersOnThread(thread) {
        // Thread was deleted, remove from thread map
        thread.addListener('threaddeleted', () => {
            const page = thread.location.page || 1;

            // Remove from map
            this._threads[page] = this._threads[page].filter((searchThread) => searchThread.threadID !== thread.threadID);

            // Unbind listeners
            this._unbindCustomListenersOnThread(thread);
        });
    }

    /**
     * Unbinds custom event listeners for the thread.
     *
     * @param {AnnotationThread} thread Thread to bind events to
     * @returns {void}
     * @private
     */
    _unbindCustomListenersOnThread(thread) {
        thread.removeAllListeners(['threaddeleted']);
    }

    /**
     * Binds point mode event listeners.
     *
     * @returns {void}
     * @private
     */
    _bindPointModeListeners() {
        this._annotatedElement.addEventListener('click', this._pointClickHandler);
    }

    /**
     * Unbinds point mode event listeners.
     *
     * @returns {void}
     * @private
     */
    _unbindPointModeListeners() {
        this._annotatedElement.removeEventListener('click', this._pointClickHandler);
    }

    /**
     * Event handler for adding a point annotation. Creates a point annotation
     * thread at the clicked location.
     *
     * @param {Event} event DOM event
     * @returns {void}
     * @private
     */
    _pointClickHandler(event) {
        event.stopPropagation();

        // If click isn't on a page, ignore
        const eventTarget = event.target;
        const { pageEl, page } = annotatorUtil.getPageElAndPageNumber(eventTarget);
        if (!pageEl) {
            return;
        }

        // If click is inside an annotation dialog, ignore
        const dataType = annotatorUtil.findClosestDataType(eventTarget);
        if (dataType === 'annotation-dialog' || dataType === 'annotation-thread') {
            return;
        }

        // Destroy any pending point threads
        this._getPendingPointThreads().forEach((pendingThread) => {
            pendingThread.destroy();
        });

        // Store coordinates at 100% scale in PDF space in PDF units
        const pageDimensions = pageEl.getBoundingClientRect();
        const browserCoordinates = [event.clientX - pageDimensions.left, event.clientY - pageDimensions.top];
        const pdfCoordinates = annotatorUtil.convertDOMSpaceToPDFSpace(browserCoordinates, pageDimensions.height, annotatorUtil.getScale(this._annotatedElement));
        const [x, y] = pdfCoordinates;
        const location = { x, y, page };

        // Create new thread with no annotations, show indicator, and show dialog
        const thread = this._createAnnotationThread([], location, POINT_ANNOTATION_TYPE);
        thread.show();

        // Bind events on thread
        this._bindCustomListenersOnThread(thread);
    }

    /**
     * Creates a new AnnotationThread, adds it to in-memory map, and returns it.
     *
     * @param {Annotation[]} annotations Annotations in thread
     * @param {Object} location Location object
     * @param {String} type Annotation type
     * @returns {AnnotationThread} Created annotation thread
     * @private
     */
    _createAnnotationThread(annotations, location, type) {
        const thread = new AnnotationThread({
            annotatedElement: this._annotatedElement,
            annotations,
            annotationService: this._annotationService,
            fileVersionID: this._fileVersionID,
            location,
            user: this._user,
            type
        });
        this._addThreadToMap(thread);
        return thread;
    }

    /**
     * Adds thread to in-memory map.
     *
     * @param {AnnotationThread} thread Thread to add
     * @returns {void}
     * @private
     */
    _addThreadToMap(thread) {
        // Add thread to in-memory map
        const page = thread.location.page || 1;
        this._threads[page] = this._threads[page] || [];
        this._threads[page].push(thread);
    }

    /**
     * Returns whether or not annotator is in point mode.
     *
     * @returns {Boolean} Whether or not in point mode
     * @private
     */
    _isInPointMode() {
        return this._annotatedElement.classList.contains(constants.CLASS_ANNOTATION_POINT_MODE);
    }

    /**
     * Returns pending point threads.
     *
     * @returns {AnnotationThread[]} Pending point threads.
     * @private
     */
    _getPendingPointThreads() {
        const pendingThreads = [];

        Object.keys(this._threads).forEach((page) => {
            // Append pending point threads on page to array of pending threads
            [].push.apply(pendingThreads, this._threads[page].filter((thread) => {
                return thread.state === POINT_STATE_PENDING &&
                    thread.type === POINT_ANNOTATION_TYPE;
            }));
        });
        return pendingThreads;
    }

    /**
     * Manually add a stylesheet for custom cursors in IE10/IE11 since they
     * don't correctly resolve relative URLs, see:
     * http://stackoverflow.com/questions/7419314/custom-cursor-image-doesnt-work-in-all-ies
     * We hard-code the cursor URL to the cursor on our CDNs. Note this is a
     * hack and should be removed if we decide that we don't need custom
     * cursors for IE10 or IE11.
     *
     * @returns {void}
     * @private
     */
    _addIEAnnotationStylesheet() {
        const styleEl = document.createElement('style');
        styleEl.setAttribute('type', 'text/css');
        styleEl.innerHTML = `
            .box-preview-point-annotation-mode .page,
            .box-preview-point-annotation-mode .box-preview-annotation-layer,
            .box-preview-point-annotation-mode .textLayer > div {
                cursor: url('https://cdn01.boxcdn.net/content-experience/0.53.0/third-party/static/cursors/point-annotation.cur'), crosshair;
            }`.trim();
        document.getElementsByTagName('head')[0].appendChild(styleEl);
    }
}

export default Annotator;
