export class PriceRangeSlider {
    private containerRange: HTMLElement;
    private containerPrice: HTMLElement;
    private slider: HTMLElement;
    private minHandle: HTMLElement;
    private maxHandle: HTMLElement;
    private min: number;
    private max: number;
    private minValue: number | null = null;
    private maxValue: number | null = null;
    private minName: string;
    private maxName: string;
    private minPriceElement: HTMLElement;
    private maxPriceElement: HTMLElement;

    constructor(containerRange: HTMLElement, containerPrice: HTMLElement) {
        this.containerRange = containerRange;
        this.containerPrice = containerPrice;
        this.slider = containerRange.querySelector('.price-range-slider') as HTMLElement;
        this.minHandle = containerRange.querySelector('.range_min') as HTMLElement;
        this.maxHandle = containerRange.querySelector('.range_max') as HTMLElement;
        this.min = this.parsePrice(this.slider.dataset.min || '0');
        this.max = this.parsePrice(this.slider.dataset.max || '100');
        this.minName = this.slider.dataset.minName || '';
        this.maxName = this.slider.dataset.maxName || '';

        this.containerPrice = this.containerPrice.querySelector('.price-range-text') as HTMLElement;
        this.minPriceElement = containerPrice.querySelector('.price-range-text__min') as HTMLElement;
        this.maxPriceElement = containerPrice.querySelector('.price-range-text__max') as HTMLElement;

        this.initValues();
        this.init();
        this.updatePriceDisplay();
    }

    private initValues(): void {
        const urlParams = new URLSearchParams(window.location.search);
        const minParam = urlParams.get(this.minName);
        const maxParam = urlParams.get(this.maxName);

        this.minValue = minParam ? this.parsePrice(minParam) : this.min;
        this.maxValue = maxParam ? this.parsePrice(maxParam) : this.max;

        this.minValue = Math.max(this.min, Math.min(this.minValue, this.max));
        this.maxValue = Math.max(this.min, Math.min(this.maxValue, this.max));
    }

    private init(): void {
        if (this.minValue === null || this.maxValue === null) {
            throw new Error('Invalid values');
        }
        const minPosition = this.valueToPosition(this.minValue);
        const maxPosition = this.valueToPosition(this.maxValue);

        this.setHandlePosition(this.minHandle, minPosition);
        this.setHandlePosition(this.maxHandle, maxPosition);

        this.addEventListeners(this.minHandle);
        this.addEventListeners(this.maxHandle);
    }

    private addEventListeners(handle: HTMLElement): void {
        handle.addEventListener('mousedown', this.startDragging.bind(this, handle));
        handle.addEventListener('touchstart', this.startDragging.bind(this, handle));
    }

    private parsePrice(price: string): number {
        return parseFloat(price.replace(/[^\d,]/g, '').replace(',', '.'));
    }

    private startDragging(handle: HTMLElement, event: MouseEvent | TouchEvent): void {
        event.preventDefault();

        const move = (e: MouseEvent | TouchEvent) => {
            this.drag(handle, e);
        };

        const stop = () => {
            document.removeEventListener('mousemove', move);
            document.removeEventListener('touchmove', move);
            document.removeEventListener('mouseup', stop);
            document.removeEventListener('touchend', stop);
            this.onChangeComplete();
        };

        document.addEventListener('mousemove', move);
        document.addEventListener('touchmove', move);
        document.addEventListener('mouseup', stop);
        document.addEventListener('touchend', stop);
    }

    private drag(handle: HTMLElement, event: MouseEvent | TouchEvent): void {
        const rect = this.slider.getBoundingClientRect();
        let clientX: number;

        if (event instanceof MouseEvent) {
            clientX = event.clientX;
        } else {
            clientX = event.touches[0].clientX;
        }

        let position = (clientX - rect.left) / rect.width * 100;
        position = Math.max(0, Math.min(position, 100));

        if (handle === this.minHandle) {
            const maxPosition = this.getHandlePosition(this.maxHandle);
            if (position < maxPosition) {
                this.setHandlePosition(handle, position);
                this.minValue = this.positionToValue(position);
                this.updatePriceDisplay();
            }
        } else {
            const minPosition = this.getHandlePosition(this.minHandle);
            if (position > minPosition) {
                this.setHandlePosition(handle, Math.min(position, 100));
                this.maxValue = this.positionToValue(position);
                this.updatePriceDisplay();
            }
        }
    }

    private setHandlePosition(handle: HTMLElement, position: number): void {
        handle.style.left = `${position}%`;
    }

    private getHandlePosition(handle: HTMLElement): number {
        return parseFloat(handle.style.left);
    }

    private positionToValue(position: number): number {
        let value = Math.round(this.min + (this.max - this.min) * position / 100);
        return value;
    }

    private valueToPosition(value: number): number {
        return ((value - this.min) / (this.max - this.min)) * 100;
    }

    private onChangeComplete(): void {
        this.updateValues();
        this.updatePriceDisplay();
    }

    private updateValues(): void {
        const minPosition = this.getHandlePosition(this.minHandle);
        const maxPosition = this.getHandlePosition(this.maxHandle);
        this.minValue = this.positionToValue(minPosition);
        this.maxValue = this.positionToValue(maxPosition);
    }

    private updatePriceDisplay(): void {
        if (this.minValue !== null && this.maxValue !== null) {
            this.minPriceElement.textContent = this.formatPrice(this.minValue);
            this.maxPriceElement.textContent = this.formatPrice(this.maxValue);
        }
    }

    private formatPrice(price: number): string {
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    public getValues(): { [key: string]: number } {
        return {
            [this.minName]: this.minValue || this.min,
            [this.maxName]: this.maxValue || this.max
        };
    }

    public reset(): void {
        this.minValue = this.min;
        this.maxValue = this.max;
        this.setHandlePosition(this.minHandle, 0);
        this.setHandlePosition(this.maxHandle, 100);
        this.updatePriceDisplay();
    }

    public isChanged(): boolean {
        return this.minValue !== this.min || this.maxValue !== this.max;
    }
}