export default class ParallaxFloor {
  constructor(assets, config = {}) {
    this.assets = assets;
    this.speed = config.speed || 40; // Velocidade mais lenta que os prédios
    this.scale = config.scale || 1;
    this.scaleX = config.scaleX || 1;
    this.scaleY = config.scaleY || 1;
    this.offsetY = config.offsetY || 0;
    this.visible = config.visible !== false;
    
    // Controles para ajuste fino do loop  
    this.exitThreshold = config.exitThreshold || -150; // Valor original
    this.entryOffset = config.entryOffset || 0; // Sobreposição na entrada
    
    // Array de tiles do piso para criar o loop infinito
    this.floorTiles = [];
    this.initializeFloorTiles(config.canvasWidth || 1200); // Usar valor ainda maior como fallback
  }

  initializeFloorTiles(canvasWidth) {
    const image = this.assets.images.piso;
    if (!image || !image.complete || image.naturalWidth === 0) {
      console.warn('IMAGEM DO PISO NÃO CARREGADA!');
      return;
    }
    
    const tileWidth = image.width * this.scaleX;
    
    this.floorTiles = [];
    
    // SIMPLES: começar bem antes e cobrir toda a tela
    const numTiles = 5; // Mais tiles para garantir cobertura
    for (let i = 0; i < numTiles; i++) {
      this.floorTiles.push({
        x: -tileWidth * 2 + (i * tileWidth) // Começar bem antes
      });
    }
  }

  update(dt) {
    if (!this.visible) return;
    
    const image = this.assets.images.piso;
    if (!image || !image.complete || image.naturalWidth === 0) return;
    
    // Se ainda não inicializamos os tiles, tentar novamente
    if (this.floorTiles.length === 0) {
      this.initializeFloorTiles(1200); // Usar valor maior para garantir cobertura
      return;
    }
    
    // Mover tiles para a esquerda
    const moveSpeed = (this.speed * dt) / 1000;
    
    this.floorTiles.forEach(tile => {
      tile.x -= moveSpeed;
    });
    
    // Loop simples e centralizado
    const tileWidth = image.width * this.scaleX;
    
    this.floorTiles.forEach(tile => {
      // Loop mais simples: quando sai completamente, volta para o final
      if (tile.x + tileWidth <= 0) { 
        const rightmostX = Math.max(...this.floorTiles.map(t => t.x));
        tile.x = rightmostX + tileWidth;        
      }
    });
  }

  render(ctx) {
    if (!this.visible) return;
    
    const image = this.assets.images.piso;
    if (!image || !image.complete || image.naturalWidth === 0) return;
    
    // Se ainda não temos tiles, inicializar
    if (this.floorTiles.length === 0) {
      this.initializeFloorTiles(ctx.canvas.width);
      return;
    }
    
    // Calcular posição Y do piso
    const floorHeight = image.height * this.scaleY;
    const floorY = ctx.canvas.height - floorHeight + this.offsetY;
    
    // FORÇAR RENDERIZAÇÃO - sempre mostrar algo
    let tilesRenderizados = 0;
    this.floorTiles.forEach((tile, index) => {
      const tileWidth = image.width * this.scaleX;
      // Renderizar SEMPRE - sem condições
      ctx.drawImage(image, tile.x, floorY, tileWidth, floorHeight);
      tilesRenderizados++;
    });   
  }

  // Método para ajustar a velocidade
  setSpeed(speed) {
    this.speed = speed;
  }

  // Método para ajustar a escala
  setScale(scaleX, scaleY = scaleX) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
    // Reinicializar tiles com nova escala
    this.floorTiles = [];
    this.initializeFloorTiles(1200);
  }

  // Método para ajustar o offset Y
  setOffsetY(offsetY) {
    this.offsetY = offsetY;
  }

  // Método para obter a posição Y do piso (para colisões)
  getFloorY(canvasHeight) {
    const image = this.assets.images.piso;
    if (image && image.complete) {
      const floorHeight = image.height * this.scaleY;
      return (canvasHeight || window.innerHeight) - floorHeight + this.offsetY;
    }
    return canvasHeight || window.innerHeight;
  }

  // Método de debug para verificar estado dos tiles
  debugTiles() {
    if (this.floorTiles.length === 0) {      
      return;
    }
    
    const image = this.assets.images.piso;
    if (!image) {      
      return;
    }
    
    const tileWidth = image.width * this.scaleX;  
    
    this.floorTiles.forEach((tile, i) => {
      const endX = tile.x + tileWidth;
      const status = tile.x <= 0 && endX >= 0 ? 'COBRINDO BORDA ESQUERDA' : 
                    tile.x >= 0 && tile.x <= 1200 ? 'VISÍVEL' : 'FORA DA TELA';      
    });
  }
}
