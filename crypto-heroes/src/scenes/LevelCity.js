import Player from '../entities/Player.js';
import AssetLoader from '../engine/AssetLoader.js';

export default class LevelCity{
  constructor(manager, heroId){
    this.mgr  = manager;
    this.player = new Player(manager.assets, heroId);
    
    // Lista de cenários disponíveis
    this.backgrounds = ['desert', 'night', 'light'];
    
    // Selecionar um cenário aleatório para esta partida
    this.currentBackground = this.backgrounds[Math.floor(Math.random() * this.backgrounds.length)];
    
    console.log(`Cenário selecionado: ${this.currentBackground}`);
    
    // Tocar som quando entrar na arena de luta
    AssetLoader.playSound(this.mgr.assets.sounds.crowd, 0.4);
  }
  update(dt,input){ 
    this.player.update(dt,input); 
  }  render(ctx){ 
    // Desenhar fundo baseado no cenário selecionado
    const currentBg = this.mgr.assets.images[this.currentBackground];
    if(currentBg && currentBg.complete && currentBg.naturalWidth > 0){
      // Escalar a imagem para cobrir toda a tela
      const scaleX = ctx.canvas.width / currentBg.width;
      const scaleY = ctx.canvas.height / currentBg.height;
      const scale = Math.max(scaleX, scaleY);
      
      const scaledWidth = currentBg.width * scale;
      const scaledHeight = currentBg.height * scale;
      const x = (ctx.canvas.width - scaledWidth) / 2;
      const y = (ctx.canvas.height - scaledHeight) / 2;
      
      ctx.drawImage(currentBg, x, y, scaledWidth, scaledHeight);
    } else {
      // Fallback: gradiente baseado no cenário
      this.drawFallbackBackground(ctx);
    }
    
    // Desenhar o player
    this.player.render(ctx); 
  }
  
  drawFallbackBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    
    // Gradientes diferentes para cada cenário
    switch(this.currentBackground) {
      case 'desert':
        gradient.addColorStop(0, '#F4A460');
        gradient.addColorStop(1, '#D2691E');
        break;
      case 'night':
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(1, '#003366');
        break;
      case 'light':
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#4682B4');
        break;
      default:
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(1, '#003366');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
}
