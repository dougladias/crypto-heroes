import ScenarioElement from './ScenarioElement.js';
import ParallaxBuildings from './ParallaxBuildings.js';
import ParallaxFloor from './ParallaxFloor.js';

export default class ScenarioManager {
  constructor(assets, scenarioType = 'cyberpunk') {
    this.assets = assets;
    this.scenarioType = scenarioType;
    this.elements = [];
    this.background = null;
    this.parallaxBuildings = null; // Adicionar parallax de prédios
    this.parallaxFloor = null; // Adicionar parallax de piso
    
    this.setupScenario();
  }

  setupScenario() {
    // Configurar o background
    this.background = new ScenarioElement(this.assets, this.getBackgroundType(), {
      x: 0,
      y: 0,
      visible: true
    });

    // Limpar elementos existentes
    this.elements = [];

    // Configurar elementos específicos do cenário
    this.setupCyberpunkScenario();
  }

  setupCyberpunkScenario() {
    console.log('Inicializando cenário cyberpunk...');
    
    // INICIALIZAR OS PRÉDIOS PARALLAX
    try {
      this.parallaxBuildings = new ParallaxBuildings(this.assets, {
        x: 0,
        y: -30, // Posição Y dos prédios (ajuste conforme necessário)
        speed: 50, // Velocidade de movimento (pixels por segundo)
        scale: 1, // Escala dos prédios
        totalFrames: 5, // 5 frames na imagem
        canvasWidth: 800, // Largura do canvas (será ajustada automaticamente)
        visible: true
      });
      console.log('Parallax buildings inicializados com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar parallax buildings:', error);
      this.parallaxBuildings = null;
    }

    // INICIALIZAR O PISO PARALLAX
    try {
      this.parallaxFloor = new ParallaxFloor(this.assets, {
        speed: 250, 
        scaleX: 1.6, // Mesmas configurações do piso anterior
        scaleY: 1,
        offsetY: 470,
        canvasWidth: 800, // Largura real do canvas (do index.html)
        visible: true
        // Loop perfeito: sem parâmetros de ajuste, funciona automaticamente
      });
      console.log('Parallax floor inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar parallax floor:', error);
      this.parallaxFloor = null;
    }
   
    
    console.log('Cenário cyberpunk inicializado completamente');

    // Pode adicionar mais elementos específicos do cyberpunk aqui
    // Por exemplo: plataformas, etc.
  }

  getBackgroundType() {
    return 'cyberpunk';
  }

  update(dt) {
    // Atualizar parallax de prédios
    if (this.parallaxBuildings) {
      this.parallaxBuildings.update(dt);
    }
    
    // Atualizar parallax do piso
    if (this.parallaxFloor) {
      this.parallaxFloor.update(dt);
    }
    
    // Atualizar elementos que possam ter animações ou lógica
    this.elements.forEach(element => {
      if (element.update) {
        element.update(dt);
      }
    });
  }

  render(ctx) {
    // Renderizar o background primeiro
    this.renderBackground(ctx);
    
    // Renderizar parallax de prédios (entre background e piso/personagem)
    if (this.parallaxBuildings) {
      this.parallaxBuildings.render(ctx);
    }
    
    // Renderizar parallax do piso (substitui o piso estático)
    if (this.parallaxFloor) {
      this.parallaxFloor.render(ctx);
    }
    
    // Renderizar outros elementos do cenário (se houver)
    this.elements.forEach(element => {
      // Pular o piso estático - agora é renderizado pelo parallax
      if (element.type !== 'piso') {
        element.render(ctx);
      }
    });
  }

  renderBackground(ctx) {
    if (!this.background) return;

    const currentBg = this.assets.images[this.background.type];
    
    if (currentBg && currentBg.complete && currentBg.naturalWidth > 0) {
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
      // Fallback: usar cor baseada no cenário
      this.drawFallbackBackground(ctx);
    }
  }

  drawFallbackBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    
    // Gradiente cyberpunk
    gradient.addColorStop(0, '#1a0d2e');
    gradient.addColorStop(1, '#16213e');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  // Método para obter informações de colisão do piso (útil para física do personagem)
  getFloorY(canvasHeight) {
    // Usar o parallax floor se disponível
    if (this.parallaxFloor) {
      return this.parallaxFloor.getFloorY(canvasHeight);
    }
    
    // Fallback: usar o elemento estático se ainda existir
    const floorElement = this.elements.find(el => el.type === 'piso');
    if (floorElement) {
      const image = this.assets.images.piso;
      if (image && image.complete) {
        const floorHeight = image.height * floorElement.scaleY;
        return (canvasHeight || window.innerHeight) - floorHeight;
      }
    }
    return canvasHeight || window.innerHeight; // Fallback: chão na parte inferior da tela
  }

  // Método para adicionar novos elementos ao cenário
  addElement(type, config) {
    const element = new ScenarioElement(this.assets, type, config);
    this.elements.push(element);
    return element;
  }

  // Método para remover elementos
  removeElement(element) {
    const index = this.elements.indexOf(element);
    if (index > -1) {
      this.elements.splice(index, 1);
    }
  }

  // Método para mudar o tipo de cenário
  changeScenario(newType) {
    this.scenarioType = newType;
    this.setupScenario();
  }

  // Métodos para controle fino do loop do piso
  adjustFloorExitThreshold(value) {
    if (this.parallaxFloor) {
      this.parallaxFloor.exitThreshold = value;
      console.log(`Exit threshold ajustado para: ${value}`);
    }
  }

  adjustFloorEntryOffset(value) {
    if (this.parallaxFloor) {
      this.parallaxFloor.entryOffset = value;
      console.log(`Entry offset ajustado para: ${value}`);
    }
  }

  // Método para obter os valores atuais dos controles
  getFloorControls() {
    if (this.parallaxFloor) {
      return {
        exitThreshold: this.parallaxFloor.exitThreshold,
        entryOffset: this.parallaxFloor.entryOffset
      };
    }
    return null;
  }

  // Método para aplicar múltiplos ajustes de uma vez
  setFloorControls(config) {
    if (this.parallaxFloor) {
      if (config.exitThreshold !== undefined) {
        this.parallaxFloor.exitThreshold = config.exitThreshold;
      }
      if (config.entryOffset !== undefined) {
        this.parallaxFloor.entryOffset = config.entryOffset;
      }
      console.log('Controles do piso atualizados:', this.getFloorControls());
    }
  }

  // Método para debug dos tiles do piso
  debugFloorTiles() {
    if (this.parallaxFloor) {
      this.parallaxFloor.debugTiles();
    } else {
      console.log('ParallaxFloor não inicializado');
    }
  }
}
