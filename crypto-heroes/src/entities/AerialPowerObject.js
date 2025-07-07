import Sprite from '../engine/Sprite.js';

// Projétil que cai do céu (ataque especial do boss)
export default class AerialPowerObject {
  constructor(assets, x, y) {
    this.assets = assets;
    
    // Usar sprite do poder inimigo
    this.sprite = new Sprite(assets.images['power_enemy'], 1, 1);
    
    // Posição inicial (no topo da tela)
    this.x = x;
    this.y = y; // Começa no topo
    this.speed = 300; // Velocidade de queda
    this.active = true;
    this.lifeTime = 5000; // 5 segundos
    this.timer = 0;
    this.damage = 30; // Dano do ataque aéreo
    
    // Efeito visual
    this.glowIntensity = 0;
    this.glowDirection = 1;
  }
  
  update(dt) {
    if (!this.active) return;
    
    // Cair verticalmente
    this.y += this.speed * dt / 1000;
    
    // Atualizar timer
    this.timer += dt;
    if (this.timer >= this.lifeTime) {
      this.active = false;
    }
    
    // Remover se sair da tela pela parte inferior
    if (this.y > 700) { // Altura da tela + margem
      this.active = false;
    }
    
    // Atualizar efeito de brilho
    this.glowIntensity += this.glowDirection * dt / 100;
    if (this.glowIntensity >= 1) {
      this.glowIntensity = 1;
      this.glowDirection = -1;
    } else if (this.glowIntensity <= 0) {
      this.glowIntensity = 0;
      this.glowDirection = 1;
    }
  }
  
  render(ctx) {
    if (!this.active) return;
    
    // Efeito de brilho/aviso
    ctx.save();
    
    // Brilho vermelho
    ctx.shadowColor = 'red';
    ctx.shadowBlur = 10 + (this.glowIntensity * 10);
    
    // Tamanho do projétil
    const width = 40;
    const height = 40;
    
    // Desenhar sprite
    this.sprite.draw(ctx, this.x, this.y, width, height, false);
    
    ctx.restore();
  }
  
  isActive() {
    return this.active;
  }
  
  destroy() {
    this.active = false;
  }
  
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: 40,
      height: 40
    };
  }
}