import { toggleDropdown } from "@/services/Dropdown";

export default class Footer extends HTMLElement {
    headingLinks: NodeListOf<HTMLElement>;

    constructor() {
        super();
        this.headingLinks = this.querySelectorAll('.heading-links');

        this.headingLinks.forEach(headingLink => {
            headingLink.addEventListener('click', () => {
                const dropdown = headingLink.nextElementSibling as HTMLElement;
                toggleDropdown(dropdown);
            });
        } );
    }
}
