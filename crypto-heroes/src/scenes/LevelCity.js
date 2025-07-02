import Player from '../entities/Player.js';
import AssetLoader from '../engine/AssetLoader.js';
import ScenarioManager from '../scenarios/ScenarioManager.js';
import EnemyManager from '../entities/EnemyManager.js';
import ScoreDisplay from '../ui/ScoreDisplay.js';
import LivesDisplay from '../ui/LivesDisplay.js';
import GameOverScene from './GameOverScene.js';
import MenuScene from './MenuScene.js';

export default class LevelCity {
  constructor(manager, heroId) {
    console.log('Iniciando LevelCity com herói:', heroId);
    
    this.mgr = manager;
    this.player = new Player(manager.assets, heroId);
    this.heroId = heroId;
    
    // Usar apenas o cenário cyberpunk
    this.currentBackground = 'cyberpunk';
    
    console.log(`Cenário selecionado: ${this.currentBackground}`);
    
    try {
      // Inicializar o gerenciador de cenários
      this.scenarioManager = new ScenarioManager(manager.assets, this.currentBackground);
      console.log('ScenarioManager inicializado com sucesso');    } catch (error) {
      console.error('Erro ao inicializar ScenarioManager:', error);
    }
    
    // Inicializar o gerenciador de inimigos com verificações de segurança
    this.enemyManager = null;
    try {
      const screenWidth = (manager.ctx && manager.ctx.canvas && manager.ctx.canvas.width) || 800;
      const screenHeight = (manager.ctx && manager.ctx.canvas && manager.ctx.canvas.height) || 600;
      
      console.log('Tentando inicializar EnemyManager...');
      console.log('Screen dimensions:', screenWidth, 'x', screenHeight);
      console.log('Assets disponíveis:', Object.keys(manager.assets.images));
        this.enemyManager = new EnemyManager(manager.assets, screenWidth, screenHeight);
      console.log('EnemyManager inicializado com sucesso!');
      
      // Configurar callback para quando inimigo escapa
      this.enemyManager.setEnemyEscapedCallback((enemy) => {
        this.handleEnemyEscaped(enemy);
      });
    } catch (error) {
      console.error('Erro ao inicializar EnemyManager:', error);
      console.log('Continuando sem sistema de inimigos...');
      this.enemyManager = null;
    }
      // Tocar som quando entrar na arena
    AssetLoader.playSound(this.mgr.assets.sounds.crowd, 0.4);
      // Inicializar display de pontuação
    this.scoreDisplay = new ScoreDisplay(manager.ctx);
    
    // Inicializar display de vidas
    this.livesDisplay = new LivesDisplay(manager.ctx, manager.assets, heroId);
    
    console.log('LevelCity inicializado completamente');
  }  update(dt, input) {
    // Atualizar o cenário
    this.scenarioManager.update(dt);
    
    // Atualizar o player
    this.player.update(dt, input);
    
    // Atualizar inimigos com verificação de segurança
    if (this.enemyManager) {
      try {
        this.enemyManager.update(dt, this.player);
        
        // Atualizar pontuação com base nos inimigos derrotados
        const gameStats = this.enemyManager.gameStats;
        if (gameStats && this.scoreDisplay) {
          this.scoreDisplay.updateScore(gameStats.enemiesDefeated);
        }
      } catch (error) {
        console.error('Erro ao atualizar EnemyManager:', error);
        this.enemyManager = null; // Desabilitar se der erro
      }
    }
  }    render(ctx) {
    // Renderizar o cenário (background + elementos como piso)
    this.scenarioManager.render(ctx);
    
    // Desenhar o player
    this.player.render(ctx);
    
    // Renderizar inimigos com verificação de segurança
    if (this.enemyManager) {
      try {
        this.enemyManager.render(ctx);
      } catch (error) {
        console.error('Erro ao renderizar EnemyManager:', error);
        this.enemyManager = null; // Desabilitar se der erro
      }
    }
      // Renderizar o display de pontuação por último (para ficar por cima)
    if (this.scoreDisplay) {
      this.scoreDisplay.render(ctx);
    }
    
    // Renderizar o display de vidas
    if (this.livesDisplay) {
      this.livesDisplay.render(ctx);
    }
  }

