export default class ParallaxBuildings {
  constructor(assets, config = {}) {
    this.assets = assets;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.speed = config.speed || 50; // pixels por segundo
    this.scale = config.scale || 1;
    this.visible = config.visible !== false;
    
    // Configurações dos frames
    this.frameWidth = config.frameWidth || 0; // Largura de cada frame
    this.frameHeight = config.frameHeight || 0; // Altura de cada frame
    this.totalFrames = config.totalFrames || 5; // Total de frames na imagem
    
    // Array de prédios para criar o loop infinito
    this.buildings = [];
    this.initializeBuildings(config.canvasWidth || 800);
  }

  initializeBuildings(canvasWidth) {
    // Se frameWidth ainda não foi calculado, usar um valor padrão
    if (this.frameWidth === 0) {
      console.log('FrameWidth não definido, usando valor padrão temporário');
      return; // Não inicializar ainda, esperar o render calcular
    }
    
    // Calcular quantos prédios precisamos para cobrir a tela + alguns extras para o loop
    const buildingWidth = this.frameWidth * this.scale;
    if (buildingWidth <= 0) {
      console.error('Largura do prédio inválida:', buildingWidth);
      return;
    }
    
    const numBuildings = Math.ceil(canvasWidth / buildingWidth) + 2; // +2 para garantir o loop
    
    console.log(`Inicializando ${numBuildings} prédios com largura ${buildingWidth}`);
    
    for (let i = 0; i < numBuildings; i++) {
      this.buildings.push({
        x: i * buildingWidth,
        frame: i % this.totalFrames // Cada prédio com um frame diferente e FIXO
      });
    }
  }

  update(dt) {
    if (!this.visible) return;
    
    // Mover prédios para a esquerda
    const moveSpeed = (this.speed * dt) / 1000; // Converter para pixels por frame
    
    this.buildings.forEach(building => {
      building.x -= moveSpeed;
    });
    
    // Reposicionar prédios que saíram da tela
    const buildingWidth = this.frameWidth * this.scale;
    
    this.buildings.forEach(building => {
      if (building.x + buildingWidth < 0) {
        // Encontrar o prédio mais à direita
        const rightmostX = Math.max(...this.buildings.map(b => b.x));
        building.x = rightmostX + buildingWidth;
        // Manter o mesmo frame - NÃO mudar quando reposicionar
        // building.frame permanece o mesmo
      }
    });
  }

  render(ctx) {
    if (!this.visible) return;
    
    const image = this.assets.images.predio;
    if (!image || !image.complete || image.naturalWidth === 0) return;
    
    // Se não temos dimensões dos frames, calcular automaticamente
    if (this.frameWidth === 0) {
      this.frameWidth = image.width / this.totalFrames;
      this.frameHeight = image.height;
      this.initializeBuildings(ctx.canvas.width);
    }
    
    ctx.save();
    
    // Renderizar cada prédio
    this.buildings.forEach(building => {
      // Calcular posição do frame na imagem
      const frameX = building.frame * this.frameWidth;
      const frameY = 0;
      
      // Dimensões finais
      const finalWidth = this.frameWidth * this.scale;
      const finalHeight = this.frameHeight * this.scale;
      
      // Renderizar apenas se estiver visível na tela
      if (building.x + finalWidth > 0 && building.x < ctx.canvas.width) {
        ctx.drawImage(
          image,
          frameX, frameY, this.frameWidth, this.frameHeight, // Fonte
          building.x, this.y, finalWidth, finalHeight // Destino
        );
      }
    });
    
    ctx.restore();
  }

  // Método para ajustar a posição Y
  setY(y) {
    this.y = y;
  }

  // Método para ajustar a velocidade
  setSpeed(speed) {
    this.speed = speed;
  }

  // Método para ajustar o intervalo entre frames
  setFrameInterval(milliseconds) {
    this.frameInterval = milliseconds;
  }

  // Método para ajustar a escala
  setScale(scale) {
    this.scale = scale;
    // Reinicializar prédios com nova escala
    this.buildings = [];
    this.initializeBuildings(800); // Usar uma largura padrão
  }
}
