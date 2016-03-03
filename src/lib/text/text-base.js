import autobind from 'autobind-decorator';
import Controls from '../controls';
import Base from '../base';

@autobind
class TextBase extends Base {

    /**
     * [destructor]
     * @returns {void}
     */
    destroy() {
        // Destroy the controls
        if (this.controls && typeof this.controls.destroy === 'function') {
            this.controls.destroy();
        }

        super.destroy();
    }

    /**
     * Zooms by increasing or decreasing font size
     * @public
     * @param {String} inOrOut in or out
     * @returns {void}
     */
    zoom(inOrOut) {
        let el = this.containerEl.firstElementChild;
        let size = parseInt(el.style.fontSize, 10) || 100;
        if (inOrOut === 'in') {
            el.style.fontSize = (size + 10) + '%';
        } else if (inOrOut === 'out') {
            el.style.fontSize = (size - 10) + '%';
        }
        this.emit('resize');
    }

    /**
     * Zooms in
     * @public
     * @returns {void}
     */
    zoomIn() {
        this.zoom('in');
    }

    /**
     * Zooms in
     * @public
     * @returns {void}
     */
    zoomOut() {
        this.zoom('out');
    }

    /**
     * Zooms in
     * @private
     * @returns {void}
     */
    loadUI() {
        this.controls = new Controls(this.containerEl);
        this.controls.add(__('zoom_in'), this.zoomIn, 'box-preview-text-zoom-in-icon');
        this.controls.add(__('zoom_out'), this.zoomOut, 'box-preview-text-zoom-out-icon');
        this.controls.add(__('fullscreen'), this.toggleFullscreen, 'box-preview-text-expand-icon');
    }

    /**
     * Handles keyboard events for media
     *
     * @private
     * @param {String} key keydown key
     * @returns {Boolean} consumed or not
     */
    onKeydown(key) {

        // Return false when media controls are not ready or are focused
        if (!this.controls) {
            return false;
        }

        if (key === 'Shift++') {
            this.zoomIn();
            return true;
        } else if (key === 'Shift+_') {
            this.zoomOut();
            return true;
        }

        return false;
    }
}

export default TextBase;