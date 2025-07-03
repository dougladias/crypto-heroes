export default class InputManager{
  #keys = new Map();
  #pressed = new Map();
  
  constructor(){
    window.addEventListener('keydown', e => this.#set(e.key, true));
    window.addEventListener('keyup',   e => this.#set(e.key, false));
      // Adicionar suporte para mouse
    this.mouseX = 0;
    this.mouseY = 0;
    
    window.addEventListener('mousemove', e => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
    
    window.addEventListener('mousedown', e => {
      if (e.button === 0) { // Botão esquerdo
        this.#set('Click', true);
      }
    });
    
    window.addEventListener('mouseup', e => {
      if (e.button === 0) { // Botão esquerdo
        this.#set('Click', false);
      }
    });
  }  #alias(k){
    return {
      a:'Left', ArrowLeft:'Left',
      d:'Right',ArrowRight:'Right',
      w:'Up',   ArrowUp:'Up',
      s:'Down', ArrowDown:'Down',
      ' ':'Jump', z:'Jump',  
      'Enter':'Action',       
      'Escape':'Escape',     
      x:'Punch',  c:'Power',
      e:'Punch',  f:'Power',
      q:'SpecialPower', Q:'SpecialPower',  
      'Click':'Click'        
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
