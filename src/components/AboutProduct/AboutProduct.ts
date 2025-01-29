export default class AboutProduct extends HTMLElement {
    options: NodeListOf<HTMLElement>;
    contents: NodeListOf<HTMLElement>;
    images: NodeListOf<HTMLImageElement>;
    titles: NodeListOf<HTMLElement>;

    constructor() {
        super();

        this.options = this.querySelectorAll('.option');
        this.contents = this.querySelectorAll('.container-container-content-option-texts-main');
        this.images = this.querySelectorAll('.image');
        this.titles = this.querySelectorAll('.title_option');

        if (this.options.length > 0) {
            this.options[0].classList.add('active');
            this.showContent(1);
            this.showImage(1);
            this.showTitle(1);
        }

        this.options.forEach(option => {
            option.addEventListener('click', this.handleOptionClick.bind(this));
        });
    }

    handleOptionClick(event: MouseEvent) {
        const target = event.currentTarget as HTMLElement;
        const index = parseInt(target.getAttribute('data-option-index-forloop') || '1');

        this.options.forEach(option => option.classList.remove('active'));

        target.classList.add('active');

        this.showContent(index);
        this.showImage(index);
        this.showTitle(index);
    }

    showContent(index: number) {
        this.contents.forEach(content => content.classList.add('hidden'));

        this.contents.forEach(content => {
            const contentIndex = parseInt(content.getAttribute('data-content-index-forloop') || '0');
            if (contentIndex === index) {
                content.classList.remove('hidden');
            }
        });
    }

    showImage(index: number) {
        this.images.forEach(image => image.classList.add('hidden'));

        this.images.forEach(image => {
            const imageIndex = parseInt(image.getAttribute('data-image-index-forloop') || '0');
            if (imageIndex === index) {
                image.classList.remove('hidden');
            }
        });
    }

    showTitle(index: number) {
        this.titles.forEach(title => title.classList.add('hidden'));

        this.titles.forEach(title => {
            const titleIndex = parseInt(title.getAttribute('data-content-index-forloop') || '0');
            if (titleIndex === index) {
                title.classList.remove('hidden');
            }
        });
    }
}