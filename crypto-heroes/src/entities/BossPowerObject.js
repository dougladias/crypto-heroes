import Sprite from '../engine/Sprite.js';

// Classe PowerObject representa um objeto de poder que pode ser coletado pelos heróis
// Ele é um sprite que se move na direção especificada e desaparece após um tempo
export default class PowerObject {
  constructor(assets, x, y, direction) {
    this.assets = assets;
    
    // SISTEMA DE ALEATORIEDADE: Escolher um dos 3 poderes aleatoriamente
    const powerTypes = ['power_enemy'];
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
  }  // Atualizar o objeto de poder
  // dt é o tempo em milissegundos desde a última atualização
  update(dt) {
    if (!this.active) return;
    
    // BOSS SEMPRE ATIRA PARA A ESQUERDA (direção fixa -1)
    this.x += this.speed * (-1) * dt / 1000; // Direção fixa -1 (esquerda)
    
    // Atualizar timer de vida
    this.timer += dt;
    if (this.timer >= this.lifeTime) {
      this.active = false;      
    }
    
    // Remover se sair da tela 
    if (this.x < -50 || this.x > 1000) {
      this.active = false;      
    }
  }
  // Renderizar o objeto de poder
  // ctx é o contexto de renderização do canvas
  render(ctx) {
    if (!this.active) return;    // Calcular a posição Y relativa ao chão
    // A base do chão é a mesma que a dos personagens, então usamos o mesmo cálculo
    const groundY = 600 - (-500); // ✨ AJUSTADO: Poder do boss mais baixo (igual ao player)
    const renderY = groundY - this.y;
    
    // Tamanho do objeto de poder
    const width = 60;
    const height = 60;
    
    // Desenhar o sprite do objeto de poder
    this.sprite.draw(ctx, this.x, renderY, width, height, this.direction === -1);
    
    // Log da posição para verificar (apenas os primeiros segundos)
    if (this.timer < 1000) {       
    }
  }
  
  // Verificar se ainda está ativo
  isActive() {
    return this.active;
  }
  
  // Destruir o objeto
  destroy() {
    this.active = false;
  }    // Obter bounds para colisão
  getBounds(ctx = null) {    // ✨ CORREÇÃO CRÍTICA: Sincronizar posição física com posição visual
    // Usar o mesmo cálculo do render para garantir que a colisão aconteça
    // exatamente onde o poder aparece visualmente na tela
    const groundY = 600 - (-500); // ✨ AJUSTADO: Mesma altura do render (sincronizado)
    const renderY = groundY - this.y;

    return {
      x: this.x,
      y: renderY, // ✨ USAR renderY em vez de this.y para sincronizar com visual
      width: 35,
      height: 35
    };
  }
}
