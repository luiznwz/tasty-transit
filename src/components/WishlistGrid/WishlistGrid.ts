import { Wishlist } from "@/services/Wishlist";

export default class WishlistGrid extends HTMLElement {
    private productsHandles: string[] = [];
    private wishlistContent: HTMLElement | null;
    private wishlistEmpty: HTMLElement | null;
    private loaderContainer: HTMLElement;
  
    constructor() {
      super();
  
      this.wishlistContent = this.querySelector('.wishlist-grid__content');
      this.wishlistEmpty = this.querySelector('.wishlist-empty__content');
      this.loaderContainer = this.querySelector('.loader_container') as HTMLElement;

      this.isLoading(true);
  
      this.init();
    }
  
    init() {
      this.handleLocalStorage();
    }

    private handleLocalStorage(){
      const wishlist = localStorage.getItem('wishlist');
  
      if (wishlist) {
        try {
          this.productsHandles = JSON.parse(wishlist);
          this.fetchProducts();
        } catch (error) {
          console.error('Error parsing wishlist from localStorage:', error);
        }
      }
    }
  
    private async fetchProducts() {
      if (this.productsHandles.length === 0 && this.wishlistEmpty) {
        this.isLoading(false);
        return this.wishlistEmpty.style.opacity = '1'
      };
  
      try {
        const productPromises = this.productsHandles.map(handle =>
          fetch(`/products/${handle}?view=product-card`)
          .then(response => response.text())
        );
  
        const products = await Promise.all(productPromises);
  
        const parser = new DOMParser();
        const productCards = products.map(product => {
        const doc = parser.parseFromString(product, 'text/html');
        return doc.querySelector('product-card');
        }).filter(card => card !== null);
  
        if (this.wishlistContent) {
          this.wishlistContent.innerHTML = productCards.map(card => card!.outerHTML).join('');
          Wishlist.init();
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        this.isLoading(false); 
      }
    }
  
    private isLoading(isLoading: boolean) {
      this.loaderContainer.classList.toggle('loader_container--active', isLoading);
    }
}