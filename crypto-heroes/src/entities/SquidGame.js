import Enemy from './Enemy.js';
import Sprite from '../engine/Sprite.js';
import PowerObject from './BossPowerObject.js';
import AerialPowerObject from './AerialPowerObject.js'; // ✨ NOVO

export default class SquidGame extends Enemy {
  constructor(x, y, spriteSheet, config = {}) {
    const squidConfig = {
      width: 300,           
      height: 220,          
      totalFrames: 3,      // Total de frames na sprite
      frameRate: 6,        // Velocidade da animação (mais lento que goblin)
      cols: 3,             // Assumindo 3 colunas
      rows: 1,             // 1 linha
      velocityX: -2.0,     // Um pouco mais rápido que o goblin
      health: 2500,          // Mais resistente
      damage: 20,          // Mais dano
      type: 'squid-game',
      attackRange: 50,     // Maior alcance
      attackCooldown: 1000, // Ataque mais rápido
      ...config
    };    super(x, y, spriteSheet, squidConfig);
    
    // Propriedades específicas do Squid Game
    this.inkAttackActive = false;
    this.inkAttackDuration = 3000; // 3 segundos
    this.inkAttackTimer = 0;
    this.inkDamage = 8;    // Configurações de boss
    this.isBoss = config.isBoss || false;

    // Sistema de poderes do boss (IGUAL AO PLAYER!)
    this.powerObjects = []; // MESMO ARRAY DO PLAYER
    this.powerCooldown = 800; // Cooldown base
    this.powerCooldownVariation = 600; // Variação para aleatoriedade (+/- 600ms)
    this.currentPowerCooldown = this.powerCooldown; // Cooldown atual (será aleatório)
    this.lastPowerTime = 0;
    this.assets = null; // Será definido quando necessário

    // Sistema de aleatoriedade de tiros
    this.shootChance = 0.5; // 50% de chance de atirar quando o cooldown permite
    this.burstMode = false; // Modo rajada ocasional
    this.burstShots = 0; // Contador de tiros na rajada
    this.maxBurstShots = 2; // Máximo de tiros na rajada
    this.burstCooldown = 200; // Cooldown entre tiros na rajada (mais rápido)
    
    // Sistema de movimento vertical aleatório
    this.baseY = y; // Posição Y original/base
    this.currentTargetY = y; // Posição Y alvo atual
    this.isMovingVertically = false; // Se está se movendo verticalmente
    this.verticalSpeed = 1.5; // Velocidade do movimento vertical
    this.maxVerticalDistance = 60; // Máxima distância que pode subir/descer
    this.verticalMoveChance = 0.003; // Chance por frame de iniciar movimento (muito baixa)
    this.timeAtPosition = 0; // Tempo na posição atual
    this.minTimeAtPosition = 2000; // Tempo mínimo para ficar em uma posição (2 segundos)
    this.maxTimeAtPosition = 5000; // Tempo máximo para ficar em uma posição (5 segundos)
    this.nextMoveTime = this.generateRandomWaitTime(); // Quando fazer o próximo movimento
    
    // Configurar frames de animação específicos
    this.setupAnimations();
    
    // Inicializar cooldown aleatório se for boss
    if (this.isBoss) {
      this.generateRandomCooldown();
    }
    
    // ✨ NOVO: Sistema de ataques aéreos
    this.aerialPowers = [];
    this.aerialAttackCooldown = 3000; // 3 segundos entre ataques aéreos
    this.lastAerialAttackTime = 0;
    this.aerialAttackActive = false;
    this.maxAerialProjectiles = 2; // Máximo de projéteis por ataque
    
    // Sistema de vida para 50%
    this.maxHealth = this.health;
    this.phase2Activated = false; // Controlar se já ativou fase 2
  }
  setupAnimations() {
    // Definir diferentes animações se o sprite tiver múltiplos frames
    this.animations = {
      walk: { frames: [0, 1, 2, 1], currentFrame: 0 },
      attack: { frames: [3, 4, 5], currentFrame: 0 },
      inkAttack: { frames: [6, 7, 8], currentFrame: 0 }
    };
  }
  
