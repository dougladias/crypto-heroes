import GasGoblin from './GasGoblin.js';
import RugReaper from './RugReaper.js';
import Tucano from './Tucano.js';
import SquidGame from './SquidGame.js';
import AssetLoader from '../engine/AssetLoader.js';

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
    this.enemyTypes = [
      {
        name: 'gas-goblin',
        class: GasGoblin,
        sprite: 'enemy_goblin',
        weight: 0.4, // 40% chance
        minLevel: 1
      },
      {
        name: 'rug-reaper',
        class: RugReaper,
        sprite: 'enemy_reaper',
        weight: 0.3, // 30% chance
        minLevel: 1
      },
      {
        name: 'tucano',
        class: Tucano,
        sprite: 'tucano',
        weight: 0.3, // 30% chance
        minLevel: 1
      }
    ];// Sistema de dificuldade
    this.currentLevel = 1;
    this.enemiesDefeated = 0;
    this.enemiesEscaped = 0; // Contador de inimigos que escaparam
    this.difficultyMultiplier = 1.0;
      // Sistema de Boss
    this.bossActive = false;
    this.bossSpawned = false;
    this.showBossMessage = false;
    this.bossMessageTimer = 0;
    this.bossMessageDuration = 2000; // 2 segundos
    this.enemiesNeededForBoss = 10;
    this.bossReadyToSpawn = false; // Novo: indica que chegou a 10 mortos
    
    // Callback para quando inimigo escapa
    this.onEnemyEscaped = null;
    
    // Configurações de spawn por nível
    this.levelConfigs = {
      1: { spawnInterval: 2000, maxEnemies: 3 },
      2: { spawnInterval: 1800, maxEnemies: 4 },
      3: { spawnInterval: 1500, maxEnemies: 5 },
      4: { spawnInterval: 1200, maxEnemies: 6 },
      5: { spawnInterval: 1000, maxEnemies: 7 }
    };
  }
  update(deltaTime, player) {    // Atualizar todos os inimigos
    this.enemies.forEach(enemy => {
      // Passar player para inimigos boss
      if (enemy.isBoss) {
        enemy.update(deltaTime, player);
      } else {
        enemy.update(deltaTime);
      }
      
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
      
      // Verificar colisões dos poderes do boss
      if (enemy.isBoss && enemy.getBossPowers) {
        this.checkBossPowerCollisions(enemy, player);
      }
    });
    
    // Verificar colisões entre power objects e inimigos
    this.checkPowerObjectCollisions(player);    // Remover inimigos inativos e detectar inimigos que escaparam
    this.enemies = this.enemies.filter(enemy => {
      if (!enemy.isActive || (!enemy.isAlive && !enemy.isGasActive)) {
        if (!enemy.isAlive) {
          this.enemiesDefeated++;
          this.checkBossSpawn(); // Verificar se deve spawnar boss
          this.checkLevelProgression();
        } else if (enemy.isAlive && !enemy.isActive) {
          // Inimigo saiu da tela sem ser derrotado
          this.enemiesEscaped++;
          console.log(`⚠️ Inimigo ${enemy.type} escapou! Total escaparam: ${this.enemiesEscaped}`);
          
          // Notificar callback se existir
          if (this.onEnemyEscaped) {
            this.onEnemyEscaped(enemy);
          }
        }
        return false;
      }
      return true;
    });
    
    // Atualizar timer da mensagem de boss
    if (this.showBossMessage) {
      this.bossMessageTimer -= deltaTime;
      if (this.bossMessageTimer <= 0) {
        this.showBossMessage = false;
        this.spawnBoss(); // Spawnar boss após mensagem
      }
    }
      // Spawnar novos inimigos (apenas se boss não estiver ativo E não estiver pronto para boss)
    if (!this.bossActive && !this.bossReadyToSpawn) {
      this.handleEnemySpawning(deltaTime);
    }
    
    // Verificar continuamente se pode spawnar boss (quando chegar a 10 E tela limpa)
    this.checkBossSpawn();
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
    const groundY = this.screenHeight - 260; // Mesma altura do jogador
    
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
  }  checkBossSpawn() {
    // Primeiro: marcar que chegou a 10 mortos (para parar spawn)
    if (!this.bossReadyToSpawn && this.enemiesDefeated >= this.enemiesNeededForBoss) {
      this.bossReadyToSpawn = true;
      console.log(`🎯 10 inimigos derrotados! Parando spawn e aguardando tela limpa...`);
    }
    
    // Segundo: quando tela estiver limpa, mostrar mensagem de boss
    if (this.bossReadyToSpawn && 
        !this.bossSpawned && 
        this.enemies.length === 0) {
      
      this.showBossMessage = true;
      this.bossMessageTimer = this.bossMessageDuration;
      this.bossSpawned = true;
      console.log(`🎯 Tela limpa! Mostrando mensagem de BOSS...`);
    }
  }

  spawnBoss() {
    // Spawnar o SquidGame como boss
    const spriteSheet = this.assets.images['enemy_squid'];
    
    if (!spriteSheet) {
      console.error('Sprite do boss SquidGame não encontrado!');
      return;
    }
      // Posição do boss (centro da tela, voando)
    const bossX = this.screenWidth * 0.7; // 70% da largura da tela
    const bossY = this.screenHeight * 0.6; // 60% da altura (mais baixo)
    
    // Configuração especial para o boss
    const bossConfig = {
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight,
      velocityX: 0, // Boss fica parado voando
      isBoss: true
    };
      const boss = new SquidGame(bossX, bossY, spriteSheet, bossConfig);
    boss.setAssets(this.assets); // Configurar assets para poderes
    this.enemies.push(boss);
    this.bossActive = true;
    
    console.log(`👹 Boss SquidGame spawnado na posição (${bossX}, ${bossY})`);
  }
  render(ctx) {
    // Renderizar todos os inimigos
    this.enemies.forEach(enemy => {
      enemy.render(ctx);
    });
    
    // Renderizar mensagem de BOSS
    if (this.showBossMessage) {
      this.renderBossMessage(ctx);
    }
    
    // Renderizar informações de debug (opcional)
    if (window.DEBUG_MODE) {
      this.renderDebugInfo(ctx);
    }
  }

  renderBossMessage(ctx) {
    // Fundo semi-transparente
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Texto "BOSS"
    ctx.fillStyle = '#ff0000'; // Vermelho
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    
    // Sombra do texto
    ctx.fillStyle = '#000000';
    ctx.fillText('BOSS', centerX + 3, centerY + 3);
    
    // Texto principal
    ctx.fillStyle = '#ff0000';
    ctx.fillText('BOSS', centerX, centerY);
    
    ctx.restore();
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
      enemiesEscaped: this.enemiesEscaped,
      activeEnemies: this.enemies.length,
      difficulty: this.difficultyMultiplier
    };
  }
  
  // Método para configurar callback quando inimigo escapa
  setEnemyEscapedCallback(callback) {
    this.onEnemyEscaped = callback;
  }checkPowerObjectCollisions(player) {
    // Obter power objects do jogador
    const powerObjects = player.getPowerObjects();
    
    // Verificar colisão de cada power object com cada inimigo
    powerObjects.forEach((powerObject, powerIndex) => {
      if (!powerObject.isActive()) return;
      
      this.enemies.forEach((enemy, enemyIndex) => {
        if (!enemy.isAlive || !enemy.isActive) return;
        
        // Verificar se houve colisão
        if (this.checkCollision(powerObject, enemy)) {
          console.log(`🎯 HIT! Power atingiu ${enemy.type}`);
          
          // Aplicar dano ao inimigo
          const damage = 50;
          const enemyDied = enemy.takeDamage(damage);
          
          // Tocar som de hit
          if (this.assets && this.assets.sounds && this.assets.sounds.punch) {
            AssetLoader.playSound(this.assets.sounds.punch, 0.3);
          }
          
          // Destruir o power object
          powerObject.destroy();
          
          if (enemyDied) {
            console.log(`${enemy.type} foi derrotado!`);
          }
        }
      });
    });
  }
  checkCollision(powerObject, enemy) {
    const powerBounds = powerObject.getBounds();
    const enemyBounds = enemy.bounds;
    
    return (
      powerBounds.x < enemyBounds.x + enemyBounds.width &&
      powerBounds.x + powerBounds.width > enemyBounds.x &&
      powerBounds.y < enemyBounds.y + enemyBounds.height &&
      powerBounds.y + powerBounds.height > enemyBounds.y
    );
  }
  
  // Verificar colisões dos poderes do boss com o jogador
  checkBossPowerCollisions(boss, player) {
    const bossPowers = boss.getBossPowers();
    
    bossPowers.forEach(power => {
      if (!power.isActive()) return;
      
      // Verificar colisão com jogador
      if (this.checkBossPowerCollision(power, player)) {
        console.log('💥 Poder do boss atingiu o jogador!');
        
        // Aplicar dano ao jogador
        const damage = power.getDamage();
        if (player.takeDamage) {
          player.takeDamage(damage);
        }
        
        // Tocar som de dano
        if (this.assets && this.assets.sounds && this.assets.sounds.kick) {
          AssetLoader.playSound(this.assets.sounds.kick, 0.4);
        }
        
        // Destruir o poder
        power.destroy();
      }
    });
  }
  
  // Verificar colisão específica do poder do boss
  checkBossPowerCollision(power, player) {
    const powerBounds = power.getBounds();
    const playerBounds = {
      x: player.x,
      y: player.y,
      width: player.width,
      height: player.height
    };
    
    return (
      powerBounds.x < playerBounds.x + playerBounds.width &&
      powerBounds.x + powerBounds.width > playerBounds.x &&
      powerBounds.y < playerBounds.y + playerBounds.height &&
      powerBounds.y + powerBounds.height > playerBounds.y
    );
  }
  
  // === MÉTODOS DE DEBUG E TESTE ===
  
  // Testar ataque do boss
  testBossAttack() {
    const boss = this.enemies.find(enemy => enemy.isBoss);
    if (boss && boss.forceTestAttack) {
      console.log('🧪 Testando ataque do boss...');
      const player = { x: 100, y: 400, width: 80, height: 140 }; // Player fictício para teste
      return boss.forceTestAttack(player);
    }
    console.log('❌ Boss não encontrado ou não tem método forceTestAttack');
    return false;
  }
  
  // Debug do boss
  debugBoss() {
    const boss = this.enemies.find(enemy => enemy.isBoss);
    if (boss) {
      console.log('🔍 DEBUG BOSS:');
      console.log('- Boss encontrado:', boss.type);
      console.log('- É boss:', boss.isBoss);
      console.log('- Assets configurados:', !!boss.assets);
      console.log('- Poderes ativos:', boss.bossPowers ? boss.bossPowers.length : 'N/A');
      console.log('- Última vez que atacou:', boss.lastPowerAttackTime);
      console.log('- Cooldown:', boss.powerAttackCooldown);
      return boss;
    }
    console.log('❌ Nenhum boss ativo encontrado');
    return null;
  }
}
