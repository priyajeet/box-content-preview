import { getURL, getDownloadURL, isWatermarked, checkPermission, checkFeature } from '../file';
import Browser from '../browser';

describe('getURL()', () => {
    it('should return the correct api url', () => {
        assert.equal(getURL('id', 'api'), 'api/2.0/files/id?fields=permissions,parent,shared_link,sha1,file_version,name,size,extension,representations,watermark_info');
    });
});

describe('getDownloadURL()', () => {
    it('should return the correct api download url', () => {
        assert.equal(getDownloadURL('id', 'api'), 'api/2.0/files/id?fields=download_url');
    });
});

describe('isWatermarked()', () => {
    it('should return the correct values with null', () => {
        assert.notOk(isWatermarked());
    });
    it('should return the correct values with empty object', () => {
        assert.notOk(isWatermarked({}));
    });
    it('should return the correct values with no watermark info', () => {
        assert.notOk(isWatermarked({ watermark_info: {} }));
    });
    it('should return the correct values when not watermarked', () => {
        assert.notOk(isWatermarked({ watermark_info: { is_watermarked: false } }));
    });
    it('should return the correct values when watermarked', () => {
        assert.ok(isWatermarked({ watermark_info: { is_watermarked: true } }));
    });
});

describe('checkPermission()', () => {
    it('should return the correct values with nulls', () => {
        assert.notOk(checkPermission());
    });
    it('should return the correct values with empty objects', () => {
        assert.notOk(checkPermission({}, 'foo'));
    });
    it('should return the correct values with empty permissions', () => {
        assert.notOk(checkPermission({ permissions: {} }, 'foo'));
    });
    it('should return the correct values when not allowed', () => {
        assert.notOk(checkPermission({ permissions: { foo: false } }, 'foo'));
    });
    it('should return the correct values when allowed', () => {
        assert.ok(checkPermission({ permissions: { foo: true } }, 'foo'));
    });
});

describe('checkFeature()', () => {
    const sandbox = sinon.sandbox.create();

    beforeEach(() => {
        sandbox.stub(Browser, 'isMobile').returns(false);
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
    });

    it('should return the correct values with nulls', () => {
        assert.notOk(checkFeature());
    });
    it('should return the correct values with empty object', () => {
        assert.notOk(checkFeature({}, 'foo'));
    });
    it('should return the correct values when feature exists', () => {
        assert.ok(checkFeature({ foo: sandbox.stub() }, 'foo'));
    });
    it('should return the correct values when feature exists and sub feature doesnt', () => {
        assert.notOk(checkFeature({ foo: sandbox.stub().returns(false) }, 'foo', 'bar'));
    });
    it('should return the correct values when feature and sub feature exist', () => {
        assert.ok(checkFeature({ foo: sandbox.stub().returns(true) }, 'foo', 'bar'));
    });
});