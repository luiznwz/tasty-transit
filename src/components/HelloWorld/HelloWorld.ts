export default class HelloWorld extends window.HTMLElement {
  button: HTMLButtonElement | null;
  output: any;

  constructor () {
    super()

    this.button = this.querySelector('button')
    this.output = this.querySelector('output')
    if (!this.button) return

    this.button.addEventListener('click', () => {
      this.output.innerHTML = String(++this.output.value)
      console.log('oi')
    })
  }
}
