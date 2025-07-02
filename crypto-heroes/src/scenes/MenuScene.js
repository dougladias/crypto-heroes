import LevelCity from './LevelCity.js';
import AssetLoader from '../engine/AssetLoader.js';

// Cena de menu para escolher o herói
export default class MenuScene {  constructor(manager){
    this.mgr   = manager;
    this.list  = ['gbrl','gusd','geur','btc','eth'];
    this.cols  = 2;              
    this.index = 0;              
    this.w     = 128;            
    this.h     = 128;
    
    // ✨ Mapeamento dos IDs para nomes das criptomoedas
    this.heroNames = {
      'gbrl': 'GLOBOO REAL',
      'gusd': 'GLOBOO DÓLAR', 
      'geur': 'GLOBOO EURO',
      'btc': 'BITCOIN',
      'eth': 'ETHEREUM'
    };
  }

  onEnter(){}  update(dt,input){
    let navigationChanged = false;
    // Verifica cooldown de teclas
      if(input.isDown('Left')  && this.tick('Left'))  {
      this.index=(this.index+this.list.length-1)%this.list.length;
      navigationChanged = true;      
    }

    // tecla para baixo
    if(input.isDown('Right') && this.tick('Right')) {
      this.index=(this.index+1)%this.list.length;
      navigationChanged = true;      
    }   

    // Tocar som de navegação quando mudar de personagem
    if(navigationChanged) {
      AssetLoader.playSound(this.mgr.assets.sounds.whoosh, 0.3);
    }

    // confirma
    if(input.isDown('Action') && this.tick('Action')){
      const hero = this.list[this.index];
      AssetLoader.playSound(this.mgr.assets.sounds.power, 0.5); 
      this.mgr.changeScene(new LevelCity(this.mgr, hero));
    }
  }

  // impede repetição rápida de tecla
  tick(key){
    if(!this.cool) this.cool = {};
    if(!this.cool[key] || this.cool[key]<=0){ this.cool[key]=200; return true; }
    return false;
  }
  // renderiza os ícones dos heróis
  render(ctx){
    const { images } = this.mgr.assets;
    
    // Desenhar imagem de fundo
    const backgroundImg = images.selectPerson;
    if(backgroundImg && backgroundImg.complete && backgroundImg.naturalWidth > 0){
      // Escalar a imagem para cobrir toda a tela
      const scaleX = ctx.canvas.width / backgroundImg.width;
      const scaleY = ctx.canvas.height / backgroundImg.height;
      const scale = Math.max(scaleX, scaleY);
      
      // Calcular posição centralizada
      const scaledWidth = backgroundImg.width * scale;
      const scaledHeight = backgroundImg.height * scale;
      const x = (ctx.canvas.width - scaledWidth) / 2;
      const y = (ctx.canvas.height - scaledHeight) / 2;
      
      // Desenhar a imagem de fundo escalada
      ctx.drawImage(backgroundImg, x, y, scaledWidth, scaledHeight);
    } else {
      // Fallback: cor de fundo escura
      ctx.fillStyle = '#111'; 
      ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);    }

    // Reduzir cooldown de teclas
    this.cool && Object.keys(this.cool).forEach(k=>this.cool[k]-=16);

    // Definir dimensões da tela titulo Select Hero
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;   
    const titleY = 160; 
    
    // Desenhar título estiloso
    ctx.textAlign = 'center';
    
    // Sombra do título
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = '36px "Press Start 2P", monospace';
    ctx.fillText('SELECT YOUR HERO', canvasWidth / 2 + 3, titleY + 3); 
    
    // Título principal com gradiente
    const gradient = ctx.createLinearGradient(0, 50, 0, 100);
    gradient.addColorStop(0, '#00ff88');
    gradient.addColorStop(0.5, '#00ccff');
    gradient.addColorStop(1, '#0088ff');
    
    // Definir fonte e cor do título
    ctx.fillStyle = gradient;
    ctx.font = '36px "Press Start 2P", monospace';
    ctx.fillText('SELECT YOUR HERO', canvasWidth / 2, titleY); 
    
    // Contorno do título
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeText('SELECT YOUR HERO', canvasWidth / 2, titleY); 
      // ✨ LAYOUT CENTRALIZADO: 5 personagens em linha horizontal
    const characterSize = 120;
    const centerY = canvasHeight * 0.5; 
    const spacing = 60; // Espaço entre personagens
    
    // Calcular espaçamento para 5 personagens centralizados
    const totalWidth = characterSize * 5 + spacing * 4; // 5 personagens + 4 espaços
    const startX = (canvasWidth - totalWidth) / 2; 
    
    // Posições para os 5 personagens em linha horizontal
    const positions = [];
    for(let i = 0; i < 5; i++) {
      positions.push({
        x: startX + i * (characterSize + spacing), 
        y: centerY - characterSize / 2 
      });
    }

    // desenha os personagens
    this.list.forEach((id,i)=>{
      const pos = positions[i];
      if(!pos) return; 
      
      // Verifica se a imagem do herói está carregada
      const x = pos.x;
      const y = pos.y;      // desenha o ícone do herói
      ctx.globalAlpha = (i===this.index?1:0.6);
      ctx.drawImage(images[`hero_${id}`], x, y, characterSize, characterSize);
      
      // desenha a seleção e nome do herói
      if(i===this.index){
        ctx.globalAlpha=1;
        ctx.strokeStyle='#00ff88';
        ctx.lineWidth=4;
        ctx.strokeRect(x-4, y-4, characterSize+8, characterSize+8);
        
        // Adicionar um brilho extra ao personagem selecionado
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 20;
        ctx.strokeRect(x-2, y-2, characterSize+4, characterSize+4);
        ctx.shadowBlur = 0;
        
        // ✨ NOVO: Desenhar nome da criptomoeda acima do personagem selecionado
        const heroName = this.heroNames[id] || id.toUpperCase();
        const nameY = y - 30; // 30px acima do personagem
        
        // Sombra do nome
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = '18px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(heroName, x + characterSize/2 + 2, nameY + 2);
        
        // Nome principal em verde
        ctx.fillStyle = '#00ff88';
        ctx.fillText(heroName, x + characterSize/2, nameY);
        
        // Contorno branco do nome
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeText(heroName, x + characterSize/2, nameY);
      }
    });
    
    // Resetar globalAlpha para evitar problemas na próxima renderização
    ctx.globalAlpha = 1;
  }
}