  // Gerar tempo aleatório para esperar antes do próximo movimento
  generateRandomWaitTime() {
    return this.minTimeAtPosition + Math.random() * (this.maxTimeAtPosition - this.minTimeAtPosition);
  }
  
  // Iniciar movimento vertical aleatório
  startVerticalMovement() {
    // Decidir se vai subir ou descer (ou voltar para a base)
    const moveOptions = [];
    
    // Se está na posição base, pode subir ou descer
    if (Math.abs(this.y - this.baseY) < 10) {
      moveOptions.push(this.baseY - this.maxVerticalDistance); // Subir
      moveOptions.push(this.baseY + this.maxVerticalDistance/2); // Descer um pouco
    } else {
      // Se não está na base, adicionar a opção de voltar para a base
      moveOptions.push(this.baseY);
      
      // Pequena chance de ir para outra posição em vez de voltar à base
      if (Math.random() < 0.3) {
        moveOptions.push(this.baseY - this.maxVerticalDistance/2);
      }
    }
    
    // Escolher posição aleatória
    this.currentTargetY = moveOptions[Math.floor(Math.random() * moveOptions.length)];
    this.isMovingVertically = true;
    this.timeAtPosition = 0;
  }  update(deltaTime, player = null) {
    if (this.isBoss) {
      // Atualizar apenas a animação usando o sistema do Sprite, sem movimento
      this.updateAnimation(deltaTime);
      
      // Atualizar movimento vertical aleatório
      this.updateVerticalMovement(deltaTime);
      
      // Atualizar poderes (IGUAL AO PLAYER!)
      this.updatePowerObjects(deltaTime);
      
      // Atirar automaticamente
      if (player && this.assets) {
        this.autoShoot(player);
      }
      
      // Atualizar ataque de tinta se estiver ativo
      if (this.inkAttackActive) {
        this.inkAttackTimer -= deltaTime;
        if (this.inkAttackTimer <= 0) {
          this.inkAttackActive = false;
        }
      }
      
      // ✨ NOVO: Atualizar projéteis aéreos
      this.updateAerialPowers(deltaTime);
      
      // ✨ NOVO: Verificar se deve fazer ataque aéreo (apenas se vida <= 50%)
      if (this.shouldUseAerialAttack() && player) {
        this.performAerialAttack(player);
      }
    } else {
      // Comportamento normal para inimigos comuns
      super.update(deltaTime);
      
      // Atualizar ataque de tinta se estiver ativo
      if (this.inkAttackActive) {
        this.inkAttackTimer -= deltaTime;
        if (this.inkAttackTimer <= 0) {
          this.inkAttackActive = false;
        }
      }
    }  }

  // Atualizar movimento vertical do boss
  updateVerticalMovement(deltaTime) {
    this.timeAtPosition += deltaTime;
    
    // Se está se movendo verticalmente
    if (this.isMovingVertically) {
      // Calcular direção do movimento
      const direction = this.currentTargetY > this.y ? 1 : -1;
      const distance = Math.abs(this.currentTargetY - this.y);
      
      // Se chegou próximo ao destino
      if (distance < this.verticalSpeed) {
        this.y = this.currentTargetY;
        this.isMovingVertically = false;
        this.timeAtPosition = 0;
        this.nextMoveTime = this.generateRandomWaitTime();
      } else {
        // Mover em direção ao alvo
        this.y += this.verticalSpeed * direction;
      }
    } else {
      // Se não está se movendo, verificar se é hora de se mover
      if (this.timeAtPosition >= this.nextMoveTime) {
        // Chance aleatória de iniciar movimento
        if (Math.random() < 0.8) { // 80% de chance quando o tempo passa
          this.startVerticalMovement();
        } else {
          // Se não se mover desta vez, esperar um pouco mais
          this.nextMoveTime = this.generateRandomWaitTime() * 0.5; // Metade do tempo
          this.timeAtPosition = 0;
        }
      }
    }
  }

  // Ataque especial: jato de tinta
  performInkAttack(target) {
    if (!this.inkAttackActive && this.canAttack()) {
      this.inkAttackActive = true;
      this.inkAttackTimer = this.inkAttackDuration;
      this.lastAttackTime = performance.now();
      
      // Causar dano ao alvo
      if (target && this.isInRange(target)) {
        target.takeDamage(this.inkDamage);
      }
      
      return true;
    }
    return false;
  }

