import BlazeSlider from "blaze-slider";
import 'blaze-slider/dist/blaze.css';

export default class LookBook extends HTMLElement {
    productsCarrousel: BlazeSlider | null = null;
    modalProducts: HTMLElement;
    lookBookButtons: NodeListOf<HTMLElement>;
    closeModal: HTMLElement;

    constructor() {
        super();

        this.lookBookButtons = this.querySelectorAll('.lookbook__button') as NodeListOf<HTMLElement>;
        this.modalProducts = this.querySelector('.lookbook__modal_products') as HTMLElement;
        this.closeModal = this.querySelector('.lookbook__modal_close') as HTMLElement;

        this.lookBookButtons.forEach((button) => {
            button.addEventListener('click', () => this.handleClickButton(button));
        });

        if(window.innerWidth > 768) this.lookBookButtons[0].classList.add('active');

        this.closeModal.addEventListener('click', () => {
            this.modalProducts.removeAttribute('open');
            if(window.innerWidth < 768) document.body.style.overflow = 'auto';
        });

        this.setupProductsCarrousel();
    }

    setupProductsCarrousel() {
        const slider = this.querySelector('.product__carrousel') as HTMLElement;
        this.productsCarrousel = new BlazeSlider(slider, {
            all: {
                draggable: true,
                slidesToShow: 1,
                slideGap: '20px',
                loop: false,
            }
        });

        this.updateButtonState(0); 
        window.addEventListener('resize', () =>{
            this.updateButtonState(this.productsCarrousel?.stateIndex || 0);
            this.lookBookButtons.forEach((button) => button.classList.remove('active'));
            this.lookBookButtons[this.productsCarrousel?.stateIndex || 0].classList.add('active');
        });
        
        this.productsCarrousel.onSlide((index) => {
            this.lookBookButtons.forEach((button) => button.classList.remove('active'));
            this.lookBookButtons[index].classList.add('active');

            this.updateButtonState(index);
        });
    }

    updateButtonState(index: number) {
        const prevButton = this.querySelector('.lookbook--prev') as HTMLElement;
        const nextButton = this.querySelector('.lookbook--next') as HTMLElement;

        if (index === 0) {
            prevButton.setAttribute('disabled', 'true');
        } else {
            prevButton.removeAttribute('disabled');
        }

        if(!this.productsCarrousel) return;
        if (index === this.productsCarrousel.slides.length - 1) {
            nextButton.setAttribute('disabled', 'true');
        } else {
            nextButton.removeAttribute('disabled');
        }
    }

    handleClickButton(button: HTMLElement) {
        const index = button.dataset.index;
        this.goToSlide(Number(index));
        
        this.lookBookButtons.forEach((button) => button.classList.remove('active'));
        button.classList.add('active');

        this.modalProducts.setAttribute('open', '')
        if(window.innerWidth < 768) document.body.style.overflow = 'hidden';
    }

    goToSlide(index: number) {
        if (this.productsCarrousel) {
            const currentState = this.productsCarrousel.stateIndex;
            const diff = index - currentState;
            
            if (diff > 0) {
                this.productsCarrousel.next(diff);
            } else if (diff < 0) {
                this.productsCarrousel.prev(Math.abs(diff));
            }
        }
    }
}