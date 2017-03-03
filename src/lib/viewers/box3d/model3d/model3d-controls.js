import autobind from 'autobind-decorator';
import Box3DControls from '../box3d-controls';
import Model3DAnimationClipsPullup from './model3d-animation-clips-pullup';
import Model3DSettingsPullup from './model3d-settings-pullup';

import {
    EVENT_ROTATE_ON_AXIS,
    EVENT_SELECT_ANIMATION_CLIP,
    EVENT_SET_CAMERA_PROJECTION,
    EVENT_SET_QUALITY_LEVEL,
    EVENT_SET_RENDER_MODE,
    EVENT_SET_SKELETONS_VISIBLE,
    EVENT_SET_WIREFRAMES_VISIBLE,
    EVENT_TOGGLE_ANIMATION,
    EVENT_TOGGLE_HELPERS,
    RENDER_MODE_LIT
} from './model3d-constants';

import { CSS_CLASS_HIDDEN } from '../box3d-constants';

import {
    ICON_3D_RESET,
    ICON_ANIMATION,
    ICON_GEAR,
    ICON_PAUSE,
    ICON_PLAY
} from '../../../icons/icons';

/**
 * Model3dControls
 * This class handles the UI for 3d preview controls. This includes Reset,
 * Render Mode selection, VR and fullscreen buttons.
 * @class
 */
@autobind
class Model3dControls extends Box3DControls {
    /**
     * Creates UI and handles events for 3D Model Preview
     * @constructor
     * @inheritdoc
     * @return {Model3dControls} Model3dControls instance
     */
    constructor(containerEl) {
        super(containerEl);
        this.animationClipsPullup = new Model3DAnimationClipsPullup(containerEl);
        this.settingsPullup = new Model3DSettingsPullup();
        this.isAnimationPlaying = false;
    }

    /** @inheritdoc */
    addUi() {
        // Reset button
        this.resetButtonEl = this.controls.add(__('box3d_reset'), this.handleReset, '', ICON_3D_RESET);

        // Animation controls
        this.animationClipsPullup.addListener(EVENT_SELECT_ANIMATION_CLIP, this.handleSelectAnimationClip);
        this.animationToggleEl = this.controls.add(__('box3d_toggle_animation'), this.handleToggleAnimation, '', ICON_PLAY);
        this.animationClipButtonEl = this.controls.add(__('box3d_animation_clips'), this.handleToggleAnimationClips, '', ICON_ANIMATION);
        this.animationClipButtonEl.parentNode.appendChild(this.animationClipsPullup.pullupEl);
        this.hideAnimationControls();

        // VR button
        this.addVrButton();
        this.hideVrButton();

        // Settings panel
        this.settingsPullup.addListener(EVENT_SET_RENDER_MODE, this.handleSetRenderMode);
        this.settingsPullup.addListener(EVENT_SET_SKELETONS_VISIBLE, this.handleSetSkeletonsVisible);
        this.settingsPullup.addListener(EVENT_SET_WIREFRAMES_VISIBLE, this.handleSetWireframesVisible);
        this.settingsPullup.addListener(EVENT_SET_CAMERA_PROJECTION, this.handleSetCameraProjection);
        this.settingsPullup.addListener(EVENT_SET_QUALITY_LEVEL, this.handleSetQualityLevel);
        this.settingsPullup.addListener(EVENT_ROTATE_ON_AXIS, this.handleAxisRotation);
        this.settingsButtonEl = this.controls.add(__('box3d_settings'), this.handleToggleSettings, '', ICON_GEAR);
        this.settingsButtonEl.parentNode.appendChild(this.settingsPullup.pullupEl);

        // Fullscreen button
        this.addFullscreenButton();

        this.handleSetRenderMode(RENDER_MODE_LIT);
    }

    /**
     * Hide any open pullups.
     * @method hidePullups
     * @public
     * @return {void}
     */
    hidePullups() {
        this.animationClipsPullup.hide();
        this.settingsPullup.hide();
        this.emit(EVENT_TOGGLE_HELPERS, false);
    }

    /**
     * Handle toggle Settings ui event
     * @return {void}
     */
    handleToggleSettings() {
        this.animationClipsPullup.hide();
        this.settingsPullup.toggle();
        this.emit(EVENT_TOGGLE_HELPERS);
    }

    /**
     * Handle a change of render mode, from the settings panel
     * @param {string} renderMode - The render mode name to notify listeners of
     * @return {void}
     */
    handleSetRenderMode(renderMode) {
        this.emit(EVENT_SET_RENDER_MODE, renderMode);
        this.settingsPullup.setCurrentRenderMode(renderMode);
    }

    /**
     * Handle a change in skeleton visibility
     * @param {boolean} visible - Indicates whether or not skeletons are visible
     * @return {void}
     */
    handleSetSkeletonsVisible(visible) {
        this.emit(EVENT_SET_SKELETONS_VISIBLE, visible);
    }

    /**
     * Handle a change in wireframe visibility
     * @param {boolean} visible - Indicates whether or not wireframes are visible
     * @return {void}
     */
    handleSetWireframesVisible(visible) {
        this.emit(EVENT_SET_WIREFRAMES_VISIBLE, visible);
    }

    /**
     * Handle change of camera projection
     * @param {string} mode - The projection mode to use
     * @return {void}
     */
    handleSetCameraProjection(mode) {
        this.emit(EVENT_SET_CAMERA_PROJECTION, mode);
    }

