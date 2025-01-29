import BlazeSlider from 'blaze-slider'
import 'blaze-slider/dist/blaze.css'

export default class BannerCarrousel extends HTMLElement {
    sliderElement: BlazeSlider | null = null;
    slider: HTMLElement;
    videos: NodeListOf<HTMLVideoElement>;
    playBtns: NodeListOf<HTMLElement>;

    constructor() {
        super();

        this.slider = this.querySelector('.blaze-slider') as HTMLElement;
        this.videos = this.querySelectorAll('video');
        this.playBtns = this.querySelectorAll('.banner_video_play');

        this.videos.forEach(video => {
            video.addEventListener('click', () => {
                this.handleVideoClick(video);
            })
        });

        this.playBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const video = btn.parentElement?.querySelector('video') as HTMLVideoElement;
                this.handleVideoClick(video);
            })
        });

        this.initializeBlazer();
    }

    handleVideoClick(video: HTMLVideoElement) {
        if(video.paused) {
            video.play();
            video.parentElement?.querySelector('.banner_video_play')?.removeAttribute('active');
        }
        else {
            video.pause();
            video.parentElement?.querySelector('.banner_video_play')?.setAttribute('active', '');
        }
    }

    initializeBlazer() {
        this.sliderElement = new BlazeSlider(this.slider, {
            all: {
                transitionDuration: 300,
                slidesToShow: 1,
                slideGap: '0px'
            }
        })

        this.sliderElement.onSlide(() => {
            const animatedEntry = this.querySelector('.first_banner') as HTMLElement;
            if(animatedEntry) animatedEntry.classList.remove('first_banner');
        })
    }
}