  // Override do método de ataque para incluir chance de ataque especial
  attack(target) {
    if (this.canAttack() && this.isInRange(target)) {
      // 30% de chance de usar ataque de tinta
      if (Math.random() < 0.3) {
        return this.performInkAttack(target);
      } else {
        return super.attack(target);
      }
    }
    return false;
  }
  
  // ✨ NOVO: Verificar se deve usar ataque aéreo
  shouldUseAerialAttack() {
    const healthPercentage = this.health / this.maxHealth;
    const currentTime = performance.now();
    
    // Só atacar se vida <= 50% E passou o cooldown
    return healthPercentage <= 0.5 && 
           currentTime - this.lastAerialAttackTime >= this.aerialAttackCooldown &&
           !this.aerialAttackActive;
  }
  
  // ✨ NOVO: Executar ataque aéreo
  performAerialAttack(player) {
    console.log('🌩️ BOSS ATIVOU ATAQUE AÉREO!');
    
    // Ativar fase 2 se ainda não foi ativada
    if (!this.phase2Activated) {
      this.phase2Activated = true;
      console.log('⚡ BOSS ENTROU NA FASE 2! (50% de vida)');
    }
    
    this.aerialAttackActive = true;
    this.lastAerialAttackTime = performance.now();
    
    // Tocar som especial se disponível
    try {
      if (this.assets.sounds.whoosh) {
        AssetLoader.playSound(this.assets.sounds.whoosh, 0.8);
      }
    } catch (e) {
      // Som não disponível
    }
    
    // Criar múltiplos projéteis que caem do céu
    for (let i = 0; i < this.maxAerialProjectiles; i++) {
      setTimeout(() => {
        this.createAerialProjectile(player);
      }, i * 300); // 300ms entre cada projétil
    }
    
    // Resetar estado após todos os projéteis
    setTimeout(() => {
      this.aerialAttackActive = false;
    }, this.maxAerialProjectiles * 300 + 1000);
  }
  
  // ✨ NOVO: Criar projétil aéreo
  createAerialProjectile(player) {
    if (!player) return;
    
    // Calcular posição X próxima ao player (com alguma variação)
    const playerX = player.x;
    const variation = (Math.random() - 0.5) * 200; // ±100px de variação
    const projectileX = playerX + variation;
    
    // Garantir que não saia da tela
    const clampedX = Math.max(50, Math.min(1150, projectileX));
    
    // Projétil começa no topo da tela
    const projectileY = -50;
    
    const aerialPower = new AerialPowerObject(this.assets, clampedX, projectileY);
    this.aerialPowers.push(aerialPower);
    
    console.log(`💫 Projétil aéreo criado em X: ${clampedX}`);
  }
  
  // Atualizar projéteis aéreos
  updateAerialPowers(dt) {
    for (let i = this.aerialPowers.length - 1; i >= 0; i--) {
      const aerialPower = this.aerialPowers[i];
      aerialPower.update(dt);
      
      if (!aerialPower.isActive()) {
        this.aerialPowers.splice(i, 1);
      }
    }
  }
  
  // Renderizar projéteis aéreos
  renderAerialPowers(ctx) {
    this.aerialPowers.forEach(aerialPower => {
      aerialPower.render(ctx);
    });
  }
  
  // Obter projéteis aéreos (para colisões)
  getAerialPowers() {
    return this.aerialPowers;
  }
  
  render(ctx) {
    super.render(ctx);
    
    // Renderizar efeito de tinta se estiver ativo
    if (this.inkAttackActive) {
      this.renderInkEffect(ctx);
    }    // Renderizar poderes (IGUAL AO PLAYER!)
    if (this.isBoss) {
      this.renderPowerObjects(ctx);
    }
    
    // Renderizar projéteis normais
    this.renderPowerObjects(ctx);
    
    // ✨ NOVO: Renderizar projéteis aéreos
    this.renderAerialPowers(ctx);
  }

