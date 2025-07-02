import Sprite from '../engine/Sprite.js';

// Classe BossPowerObject representa um poder especial que o boss atira no jogador
// É similar ao PowerObject mas vai na direção do jogador e causa dano
export default class BossPowerObject {
  constructor(assets, x, y, targetX, targetY) {
    this.assets = assets;
    
    // Usar o sprite power-enemy para o poder do boss
    this.sprite = new Sprite(assets.images['power_enemy'], 1, 1);
    
    // Posição inicial
    this.x = x;
    this.y = y;
    
    // Calcular direção para o alvo (jogador)
    const deltaX = targetX - x;
    const deltaY = targetY - y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Normalizar direção
    this.directionX = deltaX / distance;
    this.directionY = deltaY / distance;
      // Configurações
    this.speed = 200; // Velocidade mais lenta para ser mais visível
    this.active = true;
    this.lifeTime = 5000; // 5 segundos de vida (mais tempo)
    this.timer = 0;
    this.damage = 25; // Dano que causa no jogador
    this.width = 50;  // Tamanho maior para ser mais visível
    this.height = 50;
  }
    // Atualizar o poder do boss
  update(dt) {
    if (!this.active) return;
    
    // Mover na direção do alvo
    const moveX = this.speed * this.directionX * dt / 1000;
    const moveY = this.speed * this.directionY * dt / 1000;
    
    this.x += moveX;
    this.y += moveY;
    
    // Log de movimento a cada 1 segundo aproximadamente
    this.timer += dt;
    if (this.timer % 1000 < dt) { // Log aproximadamente a cada 1 segundo
      console.log(`💨 Poder do boss movendo: pos(${this.x.toFixed(0)}, ${this.y.toFixed(0)}) direção(${this.directionX.toFixed(2)}, ${this.directionY.toFixed(2)})`);
    }
    
    // Verificar tempo de vida
    if (this.timer >= this.lifeTime) {
      console.log('⏰ Poder do boss expirou por tempo');
      this.active = false;      
    }
    
    // Remover se sair muito da tela 
    if (this.x < -100 || this.x > 1000 || this.y < -100 || this.y > 700) {
      console.log('🚫 Poder do boss saiu da tela');
      this.active = false;      
    }
  }
  
  // Renderizar o poder do boss
  render(ctx) {
    if (!this.active) return;
    
    // Desenhar o sprite
    this.sprite.draw(ctx, this.x, this.y, this.width, this.height);
    
    // Efeito visual extra (brilho roxo para indicar que é perigoso)
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#8b00ff'; // Roxo
    ctx.beginPath();
    ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2 + 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  // Verificar se está ativo
  isActive() {
    return this.active;
  }
  
  // Destruir o poder
  destroy() {
    this.active = false;
  }
  
  // Obter bounds para colisão
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
  
  // Obter dano que causa
  getDamage() {
    return this.damage;
  }
}
