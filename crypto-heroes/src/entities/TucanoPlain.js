import Enemy from './Enemy.js';

export default class TucanoPlain extends Enemy {
  constructor(x, y, spriteSheet, config = {}) {    const tucanoPlainConfig = {
      width: 160,           // Menor que o Tucano normal
      height: 120,          // Mais baixo
      totalFrames: 2,      // Total de frames na sprite
      frameRate: 10,       // Velocidade da animação
      cols: 2,             // 2 colunas para 2 frames
      rows: 1,             // 1 linha
      velocityX: -2.0,     // Velocidade média
      health: 30,          // Menos vida que o Tucano normal
      damage: 8,           // Dano menor
      type: 'tucano-plain',
      attackRange: 60,     // Alcance médio
      attackCooldown: 800, // Ataque mais rápido
      ...config
    };    super(x, y, spriteSheet, tucanoPlainConfig);
    
    // Propriedades específicas do Tucano Plain (versão terrestre)
    this.isGrounded = true;
    this.jumpHeight = 40;
    this.jumpCooldown = 1500;
    this.lastJumpTime = 0;
    this.isJumping = false;
    this.jumpVelocity = 0;
    this.groundY = y; // Salvar posição inicial como chão
    
    // Sistema de bicadas rápidas
    this.peckCombo = 0;
    this.maxPeckCombo = 3;
    this.peckComboTimer = 0;
    this.peckComboDuration = 2000;
    
    this.setupAnimations();
  }
  setupAnimations() {
    this.animations = {
      walk: { frames: [0, 1, 0, 1], currentFrame: 0 },    // Alternando entre os 2 frames
      attack: { frames: [1, 0, 1], currentFrame: 0 },     // Usando os 2 frames para ataque
      jump: { frames: [1, 0, 1], currentFrame: 0 }        // Usando os 2 frames para pulo
    };
  }

  update(deltaTime) {
    // Atualizar combo de bicadas
    this.updatePeckCombo(deltaTime);
    
    // Atualizar movimento de pulo
    this.updateJump(deltaTime);
    
    // Verificar se pode pular para se aproximar do jogador
    this.checkJumpOpportunity();
    
    // Chamar update da classe pai
    super.update(deltaTime);
  }

  updatePeckCombo(deltaTime) {
    if (this.peckCombo > 0) {
      this.peckComboTimer -= deltaTime;
      if (this.peckComboTimer <= 0) {
        this.peckCombo = 0;
      }
    }
  }

  updateJump(deltaTime) {
    if (this.isJumping) {
      this.jumpVelocity += 0.8 * (deltaTime / 16); // Gravidade
      this.y += this.jumpVelocity * (deltaTime / 16);
      
      // Se chegou ao chão, parar de pular
      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.isJumping = false;
        this.jumpVelocity = 0;
        this.currentAnimation = 'walk';
      }
    }
  }

  checkJumpOpportunity() {
    const now = Date.now();
    if (now - this.lastJumpTime > this.jumpCooldown && 
        !this.isJumping && 
        this.isGrounded) {
      
      // Chance de pular para se aproximar do jogador
      if (Math.random() < 0.3) { // 30% de chance
        this.performJump();
      }
    }
  }
  performJump() {
    this.isJumping = true;
    this.jumpVelocity = -this.jumpHeight / 8; // Velocidade inicial negativa (para cima)
    this.lastJumpTime = Date.now();
    this.currentAnimation = 'jump';
    // Não redefinir groundY - usar o valor já definido no construtor
  }

  attack(player) {
    if (!this.canAttack(player)) return false;

    this.lastAttackTime = Date.now();
    
    // Sistema de combo de bicadas
    if (this.peckCombo < this.maxPeckCombo) {
      this.peckCombo++;
      this.peckComboTimer = this.peckComboDuration;
      return this.peckAttack(player);
    } else {
      // Ataque especial após combo
      return this.specialPeckAttack(player);
    }
  }

  peckAttack(player) {
    this.currentAnimation = 'attack';
    
    // Dano normal aumentado pelo combo
    const comboDamage = this.damage + (this.peckCombo * 2);
    
    if (player.takeDamage) {
      player.takeDamage(comboDamage);
    }
    
    return true;
  }

  specialPeckAttack(player) {
    this.currentAnimation = 'attack';
    
    // Ataque especial mais forte
    const specialDamage = this.damage * 2;
    
    if (player.takeDamage) {
      player.takeDamage(specialDamage);
    }
    
    // Resetar combo
    this.peckCombo = 0;
    this.peckComboTimer = 0;
    
    return true;
  }

  render(ctx) {
    super.render(ctx);
    
    // Renderizar indicador de combo se ativo
    if (this.peckCombo > 0) {
      this.renderComboIndicator(ctx);
    }
  }

  renderComboIndicator(ctx) {
    ctx.save();
    
    // Desenhar pequenos pontos acima do inimigo para indicar combo
    const dotSize = 4;
    const spacing = 8;
    const startX = this.x + (this.width / 2) - ((this.peckCombo * spacing) / 2);
    const dotY = this.y - 20;
    
    ctx.fillStyle = '#FFD700'; // Dourado
    
    for (let i = 0; i < this.peckCombo; i++) {
      ctx.beginPath();
      ctx.arc(startX + (i * spacing), dotY, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  takeDamage(damage) {
    // Tucano Plain tem chance de esquivar se estiver pulando
    if (this.isJumping && Math.random() < 0.2) { // 20% chance de esquivar
      return false; // Não recebeu dano
    }
    
    return super.takeDamage(damage);
  }

  onDeath() {
    super.onDeath();
    
    // Efeito simples de penas ao morrer
    this.createFeatherBurst();
  }

  createFeatherBurst() {
    // Criar algumas penas simples
    for (let i = 0; i < 5; i++) {
      // Código para criar efeito de penas seria aqui
      // Por simplicidade, apenas um efeito visual básico
    }
  }
  // Propriedades específicas
  get isInComboMode() {
    return this.peckCombo > 0;
  }

  get comboLevel() {
    return this.peckCombo;
  }  // Área de colisão expandida para compensar altura
  get bounds() {
    return {
      x: this.x - 10,          // Expandir um pouco para os lados
      y: this.y - 50,          // Expandir para cima
      width: this.width,  // Largura um pouco maior
      height: this.height // Altura muito maior para baixo
    };
  }

  // Sobrescrever checkCollision para usar bounds correto
  checkCollision(player) {
    const bounds = this.bounds;
    return (
      bounds.x < player.x + player.width &&
      bounds.x + bounds.width > player.x &&
      bounds.y < player.y + player.height &&
      bounds.y + bounds.height > player.y
    );
  }
}
