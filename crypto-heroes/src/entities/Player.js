import Sprite from '../engine/Sprite.js';
import AssetLoader from '../engine/AssetLoader.js';
import PowerObject from './PowerObject.js';

export default class Player {
  constructor(assets, heroId) {
    // ✨ IMPORTANTE: O sprite importado como "_idle" é na verdade um sprite de corrida
    // Isso permite usar a mesma animação tanto para movimento quanto para idle (primeiro frame)
    
    // Guardar referência dos assets para tocar sons
    this.assets = assets;
    this.heroId = heroId;    // ✨ ATUALIZADO: Sprite de corrida + power 
    this.sprites = {
      run: new Sprite(assets.images[`${heroId}_run`], 5, 8),      // Sprite de corrida (5 frames, frame rate 8)
      power: new Sprite(assets.images[`${heroId}_power`], 5, 8)    // 5 colunas, frame rate 8 (suave)
    };

    // Sprite atual (começar com corrida)
    this.currentSprite = this.sprites.run;
    
    this.x = 100;
    this.y = 0; 
    
    // Estados de movimento
    this.isMoving = false;
    this.facing = 1; // 1 = direita, -1 = esquerda
    this.speed = 250; // Velocidade ajustada para sprites maiores
    
    // Estados de ação
    this.isGrounded = true;
    this.jumpVelocity = 0;
    this.gravity = 1200; 
    this.jumpPower = 850;    
    this.actionTimer = 0;
    
    // Sistema de objetos de poder
    this.powerObjects = []; // Array para armazenar objetos de poder ativos
    this.powerReleaseTimer = 0; // Timer para soltar o objeto 1s após ativar poder
      // ✨ ATUALIZADO: Frames para sprite de corrida (sem idle)
    this.frames = {
      run: [0, 1, 2],      // Frames de corrida (todos os frames)
      power: [0, 1, 2, 3]     // Todos os frames da sprite de poder
    };
    
    // ✨ INICIALIZAR: Começar sempre correndo
    this.currentSprite.setFrameRange(this.frames.run);
    this.currentSprite.setFrameRate(10);
    this.currentSprite.reset();
    console.log('🎮 Player inicializado sempre correndo:', {
      totalFrames: this.currentSprite.totalFrames,
      frameRange: this.frames.run,
      currentFrame: this.currentSprite.frame
    });
  }update(dt, input) { 
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
      // ✨ USAR TAMANHO REAL DA TELA - aumentado para permitir ir mais para direita
    this.limitPlayerPosition(1200); 
      // Processar pulo
    if (input.wasPressed('Jump') && this.isGrounded) {
      this.jumpVelocity = this.jumpPower;
      this.isGrounded = false;
      AssetLoader.playSound(this.assets.sounds.whoosh, 0.4);
      console.log('Pulando!');
    }
    
    // ✨ ATUALIZADO: Apenas ação de poder (soco removido)
    if (input.wasPressed('Power') && this.actionTimer <= 0) {
      this.currentAction = 'power';
      this.actionTimer = 600; // 600ms de duração
      this.powerReleaseTimer = 400; // Soltar objeto após 400ms
      this.currentSprite = this.sprites.power; // Trocar para sprite de poder
      this.currentSprite.setFrameRange(this.frames.power);
      this.currentSprite.setFrameRate(8); // Frame rate otimizado
      this.currentSprite.reset();
      AssetLoader.playSound(this.assets.sounds.power, 0.6);
      console.log('Poder! - Trocou para sprite de power, objeto será solto em 400ms');
    }
      // Física do pulo
    if (!this.isGrounded) {
      this.jumpVelocity -= this.gravity * dt / 1000;
      this.y += this.jumpVelocity * dt / 1000;
      
      // Verificar se voltou ao chão (apenas se não há plataforma)
      if (this.y <= 0) {
        this.y = 0;
        this.jumpVelocity = 0;
        this.isGrounded = true;
        console.log('Player pousou no chão');
      }
    }// Atualizar timer de ação
    if (this.actionTimer > 0) {
      this.actionTimer -= dt;
    }
    
    // Atualizar timer de soltar objeto de poder
    if (this.powerReleaseTimer > 0) {
      this.powerReleaseTimer -= dt;
      if (this.powerReleaseTimer <= 0) {
        // Soltar objeto de poder
        this.releasePowerObject();
      }
    }
    
    // Atualizar objetos de poder
    this.updatePowerObjects(dt);    // Gerenciar animação baseada no estado
    if (this.actionTimer > 0) {
      // Durante ação - apenas animar (já foi configurado quando a ação começou)
      this.currentSprite.step(dt);
    } else {
      // ✨ SEMPRE CORRENDO: Manter animação de corrida sempre ativa
      if (this.currentAction !== 'run') {
        this.currentAction = 'run';
        this.currentSprite = this.sprites.run; // Usar sprite de corrida
        this.currentSprite.setFrameRange(this.frames.run); // Array com 5 frames
        this.currentSprite.setFrameRate(10); // Frame rate para corrida
        this.currentSprite.reset();
        console.log('🏃 Sempre correndo - mantendo animação ativa');
      }
      this.currentSprite.step(dt); // Sempre animar a corrida
    }
  }  render(ctx) { 
    // Ajustar posição Y para o boneco ficar no chão
    const groundY = ctx.canvas.height - 330; // Posição mais alta no cenário
    const renderY = groundY - this.y; // Subtrair Y do pulo
    
    // Tamanho ideal para sprites 128x128
    const playerWidth = 130;   // Tamanho nativo da sprite
    const playerHeight = 280;  // Mantém proporção quadrada
    
    this.currentSprite.draw(ctx, this.x, renderY, playerWidth, playerHeight, this.facing === -1);
    
    // Renderizar objetos de poder
    this.renderPowerObjects(ctx);
  }  // Soltar objeto de poder
  releasePowerObject() {
    // Calcular posição do objeto baseado na posição do player e direção
    const offsetX = this.facing === 1 ? 80 : -80; // Offset para frente do player (mais longe)
    const powerX = this.x + offsetX;
    
    // ✨ CORREÇÃO CRÍTICA: Poder deve sair na altura do meio do personagem
    // Como o personagem tem 280px de altura, o meio está a 140px da base
    // No sistema físico: this.y (altura dos pés) + 140 (meio do corpo)
    const powerY = this.y + 140; // Meio do corpo do personagem
    
    // Criar novo objeto de poder
    const powerObject = new PowerObject(this.assets, powerX, powerY, this.facing);
    this.powerObjects.push(powerObject);
    
    console.log(`🚀 Poder criado! Player físico(${this.x}, ${this.y}) -> Poder físico(${powerX}, ${powerY})`);
  }
  
