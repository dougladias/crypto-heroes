export default class InputManager{
  #keys = new Map();
  constructor(){
    window.addEventListener('keydown', e => this.#set(e.key, true));
    window.addEventListener('keyup',   e => this.#set(e.key, false));
  }  #alias(k){
    return {
      a:'Left', ArrowLeft:'Left',
      d:'Right',ArrowRight:'Right',
      w:'Up',   ArrowUp:'Up',
      s:'Down', ArrowDown:'Down',
      ' ':'Action', z:'Action'
    }[k];
  }
  #set(k,val){
    const key = this.#alias(k);
    if(key) this.#keys.set(key, val);
  }
  isDown(k){ return !!this.#keys.get(k); }
}
