import { CLASS_IS_VISIBLE } from './constants';

const CLASS_PROGRESS_BAR_CONTAINER = 'bp-progress-bar-container';
const CLASS_PROGRESS_BAR = 'bp-progress-bar';

const PROGRESS_INTERVAL_MS = 100;
const RESET_PROGRESS_DELAY_MS = 500;

class ProgressBar {

    /**
     * [constructor]
     *
     * @param {HTMLElement} mountEl - Element to mount progress bar to
     * @return {ProgressBar} Instance of ProgressBar
     */
    constructor(mountEl) {
        this.mountEl = mountEl;
        this.containerEl = document.createElement('div');
        this.containerEl.classList.add(CLASS_PROGRESS_BAR_CONTAINER);

        this.progressBarEl = document.createElement('div');
        this.progressBarEl.classList.add(CLASS_PROGRESS_BAR);

        this.containerEl.appendChild(this.progressBarEl);
        this.mountEl.appendChild(this.containerEl);

        this.updateProgress(0);
    }

    /**
     * [destructor]
     *
     * @return {void}
     */
    destroy() {
        if (!this.progressBarEl) {
            return;
        }

        clearInterval(this.progressInterval);
        this.mountEl.removeChild(this.containerEl);
        this.containerEl = null;
        this.progressBarEl = null;
    }

    /**
     * Start progress bar loading.
     *
     * @return {void}
     */
    start() {
        this.showProgress();

        // Start at random percentage between 10 and 30
        this.progress = (Math.random() * 20) + 10;
        this.updateProgress(this.progress);

        this.progressInterval = setInterval(() => {
            if (this.progress >= 90) {
                clearInterval(this.progressInterval);
                return;
            }

            this.progress += Math.random() * 5;
            this.updateProgress(this.progress);
        }, PROGRESS_INTERVAL_MS);
    }

    /**
     * Finish progress bar loading and reset.
     *
     * @return {void}
     */
    finish() {
        // Hide progress bar, this takes .3s
        this.hideProgress();

        // Stop updating progress bar and force to 100%, this takes .2s
        clearInterval(this.progressInterval);
        this.updateProgress(100);

        // Reset progress after delay - this happens after opacity goes to 0
        setTimeout(() => {
            this.updateProgress(0);
        }, RESET_PROGRESS_DELAY_MS);
    }

    /**
     * Update progress.
     *
     * @private
     * @param {number} progress - Progress percentage
     * @return {void}
     */
    updateProgress(progress) {
        if (this.progressBarEl) {
            this.progressBarEl.style.width = `${progress}%`;
        }
    }

    /**
     * Show progress bar.
     *
     * @private
     * @return {void}
     */
    showProgress() {
        if (this.progressBarEl) {
            this.progressBarEl.classList.add(CLASS_IS_VISIBLE);
        }
    }

    /**
     * Hide progress bar.
     *
     * @private
     * @return {void}
     */
    hideProgress() {
        if (this.progressBarEl) {
            this.progressBarEl.classList.remove(CLASS_IS_VISIBLE);
        }
    }
}

export default ProgressBar;