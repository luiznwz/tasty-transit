import FetchData from "@/services/FetchData";
import { calculateInstallments } from "@/services/product/InstallmentsCalculator";
import Alert from "../Alert/Alert";

export default class CartDrawer extends HTMLElement {
    private closeIcon: HTMLElement | null;
    private freeShippingPrice: number;
    private progressBar: HTMLElement | null;
    private progressSpan: HTMLElement | null;
    private cartSubtotal: HTMLElement | null;
    private translations: { [key: string]: string };
    private fetchData: FetchData;
    private cartProducts: HTMLElement | null;
    private removeIcons: NodeListOf<HTMLElement> | null;
    private itemQuantityDiv: NodeListOf<HTMLElement> | null;
    private cartItemCount: HTMLElement | null;
    private bagItemCount: HTMLElement | null;
    private loaderProductCart: HTMLElement | null;
    private firstProduct: HTMLElement | null | string;
    private cartRelatedProducts: NodeListOf<HTMLElement> | null;
    private cartShippingPrice: HTMLElement | null;
    private cartIcon: HTMLElement | null;
    private cartDrawerContent: HTMLElement | null;
    private installmentsContent: NodeListOf<HTMLElement> | null;
    private relatedProductsAdds: NodeListOf<HTMLElement> | null = null;

    constructor() {
        super();

        this.fetchData = new FetchData();
        this.translations = this.loadTranslations();

        this.cartProducts = this.querySelector('.cart_products');
        this.loaderProductCart = document.querySelector('#cart_products_loader');
        this.removeIcons = this.querySelectorAll('.cart_remove_icon svg');
        this.cartRelatedProducts = this.querySelectorAll('.cart_related_product__snippet');
        
        this.cartIcon = document.querySelector('.header__cart');
        this.closeIcon = this.querySelector('.close-modal');
        this.cartItemCount = this.querySelector('.cart__item_count');
        this.bagItemCount = document.querySelector('.bag_count');

        this.itemQuantityDiv = this.querySelectorAll('.cart_item_quantity');
        
        this.cartDrawerContent = this.querySelector('.cart_drawer__content');
        this.progressBar = this.querySelector('.progress');
        this.progressSpan = this.querySelector('.progress_span');
        
        this.cartSubtotal = this.querySelector('.cart_subtotal_price');
        this.freeShippingPrice = Number(this.getAttribute('data-free-shipping-price'));
        this.cartShippingPrice = this.querySelector('.cart_shipping_price');
        this.firstProduct = ''

        this.installmentsContent = document.querySelectorAll('[data-product-installments]');

        this.installmentsContent?.forEach((element) => {
            calculateInstallments(element);
        })

        if(window.location.pathname == '/cart' && window.location.search !== '?view=cart-drawer') return;

        this.cartIcon?.addEventListener('click', () => this.toggleCart());
        this.closeIcon?.addEventListener('click', () => this.toggleCart());

        document.addEventListener('click', (event) => this.handleClickOutside(event));

        this.setupEventListeners();
        this.updateFreeShippingProgress();
        this.loadRelatedProducts();
        this.handlePercentagemDiscount();
    }

    private async addToCart(element: HTMLElement) {
        const productId = element.dataset.id as string;
        this.loaderProductCart?.setAttribute('active', '');
        await this.fetchData.addToCart('', productId, 1)
        this.fetchNewCart();
    }

    private handleClickOutside(event: Event) {
        if (this.hasAttribute('open') 
            && !this.cartDrawerContent?.contains(event.target as Node) 
            && !this.cartIcon?.contains(event.target as Node)) {
            this.closeCart();
        }
    }

