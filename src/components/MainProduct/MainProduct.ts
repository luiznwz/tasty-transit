import BlazeSlider from 'blaze-slider';
import 'blaze-slider/dist/blaze.css';
import { calculateInstallments } from "@/services/product/InstallmentsCalculator";
import { toggleDropdown } from "@/services/Dropdown";
import FetchData from "@/services/FetchData";
import * as VariantSynchronizer from "@/services/VariantSynchronizer";
import { Cart } from '@/types/IFetchData.interface';
import CartDrawer from '../CartDrawer/CartDrawer';
import Alert from '../Alert/Alert';

export default class MainProduct extends HTMLElement {
    sliderElementMainProduct: BlazeSlider;
    installment: HTMLElement | null;
    detailHeadings: NodeListOf<HTMLElement>;
    private quantity: number = 1;
    priceProduct: HTMLElement | null;
    btnAddToCart: HTMLButtonElement | null;
    fetchData: FetchData;
    cartDrawer: CartDrawer | null;
    variantsOptions: NodeListOf<HTMLInputElement>;
    variantsHead: NodeListOf<HTMLInputElement>;

    wayToVariant: string[] = [];
    selectedVariant: string = '';

    constructor() {
        super();
        this.sliderElementMainProduct = this.setupSlider();
        this.installment = this.querySelector('.info_installment');
        this.detailHeadings = this.querySelectorAll('.detail-headings');

        this.variantsHead = this.querySelectorAll('[data-variant-head]') as NodeListOf<HTMLInputElement>;
        this.variantsOptions = this.querySelectorAll('[data-variant-option]');
        this.priceProduct = this.querySelector('.price-product');
        this.btnAddToCart = this.querySelector('.main-product-form-add-to-cart');
        this.fetchData = new FetchData();

        this.cartDrawer = document.querySelector('cart-drawer');

        const variantSelected = this.querySelector('[data-variant-option]:checked') as HTMLInputElement;
        if (variantSelected) {
            this.selectedVariant = variantSelected.value;
        }

        this.variantsOptions.forEach((element: HTMLInputElement) => {
            element.addEventListener('input', () => {
                this.selectedVariant = element.value;
                VariantSynchronizer.notifyVariantChange(this.selectedVariant, 'mainProduct');
                this.changePriceVariantSelected();
            });
        });

        VariantSynchronizer.addListener(this.handleVariantChange.bind(this));

        this.variantsHead.forEach((element: HTMLInputElement) => {
            element.addEventListener('input', () => {
                this.selectHeadings(element);
                this.changePriceVariantSelected();
            });

            if (element.checked) this.selectHeadings(element as HTMLInputElement);
        });

        this.variantsOptions.forEach(option => this.selectWay(option));

        this.detailHeadings.forEach(detailHeading => {
            detailHeading.addEventListener('click', () => {
                const dropdown = detailHeading.nextElementSibling as HTMLElement;
                toggleDropdown(dropdown);
            });
        });

        this.quantity = 1;

        this.setup();

        calculateInstallments(this.installment as HTMLElement);
        this.changePriceVariantSelected();
        this.handleAddToCart();
    }

    private handleVariantChange(variantId: string, source: string) {
        if (source !== 'mainProduct') {
            const variantInput = this.querySelector(`input[value="${variantId}"]`) as HTMLInputElement;
            variantInput.checked = true;
            this.selectedVariant = variantId;
            this.selectWay(variantInput);
        }
    }

    setupVariantOptions() {
        this.variantsOptions.forEach((option: HTMLInputElement) => {
            const optionWay = option.dataset.variantOption as string;
            const optionWayArray = optionWay.split(',');

            const optionParent = option.parentElement as HTMLElement;

            if (optionWayArray[0] === this.wayToVariant[0] && optionWayArray[1] === this.wayToVariant[1]) {
                optionParent.classList.remove('hidden');
            } else {
                optionParent.classList.add('hidden');
            }
        });

        const options = this.querySelectorAll('[data-variant-option]') as NodeListOf<HTMLInputElement>;
        const optionsVisible = Array.from(options).filter(option => !option.parentElement?.classList.contains('hidden'));

        if (optionsVisible.every(option => option.disabled)) {
            this.updateButtonToOutOfStock(true);
        } else {
            this.updateButtonToOutOfStock(false);
        }
    }

    selectHeadings(element: HTMLInputElement) {
        const nameHead = element.dataset.variantHead as string;
        const position = Number(element.dataset.headPosition as string);

        this.wayToVariant[position] = nameHead;

        this.setupVariantOptions();

        const availableOptions = Array.from(this.variantsOptions)
            .filter(option => !option.disabled && !option.parentElement?.classList.contains('hidden'));

        if (availableOptions.length > 0 && !availableOptions.some(option => option.checked)) {
            availableOptions[0].checked = true;
            this.selectedVariant = availableOptions[0].value;
            VariantSynchronizer.notifyVariantChange(this.selectedVariant, 'mainProduct');
        } else {
            const optionSelected = this.querySelector('[data-variant-option]:checked') as HTMLInputElement;
            this.selectedVariant = optionSelected.value;
        }
    }

