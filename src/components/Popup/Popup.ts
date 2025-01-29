export default class Popup extends HTMLElement {
    private closeButton: HTMLElement;
    private overlay: HTMLElement;
    private static readonly POPUP_INTERVAL = 15 * 24 * 60 * 60 * 1000;
    private static readonly POPUP_LAST_SHOWN_KEY = 'popupLastShown';

    constructor() {
        super();
        this.closeButton = this.querySelector('.popup_close') as HTMLElement;
        this.overlay = this.querySelector('.popup__overlay') as HTMLElement;

        this.initializePopUp();

        this.closeButton.addEventListener('click', () => this.closePopUp());
        this.overlay.addEventListener('click', () => this.closePopUp());

        this.querySelector('.main-popup')?.addEventListener('click', (e) => e.stopPropagation());
    }

    private initializePopUp(): void {
        const lastShown = localStorage.getItem(Popup.POPUP_LAST_SHOWN_KEY);
        const currentTime = new Date().getTime();

        if (!lastShown || currentTime - parseInt(lastShown) > Popup.POPUP_INTERVAL) {
            setTimeout(() => this.openPopUp(), 3000);
        }
    }

    private openPopUp(): void {
        this.classList.add('active');
        document.body.style.overflow = 'hidden';
        localStorage.setItem(Popup.POPUP_LAST_SHOWN_KEY, new Date().getTime().toString());
    }

    private closePopUp(): void {
        this.classList.remove('active');

        setTimeout(() => {
            document.body.style.overflow = '';
        }, 500);
    }
}