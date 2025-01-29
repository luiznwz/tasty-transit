export default class ArticleComponent extends HTMLElement {
    articleBody: HTMLElement | null;

    constructor() {
        super();
        this.articleBody = this.querySelector('.article_body');
    }

    connectedCallback() {
        if (this.articleBody) {
            this.wrapConsecutiveImages();
        }
    }

    wrapConsecutiveImages() {
        const images = Array.from(this.articleBody.querySelectorAll('img'));
        const toWrap: { images: HTMLImageElement[] }[] = [];
        let consecutiveImages: HTMLImageElement[] = [];

        images.forEach((img, index) => {
            consecutiveImages.push(img);

            const nextElement = images[index + 1];
            const isNextConsecutive = nextElement && nextElement.previousElementSibling === img;

            if (!isNextConsecutive || index === images.length - 1) {
                if (consecutiveImages.length === 2 || consecutiveImages.length === 3) {
                    toWrap.push({ images: [...consecutiveImages] });
                }
                consecutiveImages = [];
            }
        });

        toWrap.forEach(({ images }) => {
            const wrapper = document.createElement('div');
            wrapper.className = images.length === 2 ? 'grid_two' : 'grid_three';

            images[0].parentNode.insertBefore(wrapper, images[0]);
            images.forEach(img => wrapper.appendChild(img));
        });
    }
}