import Enemy from './Enemy.js';
import BossPowerObject from './BossPowerObject.js';

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
    this.inkDamage = 8;
      // Configurações de boss
    this.isBoss = config.isBoss || false;    // Sistema de poderes do boss
    this.bossPowers = [];
    this.powerAttackCooldown = 800; // 0.8 segundos entre ataques de poder (mais rápido)
    this.lastPowerAttackTime = performance.now() - this.powerAttackCooldown; // Permitir ataque imediato
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
      // Debug: verificar se está recebendo o player
      if (!player) {
        console.log('❌ Boss não recebeu player no update');
      } else if (!this.assets) {
        console.log('❌ Boss não tem assets configurados');
      } else {
        // Só logar sucesso a cada 2 segundos para não poluir
        const now = performance.now();
        if (!this.lastSuccessLog || now - this.lastSuccessLog > 2000) {
          console.log('✅ Boss tem player e assets configurados');
          this.lastSuccessLog = now;
        }
      }
      
      // Atualizar apenas a animação usando o sistema do Sprite, sem movimento
      this.updateAnimation(deltaTime);
      
      // Atualizar poderes ativos do boss
      this.updateBossPowers(deltaTime);
        // Atacar o jogador com poderes periodicamente
      if (player && this.assets) {
        this.tryPowerAttack(player);
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
    }
    
    // Renderizar poderes do boss
    if (this.isBoss) {
      this.renderBossPowers(ctx);
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

  // === SISTEMA DE PODERES DO BOSS ===
  
  // Configurar assets para o boss
  setAssets(assets) {
    this.assets = assets;
    console.log('🎯 Boss recebeu assets:', this.assets ? 'OK' : 'FALHOU');
    
    // Verificar se tem o sprite necessário
    if (this.assets && this.assets.images && this.assets.images['power_enemy']) {
      console.log('✅ Boss tem sprite power_enemy disponível');
    } else {
      console.log('❌ Boss NÃO tem sprite power_enemy disponível');
      if (this.assets && this.assets.images) {
        console.log('Sprites disponíveis:', Object.keys(this.assets.images));
      }
    }
  }
  
  // Método para forçar um ataque de teste (debug)
  forceTestAttack(player) {
    if (player && this.assets) {
      console.log('🧪 FORÇANDO ataque de teste do boss...');
      this.launchPowerAttack(player);
      return true;
    }
    console.log('🧪 Não foi possível forçar ataque - faltam prerequisites');
    return false;
  }
  
  // Atualizar todos os poderes ativos do boss
  updateBossPowers(deltaTime) {
    this.bossPowers = this.bossPowers.filter(power => {
      power.update(deltaTime);
      return power.isActive();
    });
  }
  
  // Renderizar todos os poderes do boss
  renderBossPowers(ctx) {
    this.bossPowers.forEach(power => {
      power.render(ctx);
    });
  }  // Tentar atacar o jogador com poder
  tryPowerAttack(player) {
    const currentTime = performance.now();
    const timeSinceLastAttack = currentTime - this.lastPowerAttackTime;
    
    // Debug logs detalhados
    if (timeSinceLastAttack >= this.powerAttackCooldown) {
      console.log('⚡ Boss vai tentar atacar com poder...');
      console.log(`🕒 Tempo desde último ataque: ${timeSinceLastAttack}ms, Cooldown: ${this.powerAttackCooldown}ms`);
      this.launchPowerAttack(player);
      this.lastPowerAttackTime = currentTime;
    } else {
      // Log apenas a cada 30 frames para não poluir o console
      const debugInterval = 500; // 0.5 segundos
      if (timeSinceLastAttack % debugInterval < 16) { // ~1 frame em 60fps
        console.log(`⏰ Boss esperando cooldown: ${(this.powerAttackCooldown - timeSinceLastAttack).toFixed(0)}ms restantes`);
      }
    }
  }
    // Lançar ataque de poder no jogador
  launchPowerAttack(player) {
    if (!this.assets) {
      console.log('❌ Boss não tem assets configurados!');
      return;
    }
    
    if (!this.assets.images) {
      console.log('❌ Boss assets não tem images!');
      return;
    }
    
    if (!this.assets.images['power_enemy']) {
      console.log('❌ Boss não encontrou sprite power_enemy!');
      console.log('📋 Assets de imagem disponíveis:', Object.keys(this.assets.images));
      return;
    }
    
    console.log('🔥 Boss lançou ataque de poder!');
    
    const bossX = this.x + this.width / 2;
    const bossY = this.y + this.height / 2;
    const playerX = player.x + player.width / 2;
    const playerY = player.y + player.height / 2;
    
    console.log(`📍 Boss pos: (${bossX.toFixed(0)}, ${bossY.toFixed(0)}) -> Player pos: (${playerX.toFixed(0)}, ${playerY.toFixed(0)})`);
    
    // Criar poder na posição do boss, mirando no jogador
    const power = new BossPowerObject(
      this.assets,
      bossX,  // Centro do boss X
      bossY, // Centro do boss Y
      playerX,  // Centro do jogador X
      playerY  // Centro do jogador Y
    );
    
    this.bossPowers.push(power);
    console.log(`💫 Boss criou poder! Total poderes ativos: ${this.bossPowers.length}`);
  }
  
  // Obter todos os poderes ativos (para colisão)
  getBossPowers() {
    return this.bossPowers;
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
