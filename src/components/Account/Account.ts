export default class Account extends HTMLElement {
    editAddressButtons: NodeListOf<HTMLElement> | null = null;
    editAddressModals: NodeListOf<HTMLElement> | null = null;
    newAddressModal: HTMLElement | null = null;
    newAddressButton: HTMLElement | null = null;
    overlay: HTMLElement | null = null;
    countrySelect: NodeListOf<HTMLSelectElement> | null = null;
    provinceSelect: NodeListOf<HTMLSelectElement> | null = null;

    constructor() {
        super();
        this.initializeElements();
        this.setupEventListeners();
        this.selectMenuAccount();
        this.initializeFirstItem();
    }

    private initializeElements() {
        this.editAddressButtons = this.querySelectorAll('.edit p');
        this.editAddressModals = this.querySelectorAll('.edit-modal');
        this.newAddressModal = this.querySelector('.new-address-modal');
        this.newAddressButton = this.querySelector('.btn-add-new-address p');
        this.overlay = this.querySelector('.overlay');
        this.countrySelect = this.querySelectorAll('.country-select');
        this.provinceSelect = this.querySelectorAll('.province-select');

        this.countrySelect.forEach(select => {
            this.setupSelectedCountry(select, select.dataset.country || '');
        });
    }

    private setupEventListeners() {
        this.addEventListener('click', this.handleClick.bind(this));
        this.overlay?.addEventListener('click', () => this.closeAllModals());
        this.setupAddressFormSubmission();
        this.setupCountryChangeListeners();
    }

    private handleClick(event: Event) {
        const target = event.target as HTMLElement;
        if (target.closest('.edit p')) {
            this.openModal(event);
        } else if (target.closest('.btn-add-new-address p')) {
            this.openModal(event);
        } else if (target.closest('.close')) {
            const modal = target.closest('.edit-modal, .new-address-modal') as HTMLElement;
            if (modal) this.closeModal(modal);
        } else if (target.closest('.address-delete-form button')) {
            this.handleDeleteAddress(event);
        } else if (target.closest('button[name="address[default]"]')) {
            this.handleSetDefaultAddress(event);
        }
    }

    private setupCountryChangeListeners() {
        this.countrySelect?.forEach(select => {
            select.addEventListener('change', (event) => this.handleCountryChange(event));
        });
    }

    private openModal(event: Event) {
        const target = event.target as HTMLElement;
        const editButton = target.closest('.edit p') as HTMLElement;
        const addressId = editButton?.dataset.addressId;

        let modal: HTMLElement | null = null;

        if (addressId) {
            modal = this.querySelector(`#edit-modal-${addressId}`);
        } else if (target.closest('.btn-add-new-address p')) {
            modal = this.newAddressModal;
        }

        if (modal) {
            modal.classList.add('active');
            this.overlay?.classList.add('active');
            document.querySelector('body')?.classList.add('no-scroll');
        }
    }

    private closeModal(modal: HTMLElement): void {
        modal.classList.remove('active');
        this.checkIfOverlayShouldClose();
    }

    private closeAllModals(): void {
        this.editAddressModals?.forEach(modal => {
            modal.classList.remove('active');
        });
        this.newAddressModal?.classList.remove('active');
        this.overlay?.classList.remove('active');
        document.querySelector('body')?.classList.remove('no-scroll');
    }

    private checkIfOverlayShouldClose(): void {
        if (!this.editAddressModals) return;
        
        const anyModalActive = Array.from(this.editAddressModals).some(modal => modal.classList.contains('active')) || 
                               (this.newAddressModal?.classList.contains('active') ?? false);

        if (!anyModalActive) {
            this.overlay?.classList.remove('active');
            document.querySelector('body')?.classList.remove('no-scroll');
        }
    }

    private handleCountryChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        
        const selectedOption = target.options[target.selectedIndex];
        if (selectedOption) {
            const provinces = selectedOption.dataset.provinces;
            if (provinces) {
                this.updateProvinceSelect(target, JSON.parse(provinces));
            }
        }
    }  

    setupSelectedCountry(select: HTMLSelectElement, country: string) {
        const options = select.options;
        for (let i = 0; i < options.length; i++) {
            const option = options[i];
            if (option.text === country || option.value === country) {
                option.selected = true;
                const provinces = option.dataset.provinces;
                if (provinces) {
                    this.updateProvinceSelect(select, JSON.parse(provinces));
                }
                break;
            }
        }
    }

    updateProvinceSelect(select: HTMLSelectElement, provinces: string[]) {
        const provinceSelect = select.parentElement?.parentElement?.querySelector('.province-select') as HTMLSelectElement;
        if (!provinceSelect) return;

        const selectedProvince = provinceSelect.dataset.provincedefault || '';
    
        provinceSelect.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Selecione';
        provinceSelect.appendChild(defaultOption);

        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province[0];
            option.textContent = province[0];
            option.selected = province[0] === selectedProvince;
            provinceSelect.appendChild(option);
        });

        if (!selectedProvince || !provinceSelect.querySelector(`option[value="${selectedProvince}"]`)) {
            defaultOption.selected = true;
        }
    }

    selectMenuAccount() {
        const menuAccount = document.querySelectorAll('.menu-account-content li');

        menuAccount.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.activateMenuItem(item, index);
            });
        });
    }

    initializeFirstItem() {
        const menuAccount = document.querySelectorAll('.menu-account-content li');
        if (menuAccount.length > 0) {
            this.activateMenuItem(menuAccount[0], 0);
        }
    }

    activateMenuItem(item: Element, index: number) {
        const menuAccount = document.querySelectorAll('.menu-account-content li');
        menuAccount.forEach(item => item.classList.remove('active'));
        item.classList.add('active');

        const textItem = item.textContent || item.querySelector('a')?.textContent || '';
        this.titleMenuSelected(textItem);

        if (index === 3) {
            this.showLoading();
            setTimeout(() => {
                this.hideLoading();
                this.showContentMenuSelected(index);
            }, 1000);
        } else {
            this.showContentMenuSelected(index);
        }
    }

    titleMenuSelected(textItem: string) {
        const titleMenuSelected = document.querySelector('.container-header .title-header') as HTMLElement;
        if (titleMenuSelected) {
            this.animateTitleChange(titleMenuSelected, textItem);
        }
    }

    animateTitleChange(titleElement: HTMLElement, newText: string) {
        titleElement.classList.add('fade-out');

        setTimeout(() => {
            titleElement.textContent = newText;
            titleElement.classList.remove('fade-out');
            titleElement.classList.add('fade-in');

            setTimeout(() => {
                titleElement.classList.remove('fade-in');
            }, 300);
        }, 300);
    }

    showLoading() {
        const loadingElement = document.querySelector('.container-info .loading-back') as HTMLElement;
        if (loadingElement) {
            loadingElement.classList.add('active');
        }
    }

    hideLoading() {
        const loadingElement = document.querySelector('.container-info .loading-back') as HTMLElement;
        if (loadingElement) {
            loadingElement.classList.remove('active');
        }
    }

    showContentMenuSelected(index: number) {
        const contentMenuSelected = document.querySelector('.show-content') as HTMLElement;
        if (contentMenuSelected) {
            const contentMenu = Array.from(contentMenuSelected.children).filter(child => !child.classList.contains('loading-back'));

            contentMenu.forEach((content, i) => {
                if (i === index) {
                    (content as HTMLElement).classList.add('active');
                } else {
                    (content as HTMLElement).classList.remove('active');
                }
            });
        }
    }

    private setupAddressFormSubmission() {
        const addressForms = this.querySelectorAll('form[action^="/account/addresses"]');
        addressForms.forEach(form => {
            form.addEventListener('submit', this.handleAddressFormSubmit.bind(this));
        });
    }

    private async handleAddressFormSubmit(event: Event) {
        event.preventDefault();
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const url = form.action;
        const method = form.method;

        try {
            const response = await fetch(url, {
                method: method,
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                await this.updateAddressList();
                this.closeAllModals();
                this.showSuccessMessage('Endereço atualizado com sucesso!');
            } else {
                throw new Error('Falha ao atualizar o endereço');
            }
        } catch (error) {
            console.error('Erro ao atualizar endereço:', error);
            this.showErrorMessage('Ocorreu um erro ao atualizar o endereço. Por favor, tente novamente.');
        }
    }

    private async handleDeleteAddress(event: Event) {
        event.preventDefault();
        const button = event.target as HTMLElement;
        const form = button.closest('form') as HTMLFormElement;
        if (!form) return;

        if (confirm('Tem certeza de que deseja excluir este endereço?')) {
            try {
                const response = await fetch(form.action, {
                    method: 'DELETE',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (response.ok) {
                    await this.updateAddressList();
                    this.showSuccessMessage('Endereço excluído com sucesso!');
                } else {
                    const responseText = await response.text();
                    console.warn(`Resposta inesperada ao excluir endereço: ${response.status} ${responseText}`);
                    await this.updateAddressList();
                    this.showWarningMessage('A exclusão pode ter sido bem-sucedida, mas houve uma resposta inesperada do servidor. A lista de endereços foi atualizada.');
                }
            } catch (error) {
                console.error('Erro ao excluir endereço:', error);
                await this.updateAddressList();
                this.showErrorMessage('Ocorreu um erro ao excluir o endereço. A lista de endereços foi atualizada para verificar as alterações.');
            }
        }
    }

    private async handleSetDefaultAddress(event: Event) {
        event.preventDefault();
        const button = event.target as HTMLElement;
        const form = button.closest('form') as HTMLFormElement;
        if (!form) return;

        try {
            const formData = new FormData(form);
            formData.append('address[default]', 'true');

            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (response.ok) {
                await this.updateAddressList();
                this.closeAllModals();
                this.showSuccessMessage('Endereço definido como padrão com sucesso!');
            } else {
                throw new Error('Falha ao definir o endereço como padrão');
            }
        } catch (error) {
            console.error('Erro ao definir endereço como padrão:', error);
            this.showErrorMessage('Ocorreu um erro ao definir o endereço como padrão. Por favor, tente novamente.');
        }
    }

    private async updateAddressList() {
        try {
            const response = await fetch('/account?view=addresses');
            if (response.ok) {
                const html = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newAddressList = doc.querySelector('.container-adress-details-content');
                if (newAddressList) {
                    const currentAddressList = this.querySelector('.container-adress-details-content');
                    if (currentAddressList) {
                        currentAddressList.innerHTML = newAddressList.innerHTML;
                        this.initializeElements();
                        this.setupAddressFormSubmission();
                        this.setupCountryChangeListeners();
                    } else {
                        console.error('Elemento .container-adress-details-content não encontrado no DOM atual');
                    }
                } else {
                    console.error('Novo conteúdo de endereços não encontrado na resposta');
                }
            } else {
                console.warn(`Falha ao buscar a lista de endereços: ${response.status}`);
                if (confirm('Não foi possível atualizar a lista de endereços. Deseja recarregar a página?')) {
                    window.location.reload();
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar a lista de endereços:', error);
            if (confirm('Ocorreu um erro ao atualizar a lista de endereços. Deseja recarregar a página?')) {
                window.location.reload();
            }
        }
    }

    private showSuccessMessage(message: string) {
        console.log(message);
        alert(message);
    }

    private showErrorMessage(message: string) {
        console.error(message);
        alert(message);
    }

    private showWarningMessage(message: string) {
        console.warn(message);
        alert(message);
    }
}