  // Método mantido para compatibilidade, mas agora gerenciado pelo ScenarioManager
  drawFallbackBackground(ctx) {
    return this.scenarioManager.drawFallbackBackground(ctx);
  }

  // Método para obter a posição Y do piso (útil para física do personagem)
  getFloorY(ctx) {
    return this.scenarioManager.getFloorY(ctx ? ctx.canvas.height : undefined);
  }

  // Métodos para ajuste fino do loop do piso (para usar no console)
  adjustFloorExit(value) {
    this.scenarioManager.adjustFloorExitThreshold(value);
  }

  adjustFloorEntry(value) {
    this.scenarioManager.adjustFloorEntryOffset(value);
  }

  getFloorControls() {
    return this.scenarioManager.getFloorControls();
  }

  setFloorControls(config) {
    this.scenarioManager.setFloorControls(config);
  }
  // Método para debug dos tiles (usar no console)
  debugFloor() {
    this.scenarioManager.debugFloorTiles();
  }

  // Métodos para controle de inimigos
  pauseEnemies() {
    if (this.enemyManager) {
      this.enemyManager.pauseSpawning();
    }
  }

  resumeEnemies() {
    if (this.enemyManager) {
      this.enemyManager.resumeSpawning();
    }
  }

  clearEnemies() {
    if (this.enemyManager) {
      this.enemyManager.clearAllEnemies();
    }
  }

  spawnEnemy(enemyType) {
    if (this.enemyManager) {
      return this.enemyManager.forceSpawn(enemyType);
    }
  }

  getGameStats() {
    if (this.enemyManager) {
      return this.enemyManager.gameStats;
    }
    return null;
  }

  // Métodos para controle da pontuação
  getScore() {
    if (this.enemyManager) {
      return this.enemyManager.gameStats.enemiesDefeated;
    }
    return 0;
  }

  resetScore() {
    if (this.scoreDisplay) {
      this.scoreDisplay.updateScore(0);
    }
  }

  // Método para customizar a aparência da pontuação (usar no console)
  customizeScore(options) {
    if (this.scoreDisplay) {
      this.scoreDisplay.setStyle(options);
    }
  }

  // Método para reposicionar a pontuação (usar no console)
  moveScore(x, y) {
    if (this.scoreDisplay) {
      this.scoreDisplay.setPosition(x, y);
    }
  }

  // Método para ativar/desativar modo debug
  toggleDebugMode() {
    window.DEBUG_MODE = !window.DEBUG_MODE;
    console.log('Debug Mode:', window.DEBUG_MODE ? 'ON' : 'OFF');
  }

  // Método de teste para spawnar inimigo manualmente
  testSpawnEnemy() {
    if (this.enemyManager) {
      console.log('Tentando spawnar inimigo de teste...');
      const enemy = this.enemyManager.forceSpawn('gas-goblin');
      if (enemy) {
        console.log('Inimigo spawnado com sucesso!', enemy);
      } else {
        console.log('Falha ao spawnar inimigo');
      }
    } else {
      console.log('EnemyManager não está disponível');
    }
  }

