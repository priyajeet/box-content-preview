/* eslint-disable no-unused-expressions */
import DocPointDialog from '../../doc/doc-point-dialog';
import * as annotatorUtil from '../../annotator-util';
import * as docAnnotatorUtil from '../../doc/doc-annotator-util';

let pointDialog;
const sandbox = sinon.sandbox.create();

describe('doc-point-dialog', () => {
    before(() => {
        fixture.setBase('src/lib');
    });

    beforeEach(() => {
        fixture.load('annotations/__tests__/doc/doc-point-dialog-test.html');

        pointDialog = new DocPointDialog({
            annotatedElement: document.querySelector('.annotated-element'),
            location: {},
            annotations: [],
            canAnnotate: true
        });
    });

    afterEach(() => {
        sandbox.verifyAndRestore();
    });

    describe('position()', () => {
        it('should position the dialog at the right place and show it', () => {
            sandbox.stub(docAnnotatorUtil, 'getBrowserCoordinatesFromLocation').returns([1, 2]);
            sandbox.stub(annotatorUtil, 'showElement');

            pointDialog.position();

            expect(docAnnotatorUtil.getBrowserCoordinatesFromLocation).to.have.been.called;
            expect(annotatorUtil.showElement).to.have.been.called;
        });
    });
});