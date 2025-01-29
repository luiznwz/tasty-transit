export default class CollectionGrid extends HTMLElement {
    private currentPage: number;
    private hasMorePages: boolean;
    private productGrid: HTMLElement | null;
    private isLoading: boolean;
    private loadBuffer: number;

    constructor() {
        super();
        this.currentPage = 1;
        this.hasMorePages = true;
        this.productGrid = this.querySelector('.collection_grid__container');
        this.isLoading = false;
        this.loadBuffer = 1000; // Pixels antes do final da página para iniciar o carregamento
    }

    connectedCallback() {
        if (!this.productGrid || this.productGrid.children.length === 0) {
            this.hasMorePages = false;
            return;
        }

        window.addEventListener('scroll', this.handleScroll.bind(this));
        this.checkAndLoadProducts();
    }

    private handleScroll() {
        this.checkAndLoadProducts();
    }

    private checkAndLoadProducts() {
        if (this.isLoading || !this.hasMorePages) return;

        const scrollPosition = window.innerHeight + window.scrollY;
        const bodyHeight = document.body.offsetHeight;
        const loadThreshold = bodyHeight - (window.innerHeight + this.loadBuffer);

        if (scrollPosition >= loadThreshold) {
            this.loadMoreProducts();
        }
    }

    private loadMoreProducts() {
        if (!this.hasMorePages || this.isLoading) return;

        this.isLoading = true;

        const url = new URL(window.location.href);
        url.searchParams.set('page', (this.currentPage + 1).toString());
        url.searchParams.set('sections', this.dataset.sectionId || '');

        fetch(url.toString(), {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(data => {
                const html = data[this.dataset.sectionId || ''];
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newProducts = doc.querySelectorAll('product-card');

                if (newProducts.length > 0) {
                    const fragment = document.createDocumentFragment();
                    newProducts.forEach(product => {
                        fragment.appendChild(product);
                    });
                    this.productGrid?.appendChild(fragment);
                    this.currentPage += 1;
                    setTimeout(() => this.checkAndLoadProducts(), 0);
                } else {
                    this.hasMorePages = false;
                }
                this.isLoading = false;
            })
            .catch(() => {
                this.isLoading = false;
            });
    }
}