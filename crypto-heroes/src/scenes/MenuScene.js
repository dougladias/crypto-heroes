import LevelCity from './LevelCity.js';
import AssetLoader from '../engine/AssetLoader.js';

// Cena de menu para escolher o herói
export default class MenuScene {
  constructor(manager){
    this.mgr   = manager;
    this.list  = ['gbrl','gusd','btc','eth','sol'];
    this.cols  = 3;              
    this.index = 0;              
    this.w     = 128;            
    this.h     = 128;
  }

  onEnter(){}  update(dt,input){
    let navigationChanged = false;
    
    // Debug: verificar detecção de teclas
    if(input.isDown('Down')) {
      console.log('Tecla Down detectada! Index atual:', this.index);
    }
    
    if(input.isDown('Left')  && this.tick('Left'))  {
      this.index=(this.index+this.list.length-1)%this.list.length;
      navigationChanged = true;
      console.log('Navegou para Left, novo index:', this.index);
    }
    if(input.isDown('Right') && this.tick('Right')) {
      this.index=(this.index+1)%this.list.length;
      navigationChanged = true;
      console.log('Navegou para Right, novo index:', this.index);
    }
    if(input.isDown('Up')    && this.tick('Up'))    {
      // Navegação personalizada para layout 2x3
      // Se estou na fileira de baixo (índices 2, 3, 4), vou para fileira de cima (índices 0, 1)
      if(this.index >= 2) {
        if(this.index === 2) this.index = 0;  // Primeiro da fileira de baixo vai para primeiro da de cima
        else if(this.index === 3) this.index = 0;  // Meio da fileira de baixo vai para primeiro da de cima  
        else if(this.index === 4) this.index = 1;  // Último da fileira de baixo vai para segundo da de cima
        navigationChanged = true;
        console.log('Navegou para Up, novo index:', this.index);
      }
    }
    if(input.isDown('Down')  && this.tick('Down'))  {
      // Navegação personalizada para layout 2x3
      // Se estou na fileira de cima (índices 0, 1), vou para fileira de baixo (índices 2, 3, 4)
      if(this.index < 2) {
        if(this.index === 0) this.index = 2;  // Primeiro da fileira de cima vai para primeiro da de baixo
        else if(this.index === 1) this.index = 4;  // Segundo da fileira de cima vai para último da de baixo
        navigationChanged = true;
        console.log('Navegou para Down, novo index:', this.index);
      }
    }

    // Tocar som de navegação quando mudar de personagem
    if(navigationChanged) {
      AssetLoader.playSound(this.mgr.assets.sounds.whoosh, 0.3);
    }

    // confirma
    if(input.isDown('Action') && this.tick('Action')){
      const hero = this.list[this.index];
      AssetLoader.playSound(this.mgr.assets.sounds.power, 0.5); // Som de confirmação
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
      
      const scaledWidth = backgroundImg.width * scale;
      const scaledHeight = backgroundImg.height * scale;
      const x = (ctx.canvas.width - scaledWidth) / 2;
      const y = (ctx.canvas.height - scaledHeight) / 2;
      
      ctx.drawImage(backgroundImg, x, y, scaledWidth, scaledHeight);
    } else {
      // Fallback: cor de fundo escura
      ctx.fillStyle = '#111'; 
      ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);    }

    this.cool && Object.keys(this.cool).forEach(k=>this.cool[k]-=16);

    // Definir dimensões da tela
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;    // Desenhar título estiloso
    ctx.textAlign = 'center';
    
    // Sombra do título
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = '36px "Press Start 2P", monospace';
    ctx.fillText('SELECT YOUR HERO', canvasWidth / 2 + 3, 83);
    
    // Título principal com gradiente
    const gradient = ctx.createLinearGradient(0, 50, 0, 100);
    gradient.addColorStop(0, '#00ff88');
    gradient.addColorStop(0.5, '#00ccff');
    gradient.addColorStop(1, '#0088ff');
    
    ctx.fillStyle = gradient;
    ctx.font = '36px "Press Start 2P", monospace';
    ctx.fillText('SELECT YOUR HERO', canvasWidth / 2, 80);
    
    // Contorno do título
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeText('SELECT YOUR HERO', canvasWidth / 2, 80);

    // Posicionar personagens: 2 em cima, 3 embaixo
    const characterSize = 120;
    
    // Posições para 2 personagens em cima
    const topY = canvasHeight * 0.3;
    const topPositions = [
      { x: canvasWidth * 0.33 - characterSize/2, y: topY },
      { x: canvasWidth * 0.67 - characterSize/2, y: topY }
    ];
    
    // Posições para 3 personagens embaixo
    const bottomY = canvasHeight * 0.65;
    const bottomPositions = [
      { x: canvasWidth * 0.25 - characterSize/2, y: bottomY },
      { x: canvasWidth * 0.5 - characterSize/2, y: bottomY },
      { x: canvasWidth * 0.75 - characterSize/2, y: bottomY }
    ];
    
    // Combinar todas as posições
    const positions = [...topPositions, ...bottomPositions];

    // desenha os personagens
    this.list.forEach((id,i)=>{
      const pos = positions[i];
      if(!pos) return; // Segurança caso não tenha posição definida
      
      const x = pos.x;
      const y = pos.y;

      // desenha o ícone do herói
      ctx.globalAlpha = (i===this.index?1:0.6);
      ctx.drawImage(images[`hero_${id}`], x, y, characterSize, characterSize);
      
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
      }
    });
    
    // Resetar globalAlpha para evitar problemas na próxima renderização
    ctx.globalAlpha = 1;
  }
}
