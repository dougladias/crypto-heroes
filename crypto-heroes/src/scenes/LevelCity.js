import Player from '../entities/Player.js';
import AssetLoader from '../engine/AssetLoader.js';

export default class LevelCity{
  constructor(manager, heroId){
    this.mgr  = manager;
    this.player = new Player(manager.assets, heroId);
    
    // Tocar som quando entrar na arena de luta
    AssetLoader.playSound(this.mgr.assets.sounds.crowd, 0.4);
  }
  update(dt,input){ 
    this.player.update(dt,input); 
  }
  render(ctx){ 
    // Desenhar fundo da cidade
    const cityBg = this.mgr.assets.images.city;
    if(cityBg && cityBg.complete && cityBg.naturalWidth > 0){
      // Escalar a imagem para cobrir toda a tela
      const scaleX = ctx.canvas.width / cityBg.width;
      const scaleY = ctx.canvas.height / cityBg.height;
      const scale = Math.max(scaleX, scaleY);
      
      const scaledWidth = cityBg.width * scale;
      const scaledHeight = cityBg.height * scale;
      const x = (ctx.canvas.width - scaledWidth) / 2;
      const y = (ctx.canvas.height - scaledHeight) / 2;
      
      ctx.drawImage(cityBg, x, y, scaledWidth, scaledHeight);
    } else {
      // Fallback: gradiente azul escuro
      const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      gradient.addColorStop(0, '#001122');
      gradient.addColorStop(1, '#003366');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    
    // Desenhar o player
    this.player.render(ctx); 
  }
}
