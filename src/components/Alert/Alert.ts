export default class Alert extends HTMLElement {
    private static instance: Alert | null = null;

    constructor() {
        super();
        if (!Alert.instance) {
            Alert.instance = this;
        }

        Alert.instance.addEventListener('click', () => {
            Alert.instance?.setAttribute('hidden', '');
        });
    }

    static loadMessage(message: string, timeout: number = 3000) {
        if (!Alert.instance) return;
        Alert.instance?.removeAttribute('hidden');

        Alert.instance.innerHTML = message;
        setTimeout(() => {
            Alert.instance?.setAttribute('hidden', '');
        }, timeout);
    }
}