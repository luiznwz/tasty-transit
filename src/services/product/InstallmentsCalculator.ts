export function calculateInstallments(installmentContent: HTMLElement | null) {
    if (!installmentContent) return;

    const priceString = installmentContent.dataset.price?.replace(/[^\d]/g, '') || '0';
    const price = Number(priceString) / 100;

    const maxInstallments = Number(installmentContent.dataset.installmentsCount) || 1;
    const minInstallmentPrice = Number(installmentContent.dataset.installmentsMinPrice) || 0;
    const showInterestFree = installmentContent.dataset.showInterestFree === 'true';

    const installments = Math.min(Math.floor(price / (minInstallmentPrice / 100)), maxInstallments);

    if (installments <= 1 || price <= 0) {
        installmentContent.textContent = '';
        return;
    }

    const installmentPrice = price / installments;
    const formatter = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    installmentContent.textContent = `em até ${installments}x de ${formatter.format(installmentPrice)}` +
        (showInterestFree && price >= (minInstallmentPrice / 100) * installments ? ' sem juros' : '');
}