import { PriceRangeSlider } from "@/services/PriceRangeSlider";
import BlazeSlider from 'blaze-slider';
import 'blaze-slider/dist/blaze.css';

export default class CollectionFilter extends HTMLElement {
    filterTextOpen: HTMLElement | null;
    filterModal: HTMLElement | null;
    closeModal: HTMLElement | null;
    dropdownTitles: NodeListOf<HTMLElement> | null;
    forms: NodeListOf<HTMLFormElement> | null;
    collectionProducts: HTMLElement | null;
    collectionLoading: HTMLElement | null;
    productsCount: HTMLElement | null;
    btnResetFilter: HTMLElement | null;
    btnApplyFilter: HTMLElement | null;
    private priceRangeSliders: PriceRangeSlider[] = [];
    private blazeSlider: BlazeSlider | null = null;
    sliderElement: HTMLElement | undefined;
    private prevButton: HTMLElement | null = null;
    private nextButton: HTMLElement | null = null;
    inputCarousel: NodeListOf<HTMLInputElement> | null;
    sortBySelect: HTMLSelectElement;

    constructor() {
        super();

        this.filterTextOpen = this.querySelector('.filter__text');
        this.filterModal = this.querySelector('.filter__modal');
        this.closeModal = this.querySelector('.filter__modal__heading svg');
        this.dropdownTitles = this.querySelectorAll('.filter_name');

        this.forms = this.querySelectorAll('.collection__filter_form');
        
        this.collectionProducts = document.querySelector('.collection_grid__container');
        this.collectionLoading = document.querySelector('#collection_loader');
        this.btnResetFilter = this.querySelector('.filter_reset');
        this.btnApplyFilter = this.querySelector('.filter_submit');
        this.productsCount = document.querySelector('.products_count__container .product_count');

        this.inputCarousel = this.querySelectorAll('#filterForCarousel .filter-group__checkbox');

        this.sortBySelect = document.getElementById('SortBy') as HTMLSelectElement;

        this.initEventListeners();
        this.initPriceRangeSliders();
        this.prevButton = this.querySelector('.blaze-prev');
        this.nextButton = this.querySelector('.blaze-next');
        this.sliderElement = this.setupSliderElement();
        this.preventDefault();
    }

    preventDefault() {
        this.prevButton?.addEventListener('click', (e) => e.preventDefault());
        this.nextButton?.addEventListener('click', (e) => e.preventDefault());
    }

    setupSliderElement() {
        this.sliderElement = this.querySelector('.carousel-filter-slider') as HTMLElement;
        if (!this.sliderElement) return
        this.blazeSlider = new BlazeSlider(this.sliderElement, {
            all: {
                transitionDuration: 300,
                transitionTimingFunction: 'cubic-bezier(0.45, 0.1, 0.45, 0.5)',
                draggable: true,
                slidesToShow: 6.2,
                slideGap: '60px',
                loop: false,
            },
            '(max-width: 1200px)': {
                slidesToShow: 4.8,
                slideGap: '30px',
            },
            '(max-width: 768px)': {
                slidesToShow: 3.8,
                slideGap: '25px',
            },
            '(max-width: 480px)': {
                slidesToShow: 2.8,
                slideGap: '20px',
            },
        });
        this.setupNavigationButtons();
        return this.sliderElement;
    }

    private setupNavigationButtons(): void {
        if (!this.blazeSlider) return;

        this.updateNavigationButtons(0, Number(this.blazeSlider.totalSlides));

        const totalSlides = Number(this.blazeSlider.totalSlides);
        
        if( totalSlides <= 6) {
            (this.prevButton as HTMLElement).style.display = 'none';
            (this.nextButton as HTMLElement).style.display = 'none';
        }

        this.blazeSlider.onSlide((pageIndex, firstSlideIndex, lastSlide) => {
            this.updateNavigationButtons(pageIndex, lastSlide);
        });
    }

    private updateNavigationButtons(pageIndex: number, lastSlide: number): void {
        if (!this.blazeSlider) return;

        const totalSlides = Number(this.blazeSlider.totalSlides);

        if (this.prevButton) this.prevButton.classList.toggle('disabled', pageIndex === 0);
        if (this.nextButton) this.nextButton.classList.toggle('disabled', lastSlide === totalSlides - 1);
    }

    private initPriceRangeSliders(): void {
        const containers = this.querySelectorAll('.price-range-slider__content');
        const containerPrice = this.querySelector('.price-range-slider__container') as HTMLElement;
        containers.forEach(container => {
            if (container instanceof HTMLElement) {
                const slider = new PriceRangeSlider(container, containerPrice);
                this.priceRangeSliders.push(slider);
            }
        });
    }

    private initEventListeners(): void {
        this.addListener(this.filterTextOpen, 'click', this.openFilter);
        this.addListener(this.closeModal, 'click', this.closeFilter);
        document.addEventListener('click', this.handleOutsideClick.bind(this));
    
        this.syncCheckboxes(this.inputCarousel, '.filter__dropdown .filter-group__checkbox', true);
        this.syncCheckboxes(this.querySelectorAll('.filter__dropdown .filter-group__checkbox'), '#filterForCarousel .filter-group__checkbox', false);
    
        this.dropdownTitles?.forEach((title) => {
            this.addListener(title, 'click', this.toggleDropdown);
        });
    
        this.addListener(this.btnResetFilter, 'click', this.resetFilter);
        this.addListener(this.btnApplyFilter, 'click', this.applyFilter);
    
        this.sortBySelect.addEventListener('change', (event) => this.applyFilter(event));
    }

