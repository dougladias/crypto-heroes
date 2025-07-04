import LifePowerUp from './LifePowerUp.js';

// Gerenciador de power-ups de vida
// Controla quando e onde spawnar os power-ups de vida
export default class LifePowerUpManager {  constructor(assets, screenWidth = 800, screenHeight = 600) {
    this.assets = assets;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
    
    // Array de power-ups ativos
    this.powerUps = [];
    
    // Configurações de spawn
    this.spawnChance = 0.15; // 15% de chance por spawn check
    this.spawnInterval = 8000; // Verificar a cada 8 segundos (mais raro)
    this.lastSpawnTime = 0;
    this.maxPowerUps = 1; // Apenas 1 power-up por vez
      // Configurações de posição - spawnar da direita como inimigos
    this.spawnX = screenWidth + 50; // Spawnar fora da tela à direita
    this.spawnYRange = { min: 300, max: 400 }; // Altura onde o player pode alcançar
    
    // Estatísticas
    this.totalSpawned = 0;
    this.totalCollected = 0;
  }
  
  // Atualiza todos os power-ups
  update(deltaTime) {
    // Verificar se deve spawnar novo power-up
    this.lastSpawnTime += deltaTime;
    if (this.lastSpawnTime >= this.spawnInterval) {
      this.trySpawnPowerUp();
      this.lastSpawnTime = 0;
    }
    
    // Atualizar power-ups existentes
    this.powerUps = this.powerUps.filter(powerUp => {
      if (powerUp.isActive) {
        powerUp.update(deltaTime);
        return true;
      }
      return false;
    });
  }
    // Tenta spawnar um novo power-up
  trySpawnPowerUp() {
    // Verificar se já tem muitos power-ups
    if (this.powerUps.length >= this.maxPowerUps) {
      return;
    }
    
    // Verificar chance de spawn
    if (Math.random() > this.spawnChance) {
      return;
    }
    
    // Spawnar novo power-up vindo da direita
    const x = this.spawnX;
    const y = this.spawnYRange.min + Math.random() * (this.spawnYRange.max - this.spawnYRange.min);
    
    const powerUp = new LifePowerUp(this.assets, x, y);
    this.powerUps.push(powerUp);
    this.totalSpawned++;
    
    console.log(`💚 Power-up de vida spawnou da direita em (${Math.round(x)}, ${Math.round(y)})`);
  }
  
  // Força o spawn de um power-up (para testes)
  forceSpawnPowerUp(x = null, y = null) {
    if (x === null) {
      x = this.spawnX; // Spawnar da direita
    }
    if (y === null) {
      y = this.spawnYRange.min + Math.random() * (this.spawnYRange.max - this.spawnYRange.min);
    }
    
    const powerUp = new LifePowerUp(this.assets, x, y);
    this.powerUps.push(powerUp);
    this.totalSpawned++;
    
    console.log(`💚 Power-up de vida forçado da direita em (${Math.round(x)}, ${Math.round(y)})`);
    return powerUp;
  }
  
  // Verifica colisões com o jogador
  checkCollisions(player) {
    const collectedPowerUps = [];
    
    this.powerUps.forEach(powerUp => {
      if (powerUp.checkCollision(player)) {
        if (powerUp.collect()) {
          collectedPowerUps.push(powerUp);
          this.totalCollected++;
          console.log(`💚 Power-up de vida coletado! Total coletados: ${this.totalCollected}`);
        }
      }
    });
    
    return collectedPowerUps;
  }
  
  // Renderiza todos os power-ups
  render(ctx) {
    this.powerUps.forEach(powerUp => {
      powerUp.render(ctx);
    });
  }
  
  // Limpa todos os power-ups
  clear() {
    this.powerUps = [];
  }
  
  // Getters para estatísticas
  get activePowerUps() {
    return this.powerUps.filter(p => p.isActive);
  }
  
  get powerUpCount() {
    return this.powerUps.length;
  }
  
  get statistics() {
    return {
      totalSpawned: this.totalSpawned,
      totalCollected: this.totalCollected,
      active: this.powerUpCount,
      collectionRate: this.totalSpawned > 0 ? (this.totalCollected / this.totalSpawned * 100).toFixed(1) : 0
    };
  }
  
  // Configurações ajustáveis
  setSpawnChance(chance) {
    this.spawnChance = Math.max(0, Math.min(1, chance));
  }
  
  setSpawnInterval(interval) {
    this.spawnInterval = Math.max(1000, interval);
  }
  
  setMaxPowerUps(max) {
    this.maxPowerUps = Math.max(1, max);
  }
  
  // Renderizar informações de debug
  renderDebugInfo(ctx) {
    ctx.save();
    ctx.fillStyle = '#00FF00';
    ctx.font = '12px Arial';
    ctx.fillText(`Life PowerUps: ${this.powerUpCount}`, 20, 200);
    ctx.fillText(`Spawned: ${this.totalSpawned}`, 20, 220);
    ctx.fillText(`Collected: ${this.totalCollected}`, 20, 240);
    ctx.fillText(`Collection Rate: ${this.statistics.collectionRate}%`, 20, 260);
    ctx.restore();
  }
}
