import Enemy from './Enemy.js';

export default class SquidGame extends Enemy {
  constructor(x, y, spriteSheet, config = {}) {
    const squidConfig = {
      width: 230,           
      height: 150,          
      totalFrames: 3,      // Total de frames na sprite
      frameRate: 6,        // Velocidade da animação (mais lento que goblin)
      cols: 3,             // Assumindo 3 colunas
      rows: 1,             // 1 linha
      velocityX: -2.0,     // Um pouco mais rápido que o goblin
      health: 80,          // Mais resistente
      damage: 20,          // Mais dano
      type: 'squid-game',
      attackRange: 50,     // Maior alcance
      attackCooldown: 1000, // Ataque mais rápido
      ...config
    };

    super(x, y, spriteSheet, squidConfig);
    
    // Propriedades específicas do Squid Game
    this.inkAttackActive = false;
    this.inkAttackDuration = 1500; // 1.5 segundos
    this.inkAttackTimer = 0;
    this.inkDamage = 8;
    
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
  }

  update(deltaTime) {
    super.update(deltaTime);

    // Atualizar ataque de tinta se estiver ativo
    if (this.inkAttackActive) {
      this.inkAttackTimer -= deltaTime;
      if (this.inkAttackTimer <= 0) {
        this.inkAttackActive = false;
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

  // Propriedades específicas para identificação
  get enemyType() {
    return 'squid-game';
  }

  // Pontuação específica
  get scoreValue() {
    return 150; // Mais pontos que outros inimigos
  }
}
