import Player from '../entities/Player.js';
import AssetLoader from '../engine/AssetLoader.js';
import ScenarioManager from '../scenarios/ScenarioManager.js';
import EnemyManager from '../entities/EnemyManager.js';

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
    } catch (error) {
      console.error('Erro ao inicializar EnemyManager:', error);
      console.log('Continuando sem sistema de inimigos...');
      this.enemyManager = null;
    }
    
    // Tocar som quando entrar na arena
    AssetLoader.playSound(this.mgr.assets.sounds.crowd, 0.4);
    
    console.log('LevelCity inicializado completamente');
  }
  update(dt, input) {
    // Atualizar o cenário
    this.scenarioManager.update(dt);
    
    // Atualizar o player
    this.player.update(dt, input);
    
    // Atualizar inimigos com verificação de segurança
    if (this.enemyManager) {
      try {
        this.enemyManager.update(dt, this.player);
      } catch (error) {
        console.error('Erro ao atualizar EnemyManager:', error);
        this.enemyManager = null; // Desabilitar se der erro
      }
    }
  }
    render(ctx) {
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
}
