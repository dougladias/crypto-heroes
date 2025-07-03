import Player from '../entities/Player.js';
import AssetLoader from '../engine/AssetLoader.js';
import ScenarioManager from '../scenarios/ScenarioManager.js';
import EnemyManager from '../entities/EnemyManager.js';
import ScoreDisplay from '../ui/ScoreDisplay.js';
import LivesDisplay from '../ui/LivesDisplay.js';
import GameOverScene from './GameScene.js';
import MenuScene from './MenuScene.js';

export default class LevelCity {
  constructor(manager, heroId) {   
    this.mgr = manager;
    this.player = new Player(manager.assets, heroId);
    this.heroId = heroId;
    
    // Usar apenas o cenário cyberpunk
    this.currentBackground = 'cyberpunk';
    try {
      // Inicializar o gerenciador de cenários
      this.scenarioManager = new ScenarioManager(manager.assets, this.currentBackground);
      } catch (error) {
      console.error('Erro ao inicializar ScenarioManager:', error);
    }
    
    // Inicializar o gerenciador de inimigos com verificações de segurança
    this.enemyManager = null;
    try {
      const screenWidth = (manager.ctx && manager.ctx.canvas && manager.ctx.canvas.width) || 800;
      const screenHeight = (manager.ctx && manager.ctx.canvas && manager.ctx.canvas.height) || 600;     
      
      // Criar o EnemyManager com o tamanho da tela
      // Isso garante que o EnemyManager saiba o tamanho da arena
      this.enemyManager = new EnemyManager(manager.assets, screenWidth, screenHeight);
      
        // Configurar callback para quando inimigo escapa
      this.enemyManager.setEnemyEscapedCallback((enemy) => {
        this.handleEnemyEscaped(enemy);
      });
      
      // ✨ NOVO: Configurar callback para quando boss é derrotado
      this.enemyManager.setBossDefeatedCallback((boss) => {
        this.handleBossDefeated(boss);
      });
    } catch (error) {
      console.error('Erro ao inicializar EnemyManager:', error);      
      this.enemyManager = null;
    }
      // Tocar som quando entrar na arena
    AssetLoader.playSound(this.mgr.assets.sounds.crowd, 0.4);
      // Inicializar display de pontuação
    this.scoreDisplay = new ScoreDisplay(manager.ctx);
    
    // Inicializar display de vidas
    this.livesDisplay = new LivesDisplay(manager.ctx, manager.assets, heroId);    
    
  }  update(dt, input) {
    // Atualizar o cenário
    this.scenarioManager.update(dt);
      // Atualizar o player
    this.player.update(dt, input, this.enemyManager);
    
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

  // Métodos para controle do cenário (usar no console)
  getFloorControls() {
    return this.scenarioManager.getFloorControls();
  }

  // Método para definir controles do piso (usar no console)
  // Permite customizar como o piso reage ao movimento do player
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
  }

  // Método de teste para spawnar inimigo manualmente
  testSpawnEnemy() {
    if (this.enemyManager) {      
      const enemy = this.enemyManager.forceSpawn('gas-goblin');
      if (enemy) {        
      } else {        
      }
    } else {      
    }
  }

  // Métodos para teste e debug do sistema de hit
  testPowerHit() {
    if (this.enemyManager && this.player) {      
      
      // Forçar spawn de um inimigo para teste
      const testEnemy = this.enemyManager.forceSpawn('gas-goblin');
      if (testEnemy) {        
        
        // Forçar criação de um power object
        this.player.shoot();        
        
        setTimeout(() => {          
        }, 1000);
      }
    }
  }
  // Método simples para testar dano direto
  testDirectHit() {
    if (this.enemyManager && this.enemyManager.enemies.length > 0) {
      const enemy = this.enemyManager.enemies[0];     
      
      enemy.takeDamage(25);      
      
    } else {      
      this.spawnEnemy('gas-goblin');
    }
  }

  // Método chamado quando um inimigo escapa
  handleEnemyEscaped(enemy) {
    if (this.livesDisplay) {
      const isGameOver = this.livesDisplay.loseLife();
      
      // Se perdeu a última vida, chamar game over
      if (isGameOver) {        
        this.triggerGameOver();      }
    }
  }
  
  // NOVO: Método para quando boss é derrotado (VITÓRIA!)
  handleBossDefeated(boss) {    
    this.triggerGameOver(true); 
  }
  
  // Método para game over
  triggerGameOver(isVictory = false) {
    // Pausar spawning de inimigos
    if (this.enemyManager) {
      this.enemyManager.pauseSpawning();
    }
    // Pausar o player    
    if (isVictory) {      
    } else {      
    }
    
    // Criar GameOverScene com callbacks
    const gameOverScene = new GameOverScene(
      this.mgr,
      // Callback para reiniciar o jogo
      () => {        
        const newLevelCity = new LevelCity(this.mgr, this.heroId);
        this.mgr.changeScene(newLevelCity);
      },
      // Callback para voltar ao menu
      () => {        
        this.mgr.changeScene(new MenuScene(this.mgr));
      },
      // NOVO: Parâmetro de vitória
      isVictory
    );
    
    // Mudar para a cena de game over/vitória
    this.mgr.changeScene(gameOverScene);
 }

  // Métodos para controle das vidas
  getCurrentLives() {
    if (this.livesDisplay) {
      return this.livesDisplay.getCurrentLives();
    }
    return 0;
  }
  
  // Método para perder uma vida (usar no console)
  resetLives() {
    if (this.livesDisplay) {
      this.livesDisplay.resetLives();
    }
  }
  
  // Método para verificar se o jogo acabou
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
      if (isGameOver) {        
      }
    }
  }  
}