  renderInkEffect(ctx) {
    // Efeito visual de tinta (círculo escuro semi-transparente)
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#2a0845'; // Cor roxa escura
    ctx.beginPath();
    ctx.arc(
      this.x + this.width / 2, 
      this.y + this.height / 2, 
      30, 
      0, 
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }
  // === MÉTODOS IGUAIS AO PLAYER! ===
  
  // Configurar assets
  setAssets(assets) {
    this.assets = assets;    
  }  // Atirar automático (em vez de apertar botão) - AGORA COM ALEATORIEDADE!
  autoShoot(player) {
    const currentTime = performance.now();
    
    // Verificar se passou o cooldown atual
    if (currentTime - this.lastPowerTime >= this.currentPowerCooldown) {
      
      // Verificar chance de atirar (para tornar mais imprevísivel)
      if (Math.random() < this.shootChance) {
        
        // Se estiver em modo rajada
        if (this.burstMode) {
          this.releasePowerObject(player);
          this.burstShots++;
          this.lastPowerTime = currentTime;
          this.currentPowerCooldown = this.burstCooldown; // Cooldown mais rápido na rajada
          
          // Verificar se terminou a rajada
          if (this.burstShots >= this.maxBurstShots) {
            this.burstMode = false;
            this.burstShots = 0;
            // Próximo cooldown será normal e aleatório
            this.generateRandomCooldown();
          }
        } else {
          // Tiro normal
          this.releasePowerObject(player);
          this.lastPowerTime = currentTime;
          
          // 15% chance de entrar em modo rajada após um tiro normal
          if (Math.random() < 0.15) {
            this.burstMode = true;
            this.burstShots = 0;
            this.currentPowerCooldown = this.burstCooldown;
          } else {
            // Gerar próximo cooldown aleatório
            this.generateRandomCooldown();
          }
        }
      } else {
        // Não atirou desta vez, mas gerar novo cooldown menor para tentar novamente em breve
        this.lastPowerTime = currentTime;
        this.currentPowerCooldown = 200 + Math.random() * 400; // 200-600ms para tentar novamente
      }
    }
  }
  
  // Gerar cooldown aleatório para tornar os tiros imprevisíveis
  generateRandomCooldown() {
    // Cooldown base +/- variação aleatória
    const variation = (Math.random() - 0.5) * 2 * this.powerCooldownVariation; // -600 a +600
    this.currentPowerCooldown = this.powerCooldown + variation;
    
    // Garantir que não seja muito rápido nem muito lento
    this.currentPowerCooldown = Math.max(400, Math.min(2000, this.currentPowerCooldown));
  }// CORRIGIDO: Boss atira da sua posição em direção ao player!
  releasePowerObject(player) {
    if (!this.assets || !player) {
      return;
    }
    
    const offsetX = -30;
    const powerX = this.x + offsetX;
    
    // ✨ SISTEMA DE MÚLTIPLAS ALTURAS
    let powerY;
    const shootPattern = Math.random();
    
    if (shootPattern < 0.4) {
      // 40% - Tiro alto (pode ser esquivado agachando)
      powerY = this.y + (this.height * 0.3); // Terço superior
    } else if (shootPattern < 0.7) {
      // 30% - Tiro meio (pega player em pé, difícil de esquivar)
      powerY = this.y + (this.height * 0.6); // Meio-baixo
    } else {
      // 30% - Tiro baixo (sempre pega, não pode esquivar agachando)
      powerY = this.y + (this.height * 0.8); // Bem baixo
    }
    
    const powerObject = new PowerObject(this.assets, powerX, powerY, -1);
    this.powerObjects.push(powerObject);
  }
  
  // IGUAL AO PLAYER!
  updatePowerObjects(dt) {
    for (let i = this.powerObjects.length - 1; i >= 0; i--) {
      const powerObject = this.powerObjects[i];
      powerObject.update(dt);
      
      if (!powerObject.isActive()) {
        this.powerObjects.splice(i, 1);
      }
    }
  }
  
  // IGUAL AO PLAYER!
  renderPowerObjects(ctx) {
    this.powerObjects.forEach(powerObject => {
      powerObject.render(ctx);
    });
  }
  
  // IGUAL AO PLAYER!
  getPowerObjects() {
    return this.powerObjects;
  }

  // Propriedades específicas para identificação
  get enemyType() {
    return 'squid-game';
  }

  // Pontuação específica
  get scoreValue() {
    return 150; // Mais pontos que outros inimigos
  }
}
