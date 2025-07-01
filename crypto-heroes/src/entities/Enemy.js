import Sprite from '../engine/Sprite.js';

export default class Enemy {  constructor(x, y, spriteSheet, config = {}) {
    this.x = x;
    this.y = y;
    this.width = config.width || 80;   
    this.height = config.height || 80; 
    
    // Movimento
    this.velocityX = config.velocityX || -2; 
    this.velocityY = 0;
      // Status
    this.health = config.health || 100;
    this.maxHealth = config.health || 100;
    this.damage = config.damage || 10;
    this.isAlive = true;
    this.isActive = true;
    
    // Sprite e animação - ajustado para a classe Sprite do projeto
    this.sprite = new Sprite(
      spriteSheet, 
      config.totalFrames || 4, // Total de frames na sprite sheet
      config.frameRate || 8,   // Frame rate da animação
      config.cols || null,     // Colunas na sprite sheet
      config.rows || null      // Linhas na sprite sheet
    );
    this.currentAnimation = 'walk';
    this.animationSpeed = config.animationSpeed || 8;
    this.animationTimer = 0;
    
    // Configurações específicas do inimigo
    this.type = config.type || 'enemy';
    this.attackRange = config.attackRange || 50;
    this.attackCooldown = config.attackCooldown || 1000;
    this.lastAttackTime = 0;
    
    // Limites da tela
    this.screenWidth = config.screenWidth || 800;
    this.screenHeight = config.screenHeight || 600;
  }  update(deltaTime) {
    if (!this.isAlive || !this.isActive) return;

    // Atualizar posição
    this.x += this.velocityX * (deltaTime / 16);
    this.y += this.velocityY * (deltaTime / 16);    // Verificar se saiu da tela pela esquerda
    if (this.x + this.width < 0) {
      this.isActive = false;
    }
    
    // Verificar se saiu da tela verticalmente (sem log para não poluir)
    if (this.y < -200 || this.y > this.screenHeight + 200) {
      this.isActive = false;
    }

    // Atualizar animação
    this.updateAnimation(deltaTime);
  }
  updateAnimation(deltaTime) {
    // Usar o método step da classe Sprite para atualizar a animação
    this.sprite.step(deltaTime);
  }  render(ctx) {
    if (!this.isAlive || !this.isActive) return;

    // Renderizar sprite
    this.sprite.draw(ctx, this.x, this.y, this.width, this.height);

    // Renderizar barra de vida sempre que tomar dano
    if (this.health < this.maxHealth) {
      this.renderHealthBar(ctx);
    }
  }

  renderHealthBar(ctx) {
    const barWidth = this.width;
    const barHeight = 6;
    const barX = this.x;
    const barY = this.y - 10;

    // Fundo da barra
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Barra de vida
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Borda
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
  }  // Método para receber dano
  takeDamage(damage) {
    if (!this.isAlive) return false;
    
    this.health -= damage;
    
    console.log(`${this.type} recebeu ${damage} de dano. Vida: ${this.health}/${this.maxHealth}`);
    
    // Verificar se morreu
    if (this.health <= 0) {
      this.health = 0;
      this.isAlive = false;
      this.onDeath();
      return true;
    }
    
    return false;
  }

  onDeath() {
    // Implementar efeitos de morte específicos em subclasses
    console.log(`${this.type} foi derrotado!`);
  }

  // Verificar colisão com jogador
  checkCollision(player) {
    return (
      this.x < player.x + player.width &&
      this.x + this.width > player.x &&
      this.y < player.y + player.height &&
      this.y + this.height > player.y
    );
  }

  // Verificar se pode atacar o jogador
  canAttack(player) {
    if (!this.isAlive || !this.isActive) return false;
    
    const distance = Math.abs(this.x - player.x);
    const currentTime = Date.now();
    
    return distance <= this.attackRange && 
           currentTime - this.lastAttackTime >= this.attackCooldown;
  }

  attack(player) {
    if (!this.canAttack(player)) return false;

    this.lastAttackTime = Date.now();
    
    // Implementar ataque específico em subclasses
    console.log(`${this.type} atacou o jogador!`);
    
    return true;
  }

  // Getters para verificação de estado
  get bounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  get isOffScreen() {
    return this.x + this.width < 0 || this.x > this.screenWidth;
  }
}
