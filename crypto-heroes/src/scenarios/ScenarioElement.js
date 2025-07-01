export default class ScenarioElement {
  constructor(assets, type, config = {}) {
    this.assets = assets;
    this.type = type;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.width = config.width || 0;
    this.height = config.height || 0;
    this.scaleX = config.scaleX || 1;
    this.scaleY = config.scaleY || 1;
    this.visible = config.visible !== false;
    this.offsetY = config.offsetY || 0; // Adicionar suporte ao offsetY
  }

  render(ctx) {
    if (!this.visible) return;
    
    const image = this.assets.images[this.type];
    if (!image || !image.complete || image.naturalWidth === 0) return;

    ctx.save();
    
    // Aplicar transformações
    const finalWidth = this.width > 0 ? this.width : image.width * this.scaleX;
    const finalHeight = this.height > 0 ? this.height : image.height * this.scaleY;
    
    ctx.drawImage(image, this.x, this.y, finalWidth, finalHeight);
    
    ctx.restore();
  }

  // Método para verificar colisão (útil para plataformas)
  getBounds() {
    const image = this.assets.images[this.type];
    if (!image) return { x: 0, y: 0, width: 0, height: 0 };
    
    return {
      x: this.x,
      y: this.y,
      width: this.width > 0 ? this.width : image.width * this.scaleX,
      height: this.height > 0 ? this.height : image.height * this.scaleY
    };
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  setScale(scaleX, scaleY = scaleX) {
    this.scaleX = scaleX;
    this.scaleY = scaleY;
  }

  setSize(width, height) {
    this.width = width;
    this.height = height;
  }
}
