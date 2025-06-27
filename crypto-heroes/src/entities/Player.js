import Sprite from '../engine/Sprite.js';

export default class Player {
  constructor(assets, heroId) {
    const sheet = {
      btc: assets.images.btc_idle,
      eth: assets.images.eth_idle,
      sol: assets.images.solana_idle,
      gbrl: assets.images.real_idle,
      gusd: assets.images.dollar_idle
    }[heroId];    // Criar sprite otimizada para formato 640x128 (5 frames de 128x128)
    this.sprite = new Sprite(sheet, /*frames*/8, /*frameRate*/8); // Velocidade adequada
    this.x = 100;
    
    // Estados de movimento
    this.isMoving = false;
    this.facing = 1; // 1 = direita, -1 = esquerda
    this.speed = 250; // Velocidade ajustada para sprites maiores
    
    // Configuração dos frames - AJUSTE AQUI se necessário
    this.frames = {
      idle: 0,           // Frame parado (primeiro frame)
      walk: [1, 2, 3, 4, 5, 6, 7, 8] // Frames de caminhada (frames 1-4)
    };
    
    console.log(`Player criado com herói: ${heroId}`);
  }
    update(dt, input) { 
    const wasMoving = this.isMoving;
    this.isMoving = false;
    
    // Detectar movimento usando o InputManager correto
    if (input.isDown('Left')) {
      this.x -= this.speed * dt / 1000;
      this.isMoving = true;
      this.facing = -1;
    }
    if (input.isDown('Right')) {
      this.x += this.speed * dt / 1000;
      this.isMoving = true;
      this.facing = 1;
    }
    
    // Gerenciar animação baseada no estado
    if (this.isMoving) {
      // Se começou a andar, configurar animação de caminhada
      if (!wasMoving) {
        this.sprite.setFrameRange(this.frames.walk);
        this.sprite.setFrameRate(8);
      }
      this.sprite.step(dt);
    } else {
      // Parado - mostrar frame idle
      this.sprite.setFrame(this.frames.idle);
    }
  }  render(ctx) { 
    // Ajustar posição Y para o boneco ficar no chão
    const groundY = ctx.canvas.height - 340; // Posição mais alta no cenário
    
    // Tamanho ideal para sprites 128x128
    const playerWidth = 130;   // Tamanho nativo da sprite
    const playerHeight = 280;  // Mantém proporção quadrada
    
    this.sprite.draw(ctx, this.x, groundY, playerWidth, playerHeight, this.facing === -1);
    
    // DEBUG: Ative temporariamente para ver o frame atual
    ctx.fillStyle = 'yellow';
    ctx.font = '16px Arial';
    ctx.fillText(`Frame: ${this.sprite.frame}`, this.x, groundY - 10);
  }
  
  // Método para debug - chame no console para testar frames específicos
  debugFrame(frameNumber) {
    this.sprite.setFrame(frameNumber);
    console.log(`Frame definido para: ${frameNumber}`);
  }
}
