import './Image360.scss';
import Box3D from '../Box3d';
import Box3DControls from '../Box3dControls';
import Image360Renderer from './Image360Renderer';

const CSS_CLASS_IMAGE_360 = 'bp-image-360';
const LOAD_TIMEOUT = 120000;

class Image360 extends Box3D {
    /**
     * @inheritdoc
     */
    setup() {
        // Call super() first to set up common layout
        super.setup();

        this.wrapperEl.classList.add(CSS_CLASS_IMAGE_360);

        // Override timeout as we're often downloading the original representation
        // to ensure that we get the maximum resolution image. On a 3G connection,
        // the default 15 seconds is often not enough.
        this.loadTimeout = LOAD_TIMEOUT;
    }

    /**
     * @inheritdoc
     */
    createSubModules() {
        this.controls = new Box3DControls(this.wrapperEl);
        this.renderer = new Image360Renderer(this.wrapperEl, this.boxSdk);
    }
}

export default Image360;