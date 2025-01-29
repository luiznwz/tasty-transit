export default class DescriptionSEO extends HTMLElement {
    dropdownElement: HTMLElement | null
    arrowDown: HTMLElement | null

    constructor() {
        super();

        this.dropdownElement = this.querySelector('.description_seo__content')
        this.arrowDown = this.querySelector('.description_seo__arrow')
        this.initEventListeners()
    }

    private initEventListeners(): void {
        this.addListener(this.arrowDown, 'click', this.toggleDropdown)
    }

    private addListener(element: HTMLElement | null, event: string, handler: EventListener): void {
        element?.addEventListener(event, handler.bind(this))
    }

    private toggleDropdown(event: Event): void {
        if(!this.dropdownElement) return
        const isClosed = this.dropdownElement?.hasAttribute('closed')

        if (isClosed) {
            this.openDropdown(this.dropdownElement)
        } else {
            this.closeDropdown(this.dropdownElement)
        }
    }

    private openDropdown(dropdown: HTMLElement): void {
        dropdown.style.height = '0px'
        dropdown.removeAttribute('closed')
        const height = dropdown.scrollHeight
        dropdown.style.height = height + 'px'

        dropdown.addEventListener('transitionend', () => {
            dropdown.style.height = 'auto'
        }, { once: true })
    }

    private closeDropdown(dropdown: HTMLElement): void {
        const height = dropdown.scrollHeight
        dropdown.style.height = height + 'px'
        dropdown.offsetHeight
        dropdown.style.height = '0px'
        dropdown.setAttribute('closed', '')

        dropdown.addEventListener('transitionend', () => {
            dropdown.style.height = ''
        }, { once: true })
    }
}