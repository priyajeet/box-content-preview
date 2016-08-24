/**
 * @fileoverview Presentation viewer for PowerPoint presentations.
 * @author tjin
 */

import './presentation.scss';
import autobind from 'autobind-decorator';
import DocBase from './doc-base';
import pageNumTemplate from 'raw!./page-num-button-content.html';
import throttle from 'lodash.throttle';
import { CLASS_INVISIBLE } from '../../constants';
import {
    ICON_DROP_DOWN,
    ICON_DROP_UP,
    ICON_FULLSCREEN_IN,
    ICON_FULLSCREEN_OUT
} from '../../icons/icons';

const Box = global.Box || {};
const WHEEL_THROTTLE = 200;

@autobind
class Presentation extends DocBase {

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    /**
     * [contructor]
     *
     * @param {string|HTMLElement} container Container node
     * @param {object} [options] Configuration options
     * @returns {Presentation} Presentation instance
     */
    constructor(container, options) {
        super(container, options);
        this.docEl.classList.add('box-preview-doc-presentation');
    }

    /**
     * Go to specified page. We implement presentation mode by hiding the
     * previous current page and showing the new page.
     *
     * @param {number} pageNum Page to navigate to
     * @returns {void}
     */
    setPage(pageNum) {
        let pageEl = this.docEl.querySelector(`[data-page-number="${this.pdfViewer.currentPageNumber}"]`);
        pageEl.classList.add(CLASS_INVISIBLE);

        super.setPage(pageNum);

        pageEl = this.docEl.querySelector(`[data-page-number="${this.pdfViewer.currentPageNumber}"]`);
        pageEl.classList.remove(CLASS_INVISIBLE);
    }

    /**
     * Handles keyboard events for presentation viewer.
     *
     * @override
     * @param {String} key keydown key
     * @returns {Boolean} consumed or not
     */
    onKeydown(key) {
        if (key === 'ArrowUp') {
            this.previousPage();
            return true;
        } else if (key === 'ArrowDown') {
            this.nextPage();
            return true;
        }

        return super.onKeydown(key);
    }

    //--------------------------------------------------------------------------
    // Event Listeners
    //--------------------------------------------------------------------------

    /**
     * Binds DOM listeners for presentation viewer.
     *
     * @override
     * @returns {void}
     * @protected
     */
    bindDOMListeners() {
        super.bindDOMListeners();

        // We set passive: true to make page more responsive
        this.docEl.addEventListener('wheel', this.wheelHandler(), { passive: true });
    }

    /**
     * Unbinds DOM listeners for presentation viewer.
     *
     * @override
     * @returns {void}
     * @protected
     */
    unbindDOMListeners() {
        super.unbindDOMListeners();

        // We set passive: true to make page more responsive
        this.docEl.removeEventListener('wheel', this.wheelHandler(), { passive: true });
    }

    /**
     * Adds event listeners for presentation controls
     *
     * @override
     * @returns {void}
     * @protected
     */
    bindControlListeners() {
        super.bindControlListeners();

        this.controls.add(__('previous_page'), this.previousPage, 'box-preview-presentation-previous-page-icon box-preview-previous-page', ICON_DROP_UP);

        const buttonContent = pageNumTemplate.replace(/>\s*</g, '><'); // removing new lines
        this.controls.add(__('enter_page_num'), this.showPageNumInput, 'box-preview-doc-page-num', buttonContent);

        this.controls.add(__('next_page'), this.nextPage, 'box-preview-presentation-next-page-icon box-preview-next-page', ICON_DROP_DOWN);

        this.controls.add(__('enter_fullscreen'), this.toggleFullscreen, 'box-preview-enter-fullscreen-icon', ICON_FULLSCREEN_IN);
        this.controls.add(__('exit_fullscreen'), this.toggleFullscreen, 'box-preview-exit-fullscreen-icon', ICON_FULLSCREEN_OUT);
    }

    /**
     * Handler for 'pagesinit' event.
     *
     * @returns {void}
     * @private
     */
    pagesinitHandler() {
        // We implement presentation mode by hiding other pages except for the first page
        const pageEls = [].slice.call(this.docEl.querySelectorAll('.pdfViewer .page'), 0);
        pageEls.forEach((pageEl) => {
            if (pageEl.getAttribute('data-page-number') === '1') {
                return;
            }

            pageEl.classList.add(CLASS_INVISIBLE);
        });

        super.pagesinitHandler();
    }

    /**
     * Mousewheel handler - scrolls presentations by page
     *
     * @returns {Function} Throttled mousewheel handler
     * @private
     */
    wheelHandler() {
        if (!this.throttledWheelHandler) {
            this.throttledWheelHandler = throttle((event) => {
                if (event.deltaY > 0) {
                    this.nextPage();
                } else if (event.deltaY < 0) {
                    this.previousPage();
                }
            }, WHEEL_THROTTLE);
        }

        return this.throttledWheelHandler;
    }
}

Box.Preview = Box.Preview || {};
Box.Preview.Presentation = Presentation;
global.Box = Box;
export default Presentation;