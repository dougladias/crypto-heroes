import GasGoblin from './GasGoblin.js';
import RugReaper from './RugReaper.js';
import Tucano from './Tucano.js';
import TucanoPlain from './TucanoPlain.js';
import SquidGame from './SquidGame.js';
import AssetLoader from '../engine/AssetLoader.js';
// import ExplosionManager from './ExplosionManager.js';

export default class EnemyManager {
  constructor(assets, screenWidth = 800, screenHeight = 600) {
    this.assets = assets;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
      // Lista de inimigos ativos
    this.enemies = [];
    
    // Sistema de explosões simples
    this.explosions = [];
    this.explosionImage = assets.images['explosion'];
      // Configurações de spawn progressivo
    this.spawnInterval = 2500; // Começar mais devagar (2.5 segundos)
    this.lastSpawnTime = 0;
      // Sistema de progressão de dificuldade
    this.initialMaxEnemies = 3;     // Começar com apenas 4 inimigos
    this.currentMaxEnemies = 3;     // Quantidade atual máxima
    this.maxPossibleEnemies = 5;    // Máximo que pode chegar 
    this.enemiesPerLevel = 5;        // A cada 2 inimigos derrotados, aumenta dificuldade
    this.currentLevel = 1;           // Nível atual de dificuldade

    this.enemyTypes = [
      {
        name: 'gas-goblin',
        class: GasGoblin,
        sprite: 'enemy_goblin',
        weight: 0.30 // 30% chance
      },
      {
        name: 'rug-reaper',
        class: RugReaper,
        sprite: 'enemy_reaper',
        weight: 0.30 // 30% chance
      },
      {
        name: 'tucano',
        class: Tucano,
        sprite: 'tucano',
        weight: 0.30 // 30% chance
      },
      {
        name: 'tucano-plain',
        class: TucanoPlain,
        sprite: 'tucano_plain',
        weight: 0.10 // 10% chance
      }
    ];
    
    // Sistema simples de contadores
    this.enemiesDefeated = 0;
    this.enemiesEscaped = 0; // Contador de inimigos que escaparam
      // Sistema de Boss
    this.bossActive = false;
    this.bossSpawned = false;
    this.showBossMessage = false;
    this.bossMessageTimer = 0;
    this.bossMessageDuration = 2000; // 2 segundo
    this.enemiesNeededForBoss = 100; // ✨ TEMPORÁRIO: Reduzir para 5 para testar
    this.bossReadyToSpawn = false; // Novo: indica que chegou a 10 mortos    // Callback para quando inimigo escapa
    this.onEnemyEscaped = null;
    
    // ✨ NOVO: Callback para quando inimigo é morto
    this.onEnemyKilled = null;
    
    //NOVO: Callback para quando boss é derrotado
    this.onBossDefeated = null;
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
        // Verificar colisões dos poderes do boss (AGORA USA getPowerObjects!)
      if (enemy.isBoss && enemy.getPowerObjects) {
        this.checkBossPowerCollisions(enemy, player);
      }
    });
      // Verificar colisões entre power objects e inimigos
    this.checkPowerObjectCollisions(player);    // Atualizar sistema de explosões simples
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i];
      explosion.time += deltaTime;
      
      // Atualizar frame da animação
      const frameTime = explosion.duration / explosion.totalFrames;
      explosion.frame = Math.floor(explosion.time / frameTime);
      
      if (explosion.time >= explosion.duration) {
        this.explosions.splice(i, 1);
      }
    }    // Remover inimigos inativos e detectar inimigos que escaparam
    this.enemies = this.enemies.filter(enemy => {
      if (!enemy.isActive || !enemy.isAlive) {if (!enemy.isAlive) {
          this.enemiesDefeated++;          // Criar explosão quando inimigo morre
          this.explosions.push({
            x: enemy.x + enemy.width / 2 - 60, // Explosão maior
            y: enemy.y + enemy.height / 2 - 125,
            width: 200, // Aumentei de 80 para 200
            height: 200,
            time: 0,
            duration: 400, // Mais rápida - de 500 para 400
            frame: 0,
            totalFrames: 5,
            frameRate: 12 // Mais rápida
          });
          
          // Tocar som de explosão
          if (this.assets.sounds.punch) {
            try {
              this.assets.sounds.punch.play();
            } catch (e) {
              console.log('Erro ao tocar som:', e);
            }
          }
          
          // ✨ NOVO: Notificar que um inimigo foi morto
          console.log(`🎯 INIMIGO MORTO! Callback existe: ${!!this.onEnemyKilled}`);
          if (this.onEnemyKilled) {
            this.onEnemyKilled(enemy);
          }
          
          // Atualizar dificuldade conforme progresso
          this.updateDifficulty();
          
          // ✨ NOVO: Verificar se um boss foi derrotado
          if (enemy.isBoss) {
            console.log('🎉 BOSS DERROTADO! JOGADOR VENCEU!');
            if (this.onBossDefeated) {
              this.onBossDefeated(enemy);
            }
            this.bossActive = false;
          }          
          this.checkBossSpawn(); // Verificar se deve spawnar boss
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
        this.enemies.length < this.currentMaxEnemies) {
      
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
    // Todos os tipos de inimigos estão sempre disponíveis
    const availableTypes = this.enemyTypes;
    
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
    }    // Configurações simples e fixas
    const config = {
      screenWidth: this.screenWidth,
      screenHeight: this.screenHeight,
      health: 60, // Vida fixa para simplicidade
      velocityX: -2 // Velocidade fixa
    };
    
    // Criar instância do inimigo
    return new enemyType.class(x, y, spriteSheet, config);
  }  getRandomSpawnY(enemyType) {
    // Altura base do chão
    const groundY = this.screenHeight - 260; // Mesma altura do jogador
    
    // TucanoPlain aparece mais para cima
    if (enemyType.name === 'tucano-plain') {
      return groundY - 300; // 300 pixels mais para cima que o chão
    }
    
    // Todos os outros inimigos spawnam na mesma altura (no chão)
    return groundY; // Altura fixa para outros inimigos
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
  checkBossSpawn() {
    // Primeiro: marcar que chegou a 3 mortos (para parar spawn)
    if (!this.bossReadyToSpawn && this.enemiesDefeated >= this.enemiesNeededForBoss) {
      this.bossReadyToSpawn = true;
      console.log(`🎯 3 inimigos derrotados! Parando spawn e aguardando tela limpa...`);
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
    const bossY = this.screenHeight * 0.63; // 65% da altura (mais baixo)

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
  }  render(ctx) {
    // Renderizar todos os inimigos
    this.enemies.forEach(enemy => {
      enemy.render(ctx);
    });    // Renderizar explosões simples
    for (const explosion of this.explosions) {
      if (this.explosionImage) {
        // Calcular frame atual com base no tempo
        const frameIndex = Math.floor((explosion.time / explosion.duration) * explosion.totalFrames);
        const frame = Math.min(frameIndex, explosion.totalFrames - 1);
        
        const frameWidth = this.explosionImage.width / explosion.totalFrames;
        const frameHeight = this.explosionImage.height;
        
        // Adicionar efeito de escala crescente
        const scale = 1 + (explosion.time / explosion.duration) * 0.3; // Cresce 30%
        const scaledWidth = explosion.width * scale;
        const scaledHeight = explosion.height * scale;
        const offsetX = (scaledWidth - explosion.width) / 2;
        const offsetY = (scaledHeight - explosion.height) / 2;
        
        ctx.save();
        
        // Adicionar transparência que diminui com o tempo
        const alpha = 1 - (explosion.time / explosion.duration) * 0.3;
        ctx.globalAlpha = alpha;
        
        ctx.drawImage(
          this.explosionImage,
          frame * frameWidth, 0, frameWidth, frameHeight,
          explosion.x - offsetX, explosion.y - offsetY, 
          scaledWidth, scaledHeight
        );
        
        ctx.restore();
      }
    }
    
    // Renderizar mensagem de BOSS
    if (this.showBossMessage) {
      this.renderBossMessage(ctx);
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
  }  renderDebugInfo(ctx) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 300, 160);
    
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(`Nível: ${this.currentLevel}`, 20, 30);
    ctx.fillText(`Inimigos Ativos: ${this.enemies.length}/${this.currentMaxEnemies}`, 20, 50);
    ctx.fillText(`Derrotados: ${this.enemiesDefeated}`, 20, 70);
    ctx.fillText(`Escaparam: ${this.enemiesEscaped}`, 20, 90);
    ctx.fillText(`Próximo Spawn: ${Math.max(0, Math.ceil((this.spawnInterval - (Date.now() - this.lastSpawnTime)) / 1000))}s`, 20, 110);
    ctx.fillText(`Intervalo Spawn: ${this.spawnInterval}ms`, 20, 130);
    
    // Mostrar próximo nível
    const nextLevelIn = (this.currentLevel * this.enemiesPerLevel) - this.enemiesDefeated;
    ctx.fillText(`Próximo Nível: ${nextLevelIn} inimigos`, 20, 150);
    
    ctx.restore();
  }

  // Métodos públicos para controle externo
  pauseSpawning() {
    this.spawnInterval = Infinity;
  }
  resumeSpawning() {
    this.spawnInterval = 2000; // Voltar ao intervalo padrão
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
  }  get gameStats() {
    return {
      enemiesDefeated: this.enemiesDefeated,
      enemiesEscaped: this.enemiesEscaped,
      activeEnemies: this.enemies.length
    };
  }
    // Método para configurar callback quando inimigo escapa
  setEnemyEscapedCallback(callback) {
    this.onEnemyEscaped = callback;
  }
  
  // ✨ NOVO: Método para configurar callback quando boss é derrotado
  setBossDefeatedCallback(callback) {
    this.onBossDefeated = callback;
  }
    // ✨ NOVO: Método para configurar callback quando inimigo é morto
  setEnemyKilledCallback(callback) {
    this.onEnemyKilled = callback;
  }
  
  // ✨ NOVO: Método para testar níveis altos rapidamente
  simulateHighLevel(level) {
    this.enemiesDefeated = level * this.enemiesPerLevel;
    this.updateDifficulty();
    console.log(`🧪 SIMULANDO NÍVEL ${level}! Derrotados: ${this.enemiesDefeated}`);
  }
  
  checkPowerObjectCollisions(player) {
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
            // Aplicar dano ao inimigo (usar dano do próprio poder)
          const damage = powerObject.damage || 50; // Fallback para 50
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
  }  checkCollision(powerObject, target) {
    const powerBounds = powerObject.getBounds();
    const targetBounds = target.bounds;
    
    return (
      powerBounds.x < targetBounds.x + targetBounds.width &&
      powerBounds.x + powerBounds.width > targetBounds.x &&
      powerBounds.y < targetBounds.y + targetBounds.height &&
      powerBounds.y + powerBounds.height > targetBounds.y
    );
  }  // Verificar colisões dos poderes do boss com o jogador
  checkBossPowerCollisions(boss, player) {
    const bossPowers = boss.getPowerObjects();
    
    bossPowers.forEach(power => {
      if (!power.isActive()) return;
      
      // ✨ DEBUG: Verificar posições
      const powerBounds = power.getBounds();
      const playerBounds = player.bounds;
      
      console.log(`🎯 DEBUG COLISÃO: 
        Poder: x=${powerBounds.x.toFixed(0)} y=${powerBounds.y.toFixed(0)} w=${powerBounds.width} h=${powerBounds.height}
        Player: x=${playerBounds.x.toFixed(0)} y=${playerBounds.y.toFixed(0)} w=${playerBounds.width} h=${playerBounds.height}`);
      
      // USAR O MESMO MÉTODO QUE FUNCIONA PARA PLAYER VS INIMIGOS!
      if (this.checkCollision(power, player)) {
        console.log('💥 BOSS ATINGIU O PLAYER!');
        
        // Aplicar dano ao jogador usando o método correto
        if (player.takeDamage) {
          player.takeDamage(25);
        }
        
        // Usar o sistema de callback para remover vida (fallback)
        if (this.onEnemyEscaped) {
          this.onEnemyEscaped({ type: 'boss_damage' });
        }
        
        // Tocar som de dano
        if (this.assets && this.assets.sounds && this.assets.sounds.kick) {
          AssetLoader.playSound(this.assets.sounds.kick, 0.4);
        }
        
        // IMPORTANTE: Destruir o poder para que suma
        power.destroy();
      }
    });
  }
  // Método para atualizar dificuldade progressiva
  updateDifficulty() {
    // Calcular nível atual baseado em inimigos derrotados
    const newLevel = Math.floor(this.enemiesDefeated / this.enemiesPerLevel) + 1;
    
    // Se subiu de nível, aumentar dificuldade
    if (newLevel > this.currentLevel) {
      this.currentLevel = newLevel;
      
      // Aumentar quantidade máxima de inimigos (sem passar do limite)
      const newMaxEnemies = Math.min(
        this.initialMaxEnemies + Math.floor((this.currentLevel - 1) * 1), // Crescimento mais agressivo
        this.maxPossibleEnemies
      );
      
      // Diminuir intervalo de spawn (mais rápido) - mais agressivo em níveis altos
      let newSpawnInterval;
      if (this.currentLevel <= 5) {
        // Níveis baixos: diminuir gradualmente
        newSpawnInterval = Math.max(
          800, // Mínimo de 800ms (mais rápido que antes)
          2500 - (this.currentLevel - 1) * 300
        );
      } else {
        // Níveis altos: muito mais rápido
        newSpawnInterval = Math.max(
          200, // Mínimo de 200ms para níveis altos
          800 - (this.currentLevel - 5) * 50
        );
      }
      
      // Aplicar mudanças
      this.currentMaxEnemies = newMaxEnemies;
      this.spawnInterval = newSpawnInterval;
      
      // Log da mudança de nível
      console.log(`🆙 NÍVEL ${this.currentLevel}! Máx inimigos: ${this.currentMaxEnemies}, Spawn: ${this.spawnInterval}ms`);
    }
  }
}