  // Métodos para teste e debug do sistema de hit
  testPowerHit() {
    if (this.enemyManager && this.player) {
      console.log('=== TESTE DE HIT COM POWER ===');
      console.log('Inimigos ativos:', this.enemyManager.enemies.length);
      console.log('Power objects ativos:', this.player.getPowerObjects().length);
      
      // Forçar spawn de um inimigo para teste
      const testEnemy = this.enemyManager.forceSpawn('gas-goblin');
      if (testEnemy) {
        console.log('Inimigo de teste spawnado:', testEnemy);
        
        // Forçar criação de um power object
        this.player.shoot();
        console.log('Power object criado para teste');
        
        setTimeout(() => {
          console.log(this.getGameStats());
        }, 1000);
      }
    }
  }
  // Método simples para testar dano direto
  testDirectHit() {
    if (this.enemyManager && this.enemyManager.enemies.length > 0) {
      const enemy = this.enemyManager.enemies[0];
      console.log('=== TESTE DE DANO DIRETO ===');
      console.log('Inimigo antes:', { health: enemy.health, maxHealth: enemy.maxHealth });
      
      enemy.takeDamage(25);
      
      console.log('Inimigo depois:', { health: enemy.health, maxHealth: enemy.maxHealth });
    } else {
      console.log('Nenhum inimigo para testar. Spawnando um...');
      this.spawnEnemy('gas-goblin');
    }
  }

  // Método chamado quando um inimigo escapa
  handleEnemyEscaped(enemy) {
    if (this.livesDisplay) {
      const isGameOver = this.livesDisplay.loseLife();
      
      if (isGameOver) {
        console.log('💀 GAME OVER! Todas as vidas perdidas!');
        this.triggerGameOver();
      }
    }
  }
    // Método para game over
  triggerGameOver() {
    // Pausar spawning de inimigos
    if (this.enemyManager) {
      this.enemyManager.pauseSpawning();
    }
    
    console.log('🎮 Transicionando para tela de Game Over...');
    
    // Criar GameOverScene com callbacks
    const gameOverScene = new GameOverScene(
      this.mgr,
      // Callback para reiniciar o jogo
      () => {
        console.log('🔄 Reiniciando jogo...');
        const newLevelCity = new LevelCity(this.mgr, this.heroId);
        this.mgr.changeScene(newLevelCity);
      },
      // Callback para voltar ao menu
      () => {
        console.log('📋 Voltando ao menu principal...');
        this.mgr.changeScene(new MenuScene(this.mgr));
      }
    );
    
    // Mudar para a cena de game over
    this.mgr.changeScene(gameOverScene);
 }

  // Métodos para controle das vidas
  getCurrentLives() {
    if (this.livesDisplay) {
      return this.livesDisplay.getCurrentLives();
    }
    return 0;
  }
  
  resetLives() {
    if (this.livesDisplay) {
      this.livesDisplay.resetLives();
    }
  }
  
  isGameOver() {
    if (this.livesDisplay) {
      return this.livesDisplay.isGameOver();
    }
    return false;
  }
  
  // Método para testar perda de vida (usar no console)
  testLoseLife() {
    if (this.livesDisplay) {
      const isGameOver = this.livesDisplay.loseLife();
      console.log(`Vidas restantes: ${this.getCurrentLives()}`);
      if (isGameOver) {
        console.log('Game Over triggered!');
      }
    }
  }

  // === MÉTODOS DE DEBUG DO BOSS ===
  
  // Testar ataque do boss
  testBossAttack() {
    if (this.enemyManager) {
      return this.enemyManager.testBossAttack();
    }
    console.log('❌ EnemyManager não disponível');
    return false;
  }
  
  // Debug do boss
  debugBoss() {
    if (this.enemyManager) {
      return this.enemyManager.debugBoss();
    }
    console.log('❌ EnemyManager não disponível');
    return null;
  }
  
  // Forçar spawn do boss (para teste)
  forceBossSpawn() {
    if (this.enemyManager) {
      // Limpar inimigos primeiro
      this.enemyManager.clearAllEnemies();
      
      // Simular que chegou a 10 mortos
      this.enemyManager.enemiesDefeated = 10;
      this.enemyManager.bossReadyToSpawn = true;
      this.enemyManager.bossSpawned = true;
      
      // Spawnar boss direto
      this.enemyManager.spawnBoss();
      
      console.log('🎯 Boss forçado a spawnar para teste!');
      return true;
    }
    console.log('❌ EnemyManager não disponível');
    return false;
  }
}
