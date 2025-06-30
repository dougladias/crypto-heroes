import Sprite from '../engine/Sprite.js';

export default class PowerObject {
  constructor(assets, x, y, direction) {
    this.assets = assets;
    this.sprite = new Sprite(assets.images.power, 1, 1); // Objeto de poder (1 frame)
    
    this.x = x;
    this.y = y;
    this.direction = direction; // 1 = direita, -1 = esquerda
    this.speed = 400; // Velocidade do projétil
    this.active = true;
    this.lifeTime = 3000; // 3 segundos de vida
    this.timer = 0;
    
    console.log(`Objeto de poder criado em (${x}, ${y}) direção: ${direction}`);
  }
  
  update(dt) {
    if (!this.active) return;
    
    // Mover o objeto na direção especificada
    this.x += this.speed * this.direction * dt / 1000;
    
    // Atualizar timer de vida
    this.timer += dt;
    if (this.timer >= this.lifeTime) {
      this.active = false;
      console.log('Objeto de poder expirou');
    }
    
    // Remover se sair da tela (assumindo tela de 800px)
    if (this.x < -50 || this.x > 850) {
      this.active = false;
      console.log('Objeto de poder saiu da tela');
    }
  }
  
  render(ctx) {
    if (!this.active) return;
    
    // Tamanho do objeto de poder
    const width = 80;
    const height = 80;
    
    this.sprite.draw(ctx, this.x, this.y, width, height, this.direction === -1);
  }
  
  // Verificar se ainda está ativo
  isActive() {
    return this.active;
  }
  
  // Destruir o objeto
  destroy() {
    this.active = false;
  }
  
  // Obter bounds para colisão (se necessário no futuro)
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: 32,
      height: 32
    };
  }
}
