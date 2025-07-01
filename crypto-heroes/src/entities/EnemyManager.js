import GasGoblin from './GasGoblin.js';
import RugReaper from './RugReaper.js';
import Tucano from './Tucano.js';

export default class EnemyManager {
  constructor(assets, screenWidth = 800, screenHeight = 600) {
    this.assets = assets;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    // Lista de inimigos ativos
    this.enemies = [];
    
    // Configurações de spawn
    this.spawnInterval = 2000; // 2 segundos entre spawns
    this.lastSpawnTime = 0;
    this.maxEnemies = 5; // Máximo de inimigos na tela
      // Tipos de inimigos disponíveis
    this.enemyTypes = [
      {
        name: 'gas-goblin',
        class: GasGoblin,
        sprite: 'enemy_goblin',
        weight: 0.4, // 40% chance (reduzido para dar espaço ao tucano)
        minLevel: 1
      },
      {
        name: 'rug-reaper',
        class: RugReaper,
        sprite: 'enemy_reaper',
        weight: 0.3, // 30% chance (reduzido para dar espaço ao tucano)
        minLevel: 1
      },
      {
        name: 'tucano',
        class: Tucano,
        sprite: 'tucano',
        weight: 0.3, // 30% chance (novo inimigo)
        minLevel: 1
      }
    ];
    
    // Sistema de dificuldade
    this.currentLevel = 1;
    this.enemiesDefeated = 0;
    this.difficultyMultiplier = 1.0;
    
    // Configurações de spawn por nível
    this.levelConfigs = {
      1: { spawnInterval: 2000, maxEnemies: 3 },
      2: { spawnInterval: 1800, maxEnemies: 4 },
      3: { spawnInterval: 1500, maxEnemies: 5 },
      4: { spawnInterval: 1200, maxEnemies: 6 },
      5: { spawnInterval: 1000, maxEnemies: 7 }
    };
  }

  update(deltaTime, player) {
    // Atualizar todos os inimigos
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime);
      
      // Verificar colisão com jogador
      if (enemy.isAlive && enemy.checkCollision(player)) {
        this.handlePlayerEnemyCollision(enemy, player);
      }
      
