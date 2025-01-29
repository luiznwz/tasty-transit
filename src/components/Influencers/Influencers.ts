import BlazeSlider from 'blaze-slider';
import 'blaze-slider/dist/blaze.css';

export default class Influencers extends HTMLElement {
    sliderElement: BlazeSlider;
    videoElements: NodeListOf<HTMLVideoElement>;

    constructor() {
        super();

        this.videoElements = this.querySelectorAll('.video video') as NodeListOf<HTMLVideoElement>;

        this.sliderElement = this.setupSlider();
        this.setupPlayPauseButtons();
    }

    setupPlayPauseButtons() {
        this.videoElements.forEach((video: HTMLVideoElement) => {
            const btnPlay = video.closest('.video')?.querySelector('.btn-play-and-pause') as HTMLElement;

            btnPlay.addEventListener('click', () => this.playVideo(video, btnPlay));
            video.addEventListener('click', () => this.playVideo(video, btnPlay));
        });
    }

    playVideo(video: HTMLVideoElement, btnPlay: HTMLElement) {
        if (video.paused) {
            video.play();
            video.muted = false;
            btnPlay.classList.add('play');
        } else {
            video.pause();
            video.muted = true;
            btnPlay.classList.remove('play');
        }
    }

    setupSlider() {
        const sliderElement = this.querySelector('.influencers-component-blaze-slider') as HTMLElement;
        if (!sliderElement) {
            throw new Error("Slider element not found");
        }

        const slider = new BlazeSlider(sliderElement, {
            all: {
                transitionDuration: 300,
                transitionTimingFunction: 'cubic-bezier(0.45, 0.1, 0.45, 0.5)',
                slidesToShow: 3,
                slideGap: 'clamp(4rem, 15vw, 20rem)',
                draggable: true,
                loop: true,
            },
            '(min-width: 768px)': {
                slidesToShow: 3,
                slideGap: '5rem',
                draggable: true,
            },
            '(min-width: 1024px)': {
                slidesToShow: 5,
                slideGap: '5rem',
                draggable: true,
            },
        });

        const handleResize = () => {
            this.setupOnSlide(slider);
        };

        window.addEventListener('resize', handleResize);

        this.setupOnSlide(slider);
        return slider;
    }

    setupOnSlide(slider: BlazeSlider) {
        const slidesArray = Array.from(slider.slides) as HTMLElement[];
        let sliderCurrent = slider.stateIndex;

        if (window.innerWidth >= 1024) sliderCurrent = sliderCurrent + 1;
        if (sliderCurrent === slider.totalSlides) sliderCurrent = 0;

        let nextIndex = slider.states[sliderCurrent].next.stateIndex;
        const totalSlides = slider.totalSlides;

        this.updateActiveSlide(slidesArray, nextIndex);

        slidesArray.forEach((slide, index) => {
            slide.addEventListener('click', () => {
                if (index === nextIndex) {
                    return;
                }

                if (index === 0 && nextIndex === totalSlides - 1) {
                    slider.next();
                } else if (index === totalSlides - 1 && nextIndex === 0) {
                    slider.prev();
                } else if (index > nextIndex) {
                    slider.next();
                } else if (index < nextIndex) {
                    slider.prev();
                }
            });
        });

        slider.onSlide(() => {
            sliderCurrent = slider.stateIndex;

            if (window.innerWidth >= 1024) sliderCurrent = sliderCurrent + 1;
            if (sliderCurrent === slider.totalSlides) sliderCurrent = 0;

            nextIndex = slider.states[sliderCurrent].next.stateIndex;

            this.updateActiveSlide(slidesArray, nextIndex);
        });
    }

    updateActiveSlide(slidesArray: HTMLElement[], nextIndex: number) {
        slidesArray.forEach((slide, index) => {
            if (index === nextIndex) {
                slide.classList.add('active');
                slide.classList.remove('inactive');
            } else {
                slide.classList.add('inactive');
                slide.classList.remove('active');

                this.verifyVideoActive(slide);
            }
        });
    }

    verifyVideoActive(slide: HTMLElement) {
        const video = slide.querySelector('video') as HTMLVideoElement;
        if (video.paused === false) {
            video.pause();
            video.currentTime = 0;
            video.muted = true;
            const btnPlay = slide.querySelector('.btn-play-and-pause') as HTMLElement;
            btnPlay.classList.remove('play');
        }
    }
}