import FetchData from "@/services/FetchData";
import { calculateInstallments } from "@/services/product/InstallmentsCalculator";
import Alert from "../Alert/Alert";

export default class CartSection extends HTMLElement {
    private fetchData: FetchData;
    private translations: { [key: string]: string };

    private freeShippingPrice: number;
    private progressBar: HTMLElement | null;
    private progressSpan: HTMLElement | null;

    private cartSubtotal: HTMLElement | null;
    private cartShippingPrice: HTMLElement | null;

    private removeIcons: NodeListOf<HTMLElement> | null;
    private itemQuantityDiv: NodeListOf<HTMLElement> | null;
    private cartProducts: HTMLElement | null;
    private cartItemCount: HTMLElement | null;
    private bagItemCount: HTMLElement | null;

    private cartRelatedProducts: NodeListOf<HTMLElement> | null;
    private firstProduct: HTMLElement | null | string;

    private loaderProductCart: HTMLElement | null;

    private installmentsContent: NodeListOf<HTMLElement> | null;

    constructor() {
        super();

        this.fetchData = new FetchData();
        this.translations = this.loadTranslations();

        this.freeShippingPrice = Number(this.getAttribute('data-free-shipping-price'));
        this.progressBar = this.querySelector('.progress');
        this.progressSpan = this.querySelector('.progress_span');

        this.cartSubtotal = this.querySelector('.cart_subtotal_price');
        this.cartShippingPrice = this.querySelector('.cart_shipping_price');

        this.removeIcons = this.querySelectorAll('.cart_remove_icon');
        this.itemQuantityDiv = this.querySelectorAll('.cart_item_quantity');
        this.cartProducts = this.querySelector('.cart_section_cart_products');
        this.cartItemCount = this.querySelector('.cart__item_count');
        this.bagItemCount = document.querySelector('.bag_items_count');

        this.cartRelatedProducts = document.querySelectorAll('#relatedProductSection .cart_related_product__snippet')
        this.firstProduct = '';

        this.loaderProductCart = document.querySelector('#cart_section_products_loader');

        this.installmentsContent = document.querySelectorAll('[data-product-installments]');

        this.installmentsContent?.forEach((element) => {
            calculateInstallments(element);
        })
        this.updateFreeShippingProgress();
        this.setupEventListeners();
        this.loadRelatedProducts();
    }

    private setupEventListeners() {
        this.loaderProductCart = document.querySelector('#cart_section_products_loader');
        this.removeIcons = this.querySelectorAll('.cart_remove_icon');
        this.removeIcons?.forEach(icon => {
            icon.addEventListener('click', () => {
                this.removeProduct(icon.getAttribute('data-id'))
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
                    }finally{
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
        const url = `${window.location.origin}/cart`;

        fetch(url)
            .then(response => response.text())
            .then(async data => {
                await this.updateCart(data);
            });
    }

    private async updateCart(html: string) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newCartItems = doc.querySelector('.cart_section_products__container')?.innerHTML;
            const newCartSubtotal = doc.querySelector('cart-section .cart_subtotal_price')?.innerHTML;
            const newCartItemCount = doc.querySelector('cart-section .cart__item_count')?.innerHTML;        
    
            if (newCartItems && this.cartProducts) this.cartProducts.innerHTML = newCartItems;
            if (newCartSubtotal && this.cartSubtotal) this.cartSubtotal.innerHTML = newCartSubtotal;
            if (newCartItemCount && this.cartItemCount) this.cartItemCount.innerHTML = newCartItemCount;
            if (newCartItemCount && this.bagItemCount) this.bagItemCount.innerHTML = newCartItemCount.replace('(', '').replace(')', '');
    
            this.setupEventListeners();
            this.updateFreeShippingProgress();
        } catch (error) {
            console.error('Erro ao atualizar o carrinho:', error);
        } finally {
            this.loaderProductCart?.removeAttribute('active');
        }
    }

    private async removeProduct(id: string | null) {
        this.loaderProductCart?.setAttribute('active', '');
        await this.fetchData.removeFromCart(id || '')
        this.fetchNewCart();
        this.loaderProductCart?.removeAttribute('active');
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

    private loadRelatedProducts() {
        this.firstProduct = this.querySelector('[data-related-product]') as HTMLElement;
        const productId = this.firstProduct?.dataset.relatedProduct;
        
        fetch(window.location.origin + `/recommendations/products?product_id=${productId}&limit=3&section_id=cart-related-products&intent=related`)
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

                const installments = document.querySelectorAll('cart-related-products .info_installment') as NodeListOf<HTMLElement>;

                installments.forEach((element) => {
                    calculateInstallments(element);
                })

                this.handleAddToCart();
                this.handleChangeVariant();
            })
    }

    private handleChangeVariant() {
        const btnsChangeVariant = document.querySelectorAll('#relatedProductSection .variant-select') as NodeListOf<HTMLSelectElement>;
     
        btnsChangeVariant.forEach((btn) => {
            btn.addEventListener('change', async () => {
                const variantId = btn.value;

                const btnClosest = btn.parentElement?.parentElement?.parentElement?.querySelector('.related_product_section_add__a') as HTMLElement;
                btnClosest.dataset.id = variantId; 
            })
        })
    }

    private handleAddToCart() {
        const btnsAddToCart = document.querySelectorAll('.related_product_section_add__a') as NodeListOf<HTMLElement>;
        
        btnsAddToCart.forEach((btn) => {
            btn.addEventListener('click', async () => {
                this.loaderProductCart?.setAttribute('active', '');
                const variantId = btn.dataset.id as string
                await this.fetchData.addToCart('', variantId, 1)
                this.fetchNewCart();
                this.loaderProductCart?.removeAttribute('active');
            })
        })
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