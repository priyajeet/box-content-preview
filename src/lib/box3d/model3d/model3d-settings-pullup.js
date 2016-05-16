import EventEmitter from 'events';
import {
    UIRegistry,
    createButton,
    createDropdown,
    createPullup,
    createRow
} from '../box3d-ui-utils';
import {
    AXIS_X,
    AXIS_Y,
    AXIS_Z,
    CAMERA_PROJECTION_PERSPECTIVE,
    CAMERA_PROJECTION_ORTHOGRAPHIC,
    CSS_CLASS_SETTINGS_PANEL_SELECTOR_LABEL,
    CSS_CLASS_HIDDEN,
    EVENT_ROTATE_ON_AXIS,
    EVENT_SAVE_SCENE_DEFAULTS,
    EVENT_SET_CAMERA_PROJECTION,
    EVENT_SET_RENDER_MODE,
    RENDER_MODE_LIT,
    RENDER_MODE_UNLIT,
    RENDER_MODE_NORMALS,
    RENDER_MODE_SHAPE,
    RENDER_MODE_WIRE,
    RENDER_MODE_UNTEXTURED_WIRE,
    RENDER_MODE_UV,
    ROTATION_STEP
} from './model3d-constants';

// For registering events on elements
const RENDER_MODES = [
    {
        text: RENDER_MODE_LIT,
        callback: 'onRenderModeSelected',
        args: [RENDER_MODE_LIT]
    }, {
        text: RENDER_MODE_UNLIT,
        callback: 'onRenderModeSelected',
        args: [RENDER_MODE_UNLIT]
    }, {
        text: RENDER_MODE_NORMALS,
        callback: 'onRenderModeSelected',
        args: [RENDER_MODE_NORMALS]
    }, {
        text: RENDER_MODE_SHAPE,
        callback: 'onRenderModeSelected',
        args: [RENDER_MODE_SHAPE]
    }, {
        text: RENDER_MODE_WIRE,
        callback: 'onRenderModeSelected',
        args: [RENDER_MODE_WIRE]
    }, {
        text: RENDER_MODE_UNTEXTURED_WIRE,
        callback: 'onRenderModeSelected',
        args: [RENDER_MODE_UNTEXTURED_WIRE]
    }, {
        text: RENDER_MODE_UV,
        callback: 'onRenderModeSelected',
        args: [RENDER_MODE_UV]
    }
];

const PROJECTION_MODES = [
    {
        text: 'Perspective',
        callback: 'onProjectionSelected',
        args: [CAMERA_PROJECTION_PERSPECTIVE]
    }, {
        text: 'Orthographic',
        callback: 'onProjectionSelected',
        args: [CAMERA_PROJECTION_ORTHOGRAPHIC]
    }
];

/**
 * The UI and events system necessary to run the Settings Panel
 */
class Model3DSettingsPullup extends EventEmitter {

    /**
     * @constructor
     */
    constructor() {
        super();
        this.projectionModeEl = null;
        this.renderModeEl = null;
        this.saveRowEl = null;

        this.uiRegistry = new UIRegistry();
        this.pullupEl = this.createUi();
    }

    /**
     * Convert the callback property of a config callback to a valid callback function
     * @param {Object} configEntry A descriptor for the callback.
     * @param {Function} configEntry.callback The callback function to search for and assign back to the entry
     * @param {Array} configEntry.args Arguments to be bound to the function callback
     * @returns {void}
     */
    convertToValidCallback(configEntry) {
        const entry = configEntry;
        const callback = entry.callback;
        if (typeof callback === 'string' && this[callback]) {
            entry.callback = this[callback].bind(this, ...entry.args);
        }
    }

    /**
     * Create the ui necessary to run the Settings panel pullup
     * @returns {HtmlElement} The pullup element for the settings panel
     */
    createUi() {
        // The containing pullup element
        const pullupEl = createPullup();
        this.pullupEl = pullupEl;
        pullupEl.setAttribute('TEST_ID', Math.random());
        this.uiRegistry.registerUiItem('settings-pullup-el', pullupEl);

        // Default Render Mode Dropdown
        const renderPanelData = [];
        RENDER_MODES.forEach((entry) => {
            const entryCopy = Object.assign({}, entry);
            this.convertToValidCallback(entryCopy);
            renderPanelData.push(entryCopy);
        });
        const renderModeDropdownEl = createDropdown('Render Mode', 'Lit', renderPanelData);
        this.renderModeEl = renderModeDropdownEl.querySelector(`span.${CSS_CLASS_SETTINGS_PANEL_SELECTOR_LABEL}`);
        pullupEl.appendChild(renderModeDropdownEl);

        // Default Camera Projection Dropdown
        const projectionPanelData = [];
        PROJECTION_MODES.forEach((entry) => {
            const entryCopy = Object.assign({}, entry);
            this.convertToValidCallback(entryCopy);
            projectionPanelData.push(entryCopy);
        });
        const projectionPanelRowEl = createDropdown('Camera Projection',
            'Perspective', projectionPanelData);
        this.projectionModeEl = projectionPanelRowEl.querySelector(`span.${CSS_CLASS_SETTINGS_PANEL_SELECTOR_LABEL}`);
        pullupEl.appendChild(projectionPanelRowEl);

        const renderModeListEl = renderModeDropdownEl.querySelector('ul');
        const projectionListEl = projectionPanelRowEl.querySelector('ul');

        this.uiRegistry.registerUiItem('settings-render-mode-selector-label', this.renderModeEl, 'click', () => {
            projectionListEl.classList.add(CSS_CLASS_HIDDEN);
        });

        this.uiRegistry.registerUiItem('settings-projection-mode-selector-label', this.projectionModeEl, 'click', () => {
            renderModeListEl.classList.add(CSS_CLASS_HIDDEN);
        });

        // Axis Rotation Icons
        const axisRowEl = this.createAxisWidget();
        pullupEl.appendChild(axisRowEl);

        // Save button
        const saveRowEl = createRow();
        pullupEl.appendChild(saveRowEl);
        const saveButtonEl = createButton('Save Settings');
        this.uiRegistry.registerUiItem('settings-save-button', saveButtonEl, 'click', this.onSaveSelected);
        saveButtonEl.classList.add('box-preview-settings-save-btn');
        saveRowEl.appendChild(saveButtonEl);

        this.saveRowEl = saveRowEl;

        return this.pullupEl;
    }

