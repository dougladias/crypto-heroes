import Sprite from '../engine/Sprite.js';

// Classe PowerObject representa um objeto de poder que pode ser coletado pelos heróis
// Ele é um sprite que se move na direção especificada e desaparece após um tempo
export default class PowerObject {
  constructor(assets, x, y, direction) {
    this.assets = assets;
    
    // SISTEMA DE ALEATORIEDADE: Escolher um dos 3 poderes aleatoriamente
    const powerTypes = ['power_brl', 'power_eur', 'power_usd'];
    const randomPowerType = powerTypes[Math.floor(Math.random() * powerTypes.length)];
    
    // Usar o poder aleatório escolhido
    this.sprite = new Sprite(assets.images[randomPowerType], 1, 1);
    this.powerType = randomPowerType; // Guardar qual tipo foi escolhido
      // Posição inicial e direção do objeto
    this.x = x;
    this.y = y;
    this.direction = direction; 
    this.speed = 500; 
    this.active = true;
    this.lifeTime = 3500; 
    this.timer = 0;
    
    // Dano do poder (pode ser modificado)
    this.damage = 50; // Dano padrão
  }
  
  // Atualizar o objeto de poder
  // dt é o tempo em milissegundos desde a última atualização
  update(dt) {
    if (!this.active) return;
    
    // Mover o objeto na direção especificada
    this.x += this.speed * this.direction * dt / 1000;
    
    // Atualizar timer de vida
    this.timer += dt;
    if (this.timer >= this.lifeTime) {
      this.active = false;      
    }
    
    // Remover se sair da tela 
    if (this.x < -50 || this.x > 1100) {
      this.active = false;      
    }
  }  // Renderizar o objeto de poder
  // ctx é o contexto de renderização do canvas
  render(ctx) {
    if (!this.active) return;
    
    // CORREÇÃO: Usar altura fixa para consistência total entre render e bounds
    const groundY = 600 - -85;  // Mesma lógica do getBounds
    const renderY = groundY - this.y; 
    
    // Tamanho do objeto de poder
    const width = 35;
    const height = 35;
    
    // Desenhar o sprite do objeto de poder
    this.sprite.draw(ctx, this.x, renderY, width, height, this.direction === -1);
  }
  
  // Verificar se ainda está ativo
  isActive() {
    return this.active;
  }
  
  // Destruir o objeto
  destroy() {
    this.active = false;
  }  // Obter bounds para colisão
  getBounds(ctx = null) {
    // CORREÇÃO FINAL: Calcular altura baseada no sistema usado no projeto
    // O sistema usa altura padrão de 600, então vamos manter consistência
    const canvasHeight = 600 - -100;  // Altura padrão do jogo
    const groundY = canvasHeight - 80; 
    const realY = groundY - this.y; 
    
    return {
      x: this.x,
      y: realY,  
      width: 35,
      height: 35 
    };
  }
}
