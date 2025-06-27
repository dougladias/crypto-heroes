export default class Sprite{
  constructor(img, frameCount=1, frameRate=10, cols=null, rows=null){
    this.img = img;
    this.totalFrames = frameCount;
    this.rate = frameRate;
    this.frame = 0;
    this.acc = 0;
    
    // Configuração da grade
    if(cols === null && rows === null) {
      this.cols = frameCount;
      this.rows = 1;
    } else {
      this.cols = cols || Math.ceil(Math.sqrt(frameCount));
      this.rows = rows || Math.ceil(frameCount / this.cols);
    }
    
    // Range de frames para animação (por padrão, todos os frames)
    this.frameRange = [];
    for(let i = 0; i < frameCount; i++) {
      this.frameRange.push(i);
    }
    this.currentFrameIndex = 0;
    
    console.log(`Sprite criada: ${frameCount} frames, ${this.cols}x${this.rows} grade`);
  }
  
  // Definir um frame específico (para estados idle)
  setFrame(frameNumber) {
    this.frame = Math.max(0, Math.min(frameNumber, this.totalFrames - 1));
    this.currentFrameIndex = 0;
    this.acc = 0;
  }
  
  // Definir range de frames para loop (para animações)
  setFrameRange(frames) {
    this.frameRange = frames || [];
    this.currentFrameIndex = 0;
    this.frame = this.frameRange.length > 0 ? this.frameRange[0] : 0;
    this.acc = 0;
  }
  
  // Definir velocidade da animação
  setFrameRate(rate) {
    this.rate = rate;
  }
  
  step(dt){
    // Só anima se há mais de 1 frame no range
    if(this.frameRange.length <= 1) return;
    
    this.acc += dt;
    if(this.acc >= 1000/this.rate){
      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frameRange.length;
      this.frame = this.frameRange[this.currentFrameIndex];
      this.acc = 0;
    }
  }
    draw(ctx,x,y,w,h,flip=false){
    if(!this.img || !this.img.complete || this.img.naturalWidth === 0) {
      // Desenhar retângulo colorido como fallback
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(x, y, w, h);
      return;
    }
    
    // Calcular posição do frame na grade com mais precisão
    const frameX = this.frame % this.cols;
    const frameY = Math.floor(this.frame / this.cols);
    
    // Usar Math.floor para garantir pixels inteiros e evitar bleeding
    const frameWidth = Math.floor(this.img.width / this.cols);
    const frameHeight = Math.floor(this.img.height / this.rows);
    
    // Coordenadas do source (origem) com precisão
    const srcX = Math.floor(frameX * frameWidth);
    const srcY = Math.floor(frameY * frameHeight);
    
    ctx.save();
    if(flip){
      ctx.translate(x+w,y);
      ctx.scale(-1,1);
      x = 0;
      y = 0;
    }
    
    // Usar smoothing disabled para sprites pixeladas
    ctx.imageSmoothingEnabled = false;
    
    ctx.drawImage(
      this.img,
      srcX, srcY,           // Posição source (origem)
      frameWidth, frameHeight, // Tamanho source
      x, y, w, h           // Posição e tamanho destino
    );
    
    ctx.imageSmoothingEnabled = true;
    ctx.restore();
  }
}