    selectWay(option: HTMLInputElement) {
        if (option.checked) {
            const optionWay = option.dataset.variantOption as string;
            const optionWayArray = optionWay.split(',');

            const firstHead = this.querySelector(`[data-variant-head="${optionWayArray[0]}"]`) as HTMLInputElement | null;
            const secondHead = this.querySelector(`[data-variant-head="${optionWayArray[1]}"]`) as HTMLInputElement | null;

            if (firstHead) firstHead.checked = true;
            if (secondHead) secondHead.checked = true;

            this.variantsHead.forEach((element: HTMLInputElement) => {
                if (element.checked) {
                    this.selectHeadings(element);
                }
            });
        }
    }

    changePriceVariantSelected() {
        const variantSelected = this.querySelector('[data-variant-option]:checked') as HTMLInputElement;
        const price = variantSelected.dataset.price as string;
        this.priceProduct!.innerText = price;

        if (!this.installment) return;
        this.installment.dataset.price = price;
        calculateInstallments(this.installment);
    }

    setupSlider() {
        const sliderElementMainProduct = this.querySelector('.main-product-slider-images') as HTMLElement;
        const slider = new BlazeSlider(sliderElementMainProduct, {
            all: {
                transitionDuration: 300,
                transitionTimingFunction: 'cubic-bezier(0.45, 0.1, 0.45, 0.5)',
                draggable: true,
                slidesToShow: 2.2,
                slideGap: '20px',
                loop: false,
            },
            '(max-width: 768px)': {
                slidesToShow: 2.2,
                slideGap: '20px',
            },
            '(max-width: 500px)': {
                slidesToShow: 1.2,
                slideGap: '20px',
            },
        });

        return slider;
    }

    setup() {
        this.setupQuantity();
    }

    setupQuantity() {
        const quantityInput = this.querySelector('[data-main-product-quantity]') as HTMLInputElement;
        const decreaseButton = this.querySelector('[data-main-product-quantity-decrease]') as HTMLButtonElement;
        const increaseButton = this.querySelector('[data-main-product-quantity-increase]') as HTMLButtonElement;

        decreaseButton.addEventListener('click', () => {
            if (Number(quantityInput.value) > 1) {
                this.quantity -= 1;
                quantityInput.value = `${this.quantity}`;
                if (this.quantity === 1) {
                    decreaseButton.disabled = true;
                }
            }
        });

        increaseButton.addEventListener('click', () => {
            this.quantity += 1;
            quantityInput.value = `${this.quantity}`;
            decreaseButton.disabled = false;
        });

        quantityInput.addEventListener('change', (e) => {
            if (Number(quantityInput.value) < 1 || isNaN(Number(quantityInput.value))) {
                quantityInput.value = this.quantity.toString();
            } else {
                this.quantity = Number(quantityInput.value);
            }
            if (Number(quantityInput.value) === 1) {
                decreaseButton.disabled = true;
            } else {
                decreaseButton.disabled = false;
            }
        });
    }

    setQuantityInputEvents() {
        const quantityInput = this.querySelector('[data-main-product-quantity]') as HTMLInputElement;

        quantityInput.addEventListener('change', this.handleQuantityInputChange.bind(this));
    }

    handleQuantityInputChange(e: Event) {
        const target = e.target as HTMLInputElement;
        if (isNaN(Number(target.value)) || Number(target.value) < 1) {
            target.value = this.quantity.toString();
        } else {
            this.quantity = Number(target.value);
        }
    }

    handleAddToCart() {
        this.btnAddToCart?.addEventListener('click', async () => {
            try {
                this.btnAddToCart?.setAttribute('loading', '');
                await this.fetchData.addToCart('', this.selectedVariant, this.quantity);
                this.cartDrawer?.fetchNewCart();
                this.btnAddToCart?.removeAttribute('loading');
            } catch (error) {
                Alert.loadMessage(`${error}`, 3000);
                this.btnAddToCart?.removeAttribute('loading');
            }
        });
    }

    updateButtonToOutOfStock(soldout: boolean = false) {
        if (!this.btnAddToCart) return;

        if (soldout === true) {
            this.btnAddToCart.disabled = true;
            const btnText = this.btnAddToCart?.dataset.outOfStock;
            const spanText = this.btnAddToCart.querySelector('.btn_text') as HTMLElement;

            if (btnText) spanText.innerHTML = btnText;
        } else {
            this.btnAddToCart.disabled = false;
            const btnText = this.btnAddToCart?.dataset.default;
            const spanText = this.btnAddToCart.querySelector('.btn_text') as HTMLElement;

            if (btnText) spanText.innerHTML = btnText;
        }
    }
}