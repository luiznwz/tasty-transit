import BlazeSlider from 'blaze-slider';
import 'blaze-slider/dist/blaze.css';

export default class BannerCarouselProducts extends HTMLElement{
    sliderElementCarouselProduct: BlazeSlider;

    constructor() {
        super();
        this.sliderElementCarouselProduct = this.setupSlider();
        
    }

    setupSlider() {
        const sliderElementCarouselProduct = this.querySelector('.banner-carousel-products-slider') as HTMLElement;
        const slider = new BlazeSlider(sliderElementCarouselProduct, {
            all: {
                transitionDuration: 300,
                transitionTimingFunction: 'cubic-bezier(0.45, 0.1, 0.45, 0.5)',
                draggable: true,
                slidesToShow: 3,
                slideGap: '20px',
                loop: false,
            },
            '(max-width: 1200px)': {
                slidesToShow: 2.5,
            },
            '(max-width: 768px)': {
                slidesToShow: 3,
            },
            '(max-width: 600px)': {
                slidesToShow: 2.5,
            },
            '(max-width: 480px)': {
                slidesToShow: 1.4,
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
        const prevButton = this.querySelector('.banner-carousel-products--prev') as HTMLElement;
        const nextButton = this.querySelector('.banner-carousel-products--next') as HTMLElement;

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