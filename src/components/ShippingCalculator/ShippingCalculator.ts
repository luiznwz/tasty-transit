interface ZipInfo {
    cep: string;
    uf: string;
    [key: string]: string;
}

interface ShippingRate {
    name: string;
    price: number;
    delivery_days: number;
    [key: string]: any;
}

export default class ShippingCalculator extends HTMLElement {
    private form: HTMLFormElement | null;
    private cepInput: HTMLInputElement | null;
    private submitButton: HTMLButtonElement | null;
    private responseContainer: HTMLElement | null;

    constructor() {
        super();
        this.form = this.querySelector('form');
        this.cepInput = this.querySelector('#cep');
        this.submitButton = this.querySelector('.shipping_submit');
        this.responseContainer = this.querySelector('.shipping__response');

        this.bindEvents();
    }

    private bindEvents(): void {
        this.form?.addEventListener('submit', this.handleSubmit.bind(this));
        this.cepInput?.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    private handleSubmit(event: Event): void {
        event.preventDefault();
        this.calculateShipping();
    }

    private handleKeyUp(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.calculateShipping();
        }
    }

    private async calculateShipping(): Promise<void> {
        const cep = this.cepInput?.value.replace(/\D/g, '');
        if (!cep || cep.length !== 8) {
            this.showError('CEP inválido');
            return;
        }

        this.showLoading(true);
        try {
            const zipInfo = await this.getZipInfo(cep);
            const shippingRates = await this.getShippingRates(zipInfo);
            this.renderShippingRates(shippingRates);
        } catch (error) {
            this.showError('Erro ao calcular o frete');
        } finally {
            this.showLoading(false);
        }
    }

    private async getZipInfo(cep: string): Promise<ZipInfo> {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        if (!response.ok) throw new Error('Erro ao buscar informações do CEP');
        return await response.json();
    }

    private async getShippingRates(zipInfo: ZipInfo): Promise<ShippingRate[]> {
        const response = await fetch(`/cart/shipping_rates.json?shipping_address[zip]=${zipInfo.cep}&shipping_address[country]=Brazil&shipping_address[province]=${zipInfo.uf}`);
        if (!response.ok) throw new Error('Erro ao buscar taxas de envio');
        const data = await response.json();
        return data.shipping_rates;
    }

    private renderShippingRates(rates: ShippingRate[]): void {
        if (!rates || rates.length === 0) {
            this.showError('Não há opções de envio disponíveis para este CEP');
            return;
        }

        const ratesList = rates.map(rate => `
            <li>
                <span>${rate.name} - ${this.formatPrice(rate.price)}</span>
                <span>Entrega em ${rate.delivery_days} dia(s) útil(eis)</span>
            </li>
        `).join('');

        if (this.responseContainer) {
            this.responseContainer.innerHTML = `
                <ul class="shipping__rates">
                    ${ratesList}
                </ul>
            `;
        }
    }

    private showError(message: string): void {
        if (this.responseContainer) {
            this.responseContainer.innerHTML = `<p class="shipping__error">${message}</p>`;
        }
    }

    private showLoading(isLoading: boolean): void {
        if (this.submitButton) {
            this.submitButton.classList.toggle('loading', isLoading);
            this.submitButton.disabled = isLoading;
        }
    }

    private formatPrice(price: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    }

    connectedCallback() {
        this.bindEvents();
    }

    disconnectedCallback() {
        this.form?.removeEventListener('submit', this.handleSubmit.bind(this));
        this.cepInput?.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }
}