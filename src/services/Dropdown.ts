export function toggleDropdown(dropdown: HTMLElement): void {
    if (dropdown.hasAttribute('closed')) return openDropdown(dropdown);
    closeDropdown(dropdown);
}

function openDropdown(dropdown: HTMLElement): void {
    dropdown.style.height = '0px';
    dropdown.removeAttribute('closed');
    const height = dropdown.scrollHeight;
    dropdown.style.height = height + 'px';

    dropdown.addEventListener('transitionend', () => {
        dropdown.style.height = 'auto';
    }, { once: true });
}

export function closeDropdown(dropdown: HTMLElement): void {
    const height = dropdown.scrollHeight;
    dropdown.style.height = height + 'px';
    dropdown.offsetHeight;
    dropdown.style.height = '0px';
    dropdown.setAttribute('closed', '');

    dropdown.addEventListener('transitionend', () => {
        dropdown.style.height = '';
    }, { once: true });
}