import FetchData from "@/services/FetchData";
import { toggleDropdown } from "@/services/Dropdown";
import { calculateInstallments } from "@/services/product/InstallmentsCalculator";
import * as VariantSynchronizer from "@/services/VariantSynchronizer";
import CartDrawer from '../CartDrawer/CartDrawer';
import Alert from '../Alert/Alert';

export default class Shopbar extends HTMLElement {
    installmentContent: HTMLElement | null;
    variantOptionsMobile: NodeListOf<HTMLInputElement> | null;
    selectOptionDesktop: HTMLSelectElement | null;
    // variantId: string | null = null;
    private quantity: number = 1;
    btnAddToCard: HTMLButtonElement | null;
    fetchData: FetchData;
    btnAddToCardMainProduct: HTMLButtonElement | null;
    footerComponent: HTMLElement | null;
    priceElement: HTMLElement | null;
    btnOpenModal: HTMLElement | null;
    shopbarSelectVariant: HTMLElement | null;
    shopbarHeading: HTMLElement | null;
    shopbarContent: HTMLElement | null;
    cartDrawer: CartDrawer | null;
    variantsOptions: NodeListOf<HTMLInputElement>;
    variantsHead: NodeListOf<HTMLInputElement>;

    wayToVariant: string[] = [];
    selectedVariant: string = '';

    constructor() {
        super();

        this.installmentContent = this.querySelector('.shopbar_installment');
        this.variantOptionsMobile = this.querySelectorAll('.variant_option');
        this.selectOptionDesktop = this.querySelector('.shopbar_select_desktop');
        this.btnAddToCard = this.querySelector('.info_add_to_cart');
        this.btnAddToCardMainProduct = document.querySelector('main-product .main-product-form-add-to-cart');
        this.footerComponent = document.querySelector('footer-component');
        this.priceElement = this.querySelector('.shopbar_price');

        this.cartDrawer = document.querySelector('cart-drawer');

        this.shopbarContent = this.querySelector('.shopbar__content');
        this.shopbarHeading = this.querySelector('.shopbar_heading');
        this.shopbarSelectVariant = this.querySelector('.shopbar_select_variant-group'); 
        this.btnOpenModal = this.querySelector('.buton_open_modal');

        this.variantsHead = this.querySelectorAll('[data-variant-head]') as NodeListOf<HTMLInputElement>;
        this.variantsOptions = this.querySelectorAll('[data-variant-option]');


        this.fetchData = new FetchData();

        calculateInstallments(this.installmentContent);

        this.btnOpenModal?.addEventListener('click', () => {
            this.shopbarContent?.toggleAttribute('open');
            this.shopbarHeading?.toggleAttribute('open');
            this.shopbarSelectVariant?.toggleAttribute('open');
        });

        this.initVariantsMobile();
        this.initVariantsDesktop();

        this.btnAddToCard?.addEventListener('click', (e) => this.handleAddToCard());

        VariantSynchronizer.addListener(this.handleVariantChange.bind(this));
        window.addEventListener('scroll', this.checkShopbarVisibility.bind(this));
        window.addEventListener('resize', this.checkShopbarVisibility.bind(this));

        this.changePriceVariantSelected();
        this.checkShopbarVisibility();
    }

    private updateSelectedOption(variantId: string | null) {
        if (this.variantOptionsMobile) {
            this.variantOptionsMobile.forEach(option => {
                option.checked = option.value === variantId;
            });
        }
        if (this.selectOptionDesktop && variantId) {
            this.selectOptionDesktop.value = variantId;
        }
    }

    private handleVariantChange(variantId: string, source: string) {
        if (source !== 'shopbar') {
            const variantInput = this.querySelector(`input[value="${variantId}"]`) as HTMLInputElement;
            const variantOption = this.querySelector(`option[value="${variantId}"]`) as HTMLOptionElement;

            variantInput.checked = true;
            variantOption.selected = true;

            this.selectedVariant = variantId;

            this.selectWay(variantInput);
        }
    }