    /**
     * Create the axis rotation widget
     * @returns {HtmlElement} The newly created rotation axis widget element
     */
    createAxisWidget() {
        const rowEl = createRow('Rotate Model');

        rowEl.appendChild(this.createRotationAxis(AXIS_X,
            this.onAxisRotationSelected.bind(this, AXIS_X, -1),
            this.onAxisRotationSelected.bind(this, AXIS_X, 1)));
        rowEl.appendChild(this.createRotationAxis(AXIS_Y,
            this.onAxisRotationSelected.bind(this, AXIS_Y, -1),
            this.onAxisRotationSelected.bind(this, AXIS_Y, 1)));
        rowEl.appendChild(this.createRotationAxis(AXIS_Z,
            this.onAxisRotationSelected.bind(this, AXIS_Z, 1),
            this.onAxisRotationSelected.bind(this, AXIS_Z, -1)));

        return rowEl;
    }

    /**
     * Create a single axis rotation widget
     * @param {string}  axisLabel The label for the axis
     * @returns {HtmlElement}  The axis widget for the supplied axis
     */
    createRotationAxis(axisLabel, minusIconCallback, plusIconCallback) {
        const axisEl = document.createElement('div');
        axisEl.classList.add('box3d-settings-axis-widget');

        // - icon, on the left
        const minusIconEl = document.createElement('span');
        minusIconEl.textContent = '-';
        minusIconEl.classList.add('box3d-setting-axis-rotate');
        this.uiRegistry.registerUiItem(`minus-${axisLabel}-axis-icon`, minusIconEl, 'click', minusIconCallback);
        axisEl.appendChild(minusIconEl);

        // axis label
        const axisLabelEl = document.createElement('span');
        axisLabelEl.textContent = axisLabel.toUpperCase();
        axisLabelEl.classList.add('box3d-settings-axis-label');
        axisEl.appendChild(axisLabelEl);

        // + icon, on the right
        const plusIconEl = document.createElement('span');
        plusIconEl.textContent = '+';
        plusIconEl.classList.add('box3d-setting-axis-rotate');
        this.uiRegistry.registerUiItem(`plus-${axisLabel}-axis-icon`, plusIconEl, 'click', plusIconCallback);
        axisEl.appendChild(plusIconEl);

        return axisEl;
    }

    /**
     * Emit a message with the render mode that has been selected
     * @param {string} mode The render mode to emit a message about
     * @returns {void}
     */
    onRenderModeSelected(mode) {
        this.emit(EVENT_SET_RENDER_MODE, mode);
    }

    /**
     * Emit an axis rotation event with the axis of rotation and direction to rotate
     * @param {string} rotationAxis The axis to rotate on
     * @param {Int} direction The direction to rotate. IE) 1 is positive rotation while -1 is negative rotation
     * @returns {void}
     */
    onAxisRotationSelected(rotationAxis, direction) {
        const axis = {};
        axis[rotationAxis] = direction * ROTATION_STEP;

        this.emit(EVENT_ROTATE_ON_AXIS, axis);
    }

    /**
     * Set the current projection mode being used
     * @param {string} mode The projection mode to use
     * @returns {void}
     */
    onProjectionSelected(mode) {
        this.emit(EVENT_SET_CAMERA_PROJECTION, mode);
    }

    /**
     * Notify listeners of save event
     * @returns {void}
     */
    onSaveSelected() {
        // We can cheat because the strings in the label match the metadata values
        this.emit(EVENT_SAVE_SCENE_DEFAULTS, this.renderModeEl.textContent, this.projectionModeEl.textContent);
    }

    /**
     * Set the current render mode being shown, in the dropdown label
     * @param {string} mode The render mode name to display
     * @returns {void}
     */
    setCurrentRenderMode(mode) {
        this.renderModeEl.textContent = mode;
    }

    /**
     * Set the current projection mode being used, in the dropdown label
     * @param {string} mode The projection mode name to display
     * @returns {void}
     */
    setCurrentProjectionMode(mode) {
        this.projectionModeEl.textContent = mode;
    }

    /**
     * Hide the save button
     * @returns {void}
     */
    hideSaveButton() {
        this.saveRowEl.classList.add(CSS_CLASS_HIDDEN);
    }

    /**
     * Destroy everything
     * @returns {void}
     */
    destroy() {
        this.uiRegistry.unregisterUiItems();
        this.uiRegistry = null;
        this.projectionModeEl = null;
        this.renderModeEl = null;
        this.pullupEl = null;
        this.saveRowEl = null;
    }

}

export default Model3DSettingsPullup;
