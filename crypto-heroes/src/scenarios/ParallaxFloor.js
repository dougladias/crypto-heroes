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
    
    console.log(`PISO FORÇADO: ${numTiles} tiles de ${tileWidth}px`);
    console.log(`Posições: ${this.floorTiles.map(t => t.x.toFixed(0)).join(', ')}`);
    console.log(`Imagem carregada: ${image.width}x${image.height}`);
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
        console.log(`Tile reposicionado: ${tile.x}`);
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
    console.log(`Tentando renderizar ${this.floorTiles.length} tiles`);
    
    this.floorTiles.forEach((tile, index) => {
      const tileWidth = image.width * this.scaleX;
      
      console.log(`Tile ${index}: x=${tile.x.toFixed(0)}, y=${floorY.toFixed(0)}`);
      
      // Renderizar SEMPRE - sem condições
      ctx.drawImage(image, tile.x, floorY, tileWidth, floorHeight);
      tilesRenderizados++;
    });
    
    console.log(`Renderizados: ${tilesRenderizados} tiles`);
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
      console.log('NENHUM TILE INICIALIZADO');
      return;
    }
    
    const image = this.assets.images.piso;
    if (!image) {
      console.log('IMAGEM DO PISO NÃO CARREGADA');
      return;
    }
    
    const tileWidth = image.width * this.scaleX;
    console.log('=== DEBUG TILES ===');
    console.log(`Imagem: ${image.width}x${image.height}, escala: ${this.scaleX}x${this.scaleY}`);
    console.log(`Largura do tile: ${tileWidth}px`);
    console.log(`Total de tiles: ${this.floorTiles.length}`);
    
    this.floorTiles.forEach((tile, i) => {
      const endX = tile.x + tileWidth;
      const status = tile.x <= 0 && endX >= 0 ? 'COBRINDO BORDA ESQUERDA' : 
                    tile.x >= 0 && tile.x <= 1200 ? 'VISÍVEL' : 'FORA DA TELA';
      console.log(`Tile ${i}: x=${tile.x.toFixed(1)} até ${endX.toFixed(1)} - ${status}`);
    });
  }
}
