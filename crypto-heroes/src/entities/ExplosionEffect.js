import Sprite from '../engine/Sprite.js';

export default class ExplosionEffect {
  constructor(x, y, explosionImage, config = {}) {
    this.x = x;
    this.y = y;
    this.width = config.width || 80;
    this.height = config.height || 80;
    
    // Configuração da animação
    this.sprite = new Sprite(
      explosionImage,
      5, // 5 frames como você mencionou
      config.frameRate || 12, // Frame rate da explosão
      5, // 5 colunas (assumindo que os frames estão em linha)
      1  // 1 linha
    );
    
    // Configurar para animar todos os 5 frames
    this.sprite.setFrameRange([0, 1, 2, 3, 4]);
    
    // Estado da explosão
    this.isActive = true;
    this.isFinished = false;
    this.currentFrame = 0;
    this.animationTime = 0;
    this.totalAnimationTime = config.duration || 500; // 500ms por padrão
    
    // Som da explosão (opcional)
    this.playSound = config.playSound || false;
    this.soundPlayed = false;
  }
  
  update(deltaTime) {
    if (!this.isActive || this.isFinished) return;
    
    // Atualizar sprite
    this.sprite.step(deltaTime);
    
    // Controlar duração da animação
    this.animationTime += deltaTime;
    
    // Verificar se a animação terminou
    if (this.animationTime >= this.totalAnimationTime) {
      this.isFinished = true;
      this.isActive = false;
    }
  }
  
  render(ctx) {
    if (!this.isActive || this.isFinished) return;
    
    // Renderizar a explosão
    this.sprite.draw(ctx, this.x, this.y, this.width, this.height);
  }
  
  // Método para verificar se a explosão terminou
  hasFinished() {
    return this.isFinished;
  }
  
  // Método para obter as coordenadas centralizadas
  static createCenteredExplosion(targetX, targetY, targetWidth, targetHeight, explosionImage, config = {}) {
    const explosionWidth = config.width || 80;
    const explosionHeight = config.height || 80;
    
    // Centralizar a explosão no alvo
    const centeredX = targetX + (targetWidth - explosionWidth) / 2;
    const centeredY = targetY + (targetHeight - explosionHeight) / 2;
    
    return new ExplosionEffect(centeredX, centeredY, explosionImage, config);
  }
}
