export default class AccountAccess extends HTMLElement {
    private passwordInput: HTMLInputElement | null;
    private passwordIcon: HTMLElement | null;
    private loginForm: HTMLElement | null;
    private resetForm: HTMLElement | null;
    private toggleLoginFormLink: HTMLElement | null;
    private toggleResetFormLink: HTMLElement | null;

    constructor() {
        super();
        this.passwordInput = this.querySelector('.input-password');
        this.passwordIcon = this.querySelector('.icon-password-reveal');
        this.loginForm = this.querySelector('#login-form');
        this.resetForm = this.querySelector('#reset-form');
        this.toggleLoginFormLink = this.querySelector('[data-toggle-login-form]');
        this.toggleResetFormLink = this.querySelector('[data-toggle-reset-form]');
        this.attachEventListeners();
        this.checkUrlHash();
    }

    private attachEventListeners(): void {
        if (this.passwordIcon) {
            this.passwordIcon.addEventListener('click', this.togglePassword.bind(this));
        }
        if (this.toggleLoginFormLink) {
            this.toggleLoginFormLink.addEventListener('click', this.showResetForm.bind(this));
        }
        if (this.toggleResetFormLink) {
            this.toggleResetFormLink.addEventListener('click', this.showLoginForm.bind(this));
        }
    }

    private togglePassword(): void {
        if (!this.passwordInput || !this.passwordIcon) return;

        if (this.passwordInput.type === 'password') {
            this.passwordInput.type = 'text';
            this.passwordIcon.classList.add('active');
        } else {
            this.passwordInput.type = 'password';
            this.passwordIcon.classList.remove('active');
        }
    }

    private showLoginForm(event?: Event): void {
        if (event) event.preventDefault();
        if (!this.loginForm || !this.resetForm) return;

        this.loginForm.style.display = 'block';
        this.resetForm.style.display = 'none';
        history.pushState(null, '', window.location.pathname);
    }

    private showResetForm(event?: Event): void {
        if (event) event.preventDefault();
        if (!this.loginForm || !this.resetForm) return;

        this.loginForm.style.display = 'none';
        this.resetForm.style.display = 'block';
        history.pushState(null, '', window.location.pathname + '#recover');
    }

    private checkUrlHash(): void {
        if (window.location.hash === '#recover') {
            this.showResetForm();
        } else {
            this.showLoginForm();
        }
    }
}
