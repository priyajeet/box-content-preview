'use strict';

import 'core-js/modules/es6.reflect';
import autobind from 'autobind-decorator';
import Promise from 'bluebird';
import EventEmitter from 'events';


const CSS_CLASS_ZOOMABLE = 'zoomable';
const CSS_CLASS_PANNABLE = 'pannable';
const CSS_CLASS_PANNING = 'panning';
const IMAGE_LOAD_TIMEOUT_IN_MILLIS = 5000;


@autobind
class Image extends EventEmitter {

    /**
     * [constructor]
     * @param {string|HTMLElement} event The mousemove event
     * @returns {Image}
     */
    constructor(container) {
        super();
        this.document = global.document;
        this.currentRotationAngle = 0;

        if (typeof container === 'string') {
            this.containerEl = this.document.querySelector(container);
        } else {
            this.containerEl = container;
        }

        this.containerEl.innerHTML = '<div class="box-image"><span class="vertical-alignment-helper"></div>';
        this.containerEl.style.position = 'relative';
        
        this.wrapperEl = this.containerEl.firstElementChild;
        
        this.imageEl = this.wrapperEl.appendChild(this.document.createElement('img'));
        this.imageEl.addEventListener('mousedown', this.handleMouseDown);
        this.imageEl.addEventListener('mouseup', this.handleMouseUp);
        this.imageEl.addEventListener('dragstart', this.handleDragStart);
    }

    /**
     * Loads an image.
     * @param {Event} event The mousemove event
     * @returns {Promise}
     */
    load(imageUrl) {
        this.imageUrl = imageUrl;
        
        return new Promise((resolve, reject) => {
            this.imageEl.addEventListener('load', () => {
                resolve(this);
                this.loaded = true;
                this.zoom();
                this.emit('load');
            });
            this.imageEl.src = imageUrl;

            setTimeout(() => {
                if (!this.loaded) {
                    reject();
                }
            }, IMAGE_LOAD_TIMEOUT_IN_MILLIS);
        });
    }

    /**
     * Handles mouse down event.
     * @param {Event} event The mousemove event
     * @returns {void}
     */
    handleMouseDown(event) {
        this.didPan = false;

        // If this is not a left click, then ignore
        // If this is a CTRL or CMD click, then ignore
        if ((typeof event.button !== 'number' || event.button < 2) && !event.ctrlKey && !event.metaKey) {
            this.startPanning(event.clientX, event.clientY);
            event.preventDefault();
        }
    }

    /**
     * Handles mouse down event.
     * @param {Event} event The mousemove event
     * @returns {void}
     */
    handleMouseUp(event) {
        this.didPan = false;

        // If this is not a left click, then ignore
        // If this is a CTRL or CMD click, then ignore
        if ((typeof event.button !== 'number' || event.button < 2) && !event.ctrlKey && !event.metaKey) {
            if (!this.isPannable && this.isZoomable) {
                // If the mouse up was not due to panning, and the image is zoomable, then zoom in.
                this.zoom('in');
            } else if (!this.didPan) {
                // If the mouse up was not due to ending of panning, then assume it was a regular
                // click mouse up. In that case reset the image size, mimicking single-click-unzoom.
                this.zoom('reset');
            }
            event.preventDefault();
        }
    }

    /**
     * Prevents drag events on the image
     * @param {Event} event The mousemove event
     * @returns {void}
     */
    handleDragStart(event) {
        event.preventDefault();
        event.stopPropogation();
    }

    /**
     * Updates cursors on image content
     * @private
     * @returns {void}
     */
    updateCursor() {
        if (this.isPannable) {
            this.isZoomable = false;
            this.imageEl.classList.add(CSS_CLASS_PANNABLE);
            this.imageEl.classList.remove(CSS_CLASS_ZOOMABLE);
        } else {
            this.isZoomable = true;
            this.imageEl.classList.remove(CSS_CLASS_PANNABLE);
            this.imageEl.classList.add(CSS_CLASS_ZOOMABLE);
        }
    }

    /**
     * Can the viewer currently be panned
     * @private
     * @returns {void}
     */
    updatePannability() {
        let imageDimensions = this.imageEl.getBoundingClientRect();
        let containerDimensions = this.wrapperEl.getBoundingClientRect();
        this.isPannable = imageDimensions.width > containerDimensions.width || imageDimensions.height > containerDimensions.height;
        this.didPan = false;
        this.updateCursor();
    }

    /**
     * Pan the image to the given x/y position
     * @param {Event} event The mousemove event
     * @private
     * @returns {void}
     */
    pan(event) {
        if (!this.isPanning) {
            return;
        }
        let offsetX = event.clientX - this.panStartX;
        let offsetY = event.clientY - this.panStartY;
        this.wrapperEl.scrollLeft = this.panStartScrollLeft - offsetX;
        this.wrapperEl.scrollTop = this.panStartScrollTop - offsetY;
        this.didPan = true;
        this.emit('pan');
    }