    private syncCheckboxes(sourceCheckboxes: NodeListOf<HTMLInputElement> | null, targetSelector: string, change: boolean): void {
        sourceCheckboxes?.forEach(sourceCheckbox => {
            sourceCheckbox.addEventListener('input', () => {
                const targetCheckbox = this.querySelector(`${targetSelector}[value="${sourceCheckbox.value}"]`) as HTMLInputElement;
                if (targetCheckbox) {
                    targetCheckbox.checked = sourceCheckbox.checked;
                }
                if (change) this.applyFilter(new Event('input'));
            });
        });
    }

    private addListener(element: HTMLElement | null, event: string, handler: EventListener): void {
        element?.addEventListener(event, handler.bind(this));
    }

    private handleOutsideClick(event: MouseEvent): void {
        if (this.filterModal?.hasAttribute('open') &&
            !this.filterModal.contains(event.target as Node) &&
            event.target !== this.filterTextOpen) {
            this.closeFilter();
        }
    }

    private openFilter(event: Event): void {
        event.stopPropagation();
        this.filterModal?.setAttribute('open', '');
        document.body.classList.add('no-scroll');
    }

    private closeFilter(): void {
        this.filterModal?.removeAttribute('open');
        document.body.classList.remove('no-scroll');
    }

    private resetFilter(e: Event): void {
        e.preventDefault();
        this.forms?.forEach(form => {
            form.reset();
        });

        const currentUrl = new URL(window.location.href);
        const searchQuery = currentUrl.searchParams.get('q');
        const params = new URLSearchParams();

        if (searchQuery) {
            params.set('q', searchQuery);
        }

        this.forms?.forEach(form => {
            form.querySelectorAll('input').forEach((input) => {
                if (input.type === 'checkbox') {
                    input.checked = false;
                }
            });
        });

        this.priceRangeSliders.forEach(slider => {
            slider.reset();
        });

        const queryString = params.toString();
        this.updateURL(queryString);

        this.applyFilter(e);
    }

    private applyFilter(e: Event): void {
        e.preventDefault();
        if (!this.forms || this.forms.length < 2) return;
    
        this.collectionLoading?.setAttribute('active', '');
        this.closeFilter();
    
        const formData = new FormData();
        this.forms.forEach(form => {
            new FormData(form).forEach((value, key) => {
                formData.append(key, value);
            });
        });
    
        const params = new URLSearchParams();
        const currentUrl = new URL(window.location.href);
        const searchQuery = currentUrl.searchParams.get('q');
        if (searchQuery) {
            params.set('q', searchQuery);
        }
    
        formData.forEach((value, key) => {
            if (value) params.append(key, value.toString());
        });
    
        this.priceRangeSliders.forEach(slider => {
            const values = slider.getValues();
            if (slider.isChanged()) {
                for (const [key, value] of Object.entries(values)) {
                    if (typeof value === 'number') {
                        params.set(key, value.toFixed(2).replace('.', ','));
                    }
                }
            }
        });
    
        const sortByValue = this.sortBySelect.value;
        if (sortByValue) {
            params.set('sort_by', sortByValue);
        }
    
        const queryString = params.toString();
        this.updateURL(queryString);
    
        fetch(window.location.pathname + '?' + queryString, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.text())
        .then(async html => {
            await this.updateCollectionProducts(html);
        })
        .catch(error => console.error('Error:', error));
    }

    updateURL(queryString: string) {
        const newURL = `${window.location.pathname}?${queryString}`;
        history.pushState({ path: newURL }, '', newURL);
    }

    private async updateCollectionProducts(html: string) {
        if (!this.collectionProducts) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newProducts = doc.querySelector('.collection_grid__container')?.innerHTML;
        const newCount = doc.querySelector('.products_count__container .product_count')?.innerHTML;

        this.collectionLoading?.removeAttribute('active');
        if (this.productsCount && newCount) this.productsCount.innerHTML = newCount;
        if (newProducts) this.collectionProducts.innerHTML = newProducts;
    }

    //*** Funções para a animação de abertura do DROPDOWN JP ***/

    private toggleDropdown(event: Event): void {
        const target = event.currentTarget as HTMLElement;
        const dropdown = target.nextElementSibling as HTMLElement;

        if (dropdown.hasAttribute('closed')) return this.openDropdown(dropdown);

        this.closeDropdown(dropdown);
    }

    private openDropdown(dropdown: HTMLElement): void {
        dropdown.style.height = '0px';
        dropdown.removeAttribute('closed');
        const height = dropdown.scrollHeight;
        dropdown.style.height = height + 'px';

        dropdown.addEventListener('transitionend', () => {
            dropdown.style.height = 'auto';
        }, { once: true });
    }

    private closeDropdown(dropdown: HTMLElement): void {
        const height = dropdown.scrollHeight;
        dropdown.style.height = height + 'px';
        dropdown.offsetHeight;
        dropdown.style.height = '0px';
        dropdown.setAttribute('closed', '');

        dropdown.addEventListener('transitionend', () => {
            dropdown.style.height = '';
        }, { once: true });
    }
}