    initVariantsDesktop() {
        const variantsSelect = this.querySelectorAll('.variant-select');          
        variantsSelect.forEach((element) => {
            element.addEventListener('change', () => {
                const selectedVariant = element.querySelector('option:checked') as HTMLOptionElement;
                const selectedVariantId = selectedVariant.value;

                this.selectedVariant = selectedVariantId;
                this.changePriceVariantDesktop(selectedVariant);
                VariantSynchronizer.notifyVariantChange(this.selectedVariant, 'shopbar');
            });

            if(element.querySelector('option:checked')) {
                const selectedVariant = element.querySelector('option:checked') as HTMLOptionElement;
                this.selectedVariant = selectedVariant.value;
                this.changePriceVariantDesktop(selectedVariant);
                VariantSynchronizer.notifyVariantChange(this.selectedVariant, 'shopbar');
            }
        });
    }

    changePriceVariantDesktop(selectedVariant: HTMLOptionElement) {
        const price = selectedVariant.dataset.price as string;
        if (this.priceElement) {
            this.priceElement.innerText = price;
        }

        if (this.installmentContent) {
            this.installmentContent.dataset.price = price;
            calculateInstallments(this.installmentContent);
        }
    }

    initVariantsMobile(){
        const variantSelected = this.querySelector('[data-variant-option]:checked') as HTMLInputElement;
        if (variantSelected) {
            this.selectedVariant = variantSelected.value;
        }

        this.variantsOptions.forEach((element: HTMLInputElement) => {
            element.addEventListener('input', () => {
                this.selectedVariant = element.value;
                VariantSynchronizer.notifyVariantChange(this.selectedVariant, 'shopbar');
                this.changePriceVariantSelected();
            });
        });

        this.variantsHead.forEach((element: HTMLInputElement) => {
            element.addEventListener('input', () => {
                this.selectHeadings(element);
                this.changePriceVariantSelected();
            });   

            if(element.checked) this.selectHeadings(element as HTMLInputElement);
        });

        this.variantsOptions.forEach(option => this.selectWay(option));
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

        if (availableOptions.length > 0 && availableOptions.every(option => option.checked == false)) {
            availableOptions[0].checked = true;
            this.selectedVariant = availableOptions[0].value;
        } else {
            this.selectedVariant = '';
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
        if (variantSelected) {
            const price = variantSelected.dataset.price as string;
            if (this.priceElement) {
                this.priceElement.innerText = price;
            }
    
            if (this.installmentContent) {
                this.installmentContent.dataset.price = price;
                calculateInstallments(this.installmentContent);
            }
        }
    }

    updateButtonToOutOfStock(soldout: boolean = false) {
        if (!this.btnAddToCard) return;

        if (soldout === true) {
            this.btnAddToCard.disabled = true;
            const btnText = this.btnAddToCard?.dataset.outOfStock;
            const spanText = this.btnAddToCard.querySelector('.btn_text') as HTMLElement;

            if (btnText) spanText.innerHTML = btnText;
        } else {
            this.btnAddToCard.disabled = false;
            const btnText = this.btnAddToCard?.dataset.default;
            const spanText = this.btnAddToCard.querySelector('.btn_text') as HTMLElement;

            if (btnText) spanText.innerHTML = btnText;
        }
    }

    private checkShopbarVisibility() {
        if (!this.btnAddToCardMainProduct || !this.footerComponent) return;

        const buttonRect = this.btnAddToCardMainProduct.getBoundingClientRect();
        const footerRect = this.footerComponent.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        const isButtonOutOfView = buttonRect.bottom <= 0;
        const isCollidingWithFooter = footerRect.top <= windowHeight;
        const buttonWtts = document.querySelector('.container_button_whats') as HTMLElement;

        if (isButtonOutOfView && !isCollidingWithFooter) {
            this.setAttribute('open', '')

            if (buttonWtts) {
                buttonWtts.style.display = 'none';
            }
        } else {
            this.removeAttribute('open')

            if (buttonWtts) {
                buttonWtts.style.display = 'flex';
            }
        }
    }

    async handleAddToCard() {
        if (!this.selectedVariant) return;
        
        try{
            this.btnAddToCard?.setAttribute('loading', '');
            await this.fetchData.addToCart('', this.selectedVariant, this.quantity);
            this.cartDrawer?.fetchNewCart();
            this.btnAddToCard?.removeAttribute('loading');
        }catch(error){
            Alert.loadMessage(`${error}`, 3000);
            this.btnAddToCard?.removeAttribute('loading');
        }
    }

    disconnectedCallback() {
        VariantSynchronizer.removeListener(this.handleVariantChange);
        window.removeEventListener('scroll', this.checkShopbarVisibility);
        window.removeEventListener('resize', this.checkShopbarVisibility);
    }
}