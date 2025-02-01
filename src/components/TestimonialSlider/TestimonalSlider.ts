import BlazeSlider from "blaze-slider";
import "blaze-slider/dist/blaze.css";
import { gsap } from "gsap";

interface TestimonialSliderConfig {
  autoplayInterval?: number;
  transitionDuration?: number;
  slideGap?: string;
  breakpoints?: {
    [key: string]: {
      slidesToShow: number;
      slideGap?: string;
    };
  };
}

export default class TestimonialSlider {
  private readonly container: HTMLElement;
  private slider: BlazeSlider | null = null;
  private slides: NodeListOf<HTMLElement>;
  private currentSlideIndex: number = 0;
  private isDestroyed: boolean = false;
  private readonly config: TestimonialSliderConfig;

  constructor(
    container: HTMLElement,
    config: Partial<TestimonialSliderConfig> = {}
  ) {
    if (!container) throw new Error("Container element is required");

    this.container = container;
    this.slides = container.querySelectorAll(".testimonial-slide");
    this.config = {
      autoplayInterval: 5000,
      transitionDuration: 500,
      slideGap: "2rem",
      ...config,
    };

    this.init();
  }

  private init(): void {
    try {
      this.slider = this.setupSlider();
      this.setupNavigation();
      this.setupSlideTransitions();
      this.animateFirstSlide();
      this.setupResizeHandler();
    } catch (error) {
      console.error("Failed to initialize TestimonialSlider:", error);
    }
  }

  private setupResizeHandler(): void {
    const debouncedResize = this.debounce(() => {
      if (this.slider && !this.isDestroyed) {
        this.slider.refresh();
      }
    }, 250);

    window.addEventListener("resize", debouncedResize);
  }

  private debounce(func: Function, wait: number): (...args: any[]) => void {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  private setupSlideTransitions(): void {
    if (!this.slider) return;

    this.slider.onSlide((index) => {
      if (this.isDestroyed) return;

      this.slides.forEach((slide, i) => {
        if (i === index) {
          slide.classList.add("is-active");
          this.playVideo(slide);
          this.animateSlide(slide);
        } else {
          slide.classList.remove("is-active");
          this.pauseVideo(slide);
        }
      });
      this.currentSlideIndex = index;
    });
  }

  private animateSlide(slide: HTMLElement): void {
    gsap.fromTo(
      slide,
      { opacity: 0.5, scale: 0.95 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
      }
    );
  }

  private setupNavigation(): void {
    if (!this.slider) return;

    const prevButton = this.container.querySelector(".testimonial-nav--prev");
    const nextButton = this.container.querySelector(".testimonial-nav--next");

    const handlePrev = () => this.slider?.prev();
    const handleNext = () => this.slider?.next();

    if (prevButton) {
      prevButton.addEventListener("click", handlePrev);
      this.cleanupCallbacks.push(() =>
        prevButton.removeEventListener("click", handlePrev)
      );
    }

    if (nextButton) {
      nextButton.addEventListener("click", handleNext);
      this.cleanupCallbacks.push(() =>
        nextButton.removeEventListener("click", handleNext)
      );
    }
  }

  private readonly cleanupCallbacks: Array<() => void> = [];

  private setupSlider(): BlazeSlider {
    const sliderElement = this.container.querySelector(".testimonial-slider");
    if (!sliderElement) throw new Error("Slider element not found");

    return new BlazeSlider(sliderElement as HTMLElement, {
      all: {
        slidesToShow: 1,
        slideGap: this.config.slideGap,
        loop: true,
        enableAutoplay: true,
        autoplayInterval: this.config.autoplayInterval,
        transitionDuration: this.config.transitionDuration,
        transitionTimingFunction: "cubic-bezier(0.45, 0.1, 0.45, 0.5)",
        draggable: true,
        stopAutoplayOnInteraction: true,
      },
      "(min-width: 768px)": {
        slidesToShow: 2,
        slideGap: "3rem",
        ...this.config.breakpoints?.["(min-width: 768px)"],
      },
    });
  }

  private animateFirstSlide(): void {
    if (this.slides.length > 0) {
      gsap.fromTo(
        this.slides[0],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
        }
      );

      // Add a subtle scale animation to the active slide
      gsap.to(this.slides[0], {
        scale: 1.02,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }

  private playVideo(slide: HTMLElement): void {
    const video = slide.querySelector("video");
    if (video instanceof HTMLVideoElement) {
      video.play().catch((error) => {
        console.warn("Failed to play video:", error);
      });
    }
  }

  private pauseVideo(slide: HTMLElement): void {
    const video = slide.querySelector("video");
    if (video instanceof HTMLVideoElement) {
      video.pause();
    }
  }

  public destroy(): void {
    if (this.isDestroyed) return;

    this.isDestroyed = true;
    this.slider?.destroy();
    this.slider = null;

    // Execute all cleanup callbacks
    this.cleanupCallbacks.forEach((cleanup) => cleanup());
    this.cleanupCallbacks.length = 0;

    // Stop all GSAP animations
    gsap.killTweensOf(this.slides);
  }
}
