import Enemy from './Enemy.js';

export default class Tucano extends Enemy {
  constructor(x, y, spriteSheet, config = {}) {    const tucanoConfig = {
      width: 140,           // Tamanho médio
      height: 180,          // Mais alto (pássaro)
      totalFrames: 3,      // Total de frames na sprite
      frameRate: 10,       // Mais rápido na animação (pássaro ágil)
      cols: 3,             // Assumindo 3 colunas
      rows: 1,             // 1 linha
      velocityX: -3.0,     // Negativo = vai para esquerda
      health: 30,          // Menos vida (mais frágil)
      damage: 8,          // Dano médio
      type: 'tucano',
      attackRange: 80,     // Maior alcance (pode atacar voando)
      attackCooldown: 600, // Ataque mais rápido
      ...config
    };super(x, y, spriteSheet, tucanoConfig);
    
    // Inicializar velocityY corretamente
    this.velocityY = 0;
    
    // Propriedades específicas do Tucano (SEM sistema de voo)
    this.isFlying = false;  // Mudado para false    
    
    
    // Simplificar ataques - remover dive bomb
    this.canDiveBomb = false;  // Desabilitar dive bomb
    
    // Efeito de penas (mínimo)
    this.featherEffects = [];
    
    this.setupAnimations();
  }
  setupAnimations() {
    this.animations = {
      walk: { frames: [0, 1, 2, 1], currentFrame: 0 },    // Mudado de 'fly' para 'walk'
      attack: { frames: [3, 0, 1], currentFrame: 0 }      // Removido 'dive'
    };
  }  update(deltaTime) {
    // Movimento simples no chão, igual aos outros inimigos
    // Sem sistema de voo, sem dive bomb, sem oscilações
    
    // Atualizar efeitos de penas (mínimo)
    this.updateFeatherEffects(deltaTime);

    // Chamar update da classe pai (Enemy)
    super.update(deltaTime);
  }  // Método já não é necessário, mas mantido para compatibilidade
  startDiveBomb() {
    // Removido - Tucano não voa mais
  }

  endDiveBomb() {
    // Removido - Tucano não voa mais
  }
  attack(player) {
    if (!this.canAttack(player)) return false;

    this.lastAttackTime = Date.now();
    
    // Apenas ataque simples de bico
    return this.peckAttack(player);
  }  peckAttack(player) {
    this.currentAnimation = 'attack';
    
    // Dano normal (sem sistema de dive bomb)
    const finalDamage = this.damage;
    
    if (player.takeDamage) {
      player.takeDamage(finalDamage);
    }
    
    return true;
  }  createFeatherEffect() {
    // Efeito muito simples - apenas para morte
    this.featherEffects.push({
      x: this.x + Math.random() * this.width,
      y: this.y + Math.random() * this.height,
      velocityX: (Math.random() - 0.5) * 1,
      velocityY: Math.random() * 1 + 0.5,
      alpha: 0.4, // Bem transparente
      size: 3,    // Pequeno
      life: 500   // Bem rápido
    });
  }
  updateFeatherEffects(deltaTime) {
    this.featherEffects = this.featherEffects.filter(feather => {
      feather.x += feather.velocityX * (deltaTime / 16);
      feather.y += feather.velocityY * (deltaTime / 16);
      feather.alpha -= deltaTime / feather.life;
      feather.life -= deltaTime;
      
      return feather.life > 0 && feather.alpha > 0;
    });
  }  render(ctx) {
    // Renderizar sprite flipado horizontalmente (virado para esquerda)
    if (!this.isAlive || !this.isActive) return;

    // Usar o método draw do sprite com flip horizontal (true)
    this.sprite.draw(ctx, this.x, this.y, this.width, this.height, true);

    // Renderizar barra de vida se necessário
    if (this.health < this.maxHealth) {
      this.renderHealthBar(ctx);
    }

    // Renderizar apenas efeitos mínimos de penas (se houver)
    this.renderFeatherEffects(ctx);
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
  }

  renderFeatherEffects(ctx) {
    // Renderizar penas sem usar transformações que podem buggar
    this.featherEffects.forEach(feather => {
      ctx.save();
      ctx.globalAlpha = feather.alpha;
      
      // Desenhar pena simples SEM rotação para evitar bugs
      ctx.fillStyle = '#FFD700'; // Dourado
      ctx.fillRect(
        feather.x - feather.size/2, 
        feather.y - feather.size/4, 
        feather.size, 
        feather.size/2
      );
      
      ctx.restore();
    });
  }
  renderDiveEffect(ctx) {
    // Efeito de rastro mais sutil durante o dive
    ctx.save();
    ctx.globalAlpha = 0.2; // Muito mais sutil
    
    // Apenas um rastro simples
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.fillRect(this.x + 10, this.y, this.width - 10, this.height);
    
    ctx.restore();
  }  takeDamage(damage) {
    // Tucano agora é um inimigo terrestre normal
    // Sem habilidades especiais de esquiva
    
    return super.takeDamage(damage);
  }  onDeath() {
    super.onDeath();    
  }
  
  // Propriedades específicas - simplificadas
  get isInWalkingMode() {
    return true; // Sempre caminhando no chão
  }
}