    /**
     * Stop panning the image
     * @private
     * @returns {void}
     */
    stopPanning() {
        this.isPanning = false;
        this.document.body.removeEventListener('mousemove', this.pan);
        this.document.body.removeEventListener('mouseup', this.stopPanning);
        this.imageEl.classList.remove(CSS_CLASS_PANNING);
        this.emit('panend');
    }

    /**
     * Start panning the image if the image is pannable
     * @param {number} x The initial x position of the mouse
     * @param {number} y The initial y position of the mouse
     * @returns {void}
     */
    startPanning(x, y) {
        if (!this.isPannable) {
            return;
        }
        this.panStartX = x;
        this.panStartY = y;
        this.panStartScrollLeft = this.wrapperEl.scrollLeft;
        this.panStartScrollTop = this.wrapperEl.scrollTop;
        this.isPanning = true;
        this.document.body.addEventListener('mousemove', this.pan);
        this.document.body.addEventListener('mouseup', this.stopPanning);
        this.imageEl.classList.add(CSS_CLASS_PANNING);
        this.emit('panstart');
    }

    /**
     * Rotate image anti-clockwise by 90 degrees
     * @private
     * @returns {void}
     */
    rotateLeft() {
        let angle = this.currentRotationAngle - 90;
        this.currentRotationAngle = (angle === -3600) ? 0 : angle;
        this.imageEl.style.transform = 'rotate(' + this.currentRotationAngle + 'deg)';
        this.emit('rotate');
    }

    /**
     * Handles zoom
     * @param {string} [type] Type of zoom in|out|reset
     * @private
     * @returns {void}
     */
    zoom(type) {

        let temp,
            ratio = 1, // default scaling ratio is 1:1
            newWidth,
            newHeight,
            newMarginLeft,
            newMarginTop,
            viewport,
            widthDifference,
            heightDifference,
            overflowingWidth,
            overflowingHeight,
            modifyWidthInsteadOfHeight,
            isRotated = Math.abs(this.currentRotationAngle) % 180 === 90,
            imageCurrentDimensions = this.imageEl.getBoundingClientRect(), // Getting bounding rect does not ignore transforms / rotates
            wrapperCurrentDimensions = this.wrapperEl.getBoundingClientRect(),
            width = imageCurrentDimensions.width,
            height = imageCurrentDimensions.height,
            aspect = width / height;

        // For multi page tifs, we always modify the width, since its essentially a DIV and not IMG tag.
        // For images that are wider than taller we use width. For images that are taller than wider, we use height.
        modifyWidthInsteadOfHeight = aspect >= 1;

        // getBoundingClientRect() includes scrollbar widths.
        viewport = {
            width: wrapperCurrentDimensions.width,
            height: wrapperCurrentDimensions.height
        };


        // From this point on, only 1 dimension will be modified. Either it will be width or it will be height.
        // The other one will remain null and eventually get cleared out. The image should automatically use the proper value
        // for the dimension that was cleared out.

        switch (type) {

            case 'in':
                if (modifyWidthInsteadOfHeight) {
                    newWidth = width + 100;
                } else {
                    newHeight = height + 100;
                }
                break;

            case 'out':
                if (modifyWidthInsteadOfHeight) {
                    newWidth = width - 100;
                } else {
                    newHeight = height - 100;
                }
                break;

            case 'reset':
                // Reset the dimensions to their original values by removing overrides
                // Doing so will make the browser render the image in its natural size
                // Then we can proceed by recalculating stuff from that natural size.
                this.imageEl.style.width = '';
                this.imageEl.style.height = '';

                // Image may still overflow the page, so do the default zoom by calling zoom again
                // This will go through the same workflow but end up in another case block.
                this.zoom();

                // Kill further execution
                return;

            default:

                // If the image is overflowing the viewport, figure out by how much
                // Then take that aspect that reduces the image the maximum (hence min ratio) to fit both width and height
                if (width > viewport.width || height > viewport.height) {
                    ratio = Math.min(viewport.width / width, viewport.height / height);
                }

                if (modifyWidthInsteadOfHeight) {
                    newWidth = width * ratio;
                } else {
                    newHeight = height * ratio;
                }
        }

        // If the image has been rotated, we need to swap the width and height
        // getBoundingClientRect always gives values based on how its rendered on the screen
        // But when setting width or height, transforms / rotates are ignored.
        if (isRotated) {
            temp = newWidth;
            newWidth = newHeight;
            newHeight = temp;
        }

        // Set the new dimensions. This ignores rotates, hence we need to swap the dimensions above.
        // Only one of the below will be set, while the other will get cleared out to let the browser
        // adjust it automatically based on the images aspect ratio.
        this.imageEl.style.width = newWidth ? newWidth + 'px' : '';
        this.imageEl.style.height = newHeight ? newHeight + 'px' : '';

        // Fix the scroll position of the image to be centered
        this.wrapperEl.scrollLeft = (this.wrapperEl.scrollWidth - viewport.width) / 2;
        this.wrapperEl.scrollTop = (this.wrapperEl.scrollHeight - viewport.height) / 2;

        this.emit('resize');

        // Give the browser some time to render before updating pannability
        setTimeout(this.updatePannability, 50);
    }        
}

global.Box = global.Box || {};
global.Box.Image = Image;
module.exports = Image;
