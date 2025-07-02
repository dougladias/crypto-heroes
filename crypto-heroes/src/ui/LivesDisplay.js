export default class LivesDisplay {
  constructor(ctx, assets, heroId) {
    this.ctx = ctx;
    this.assets = assets;
    this.heroId = heroId;
    this.maxLives = 5;
    this.currentLives = 5;
    
    // Configurações visuais
    this.iconSize = 32;
    this.spacing = 40;
    this.x = 20; // Posição à esquerda
    this.y = 20; // Posição no topo
    
    // Cores
    this.activeColor = '#00FF00';   // Verde para vidas ativas
    this.lostColor = '#FF0000';     // Vermelho para vidas perdidas
    this.shadowColor = '#000000';
  }
  
  loseLife() {
    if (this.currentLives > 0) {
      this.currentLives--;      
      return this.currentLives === 0; // Retorna true se game over
    }
    return false;
  }
  
  resetLives() {
    this.currentLives = this.maxLives;    
  }
  
  getCurrentLives() {
    return this.currentLives;
  }
  
  isGameOver() {
    return this.currentLives <= 0;
  }
  
  render(ctx) {
    // Obter o ícone do herói
    const heroIcon = this.assets.images[`hero_${this.heroId}`];
    
    if (!heroIcon) {
      console.warn(`Ícone do herói não encontrado: hero_${this.heroId}`);
      this.renderFallbackIcons(ctx);
      return;
    }
    
    // Renderizar cada vida
    for (let i = 0; i < this.maxLives; i++) {
      const iconX = this.x + (i * this.spacing);
      const iconY = this.y;
      
      // Configurar opacidade baseada no estado da vida
      const isActive = i < this.currentLives;
      ctx.globalAlpha = isActive ? 1.0 : 0.3;
      
      // Adicionar sombra
      ctx.shadowColor = this.shadowColor;
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Desenhar ícone do herói
      ctx.drawImage(
        heroIcon,
        iconX,
        iconY,
        this.iconSize,
        this.iconSize
      );
      
      // Resetar configurações de sombra
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }
    
    // Resetar opacidade
    ctx.globalAlpha = 1.0;
  }
  
  renderFallbackIcons(ctx) {
    // Fallback: renderizar círculos se não tiver ícone
    for (let i = 0; i < this.maxLives; i++) {
      const iconX = this.x + (i * this.spacing) + (this.iconSize / 2);
      const iconY = this.y + (this.iconSize / 2);
      
      ctx.save();
      
      // Sombra
      ctx.shadowColor = this.shadowColor;
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Desenhar círculo
      ctx.beginPath();
      ctx.arc(iconX, iconY, this.iconSize / 2 - 2, 0, 2 * Math.PI);
      ctx.fillStyle = i < this.currentLives ? this.activeColor : this.lostColor;
      ctx.fill();
      
      // Borda
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      ctx.restore();
    }
  }
  
  // Método para customizar posição (útil para ajustes)
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
  
  // Método para customizar espaçamento
  setSpacing(spacing) {
    this.spacing = spacing;
  }
}
