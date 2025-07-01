import Player from '../entities/Player.js';
import AssetLoader from '../engine/AssetLoader.js';
import ScenarioManager from '../scenarios/ScenarioManager.js';

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
      console.log('ScenarioManager inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar ScenarioManager:', error);
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
  }
  
  render(ctx) {
    // Renderizar o cenário (background + elementos como piso)
    this.scenarioManager.render(ctx);
    
    // Desenhar o player
    this.player.render(ctx);
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
}
