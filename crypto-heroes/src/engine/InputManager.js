export default class InputManager{
  #keys = new Map();
  #pressed = new Map();
  
  constructor(){
    window.addEventListener('keydown', e => this.#set(e.key, true));
    window.addEventListener('keyup',   e => this.#set(e.key, false));
  }  #alias(k){
    return {
      a:'Left', ArrowLeft:'Left',
      d:'Right',ArrowRight:'Right',
      w:'Up',   ArrowUp:'Up',
      s:'Down', ArrowDown:'Down',
      ' ':'Jump', z:'Jump', 
      Enter:'Action',
      x:'Punch',  c:'Power',
      e:'Punch',  f:'Power'
    }[k];
  }#set(k,val){
    const key = this.#alias(k);
    if(key) {
      const wasDown = this.#keys.get(key);
      this.#keys.set(key, val);
      
      // Detectar nova pressão (não estava pressionada e agora está)
      if(!wasDown && val) {
        this.#pressed.set(key, true);
      }
    }
  }
  
  isDown(k){ return !!this.#keys.get(k); }
  
  // Método para detectar se uma tecla foi pressionada neste frame
  wasPressed(k) {
    const pressed = this.#pressed.get(k);
    this.#pressed.set(k, false); // Reset após verificar
    return !!pressed;
  }
}
