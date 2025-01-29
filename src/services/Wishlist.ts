import WishlistGrid from "@/components/WishlistGrid/WishlistGrid";

export const Wishlist = {
    wishlistItems: [] as string[],

    getAllFavoriteElements: function() {
        return document.querySelectorAll('.favorite_product_heart') as NodeListOf<HTMLElement>;
    },

    init: function() {
        this.initializeWishlist();
        this.setupEventListeners(document.body);
    },

    initForNewElements: function(container: Element) {
        this.setupEventListeners(container);
        this.updateAllFavoriteElements(container);
    },

    initializeWishlist: function() {
        const storedWishlist = localStorage.getItem('wishlist');
        if (storedWishlist) {
            this.wishlistItems = JSON.parse(storedWishlist);
        }
        this.updateAllFavoriteElements(document.body);
    },

    setupEventListeners: function(container: Element) {
        const favoriteElements: NodeListOf<HTMLElement> = container.querySelectorAll('.favorite_product_heart');
        favoriteElements.forEach(element => {
            element.removeEventListener('click', this.handleClick);
            element.addEventListener('click', this.handleClick);
        });
    },

    handleClick: function(event: Event) {
        const element = event.currentTarget as HTMLElement;
        Wishlist.toggleWishlist(element);

        const wishlistGrid = document.querySelector('wishlist-grid') as WishlistGrid;
        wishlistGrid?.init();    
    },

    updateAllFavoriteElements: function(container: Element) {
        const favoriteElements: NodeListOf<HTMLElement> = container.querySelectorAll('.favorite_product_heart');
        favoriteElements.forEach(element => {
            this.verifyWishlistActive(element);
        });
    },

    verifyWishlistActive: function(element: HTMLElement) {
        const productHandle = element.getAttribute('data-handle');
        if (productHandle && this.wishlistItems.includes(productHandle)) {
            element.classList.add('active');
        } else {
            element.classList.remove('active');
        }
    },

    toggleWishlist: function(element: HTMLElement) {
        const productHandle = element.getAttribute('data-handle');
        if (productHandle) {
            if (this.wishlistItems.includes(productHandle)) {
                const index = this.wishlistItems.indexOf(productHandle);
                if (index > -1) {
                    this.wishlistItems.splice(index, 1);
                }
            } else {
                this.wishlistItems.push(productHandle);
            }
            this.updateLocalStorage();
            this.updateAllFavoriteElements(document.body);
        }
    },

    updateLocalStorage: function() {
        localStorage.setItem('wishlist', JSON.stringify(this.wishlistItems));
    },

    getWishlistItems: function() {
        return this.wishlistItems;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Wishlist.init();
});