import Box3DControls from '../box3d-controls';
import autobind from 'autobind-decorator';
import {
    EVENT_CLOSE_RENDER_MODE_UI,
    EVENT_CLOSE_SETTINGS_UI,
    EVENT_SET_RENDER_MODE
} from './model3d-constants';

import { CLASS_HIDDEN } from '../../constants';

const CSS_CLASS_CURRENT_RENDER_MODE = 'box-preview-current-render-mode';

const RENDER_MODES = {
    lit: {
        name: 'Lit',
        key: 'lit',
        baseClass: 'lit', // add rm- for control, and icon-rm, and .rm- for query selector
        el: null
    },
    unlit: {
        name: 'Unlit',
        key: 'unlit',
        baseClass: 'unlit',
        el: null
    },
    normals: {
        name: 'Normals',
        key: 'normals',
        baseClass: 'normals',
        el: null
    },
    shape: {
        name: 'Shape',
        key: 'shape',
        baseClass: 'normals',
        el: null
    },
    wireframe: {
        name: 'Wireframe',
        key: 'wireframe',
        baseClass: 'wireframe',
        el: null
    },
    flatwire: {
        name: 'Untextured Wireframe',
        key: 'flatwire',
        baseClass: 'untexturedwireframe',
        el: null
    },
    uv: {
        name: 'UV Overlay',
        key: 'uv',
        baseClass: 'uvoverlay',
        el: null
    }
};

import {
    ICON_3D_RENDER_MODES,
    ICON_3D_RESET,
    ICON_GEAR
} from '../../icons/icons';


/**
 * Model3dControls
 * This class handles the UI for 3d preview controls. This includes Reset,
 * Render Mode selection, VR and fullscreen buttons.
 * @class
 */
@autobind
class Model3dControls extends Box3DControls {
    /**
     * Creates UI and Handles events for 3D Model Preview
     * @constructor
     * @inheritdoc
     * @returns {Model3dControls} Model3dControls instance
     */
    constructor(containerEl) {
        super(containerEl);
        this.renderModeCurrent = RENDER_MODES.lit.name;
    }

    /**
     * @inheritdoc
     */
    addUi() {
        this.renderModesSelectorEl = document.createElement('ul');
        this.renderModesSelectorEl.classList.add('box-preview-overlay');
        this.renderModesSelectorEl.classList.add('box-preview-pullup');
        this.renderModesSelectorEl.classList.add('box-preview-render-mode-selector');
        this.renderModesSelectorEl.classList.add(CLASS_HIDDEN);

        Object.keys(RENDER_MODES).forEach((mode) => {
            const renderModeEl = this.createRenderModeItem(RENDER_MODES[mode]);
            this.renderModesSelectorEl.appendChild(renderModeEl);
        });

        this.resetButtonEl = this.controls.add(__('box3d_reset_camera'), this.handleReset, '', ICON_3D_RESET);

        this.addVRButton();
        this.hideVrButton();

        const renderModesEl = this.controls.add(__('box3d_render_modes'), this.handleToggleRenderModes, '', ICON_3D_RENDER_MODES);
        renderModesEl.parentElement.appendChild(this.renderModesSelectorEl);

        this.settingsButtonEl = this.controls.add(__('box3d_settings'), this.fixme, '', ICON_GEAR);
        this.addFullscreenButton();

        // Set default to lit!
        this.handleSetRenderMode(RENDER_MODES.lit);

        this.addListener(EVENT_CLOSE_RENDER_MODE_UI, this.handleCloseUi);
        this.controls.controlsEl.addEventListener('click', this.handleControlsClick);
    }

    /**
     * Create a render mode selector for the render mode controls
     * @param {Object} renderModeDescriptor Description of render mode data. See RENDER_MODES
     * @returns {HTMLElement} The built render mode item to add to render modes list UI
     */
    createRenderModeItem(renderModeDescriptor) {
        const className = renderModeDescriptor.baseClass;

        const renderModeItem = document.createElement('li');
        renderModeItem.classList.add(`box-preview-rm-${className}`);
        renderModeItem.classList.add('box-preview-rendermode-item');
        /*eslint-disable*/
        renderModeDescriptor.el = renderModeItem;
        /*eslint-enable*/
        const onRenderModeChange = () => {
            this.handleCloseUi();
            this.handleSetRenderMode(renderModeDescriptor);
        };

        this.registerUiItem(className, renderModeItem, 'click', onRenderModeChange);

        const renderModeIcon = document.createElement('span');
        renderModeIcon.classList.add(`box-preview-icon-rm-${className}`);
        renderModeIcon.classList.add('box-preview-inline-icon');

        renderModeItem.appendChild(renderModeIcon);
        renderModeItem.innerHTML += renderModeDescriptor.name;

        return renderModeItem;
    }

    /**
     * Handle toggle rendermodes ui event
     * @returns {void}
     */
    handleToggleRenderModes() {
        this.toggleElementVisibility(this.renderModesSelectorEl);
    }

    /**
     * Handle a change of render mode
     * @param {object} renderMode A render mode descriptor, used to set the current
     * render mode icon, and send an event
     * @returns {void}
     */
    handleSetRenderMode(renderMode = 'Lit') {
        const current = this.renderModesSelectorEl.querySelector(`.${CSS_CLASS_CURRENT_RENDER_MODE}`);
        if (current) {
            current.classList.remove(CSS_CLASS_CURRENT_RENDER_MODE);
        }

        let mode = renderMode;
        // In the case the render mode name is passed, we'll use it to get the
        // corresponding render mode info
        if (typeof mode === 'string') {
            mode = this.getModeByName(renderMode);
        }

        mode.el.classList.add(CSS_CLASS_CURRENT_RENDER_MODE);
        this.renderModeCurrent = mode.key;
        this.emit(EVENT_SET_RENDER_MODE, mode.name);
    }

    /**
     * Close the render mode ui
     * @returns {void}
     */
    handleCloseUi() {
        this.setElementVisibility(this.renderModesSelectorEl, false);
    }

    /**
     * Handle controls click Event
     * @returns {void}
     */
    handleControlsClick() {
        this.emit(EVENT_CLOSE_SETTINGS_UI);
    }

    /**
     * Set a the render mode, from a key in the Render Modes dictionary
     * @param {string} modeIcon The key in the RENDER_MODES dictionary to use to
     * get the icon class that we'll change the render mode button to
     * @returns {void}
     */
    setRenderModeIcon(modeIcon) {
        const icon = this.renderModeControl.querySelector('span');
        icon.className = modeIcon;
    }


    /**
     * Given a render mode name, get the corresponding render mode info
     * @param {String} renderModeName The name of the render mode
     * @returns {Object} Render mode descriptor
     */
    getModeByName(renderModeName) {
        let renderMode;

        /* eslint-disable no-restricted-syntax */
        for (const renderModeKey in RENDER_MODES) {
            if (RENDER_MODES.hasOwnProperty(renderModeKey)) {
                const renderModeDesc = RENDER_MODES[renderModeKey];
                if (renderModeDesc.name === renderModeName) {
                    renderMode = renderModeDesc;
                    break;
                }
            }
        }
        /* eslint-enable no-restricted-syntax */

        return renderMode;
    }

    /**
     * @inheritdoc
     */
    destroy() {
        if (this.controls) {
            this.controls.controlsEl.removeEventListener('click', this.handleControlsClick);
        }
        this.removeListener(EVENT_CLOSE_RENDER_MODE_UI, this.handleCloseUi);
        super.destroy();
    }
}

export default Model3dControls;