  // Atualizar todos os objetos de poder
  updatePowerObjects(dt) {
    // Atualizar cada objeto de poder
    for (let i = this.powerObjects.length - 1; i >= 0; i--) {
      const powerObject = this.powerObjects[i];
      powerObject.update(dt);
      
      // Remover objetos inativos
      if (!powerObject.isActive()) {
        this.powerObjects.splice(i, 1);
      }
    }
  }
  
  // Renderizar todos os objetos de poder
  renderPowerObjects(ctx) {
    this.powerObjects.forEach(powerObject => {
      powerObject.render(ctx);
    });
  }
  
  // Obter todos os objetos de poder ativos (para colisões futuras)
  getPowerObjects() {
    return this.powerObjects;
  }
    // Método para debug - chame no console para testar animação de corrida
  debugRunAnimation() {
    console.log('🏃 Forçando animação de corrida...');
    this.currentSprite = this.sprites.run;
    this.currentSprite.setFrameRange(this.frames.run);
    this.currentSprite.setFrameRate(10);
    this.currentSprite.reset();
    console.log('Estado após debug:', {
      currentFrame: this.currentSprite.frame,
      frameRange: this.currentSprite.frameRange,
      frameRangeLength: this.currentSprite.frameRange.length
    });
  }

  // Getter para verificar status atual
  get status() {
    return {
      facing: this.facing === 1 ? 'right' : 'left',
      isGrounded: this.isGrounded,
      isMoving: this.isMoving,
      currentFrame: this.currentSprite.frame,
      currentAction: this.currentAction
    };
  }  // ✨ LIMITES IGUAIS - Mesma margem dos dois lados
  limitPlayerPosition(canvasWidth = 1200) {
    // Tamanho do player (mesmo valor usado no render)
    const playerWidth = 130;
    
    // Definir limites iguais dos dois lados
    const margin = 5;                                   // Margem igual para ambos os lados
    const leftLimit = margin;                           // Margem esquerda
    const rightLimit = canvasWidth - playerWidth - margin; // Margem direita igual
    
    // Aplicar limites sem quebrar as ações
    const previousX = this.x;
    
    if (this.x < leftLimit) {
      this.x = leftLimit;
      if (previousX !== this.x) {
        console.log(`Player atingiu limite esquerdo - X: ${this.x}, Limite: ${leftLimit}`);
      }
    }
    if (this.x > rightLimit) {
      this.x = rightLimit;
      if (previousX !== this.x) {
        console.log(`Player atingiu limite direito - X: ${this.x}, Limite: ${rightLimit}, Tela: ${canvasWidth}`);
      }
    }
      // Debug: remover para performance (descomente se precisar debugar)
    // console.log(`Player X: ${this.x.toFixed(0)}, Limite esquerdo: ${leftLimit}, Limite direito: ${rightLimit.toFixed(0)}, Tela: ${canvasWidth}`);
  }
}
