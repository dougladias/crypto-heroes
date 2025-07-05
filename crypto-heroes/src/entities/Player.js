import Sprite from "../engine/Sprite.js";
import AssetLoader from "../engine/AssetLoader.js";
import PowerObject from "./PowerObject.js";

export default class Player {
  constructor(assets, heroId) {
    // ✨ IMPORTANTE: O sprite importado como "_idle" é na verdade um sprite de corrida
    // Isso permite usar a mesma animação tanto para movimento quanto para idle (primeiro frame)

    // Guardar referência dos assets para tocar sons
    this.assets = assets;
    this.heroId = heroId;

    // ✨ DIMENSÕES DO PLAYER (para colisões)
    this.width = 20; // Largura do player
    this.height = 50; // Altura do player

    // ✨ ATUALIZADO: Sprite de corrida + power
    this.sprites = {
      run: new Sprite(assets.images[`${heroId}_run`], 5, 8),
      power: new Sprite(assets.images[`${heroId}_power`], 5, 8),
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

    // Sistema Fast Fall e Agachar
    this.isCrouching = false; // Se está agachado
    this.isFastFalling = false; // Se está em fast fall
    this.fastFallMultiplier = 3.5; // Multiplicador da gravidade no fast fall
    this.crouchHeight = 25; // Altura quando agachado (metade da altura normal)
    this.normalHeight = 50; // Altura normal

    this.actionTimer = 0;
    // Sistema de objetos de poder
    this.powerObjects = []; // Array para armazenar objetos de poder ativos
    this.powerReleaseTimer = 0; // Timer para soltar o objeto 1s após ativar poder

    // ✨ NOVO: Sistema de poder especial
    this.enemiesKilled = 0; // Contador de inimigos mortos
    this.specialPowerAvailable = false; // Se o poder especial está disponível
    this.specialPowerCooldown = 0; // Cooldown do poder especial
    this.ENEMIES_FOR_SPECIAL = 10; // Inimigos necessários para poder especial

    // ✨ ATUALIZADO: Frames para sprite de corrida (sem idle)
    this.frames = {
      run: [0, 1, 2, 3, 4], // Frames de corrida (todos os frames)
      power: [0, 1, 2, 3, 4], // Todos os frames da sprite de poder
    };
    // ✨ INICIALIZAR: Começar sempre correndo
    this.currentSprite.setFrameRange(this.frames.run);
    this.currentSprite.setFrameRate(10);
    this.currentSprite.reset();
  }
  update(dt, input, enemyManager = null) {
    const wasMoving = this.isMoving;
    this.isMoving = false;

    // Detectar movimento usando o InputManager correto
    if (input.isDown("Left")) {
      this.x -= (this.speed * dt) / 1000;
      this.isMoving = true;
      this.facing = -1;
    }
    if (input.isDown("Right")) {
      this.x += (this.speed * dt) / 1000;
      this.isMoving = true;
      this.facing = 1;
    }
    // ✨ USAR TAMANHO REAL DA TELA - aumentado para permitir ir mais para direita
    this.limitPlayerPosition(1200, enemyManager); // Processar pulo
    if (input.wasPressed("Jump") && this.isGrounded) {
      this.jumpVelocity = this.jumpPower;
      this.isGrounded = false;
      AssetLoader.playSound(this.assets.sounds.whoosh, 0.4);
    }
    // ✨ ATUALIZADO: Apenas ação de poder (soco removido)
    if (input.wasPressed("Power") && this.actionTimer <= 0) {
      this.currentAction = "power";
      this.actionTimer = 600; // 600ms de duração
      this.powerReleaseTimer = 400; // Soltar objeto após 400ms
      this.currentSprite = this.sprites.power; // Trocar para sprite de poder
      this.currentSprite.setFrameRange(this.frames.power);
      this.currentSprite.setFrameRate(8); // Frame rate otimizado
      this.currentSprite.reset();
      AssetLoader.playSound(this.assets.sounds.power, 0.6);
    } // ✨ NOVO: Poder especial (tecla Q)
    if (input.wasPressed("SpecialPower")) {
      if (this.specialPowerAvailable && this.actionTimer <= 0) {
        this.useSpecialPower();
      }
    }
    // Física do pulo com Fast Fall
    if (!this.isGrounded) {
      // Aplicar gravidade normal ou fast fall
      let currentGravity = this.gravity;
      if (this.isFastFalling) {
        currentGravity *= this.fastFallMultiplier; // Gravidade mais forte
      }

      this.jumpVelocity -= (currentGravity * dt) / 1000;
      this.y += (this.jumpVelocity * dt) / 1000;

      // Verificar se voltou ao chão
      if (this.y <= 0) {
        this.y = 0;
        this.jumpVelocity = 0;
        this.isGrounded = true;
        this.isFastFalling = false; // Reset fast fall ao tocar o chão
      }
    }
    // Atualizar timer de ação
    if (this.actionTimer > 0) {
      this.actionTimer -= dt;
    }

    // ✨ NOVO: Atualizar cooldown do poder especial
    if (this.specialPowerCooldown > 0) {
      this.specialPowerCooldown -= dt;
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
    this.updatePowerObjects(dt); // Gerenciar animação baseada no estado
    if (this.actionTimer > 0) {
      // Durante ação - apenas animar (já foi configurado quando a ação começou)
      this.currentSprite.step(dt);
    } else {
      // ✨ SEMPRE CORRENDO: Manter animação de corrida sempre ativa
      if (this.currentAction !== "run") {
        this.currentAction = "run";
        this.currentSprite = this.sprites.run; // Usar sprite de corrida
        this.currentSprite.setFrameRange(this.frames.run); // Array com 5 frames
        this.currentSprite.setFrameRate(10); // Frame rate para corrida
        this.currentSprite.reset();
      }
      this.currentSprite.step(dt); // Sempre animar a corrida
    }

    // Sistema Fast Fall / Agachar (tecla S)
    const downPressed = input.isDown("Down"); // Tecla S

    if (downPressed) {
      if (!this.isGrounded) {
        // No ar: Fast Fall
        if (!this.isFastFalling) {
          this.isFastFalling = true;
          // Som opcional para feedback
          try {
            AssetLoader.playSound(this.assets.sounds.whoosh, 0.3);
          } catch (e) {
            // Som não disponível
          }
        }
      } else {
        // No chão: Agachar
        if (!this.isCrouching) {
          this.isCrouching = true;
          this.height = this.crouchHeight; // Reduzir altura para colisão
        }
      }
    } else {
      // Soltar tecla S
      this.isFastFalling = false;
      if (this.isCrouching) {
        this.isCrouching = false;
        this.height = this.normalHeight; // Restaurar altura normal
      }
    }
  }
  render(ctx) {
    // Ajustar posição Y para o boneco ficar no chão
    const groundY = ctx.canvas.height - 280;
    const renderY = groundY - this.y;

    // FEEDBACK VISUAL MELHORADO
    const playerWidth = 130;
    let playerHeight = 250;
    let renderYAdjusted = renderY;

    // Se estiver agachado, reduzir altura visual e ajustar posição
    if (this.isCrouching) {
      playerHeight = 160;
      renderYAdjusted = renderY + 90;

      ctx.save();
      ctx.shadowColor = "rgba(0, 255, 0, 0.3)";
      ctx.shadowBlur = 5;
    }

    this.currentSprite.draw(
      ctx,
      this.x,
      renderYAdjusted,
      playerWidth,
      playerHeight,
      this.facing === -1
    );

    if (this.isCrouching) {
      ctx.restore();
    }

    // Renderizar objetos de poder
    this.renderPowerObjects(ctx);

    // ✨ NOVO: Renderizar hitboxes de debug (ativar/desativar conforme necessário)
    if (window.debugHitboxes) {
      this.renderDebugHitboxes(ctx);
    }
  } // Soltar objeto de poder
  releasePowerObject() {
    // Calcular posição do objeto baseado na posição do player e direção
    const offsetX = this.facing === 1 ? 80 : -80; // Offset para frente do player (mais longe)
    const powerX = this.x + offsetX;

    // ✨ CORREÇÃO CRÍTICA: Poder deve sair na altura do meio do personagem
    // Como o personagem tem 280px de altura, o meio está a 140px da base
    // No sistema físico: this.y (altura dos pés) + 140 (meio do corpo)
    const powerY = this.y + 140; // Meio do corpo do personagem
    // Criar novo objeto de poder
    const powerObject = new PowerObject(
      this.assets,
      powerX,
      powerY,
      this.facing
    );
    this.powerObjects.push(powerObject);
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
    this.powerObjects.forEach((powerObject) => {
      powerObject.render(ctx);
    });
  }
  // Obter todos os objetos de poder ativos (para colisões futuras)
  getPowerObjects() {
    return this.powerObjects;
  }
  // Getter para verificar status atual
  get status() {
    return {
      facing: this.facing === 1 ? "right" : "left",
      isGrounded: this.isGrounded,
      isMoving: this.isMoving,
      isCrouching: this.isCrouching, // ✨ NOVO
      isFastFalling: this.isFastFalling, // ✨ NOVO
      currentFrame: this.currentSprite.frame,
      currentAction: this.currentAction,
      bounds: this.bounds, // ✨ NOVO: Ver bounds atual
      specialPower: this.getSpecialPowerStatus(), // ✨ NOVO
    };
  }
  // ✨ BOUNDS PARA COLISÃO (necessário para detectar poderes do boss)
  get bounds() {
    const groundY = 600 - 80;
    const renderY = groundY - this.y;

    // ✨ SISTEMA DE ESQUIVA: Hitbox ajustada ao tamanho visual real
    if (this.isCrouching) {
      // Agachado: hitbox bem menor e mais baixa
      return {
        x: this.x + 20, // Margem lateral (player visual tem 130px, hitbox ~100px)
        y: renderY + 70, // Muito mais baixo (120px para baixo)
        width: 80, // ✨ AJUSTADO: Largura fixa menor
        height: 70, // ✨ AJUSTADO: Altura pequena para agachamento
      };
    } else {
      // Em pé: hitbox proporcional ao personagem visual
      return {
        x: this.x + 20, // ✨ AJUSTADO: Margem lateral (130px visual -> 100px hitbox)
        y: renderY + -20, // ✨ AJUSTADO: Margem superior (não pegar a cabeça toda)
        width: 80, // ✨ AJUSTADO: Largura realista
        height: 130, // Altura hitbox personagem
      };
    }
  }
  // ✨ LIMITES IGUAIS - Mesma margem dos dois lados + limitação para boss
  limitPlayerPosition(canvasWidth = 1200, enemyManager = null) {
    // Tamanho do player (mesmo valor usado no render)
    const playerWidth = 130;

    // Definir limites iguais dos dois lados
    const margin = 5; // Margem igual para ambos os lados
    const leftLimit = margin; // Margem esquerda
    let rightLimit = canvasWidth - playerWidth - margin; // Margem direita igual

    // ✨ NOVO: Se há boss ativo, limitar player para não passar do boss
    if (enemyManager && enemyManager.bossActive) {
      const bossX = canvasWidth * 0.7; // Mesma posição do boss (70% da tela)
      const bossLimit = bossX - playerWidth - 20; // 20px de distância do boss
      if (bossLimit < rightLimit) {
        rightLimit = bossLimit;
      }
    }

    // Aplicar limites sem quebrar as ações    const previousX = this.x;

    if (this.x < leftLimit) {
      this.x = leftLimit;
    }
    if (this.x > rightLimit) {
      this.x = rightLimit;
    }
    // Debug: remover para performance (descomente se precisar debugar)
    // console.log(`Player X: ${this.x.toFixed(0)}, Limite esquerdo: ${leftLimit}, Limite direito: ${rightLimit.toFixed(0)}, Tela: ${canvasWidth}`);
  }
  // Método para receber dano
  takeDamage(damage) {
    // Aplicar dano ao player - por enquanto só usar o callback
    // Você pode expandir aqui para ter sistema de HP se quiser

    // Por enquanto, usar o callback existente para simular perda de vida
    return true;
  } // ✨ NOVO: Métodos do poder especial

  // Método chamado quando um inimigo é morto
  onEnemyKilled(enemy) {
    this.enemiesKilled++;
    // Verificar se pode ativar poder especial
    if (
      this.enemiesKilled >= this.ENEMIES_FOR_SPECIAL &&
      !this.specialPowerAvailable
    ) {
      this.specialPowerAvailable = true;
      // Tentar tocar som se existir
      try {
        if (this.assets.sounds.victory) {
          AssetLoader.playSound(this.assets.sounds.victory, 0.3);
        } else {
          AssetLoader.playSound(this.assets.sounds.power, 0.3); // Fallback
        }
      } catch (e) {
        // Som não disponível, continuar silenciosamente
      }
    }
  }
  // Usar poder especial
  useSpecialPower() {
    if (!this.specialPowerAvailable || this.specialPowerCooldown > 0) return;

    // Configurar animação de poder especial
    this.currentAction = "special";
    this.actionTimer = 800; // Duração mais longa para poder especial
    this.currentSprite = this.sprites.power;
    this.currentSprite.setFrameRange(this.frames.power);
    this.currentSprite.setFrameRate(12); // Mais rápido para parecer mais poderoso
    this.currentSprite.reset();

    // Som mais intenso
    AssetLoader.playSound(this.assets.sounds.power, 1.0);

    // Lançar múltiplos poderes em rajada
    this.releaseSpecialPowerBurst();

    // Resetar contador e desativar poder especial
    this.specialPowerAvailable = false;
    this.enemiesKilled = 0;
    this.specialPowerCooldown = 2000; // 2 segundos de cooldown
  }

  // Lançar rajada de poderes especiais
  releaseSpecialPowerBurst() {
    // Lançar 8 poderes em sequência
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const offsetX = this.facing === 1 ? 80 + i * 30 : -80 - i * 30;
        const powerX = this.x + offsetX;
        const powerY = this.y + 140;
        // Criar poder especial mais forte
        const specialPower = new PowerObject(
          this.assets,
          powerX,
          powerY,
          this.facing
        );
        specialPower.damage = 50; // Mais dano que o poder normal
        specialPower.speed *= 1.5; // Mais rápido
        this.powerObjects.push(specialPower);
      }, i * 150); // 150ms entre cada poder
    }
  }

  // Getters para UI
  getSpecialPowerStatus() {
    return {
      available: this.specialPowerAvailable,
      progress: this.enemiesKilled,
      needed: this.ENEMIES_FOR_SPECIAL,
      cooldown: this.specialPowerCooldown,
    };
  }

  // ✨ NOVO: Método para renderizar hitboxes de debug
  renderDebugHitboxes(ctx) {
    // 1. HITBOX DO PLAYER
    const playerBounds = this.bounds;
    ctx.save();

    // Cor baseada no estado
    if (this.isCrouching) {
      ctx.strokeStyle = "lime"; // Verde brilhante quando agachado
      ctx.fillStyle = "rgba(0, 255, 0, 0.2)"; // Verde translúcido
    } else {
      ctx.strokeStyle = "red"; // Vermelho quando em pé
      ctx.fillStyle = "rgba(255, 0, 0, 0.2)"; // Vermelho translúcido
    }

    ctx.lineWidth = 3;

    // Desenhar hitbox do player
    ctx.fillRect(
      playerBounds.x,
      playerBounds.y,
      playerBounds.width,
      playerBounds.height
    );
    ctx.strokeRect(
      playerBounds.x,
      playerBounds.y,
      playerBounds.width,
      playerBounds.height
    );

    // Texto de status do player
    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    const statusText = this.isCrouching ? "🟢 AGACHADO" : "🔴 EM PÉ";
    ctx.strokeText(statusText, playerBounds.x, playerBounds.y - 10);
    ctx.fillText(statusText, playerBounds.x, playerBounds.y - 10);

    ctx.restore();

    // 2. HITBOXES DOS PODERES DO PLAYER
    this.powerObjects.forEach((power, index) => {
      if (!power.isActive()) return;

      const powerBounds = power.getBounds(ctx);
      ctx.save();
      ctx.strokeStyle = "cyan";
      ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
      ctx.lineWidth = 2;

      ctx.fillRect(
        powerBounds.x,
        powerBounds.y,
        powerBounds.width,
        powerBounds.height
      );
      ctx.strokeRect(
        powerBounds.x,
        powerBounds.y,
        powerBounds.width,
        powerBounds.height
      );

      // Texto do poder
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.fillText(`P${index}`, powerBounds.x, powerBounds.y - 5);

      ctx.restore();
    });
  }
}
