import AssetLoader from '../asset-loader';
import IFrame from './iframe';
import { ORIGINAL_REP_NAME } from '../../constants';

// Order of the viewers matters. Prefer original before others. Go from specific to general.
const VIEWERS = [
    {
        NAME: 'IFrame',
        CONSTRUCTOR: IFrame,
        REP: ORIGINAL_REP_NAME,
        EXT: ['boxnote', 'boxdicom']
    }
];

class IFrameLoader extends AssetLoader {

    /**
     * [constructor]
     *
     * @return {IFrameLoader} IFrameLoader instance
     */
    constructor() {
        super();
        this.viewers = VIEWERS;
    }

    /**
     * Override default prefetch functionality with no-op.
     *
     * @override
     * @return {void}
     */
    prefetch() {}
}

export default new IFrameLoader();