    private loadRelatedProducts() {
        this.firstProduct = this.querySelector('[data-related-product]') as HTMLElement;
        const productId = this.firstProduct?.dataset.relatedProduct
        fetch(window.location.origin + `/recommendations/products?product_id=${productId}&limit=4&section_id=cart-related-products&intent=related`)
            .then(response => response.text())
            .then((text) => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const recommendations = doc.querySelector('cart-related-products');
    
                if (recommendations && this.cartRelatedProducts) {
                    this.cartRelatedProducts.forEach(element => {
                        element.innerHTML = recommendations.innerHTML;
                    });
                }

                const relatedProductsSelect = this.querySelectorAll('.variant-select');
                
                relatedProductsSelect.forEach((element) => {
                    element.addEventListener('change', () => {
                        const selectedVariant = element.querySelector('option:checked') as HTMLOptionElement;
                        const selectedVariantId = selectedVariant.value;
                        const selectedVariantPrice = selectedVariant.dataset.price;
                        const relatedProduct = element.closest('.cart_related_product__container') as HTMLElement;
                        const relatedProductAdd = relatedProduct.querySelector('.cart_related_product_add') as HTMLElement;
                        const relatedProductPrice = relatedProduct.querySelector('.cart_related_product_price') as HTMLElement;
                        relatedProductPrice.textContent = selectedVariantPrice || '';
                        relatedProductAdd.dataset.id = selectedVariantId;
                    });
                });

                this.relatedProductsAdds = this.querySelectorAll('.cart_related_product_add');

                this.relatedProductsAdds?.forEach((element) => {
                    element.addEventListener('click', () => {
                        this.addToCart(element);
                    });
                });
            })
    }

    private async removeProduct(id: string | null) {
        this.loaderProductCart?.setAttribute('active', '');
        await this.fetchData.removeFromCart(id || '')
        this.fetchNewCart();
    }

    private setupEventListeners() {
        this.loaderProductCart = document.querySelector('#cart_products_loader');
        this.removeIcons = this.querySelectorAll('.cart_remove_icon svg');
        this.removeIcons?.forEach(icon => {
            icon.addEventListener('click', () => {
                const parent = icon.parentElement as HTMLElement;
                this.removeProduct(parent.getAttribute('data-id'))
            });
        });

        this.itemQuantityDiv = this.querySelectorAll('.cart_item_quantity');
        this.itemQuantityDiv?.forEach(div => {
            const minusBtn = div.querySelector('.minus_cart')
            const plusBtn = div.querySelector('.plus_cart')
            const quantityText = div.querySelector('.cart_item__quantity_text')
            
            if(!quantityText) return;

            minusBtn?.addEventListener('click', async () => {
                const quantity = parseInt(quantityText?.textContent || '0')

                if(quantity === 1) return this.removeProduct(div.getAttribute('data-id'));
                if (quantity > 1) {
                    try{
                        this.loaderProductCart?.setAttribute('active', '');    
                        await this.fetchData.updateCart(div.getAttribute('data-id') || '', quantity - 1)             
                        this.fetchNewCart();
                        quantityText.textContent = (quantity - 1).toString()
                        this.loaderProductCart?.removeAttribute('active');
                    }catch(error){
                        Alert.loadMessage(`${error}`, 3000);
                    } finally{
                        this.loaderProductCart?.removeAttribute('active');
                    }
                }
            })

            plusBtn?.addEventListener('click', async () => {
                if(quantityText.textContent === '10') return;
                try{
                    const quantity = parseInt(quantityText?.textContent || '0')
                    this.loaderProductCart?.setAttribute('active', '');
                    // await this.fetchData.updateCart(div.getAttribute('data-id') || '', quantity + 1)
                    await this.fetchData.addToCart('', div.getAttribute('data-id') || '', 1);
                    this.fetchNewCart();
                    quantityText.textContent = (quantity + 1).toString()
                    this.loaderProductCart?.removeAttribute('active');
                }catch(error){
                    Alert.loadMessage(`${error}`, 3000);
                }finally{
                    this.loaderProductCart?.removeAttribute('active');
                }
            })
        })
    }

    fetchNewCart() {
        if(window.location.pathname == '/cart') return;
        const url = `${window.location.origin}/cart?view=cart-drawer`;

        fetch(url)
            .then(response => response.text())
            .then(async data => {
                await this.updateCart(data);
                if (!this.hasAttribute('open')) this.openCart();
            });
    }

    private async updateCart(html: string) {
        try{
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newCartItems = doc.querySelector('cart-drawer .cart_products')?.innerHTML;
            const newCartSubtotal = doc.querySelector('cart-drawer .cart_subtotal_price')?.innerHTML;
            const newCartItemCount = doc.querySelector('cart-drawer .cart__item_count')?.innerHTML;  
    
            if (newCartItems && this.cartProducts) this.cartProducts.innerHTML = newCartItems;
            if (newCartSubtotal && this.cartSubtotal) this.cartSubtotal.innerHTML = newCartSubtotal;
            if (newCartItemCount && this.cartItemCount) this.cartItemCount.innerHTML = newCartItemCount;
            if (newCartItemCount && this.bagItemCount) this.bagItemCount.innerHTML = newCartItemCount.replace('(', '').replace(')', '');
    
            this.loaderProductCart?.removeAttribute('active');
    
            this.setupEventListeners();
            this.openCart();
            this.updateFreeShippingProgress();
            this.loadRelatedProducts();
            this.handlePercentagemDiscount();
        }catch(error){
            console.error(error)
        } finally{
            this.loaderProductCart?.removeAttribute('active');
        }
    }

    handlePercentagemDiscount() {
        const cartItemDiscount = this.querySelectorAll('.cart_item_discount') as NodeListOf<HTMLElement>;
        cartItemDiscount.forEach((element: HTMLElement) => {
            const oldPrice = element.dataset.originalPrice as string
            const newPrice = element.dataset.price as string
            const planText = element.dataset.months as string

            const containerPercentage = element.querySelector('.percentage_discount') as HTMLElement

            const percentage = this.calculateMonthlyPercentageDifference(oldPrice, newPrice, planText);
            containerPercentage.innerHTML = percentage;
        })
    }

    calculateMonthlyPercentageDifference(oldInstallment: string, newInstallment: string, planText: string) {
        if (!oldInstallment || !newInstallment) return "";
    
        const monthsMatch = planText.match(/(\d+)/);
        const months = monthsMatch ? parseInt(monthsMatch[0], 10) : 1;
    
        const oldValue = parseFloat(oldInstallment.replace(/[^\d.-]/g, ''));
        const newValue = parseFloat(newInstallment.replace(/[^\d.-]/g, ''));
    
        if (isNaN(oldValue) || isNaN(newValue) || oldValue === 0) return "";
    
        const newMonthlyValue = newValue / months;
    
        const percentageDifference = ((oldValue - newMonthlyValue) / oldValue) * 100;
        if(percentageDifference == 0) return ''
        return `${percentageDifference.toFixed(0)}% OFF`;
    }

    toggleCart() {
        if (this.hasAttribute('open')) {
            this.closeCart();
        } else {
            this.openCart();
        }
    }

    openCart() {
        this.setAttribute('open', '');
        document.body.classList.add('no-scroll');
        this.updateFreeShippingProgress();
    }

    closeCart() {
        this.removeAttribute('open');
        document.body.classList.remove('no-scroll');
    }

    private updateFreeShippingProgress() {
        if (!this.cartSubtotal || !this.progressBar || !this.progressSpan || !this.cartShippingPrice) return;

        const subtotal = this.extractPrice(this.cartSubtotal.textContent);
        const progress = Math.min((subtotal / this.freeShippingPrice) * 100, 100);

        this.progressBar.style.width = `${progress}%`;

        if (subtotal >= this.freeShippingPrice) {
            this.progressSpan.textContent = this.translations['free-shipping'];
            this.cartShippingPrice.textContent = this.translations['free'];
        } else {
            const remaining = this.freeShippingPrice - subtotal;
            this.progressSpan.textContent = `${this.formatPrice(remaining)} ${this.translations['missing-free-shipping']}`;
            this.cartShippingPrice.textContent = this.translations['to_be_calculated'];
        }
    }

    private extractPrice(priceString: string | null): number {
        if (!priceString) return 0;
        return parseFloat(priceString.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
    }

    private formatPrice(price: number): string {
        return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    private loadTranslations(): { [key: string]: string } {
        const translationsScript = document.querySelector('script[type="application/json"][data-translations]');
        if (translationsScript) {
            try {
                return JSON.parse(translationsScript.textContent || '{}');
            } catch (e) {
                console.error('Error parsing translations:', e);
            }
        }
        return {};
    }
}