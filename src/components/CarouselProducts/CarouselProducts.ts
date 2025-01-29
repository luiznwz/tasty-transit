import BlazeSlider from 'blaze-slider';
import 'blaze-slider/dist/blaze.css';

export default class CarouselProduct extends HTMLElement {
    sliderElementCarouselProduct: BlazeSlider;

    constructor() {
        super();
        this.sliderElementCarouselProduct = this.setupSlider();
        
    }

    setupSlider() {
        const sliderElementCarouselProduct = this.querySelector('.carousel-product-slider') as HTMLElement;
        const slider = new BlazeSlider(sliderElementCarouselProduct, {
            all: {
                transitionDuration: 300,
                transitionTimingFunction: 'cubic-bezier(0.45, 0.1, 0.45, 0.5)',
                draggable: true,
                slidesToShow: 4,
                slideGap: '60px',
                loop: false,
            },
            '(max-width: 1024px)': {
                slidesToShow: 3,
                slideGap: '40px',
            },
            '(max-width: 768px)': {
                slidesToShow: 2.5,
                slideGap: '30px',
            },
            '(max-width: 480px)': {
                slidesToShow: 1.4,
                slideGap: '20px',
            },
        });

        this.updateButtonState(0, slider); 

        window.addEventListener('resize', () =>{
            this.updateButtonState(slider?.stateIndex || 0, slider);
        });

        slider.onSlide((index) => {
            this.updateButtonState(index, slider);
        });

        return slider;
    }

    updateButtonState(index: number, slider: BlazeSlider) {
        const prevButton = this.querySelector('.carousel-product--prev') as HTMLElement;
        const nextButton = this.querySelector('.carousel-product--next') as HTMLElement;

        if (index === 0) {
            prevButton.setAttribute('disabled', 'true');
        } else {
            prevButton.removeAttribute('disabled');
        }

        if(!slider) return;
        if (index === slider.states.length - 1) {
            nextButton.setAttribute('disabled', 'true');
        } else {
            nextButton.removeAttribute('disabled');
        }
    }
}