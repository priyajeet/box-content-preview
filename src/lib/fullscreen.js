import autobind from 'autobind-decorator';
import EventEmitter from 'events';
import {
    CLASS_FULLSCREEN
} from './constants';

@autobind
class Fullscreen extends EventEmitter {

    /**
     * [constructor]
     * @param {string|HTMLElement} event The mousemove event
     * @returns {Fullscreen} Fullscreen instance
     */
    constructor() {
        super();

        document.addEventListener('webkitfullscreenchange', this.fullscreenchangeHandler);
        document.addEventListener('mozfullscreenchange', this.fullscreenchangeHandler);
        document.addEventListener('MSFullscreenChange', this.fullscreenchangeHandler);
        document.addEventListener('fullscreenchange', this.fullscreenchangeHandler);
    }

    /**
     * Returns true if the browser supports fullscreen natively
     *
     * @private
     * @returns {Boolean} Fullscreen supported or not
     */
    isSupported() {
        return document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled;
    }

    /**
     * Return true if full screen is active
     *
     * @public
     * @param {HTMLElement} [element] fullscreen element
     * @returns {Boolean} In fullscreen or not
     */
    isFullscreen(element) {
        let fullscreen;
        if (this.isSupported()) {
            fullscreen = !!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
        } else {
            fullscreen = element instanceof HTMLElement && element.classList.contains(CLASS_FULLSCREEN);
        }
        return fullscreen;
    }

    /**
     * Fires events when the fullscreen state changes
     * @param {HTMLElement|Event} [el] fullscreen element
     * @returns {void}
     * @private
     */
    fullscreenchangeHandler(el) {
        let enter = false;

        if (this.isSupported()) {
            if (this.isFullscreen()) {
                enter = true;
            }
        } else {
            if (!this.isFullscreen(el)) {
                enter = true;
            }
        }

        if (enter) {
            this.emit('enter');
        } else {
            this.emit('exit');
        }
    }

    /**
     * Toggles fullscreen mode
     *
     * @private
     * @param {HTMLElement} el fullscreen element
     * @param {Object} vrDevice The HMD device used by WebVR
     * @returns {void}
     */
    toggle(el, vrDevice) {
        const options = vrDevice ? { vrDisplay: vrDevice } : Element.ALLOW_KEYBOARD_INPUT;
        const element = el || document.documentElement;

        if (this.isSupported()) {
            if (this.isFullscreen()) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            } else {
                if (element.requestFullscreen) {
                    element.requestFullscreen(options);
                } else if (element.msRequestFullscreen) {
                    element.msRequestFullscreen(options);
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen(options);
                } else if (element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen(options);
                }
            }
        } else {
            this.fullscreenchangeHandler(element);
        }
    }
}

export default new Fullscreen();
