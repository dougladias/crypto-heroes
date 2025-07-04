import ExplosionEffect from './ExplosionEffect.js';

export default class ExplosionManager {
  constructor(explosionImage, soundManager = null) {
    this.explosionImage = explosionImage;
    this.soundManager = soundManager;
    this.explosions = [];
  }
    // Criar uma nova explosão
  createExplosion(x, y, config = {}) {
    const explosion = new ExplosionEffect(x, y, this.explosionImage, config);
    this.explosions.push(explosion);
    
    // Tocar som se disponível
    if (this.soundManager && this.soundManager.punch) {
      try {
        this.soundManager.punch.play();
      } catch (e) {
        console.log('Erro ao tocar som de explosão:', e);
      }
    }
    
    return explosion;
  }
  
  // Criar explosão centralizada em um alvo
  createCenteredExplosion(targetX, targetY, targetWidth, targetHeight, config = {}) {
    const explosion = ExplosionEffect.createCenteredExplosion(
      targetX, targetY, targetWidth, targetHeight, 
      this.explosionImage, config
    );
    this.explosions.push(explosion);
      // Tocar som se disponível
    if (this.soundManager && this.soundManager.punch) {
      try {
        this.soundManager.punch.play();
      } catch (e) {
        console.log('Erro ao tocar som de explosão:', e);
      }
    }
    
    return explosion;
  }
  
  // Atualizar todas as explosões
  update(deltaTime) {
    // Atualizar explosões ativas
    for (let i = 0; i < this.explosions.length; i++) {
      this.explosions[i].update(deltaTime);
    }
    
    // Remover explosões que terminaram
    this.explosions = this.explosions.filter(explosion => !explosion.hasFinished());
  }
  
  // Renderizar todas as explosões
  render(ctx) {
    for (let i = 0; i < this.explosions.length; i++) {
      this.explosions[i].render(ctx);
    }
  }
  
  // Limpar todas as explosões
  clear() {
    this.explosions = [];
  }
  
  // Obter número de explosões ativas
  getActiveExplosionsCount() {
    return this.explosions.length;
  }
}