      // Verificar ataques especiais (ex: nuvem de gás)
      if (enemy.type === 'gas-goblin' && enemy.isGasActive) {
        if (enemy.checkGasCloudCollision(player)) {
          this.handleGasCloudDamage(enemy, player, deltaTime);
        }
      }
    });
    
    // Remover inimigos inativos
    this.enemies = this.enemies.filter(enemy => {
      if (!enemy.isActive || (!enemy.isAlive && !enemy.isGasActive)) {
        if (!enemy.isAlive) {
          this.enemiesDefeated++;
          this.checkLevelProgression();
        }
        return false;
      }
      return true;
    });
    
    // Spawnar novos inimigos
    this.handleEnemySpawning(deltaTime);
  }

  handleEnemySpawning(deltaTime) {
    const currentTime = Date.now();
    
    // Verificar se pode spawnar
    if (currentTime - this.lastSpawnTime >= this.spawnInterval && 
        this.enemies.length < this.maxEnemies) {
      
      this.spawnRandomEnemy();
      this.lastSpawnTime = currentTime;
    }
  }
  spawnRandomEnemy() {
    // Escolher tipo de inimigo baseado nos pesos
    const enemyType = this.selectEnemyType();
    
    if (!enemyType) return;
    
    // Posição de spawn (lado direito da tela)
    const spawnX = this.screenWidth + 50;
    const spawnY = this.getRandomSpawnY(enemyType); // Passar o tipo para altura correta
    
    // Criar inimigo
    const enemy = this.createEnemy(enemyType, spawnX, spawnY);
    
    if (enemy) {
      this.enemies.push(enemy);
      console.log(`Spawnou ${enemyType.name} na posição (${spawnX}, ${spawnY})`);
    }
  }

  selectEnemyType() {
    // Filtrar inimigos disponíveis para o nível atual
    const availableTypes = this.enemyTypes.filter(type => 
      type.minLevel <= this.currentLevel
    );
    
    if (availableTypes.length === 0) return null;
    
    // Selecionar baseado nos pesos
    const random = Math.random();
    let cumulativeWeight = 0;
    
    for (const type of availableTypes) {
      cumulativeWeight += type.weight;
      if (random <= cumulativeWeight) {
        return type;
      }
    }
    
    // Fallback para o primeiro tipo
    return availableTypes[0];
  }

  createEnemy(enemyType, x, y) {
    const spriteSheet = this.assets.images[enemyType.sprite];
    
    if (!spriteSheet) {
      console.error(`Sprite não encontrado para ${enemyType.name}: ${enemyType.sprite}`);
      return null;
    }
      // Configurações baseadas na dificuldade
    const config = {
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight,
      health: Math.floor(60 * this.difficultyMultiplier), // Corrigida a linha problemática
      velocityX: -2 * this.difficultyMultiplier
    };
    
    // Criar instância do inimigo
    return new enemyType.class(x, y, spriteSheet, config);
  }  getRandomSpawnY(enemyType) {
    // Todos os inimigos spawnam na mesma altura (no chão)
    // Baseado na lógica do Player.js: groundY = ctx.canvas.height - 330
    const groundY = this.screenHeight - 330; // Mesma altura do jogador
    
    // Tucano agora também anda no chão como os outros
    return groundY; // Altura fixa para todos os inimigos
  }

  handlePlayerEnemyCollision(enemy, player) {
    // Verificar se o inimigo pode atacar
    if (enemy.canAttack(player)) {
      enemy.attack(player);
    }
  }

  handleGasCloudDamage(enemy, player, deltaTime) {
    // Dano contínuo da nuvem de gás
    const gasTickDamage = 2; // Dano por segundo
    const damagePerFrame = gasTickDamage * (deltaTime / 1000);
    
    if (player.takeDamage) {
      player.takeDamage(damagePerFrame);
    }
  }

  checkLevelProgression() {
    // Aumentar nível baseado em inimigos derrotados
    const newLevel = Math.floor(this.enemiesDefeated / 10) + 1;
    
    if (newLevel > this.currentLevel) {
      this.levelUp(newLevel);
    }
  }

  levelUp(newLevel) {
    this.currentLevel = newLevel;
    this.difficultyMultiplier = 1 + (newLevel - 1) * 0.2; // +20% de dificuldade por nível
    
    // Atualizar configurações de spawn
    const levelConfig = this.levelConfigs[newLevel] || this.levelConfigs[5];
    this.spawnInterval = levelConfig.spawnInterval;
    this.maxEnemies = levelConfig.maxEnemies;
    
    console.log(`Nível aumentou para ${newLevel}! Dificuldade: ${this.difficultyMultiplier.toFixed(1)}x`);
  }

  render(ctx) {
    // Renderizar todos os inimigos
    this.enemies.forEach(enemy => {
      enemy.render(ctx);
    });
    
    // Renderizar informações de debug (opcional)
    if (window.DEBUG_MODE) {
      this.renderDebugInfo(ctx);
    }
  }

  renderDebugInfo(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 120);
    
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`Inimigos Ativos: ${this.enemies.length}`, 20, 30);
    ctx.fillText(`Nível: ${this.currentLevel}`, 20, 50);
    ctx.fillText(`Derrotados: ${this.enemiesDefeated}`, 20, 70);
    ctx.fillText(`Dificuldade: ${this.difficultyMultiplier.toFixed(1)}x`, 20, 90);
    ctx.fillText(`Próximo Spawn: ${Math.max(0, Math.ceil((this.spawnInterval - (Date.now() - this.lastSpawnTime)) / 1000))}s`, 20, 110);
    ctx.restore();
  }

  // Métodos públicos para controle externo
  pauseSpawning() {
    this.spawnInterval = Infinity;
  }

  resumeSpawning() {
    const levelConfig = this.levelConfigs[this.currentLevel] || this.levelConfigs[5];
    this.spawnInterval = levelConfig.spawnInterval;
  }

  clearAllEnemies() {
    this.enemies = [];
  }
  forceSpawn(enemyTypeName) {
    const enemyType = this.enemyTypes.find(type => type.name === enemyTypeName);
    if (enemyType) {
      const spawnX = this.screenWidth + 50;
      const spawnY = this.getRandomSpawnY(enemyType); // Passar o tipo
      const enemy = this.createEnemy(enemyType, spawnX, spawnY);
      if (enemy) {
        this.enemies.push(enemy);
        return enemy;
      }
    }
    return null;
  }

  // Getters para estado atual
  get activeEnemies() {
    return this.enemies.filter(enemy => enemy.isActive && enemy.isAlive);
  }

  get enemyCount() {
    return this.enemies.length;
  }

  get gameStats() {
    return {
      level: this.currentLevel,
      enemiesDefeated: this.enemiesDefeated,
      activeEnemies: this.enemies.length,
      difficulty: this.difficultyMultiplier
    };
  }
}
