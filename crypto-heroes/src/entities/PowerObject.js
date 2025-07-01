import Sprite from '../engine/Sprite.js';

export default class PowerObject {
  constructor(assets, x, y, direction) {
    this.assets = assets;
    this.sprite = new Sprite(assets.images.power, 1, 1); // Objeto de poder (1 frame)
    
    this.x = x;
    this.y = y;
    this.direction = direction; // 1 = direita, -1 = esquerda
    this.speed = 500; // Velocidade do projétil
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
    
    // ✨ CORREÇÃO IMPORTANTE: O poder deve aparecer na mesma altura do personagem
    // Usar exatamente o mesmo cálculo que o personagem usa para renderização
    const groundY = ctx.canvas.height - 60; // Mesma base que os personagens
    const renderY = groundY - this.y; // Mesma fórmula que o personagem, SEM offset adicional
    
    // Tamanho do objeto de poder
    const width = 35;
    const height = 35;
    
    this.sprite.draw(ctx, this.x, renderY, width, height, this.direction === -1);
    
    // ✨ DEBUG: Log da posição para verificar (apenas os primeiros segundos)
    if (this.timer < 1000) { // Só logar no primeiro segundo
      console.log(`🔥 Power render: Físico(${this.x}, ${this.y}) -> Tela(${this.x}, ${renderY}) | GroundY: ${groundY}`);
    }
  }
  
  // Verificar se ainda está ativo
  isActive() {
    return this.active;
  }
  
  // Destruir o objeto
  destroy() {
    this.active = false;
  }  // Obter bounds para colisão
  getBounds(ctx = null) {
    // Usar o mesmo sistema de coordenadas dos inimigos
    // Inimigos usam: groundY = screenHeight - 330
    const canvasHeight = ctx ? ctx.canvas.height : 600;
    const groundY = canvasHeight - 330; // Mesmo que os inimigos
    
    // Para PowerObject, o y é relativo ao chão, então a posição real é groundY + this.y
    const realY = groundY + this.y;
    
    return {
      x: this.x,
      y: realY,
      width: 35,
      height: 35
    };
  }
}
