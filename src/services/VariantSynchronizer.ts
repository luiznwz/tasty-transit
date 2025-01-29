export type VariantChangeListener = (variantId: string, source: string) => void;

const listeners: VariantChangeListener[] = [];

export function addListener(callback: VariantChangeListener) {
    listeners.push(callback);
}

export function removeListener(callback: VariantChangeListener) {
    const index = listeners.indexOf(callback);
    if (index > -1) {
        listeners.splice(index, 1);
    }
}

export function notifyVariantChange(variantId: string, source: string) {
    listeners.forEach(listener => listener(variantId, source));
}