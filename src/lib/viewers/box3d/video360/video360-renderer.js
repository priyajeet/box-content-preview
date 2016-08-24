/* global Box3D, Box3DResourceLoader */
import Box3DRenderer from '../box3d-renderer';

class Video360Renderer extends Box3DRenderer {

    /**
     * @inheritdoc
     */
    constructor(containerEl, boxSdk) {
        super(containerEl, boxSdk);

        this.inputController = null;
    }

    /**
     * @inheritdoc
     */
    enableCameraControls() {
        super.enableCameraControls('orbit_camera_controller');
    }

    /**
     * @inheritdoc
     */
    disableCameraControls() {
        super.disableCameraControls('orbit_camera_controller');
    }

    /**
     * Get the input controller attached to the runtime
     * @returns {Object} The input controller, if any
     */
    getInputController() {
        if (!this.inputController) {
            const app = this.box3d.getApplication();

            if (!app) {
                return null;
            }

            this.inputController = app.componentRegistry.getFirstByScriptName('Input Controller');
        }

        return this.inputController;
    }
}

export default Video360Renderer;