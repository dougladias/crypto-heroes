import Enemy from './Enemy.js';
import PowerObject from './BossPowerObject.js'; 

export default class SquidGame extends Enemy {
  constructor(x, y, spriteSheet, config = {}) {
    const squidConfig = {
      width: 330,           
      height: 250,          
      totalFrames: 3,      // Total de frames na sprite
      frameRate: 6,        // Velocidade da animação (mais lento que goblin)
      cols: 3,             // Assumindo 3 colunas
      rows: 1,             // 1 linha
      velocityX: -2.0,     // Um pouco mais rápido que o goblin
      health: 5000,          // Mais resistente
      damage: 20,          // Mais dano
      type: 'squid-game',
      attackRange: 50,     // Maior alcance
      attackCooldown: 1000, // Ataque mais rápido
      ...config
    };    super(x, y, spriteSheet, squidConfig);
    
    // Propriedades específicas do Squid Game
    this.inkAttackActive = false;
    this.inkAttackDuration = 1500; // 1.5 segundos
    this.inkAttackTimer = 0;
    this.inkDamage = 8;    // Configurações de boss
    this.isBoss = config.isBoss || false;
      // Sistema de poderes do boss (IGUAL AO PLAYER!)
    this.powerObjects = []; // MESMO ARRAY DO PLAYER
    this.powerCooldown = 800; // Cooldown automático
    this.lastPowerTime = 0;
    this.assets = null; // Será definido quando necessário
    
    // Configurar frames de animação específicos
    this.setupAnimations();
  }

  setupAnimations() {
    // Definir diferentes animações se o sprite tiver múltiplos frames
    this.animations = {
      walk: { frames: [0, 1, 2, 1], currentFrame: 0 },
      attack: { frames: [3, 4, 5], currentFrame: 0 },
      inkAttack: { frames: [6, 7, 8], currentFrame: 0 }
    };
  }  update(deltaTime, player = null) {
    // Se for boss, ficar parado voando
    if (this.isBoss) {
      // Atualizar apenas a animação usando o sistema do Sprite, sem movimento
      this.updateAnimation(deltaTime);
        // Atualizar poderes (IGUAL AO PLAYER!)
      this.updatePowerObjects(deltaTime);
      
      // Atirar automaticamente
      if (player && this.assets) {
        this.autoShoot();
      }
      
      // Atualizar ataque de tinta se estiver ativo
      if (this.inkAttackActive) {
        this.inkAttackTimer -= deltaTime;
        if (this.inkAttackTimer <= 0) {
          this.inkAttackActive = false;
        }
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
  render(ctx) {
    super.render(ctx);
    
    // Renderizar efeito de tinta se estiver ativo
    if (this.inkAttackActive) {
      this.renderInkEffect(ctx);
    }    // Renderizar poderes (IGUAL AO PLAYER!)
    if (this.isBoss) {
      this.renderPowerObjects(ctx);
    }
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
    console.log('🎯 Boss assets configurados!');
  }
  
  // Atirar automático (em vez de apertar botão)
  autoShoot() {
    const currentTime = performance.now();
    if (currentTime - this.lastPowerTime >= this.powerCooldown) {
      this.releasePowerObject();
      this.lastPowerTime = currentTime;
    }
  }
  
  // EXATAMENTE IGUAL AO PLAYER, só que INVERTIDO!
  releasePowerObject() {
    if (!this.assets) return;
    
    // Boss atira para a ESQUERDA (direção -1)
    const offsetX = -80; // Para a esquerda
    const powerX = this.x + offsetX;
    const powerY = this.y + this.height / 2; // Meio do boss
    
    // Criar poder IGUAL ao player (direção -1 = esquerda)
    const powerObject = new PowerObject(this.assets, powerX, powerY, -1);
    this.powerObjects.push(powerObject);
    
    console.log(`🔥 BOSS ATIROU! Poder na posição (${powerX}, ${powerY})`);
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
