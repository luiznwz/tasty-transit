import BlazeSlider from 'blaze-slider';
import 'blaze-slider/dist/blaze.css';

export default class ImageGridCarousel extends HTMLElement {
    sliderElementGridImagesCarousel: BlazeSlider;

    constructor() {
        super();
        this.sliderElementGridImagesCarousel = this.setupSlider();
    }

    setupSlider() {
        const sliderElementGridImagesCarousel = this.querySelector('.grid-image-slider') as HTMLElement;
        const slider = new BlazeSlider(sliderElementGridImagesCarousel, {
            all: {
                transitionDuration: 300,
                transitionTimingFunction: 'cubic-bezier(0.45, 0.1, 0.45, 0.5)',
                draggable: true,
                slidesToShow: 2,
                slideGap: '10px',
                loop: true,
            },
            '(max-width: 480px)': {
                slidesToShow: 1,
            },
        });

        return slider;
    }
}