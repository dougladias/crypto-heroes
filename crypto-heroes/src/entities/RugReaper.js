import Enemy from './Enemy.js';

export default class RugReaper extends Enemy {
  constructor(x, y, spriteSheet, config = {}) {    const reaperConfig = {
      width: 120,           // Aumentado de 56 para 90
      height: 300,         // Aumentado de 64 para 100
      totalFrames: 3,      // Total de frames na sprite
      frameRate: 8,        // Velocidade da animação
      cols: 3,             // Assumindo 3 colunas
      rows: 1,             // 1 linha
      velocityX: -2.2,     // Mais rápido que o Gas Goblin
      health: 80,
      damage: 20,
      type: 'rug-reaper',
      attackRange: 60,
      attackCooldown: 800,
      ...config
    };

    super(x, y, spriteSheet, reaperConfig);
    
    // Propriedades específicas do Rug Reaper
    this.dashCooldown = 3000; // 3 segundos
    this.lastDashTime = 0;
    this.isDashing = false;
    this.dashSpeed = -6;
    this.dashDuration = 500; // 0.5 segundos
    this.dashTimer = 0;
    
    // Efeito de "roubo" - pode drenar recursos do jogador
    this.stealChance = 0.3; // 30% chance de roubar
    this.stealAmount = 10;
    
    this.setupAnimations();
  }

  setupAnimations() {
    this.animations = {
      walk: { frames: [0, 1, 2, 3], currentFrame: 0 },
      dash: { frames: [4, 5], currentFrame: 0 },
      attack: { frames: [6, 7, 8], currentFrame: 0 },
      steal: { frames: [9, 10, 11], currentFrame: 0 }
    };
  }

  update(deltaTime) {
    // Atualizar dash
    if (this.isDashing) {
      this.dashTimer -= deltaTime;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.velocityX = this.isDashing ? this.dashSpeed : -2.2;
        this.currentAnimation = 'walk';
      }
    } else {
      // Verificar se pode fazer dash
      const currentTime = Date.now();
      if (currentTime - this.lastDashTime >= this.dashCooldown) {
        if (Math.random() < 0.02) { // 2% chance por frame
          this.startDash();
        }
      }
    }

    super.update(deltaTime);
  }

  startDash() {
    this.isDashing = true;
    this.dashTimer = this.dashDuration;
    this.lastDashTime = Date.now();
    this.velocityX = this.dashSpeed;
    this.currentAnimation = 'dash';
    
    console.log('Rug Reaper iniciou um dash rápido!');
  }

  attack(player) {
    if (!this.canAttack(player)) return false;

    this.lastAttackTime = Date.now();
    
    // 60% chance de ataque normal, 40% chance de tentativa de roubo
    if (Math.random() < 0.6) {
      return this.slashAttack(player);
    } else {
      return this.stealAttack(player);
    }
  }

  slashAttack(player) {
    console.log('Rug Reaper fez um ataque de lâmina!');
    
    this.currentAnimation = 'attack';
    
    // Dano aumentado se estiver dashando
    const finalDamage = this.isDashing ? this.damage * 1.5 : this.damage;
    
    if (player.takeDamage) {
      player.takeDamage(finalDamage);
    }
    
    return true;
  }

  stealAttack(player) {
    console.log('Rug Reaper tentou roubar recursos!');
    
    this.currentAnimation = 'steal';
    
    // Dano menor, mas pode roubar recursos
    const stealDamage = this.damage * 0.7;
    
    if (player.takeDamage) {
      player.takeDamage(stealDamage);
    }
    
    // Tentar roubar recursos (implementar conforme sistema do jogo)
    if (Math.random() < this.stealChance) {
      this.performSteal(player);
    }
    
    return true;
  }

  performSteal(player) {
    // Implementar roubo de recursos específicos do jogador
    console.log(`Rug Reaper roubou ${this.stealAmount} recursos do jogador!`);
    
    // Exemplo: se o jogador tiver propriedades de recursos
    if (player.coins !== undefined) {
      const stolen = Math.min(this.stealAmount, player.coins);
      player.coins -= stolen;
      console.log(`${stolen} moedas foram roubadas!`);
    }
    
    if (player.energy !== undefined) {
      const energyStolen = Math.min(5, player.energy);
      player.energy -= energyStolen;
      console.log(`${energyStolen} de energia foi drenada!`);
    }
  }

  render(ctx) {
    super.render(ctx);

    // Renderizar efeito de dash
    if (this.isDashing) {
      this.renderDashEffect(ctx);
    }

    // Renderizar aura sinistra
    this.renderSinisterAura(ctx);
  }

  renderDashEffect(ctx) {
    // Criar rastro de movimento durante o dash
    const trailLength = 20;
    const trailX = this.x + this.width;
    
    ctx.save();
    ctx.globalAlpha = 0.3;
    
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = `rgba(255, 0, 0, ${0.3 - i * 0.1})`;
      ctx.fillRect(
        trailX + (i * 10), 
        this.y, 
        this.width, 
        this.height
      );
    }
    
    ctx.restore();
  }

  renderSinisterAura(ctx) {
    // Aura vermelha sutil ao redor do Rug Reaper
    if (Math.random() < 0.1) { // Efeito intermitente
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.x - 2, 
        this.y - 2, 
        this.width + 4, 
        this.height + 4
      );
      ctx.restore();
    }
  }

  takeDamage(damage) {
    // Rug Reaper tem chance de esquivar durante o dash
    if (this.isDashing && Math.random() < 0.3) {
      console.log('Rug Reaper esquivou do ataque durante o dash!');
      return false;
    }
    
    return super.takeDamage(damage);
  }

  onDeath() {
    super.onDeath();
    
    // Efeito especial de morte: explosion dramática
    console.log('Rug Reaper foi derrotado com uma explosão sinistra!');
    
    // Pode deixar recursos para o jogador coletar
    this.dropResources();
  }

  dropResources() {
    // Implementar drop de recursos específicos
    const dropChance = 0.7; // 70% chance de drop
    
    if (Math.random() < dropChance) {
      console.log('Rug Reaper deixou recursos valiosos!');
      // Implementar lógica de drop conforme sistema do jogo
    }
  }

  // Propriedades específicas
  get isDashActive() {
    return this.isDashing;
  }

  get dashTimeRemaining() {
    return Math.max(0, this.dashTimer);
  }

  get canDash() {
    const currentTime = Date.now();
    return !this.isDashing && (currentTime - this.lastDashTime >= this.dashCooldown);
  }
}
