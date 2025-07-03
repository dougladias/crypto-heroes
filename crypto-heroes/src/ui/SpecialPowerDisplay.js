
// Exibe a barra de progresso do poder especial do jogador
// e indica quando o poder está disponível para uso
export default class SpecialPowerDisplay {
  constructor(ctx, assets) {
    this.ctx = ctx;
    this.assets = assets;
    
    // Posição embaixo das vidas (lado esquerdo)
    this.x = 20;
    this.y = 80; 
    this.width = 200;
    this.height = 15;
  }
  
  // Método para atualizar a posição da barra
  render(ctx, player) {
    const specialStatus = player.getSpecialPowerStatus();
    const progress = specialStatus.progress / specialStatus.needed;
    
    // Fundo da barra
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    if (specialStatus.available) {
      // Poder disponível - barra laranja piscando
      const isBlinking = Math.floor(Date.now() / 300) % 2;
      ctx.fillStyle = isBlinking ? '#FF8C00' : '#FFA500';
      ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
    } else {

      // Barra verde do progresso
      ctx.fillStyle = '#00FF00';
      const barWidth = (this.width - 4) * progress;
      ctx.fillRect(this.x + 2, this.y + 2, barWidth, this.height - 4);
    }

    // Borda da barra
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}
