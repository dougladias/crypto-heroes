import Enemy from './Enemy.js';

export default class GasGoblin extends Enemy {
  constructor(x, y, spriteSheet, config = {}) {
    const goblinConfig = {
      width: 120,           // Aumentado de 48 para 80
      height: 300,          // Aumentado de 48 para 80
      totalFrames: 3,      // Total de frames na sprite
      frameRate: 8,        // Velocidade da animação
      cols: 3,             // Assumindo 3 colunas
      rows: 1,             // 1 linha
      velocityX: -1.5,     // Um pouco mais lento que o padrão
      health: 60,
      damage: 15,
      type: 'gas-goblin',
      attackRange: 40,
      attackCooldown: 1200,
      ...config
    };

    super(x, y, spriteSheet, goblinConfig);
    
    // Propriedades específicas do Gas Goblin
    this.gasCloudActive = false;
    this.gasCloudDuration = 2000; // 2 segundos
    this.gasCloudTimer = 0;
    this.gasDamage = 5;
    
    // Configurar frames de animação específicos
    this.setupAnimations();
  }

  setupAnimations() {
    // Definir diferentes animações se o sprite tiver múltiplos frames
    this.animations = {
      walk: { frames: [0, 1, 2, 1], currentFrame: 0 },
      attack: { frames: [3, 4, 5], currentFrame: 0 },
      gasAttack: { frames: [6, 7, 8], currentFrame: 0 }
    };
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Atualizar nuvem de gás se estiver ativa
    if (this.gasCloudActive) {
      this.gasCloudTimer -= deltaTime;
      if (this.gasCloudTimer <= 0) {
        this.gasCloudActive = false;
      }
    }

    // Movimento específico: pequenas variações na velocidade
    if (Math.random() < 0.01) { // 1% de chance por frame
      this.velocityX = -1.5 + (Math.random() - 0.5) * 0.5;
    }
  }

  attack(player) {
    if (!this.canAttack(player)) return false;

    this.lastAttackTime = Date.now();
    
    // 70% chance de ataque normal, 30% chance de ataque de gás
    if (Math.random() < 0.7) {
      return this.normalAttack(player);
    } else {
      return this.gasAttack(player);
    }
  }

  normalAttack(player) {
    console.log('Gas Goblin fez um ataque normal!');
    
    // Aplicar dano direto
    if (player.takeDamage) {
      player.takeDamage(this.damage);
    }
    
    return true;
  }

  gasAttack(player) {
    console.log('Gas Goblin liberou uma nuvem de gás tóxico!');
    
    // Ativar nuvem de gás
    this.gasCloudActive = true;
    this.gasCloudTimer = this.gasCloudDuration;
    
    // Dano inicial
    if (player.takeDamage) {
      player.takeDamage(this.damage * 0.7); // Dano inicial menor
    }
    
    return true;
  }

  render(ctx) {
    super.render(ctx);

    // Renderizar nuvem de gás se estiver ativa
    if (this.gasCloudActive) {
      this.renderGasCloud(ctx);
    }
  }

  renderGasCloud(ctx) {
    const cloudRadius = 30;
    const cloudX = this.x + this.width / 2;
    const cloudY = this.y + this.height / 2;
    
    // Criar gradiente para a nuvem
    const gradient = ctx.createRadialGradient(
      cloudX, cloudY, 0,
      cloudX, cloudY, cloudRadius
    );
    
    const alpha = Math.max(0.1, this.gasCloudTimer / this.gasCloudDuration * 0.4);
    gradient.addColorStop(0, `rgba(0, 255, 0, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 0, ${alpha * 0.7})`);
    gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cloudX, cloudY, cloudRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Verificar se o jogador está na nuvem de gás
  checkGasCloudCollision(player) {
    if (!this.gasCloudActive) return false;

    const cloudX = this.x + this.width / 2;
    const cloudY = this.y + this.height / 2;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(cloudX - playerCenterX, 2) + 
      Math.pow(cloudY - playerCenterY, 2)
    );
    
    return distance <= 30; // Raio da nuvem
  }

  onDeath() {
    super.onDeath();
    
    // Efeito especial de morte: pequena explosão de gás
    this.gasCloudActive = true;
    this.gasCloudTimer = 1000; // 1 segundo após a morte
    
    console.log('Gas Goblin explodiu em uma nuvem tóxica!');
  }

  // Propriedades específicas
  get isGasActive() {
    return this.gasCloudActive;
  }

  get gasTimeRemaining() {
    return Math.max(0, this.gasCloudTimer);
  }
}
