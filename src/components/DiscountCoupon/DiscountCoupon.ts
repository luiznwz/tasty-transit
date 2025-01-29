import { Cart } from "@/types/IFetchData.interface";
import CartDrawer from "../CartDrawer/CartDrawer";
import CartSection from "../CartSection/CartSection";
import { closeDropdown, toggleDropdown } from "@/services/Dropdown";

export default class DiscountCoupon extends HTMLElement {
    private couponHeading: HTMLElement | null;
    private form: HTMLFormElement;
    private input: HTMLInputElement | null;
    private applyButton: HTMLButtonElement | null;
    private errorMessage: HTMLElement | null;
    private successMessage: HTMLElement | null;
    private appliedCouponsContainer: HTMLElement | null;

    private shopifyAccessToken: string = "a1dddf2a2f953d4b8ea1c2e6036222d9"; // Substitua pelo seu token
    private shopifyUrl: string = "https://totvssp-lazufragrance-dc.myshopify.com"; // Substitua pelo seu domínio Shopify

    cartDrawerElement: CartDrawer;
    cartSectionElement: CartSection


    constructor() {
        super();

        this.couponHeading = this.querySelector('.discount_coupon__heading');
        this.form = this.querySelector('.discount_coupon__form') as HTMLFormElement;
        this.input = this.querySelector('.discount_coupon__input');
        this.applyButton = this.querySelector('.discount_coupon__button');
        this.errorMessage = this.querySelector('.discount_coupon__error');
        this.successMessage = this.querySelector('.discount_coupon__success');
        this.appliedCouponsContainer = this.querySelector('.discount_coupon__applied');
        this.cartDrawerElement = document.querySelector('cart-drawer') as CartDrawer;
        this.cartSectionElement = document.querySelector('cart-section') as CartSection

        this.couponHeading?.addEventListener('click', (event) => {
            const shipping__form = document.querySelector('cart-drawer .shipping__form') as HTMLElement 

            closeDropdown(shipping__form)
            toggleDropdown(this.form)
        });
        this.form?.addEventListener('submit', this.handleSubmit.bind(this));

        this.initializeAppliedCoupons();
    }

    private async handleSubmit(event: Event): Promise<void> {
        event.preventDefault();
        if (!this.input || !this.applyButton) return;

        const couponCode = this.input.value.trim();
        if (!couponCode) return;

        this.applyButton.disabled = true;
        await this.applyCoupon(couponCode);
        this.applyButton.disabled = false;
    }

    private async applyCoupon(couponCode: string): Promise<void> {
        try {
            const cart = await this.getCart();
            const appliedCoupons = this.getAppliedCoupons();
            const updatedCoupons = [...appliedCoupons, couponCode];

            const result = await this.updateCartDiscountCodes(cart.token, updatedCoupons);

            if (this.isCouponApplicable(result)) {
                this.showSuccessMessage('Cupom aplicado com sucesso');
                this.input!.value = '';
                this.updateAppliedCoupons(updatedCoupons);
                this.updateCartDisplay(result);
            } else {
                this.showErrorMessage('Cupom inválido');
            }
        } catch (error) {
            console.error('Erro ao aplicar cupom:', error);
            this.showErrorMessage('Erro ao aplicar cupom');
        }
    }

    private async removeCoupon(couponCode: string): Promise<void> {
        try {
            const cart = await this.getCart();
            const appliedCoupons = this.getAppliedCoupons().filter(coupon => coupon !== couponCode);

            const result = await this.updateCartDiscountCodes(cart.token, appliedCoupons);

            this.showSuccessMessage('Cupom removido com sucesso');
            this.querySelector(`[data-coupon="${couponCode}"]`)?.parentElement?.remove();
            this.updateCartDisplay(result);
        } catch (error) {
            console.error('Erro ao remover cupom:', error);
            this.showErrorMessage('Erro ao remover cupom');
        }
    }

    private async updateCartDiscountCodes(cartId: string, discountCodes: string[]): Promise<any> {
        const shopifyUrlApi = `${this.shopifyUrl}/api/2024-04/graphql.json`;
        const data = {
            query: `
                mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
                    cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
                        cart {
                            discountCodes {
                                code
                                applicable
                            }
                            cost {
                                subtotalAmount {
                                    amount
                                    currencyCode
                                }
                                totalAmount {
                                    amount
                                    currencyCode
                                }
                            }
                        }
                    }
                }
            `,
            variables: {
                cartId: `gid://shopify/Cart/${cartId}`,
                discountCodes
            }
        };
    
        try {
            const response = await fetch(shopifyUrlApi, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Storefront-Access-Token': this.shopifyAccessToken
                },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Response:', response.status, errorText);
                throw new Error(`Erro na resposta da API Shopify: ${response.status} ${response.statusText}`);
            }
    
            const result = await response.json();
            if (result.errors) {
                console.error('GraphQL Errors:', result.errors);
                throw new Error(`Erro GraphQL: ${result.errors[0].message}`);
            }
    
            return result;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    }

    private async getCart(): Promise<Cart> {
        const response = await fetch('/cart.js');
        return await response.json();
    }

    private getAppliedCoupons(): string[] {
        return Array.from(this.appliedCouponsContainer?.querySelectorAll('.applied_coupon') || [])
            .map(el => el.textContent?.trim() || '');
    }

    private updateAppliedCoupons(coupons: string[]): void {
        if (!this.appliedCouponsContainer) return;
        this.appliedCouponsContainer.innerHTML = coupons.map(coupon => `
            <div class="applied_coupon">
                ${coupon}
                <button class="remove-coupon" data-coupon="${coupon}">Remover</button>
            </div>
        `).join('');

        this.appliedCouponsContainer.querySelectorAll('.remove-coupon').forEach(button => {
            button.addEventListener('click', (e) => {
                const couponToRemove = (e.currentTarget as HTMLElement).dataset.coupon;
                if (couponToRemove) {
                    this.removeCoupon(couponToRemove);
                }
            });
        });
    }

    private updateCartDisplay(result: any): void {
        this.cartDrawerElement.fetchNewCart();
        this.cartSectionElement.fetchNewCart();
        const event = new CustomEvent('cart:updated', { detail: result });
        document.dispatchEvent(event);
    }

    private isCouponApplicable(result: any): boolean {
        return result.data.cartDiscountCodesUpdate.cart.discountCodes.every((code: any) => code.applicable);
    }

    private showErrorMessage(message: string): void {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.style.display = 'block';
            setTimeout(() => {
                this.errorMessage!.style.display = 'none';
            }, 3000);
        }
    }

    private showSuccessMessage(message: string): void {
        if (this.successMessage) {
            this.successMessage.textContent = message;
            this.successMessage.style.display = 'block';
            setTimeout(() => {
                this.successMessage!.style.display = 'none';
            }, 3000);
        }
    }

    private initializeAppliedCoupons(): void {
        this.getCart().then(cart => {            
            if (cart.cart_level_discount_applications) {
                this.updateAppliedCoupons(cart.cart_level_discount_applications.map(code => code.title));
            }

            cart.items.map(items =>{
                if(items.discounts){
                    items.discounts.map(code => {     
                        this.updateAppliedCoupons(code.title ? [code.title] : [])
                    })
                }
            })
        });
    }
}