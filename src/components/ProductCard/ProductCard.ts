import { calculateInstallments } from "@/services/product/InstallmentsCalculator";

export default class ProductCard extends HTMLElement {
    installment: HTMLElement | null;

    constructor() {
        super();

        this.installment = this.querySelector('.info_installment');
    
        calculateInstallments(this.installment as HTMLElement);
    }
}
