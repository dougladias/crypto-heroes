export default class ScoreDisplay {
  constructor(ctx) {
    this.ctx = ctx;
    this.score = 0;
    this.x = 0;
    this.y = 0;
    this.fontSize = 24;
    this.fontFamily = 'Arial, sans-serif';
    this.textColor = '#00FF00'; // Verde neon para combinar com o tema cyberpunk
    this.shadowColor = '#000000';
    this.shadowBlur = 3;
    
    // Configurar posição centralizada no topo
    this.updatePosition();
  }
  
  updatePosition() {
    if (this.ctx && this.ctx.canvas) {
      this.x = this.ctx.canvas.width / 2;
      this.y = 40; // 40px do topo
    }
  }
  
  updateScore(newScore) {
    this.score = newScore;
  }
  
  render(ctx) {
    // Garantir que a posição está atualizada
    this.updatePosition();
    
    // Configurar estilo do texto
    ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Adicionar sombra para melhor legibilidade
    ctx.shadowColor = this.shadowColor;
    ctx.shadowBlur = this.shadowBlur;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Desenhar o texto da pontuação
    ctx.fillStyle = this.textColor;
    ctx.fillText(`PONTOS: ${this.score}`, this.x, this.y);
    
    // Resetar configurações de sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
  
  // Método para customizar a aparência (útil para ajustes)
  setStyle(options = {}) {
    if (options.fontSize) this.fontSize = options.fontSize;
    if (options.fontFamily) this.fontFamily = options.fontFamily;
    if (options.textColor) this.textColor = options.textColor;
    if (options.shadowColor) this.shadowColor = options.shadowColor;
    if (options.shadowBlur) this.shadowBlur = options.shadowBlur;
  }
  
  // Método para reposicionar (caso queira mudar a posição)
  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }
}
