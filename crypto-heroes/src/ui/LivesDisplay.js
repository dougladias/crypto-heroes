// Exibe as vidas restantes do herói com ícones personalizados
export default class LivesDisplay {

  // Construtor da classe LivesDisplay
  // Recebe o contexto do canvas, os assets e o ID do herói
  constructor(ctx, assets, heroId) {
    this.ctx = ctx;
    this.assets = assets;
    this.heroId = heroId;
    this.maxLives = 5;
    this.currentLives = 5;
    
    // Configurações visuais
    this.iconSize = 32;
    this.spacing = 40;
    this.x = 20; 
    this.y = 20; 
    
    // Cores
    this.activeColor = '#00FF00';   
    this.lostColor = '#FF0000';     
    this.shadowColor = '#000000';
  }
  
  // Métodos para manipular as vidas  
  loseLife() {
    if (this.currentLives > 0) {
      this.currentLives--;      
      return this.currentLives === 0; 
    }
    return false;
  }
  
  // Método para ganhar uma vida (novo)
  gainLife() {
    if (this.currentLives < this.maxLives) {
      // Se não está com vidas cheias, restaura uma vida perdida
      this.currentLives++;
      console.log(`💚 Vida restaurada! Vidas atuais: ${this.currentLives}/${this.maxLives}`);
      return false; // Não é vida extra
    } else {
      // Se já está com vidas cheias, ganha uma vida extra
      this.currentLives++;
      this.maxLives++; // Aumenta o máximo também
      console.log(`⭐ Vida EXTRA ganha! Vidas atuais: ${this.currentLives}/${this.maxLives}`);
      return true; // É vida extra
    }
  }
  
  // Método para restaurar as vidas do herói
  resetLives() {
    this.currentLives = this.maxLives;    
  }
  
  // Método para definir o número máximo de vidas
  getCurrentLives() {
    return this.currentLives;
  }
  
  // Método para verificar se o jogo acabou
  isGameOver() {
    return this.currentLives <= 0;
  }
  
  // Renderiza as vidas no canvas
  render(ctx) {
    // Obter o ícone do herói
    const heroIcon = this.assets.images[`hero_${this.heroId}`];
    
    // Verificar se o ícone do herói existe
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
      
      // Resetar sombra
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