    /**
     * Handle change of render quality
     * @param {string} mode - The quality level to use
     * @return {void}
     */
    handleSetQualityLevel(level) {
        this.emit(EVENT_SET_QUALITY_LEVEL, level);
    }

    /**
     * Handle rotation on axis
     * @param {Object} rotation - Rotation axis description with axis and amount (in degrees)
     * @return {void}
     */
    handleAxisRotation(rotation) {
        this.emit(EVENT_ROTATE_ON_AXIS, rotation);
    }

    /**
     * Show the animation controls.
     * @method showAnimationControls
     * @public
     * @return {void}
     */
    showAnimationControls() {
        if (!this.animationToggleEl || !this.animationClipButtonEl) {
            return;
        }

        this.animationToggleEl.classList.remove(CSS_CLASS_HIDDEN);
        this.animationClipButtonEl.classList.remove(CSS_CLASS_HIDDEN);
    }

    /**
     * Hide the animation controls.
     * @method hideAnimationControls
     * @public
     * @return {void}
     */
    hideAnimationControls() {
        if (!this.animationToggleEl || !this.animationClipButtonEl) {
            return;
        }

        this.animationToggleEl.classList.add(CSS_CLASS_HIDDEN);
        this.animationClipButtonEl.classList.add(CSS_CLASS_HIDDEN);
    }

    /**
     * Handle animation clip selection.
     * @method handleSelectAnimationClip
     * @private
     * @param {string} clipId - The ID of the clip that was selected.
     * @return {void}
     */
    handleSelectAnimationClip(clipId) {
        this.setAnimationPlaying(false);
        this.emit(EVENT_SELECT_ANIMATION_CLIP, clipId);
    }

    /**
     * Handle clicks on the animation clip button.
     * @method handleToggleAnimationClips
     * @private
     * @return {void}
     */
    handleToggleAnimationClips() {
        this.settingsPullup.hide();
        this.animationClipsPullup.toggle();
    }

    /**
     * Handle clicks on the animation play / pause button.
     * @method handleToggleAnimation
     * @private
     * @return {void}
     */
    handleToggleAnimation() {
        this.hidePullups();
        this.setAnimationPlaying(!this.isAnimationPlaying);
    }

    /**
     * Set the animation playback state, firing event EVENT_TOGGLE_ANIMATION.
     * @method setAnimationPlaying
     * @private
     * @param {boolean} playing - Whether or not the animation is playing.
     * @return {void}
     */
    setAnimationPlaying(playing) {
        this.isAnimationPlaying = playing;
        this.animationToggleEl.innerHTML = this.isAnimationPlaying ? ICON_PAUSE : ICON_PLAY;
        this.emit(EVENT_TOGGLE_ANIMATION, this.isAnimationPlaying);
    }

    /**
     * Add an animation clip to the clip pullup.
     * @method addAnimationClip
     * @public
     * @param {string} id - The ID of the clip.
     * @param {string} name - The name of the clip.
     * @param {number} duration - The duration of the clip.
     * @return {void}
     */
    addAnimationClip(id, name, duration) {
        this.animationClipsPullup.addClip(id, name, duration);
    }

    /**
     * Select the animation clip with the specified ID.
     * @method selectAnimationClip
     * @public
     * @param {string} clipId - The ID of the clip to select.
     * @return {void}
     */
    selectAnimationClip(clipId) {
        this.animationClipsPullup.selectClip(clipId);
    }

    /**
     * @inheritdoc
     */
    handleToggleFullscreen() {
        super.handleToggleFullscreen();
        this.hidePullups();
    }

    /**
     * Set the current projection mode being used by the settings pullup
     * @param {string} mode - The projection mode to set on the pullup
     * @return {void}
     */
    setCurrentProjectionMode(mode) {
        this.settingsPullup.onProjectionSelected(mode);
        this.settingsPullup.setCurrentProjectionMode(mode);
    }

    /**
     * @inheritdoc
     */
    handleReset() {
        super.handleReset();
        this.hidePullups();
        this.settingsPullup.reset();
        this.setAnimationPlaying(false);
    }

    /**
     * @inheritdoc
     */
    destroy() {
        if (this.controls) {
            this.controls.controlsEl.removeEventListener('click', this.handleControlsClick);
        }

        this.animationClipsPullup.removeListener(EVENT_SELECT_ANIMATION_CLIP, this.handleSelectAnimationClip);
        this.animationClipsPullup.destroy();
        this.animationClipsPullup = null;

        this.settingsPullup.removeListener(EVENT_SET_RENDER_MODE, this.handleSetRenderMode);
        this.settingsPullup.removeListener(EVENT_SET_SKELETONS_VISIBLE, this.handleSetSkeletonsVisible);
        this.settingsPullup.removeListener(EVENT_SET_WIREFRAMES_VISIBLE, this.handleSetWireframesVisible);
        this.settingsPullup.removeListener(EVENT_SET_CAMERA_PROJECTION, this.handleSetCameraProjection);
        this.settingsPullup.removeListener(EVENT_SET_QUALITY_LEVEL, this.handleSetQualityLevel);
        this.settingsPullup.removeListener(EVENT_ROTATE_ON_AXIS, this.handleAxisRotation);
        this.settingsPullup.destroy();
        this.settingsPullup = null;

        super.destroy();
    }
}

export default Model3dControls;
