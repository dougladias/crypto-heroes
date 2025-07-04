// Power-up de vida que pode ser coletado pelo jogador
// Quando coletado, restaura uma vida perdida ou adiciona uma vida extra
export default class LifePowerUp {  constructor(assets, x, y) {
    this.assets = assets;
    this.x = x;
    this.y = y;
    this.width = 60;  // Maior para ser mais fácil de pegar
    this.height = 60; // Maior para ser mais fácil de pegar
    
    // Estados do power-up
    this.isActive = true;
    this.isCollected = false;
    
    // Animação de flutuação
    this.floatTimer = 0;
    this.floatAmount = 8;
    this.floatSpeed = 0.004;
    this.originalY = y;
    
    // Animação de rotação
    this.rotationAngle = 0;
    this.rotationSpeed = 0.03;
    
    // Efeito de brilho
    this.glowIntensity = 0;
    this.glowDirection = 1;
    
    // Sprite do power-up
    this.sprite = assets.images.life;
    
    // Movimento - igual aos inimigos
    this.speed = 120; // Velocidade similar aos inimigos
    this.moveDirection = -1; // Move para a esquerda (mesma direção dos inimigos)
  }
    // Atualiza o power-up
  update(deltaTime) {
    if (!this.isActive) return;
    
    // Movimento para a esquerda (igual aos inimigos)
    this.x += this.moveDirection * this.speed * deltaTime / 1000;
    
    // Animação de flutuação
    this.floatTimer += deltaTime * this.floatSpeed;
    this.y = this.originalY + Math.sin(this.floatTimer) * this.floatAmount;
    
    // Animação de rotação
    this.rotationAngle += this.rotationSpeed * deltaTime / 1000;
    
    // Efeito de brilho
    this.glowIntensity += this.glowDirection * deltaTime * 0.002;
    if (this.glowIntensity >= 1) {
      this.glowIntensity = 1;
      this.glowDirection = -1;
    } else if (this.glowIntensity <= 0) {
      this.glowIntensity = 0;
      this.glowDirection = 1;
    }
    
    // Desativar se saiu da tela pela esquerda
    if (this.x < -this.width - 50) {
      this.isActive = false;
    }
  }
    // Renderiza o power-up
  render(ctx) {
    if (!this.isActive || !this.sprite) return;
    
    ctx.save();
    
    // Mover para o centro do power-up para rotação
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
    
    // Aplicar rotação
    ctx.rotate(this.rotationAngle);
    
    // Efeito de brilho (sombra colorida)
    const glowIntensity = 0.4 + (this.glowIntensity * 0.6);
    ctx.shadowColor = '#00FF88';
    ctx.shadowBlur = 15 + (this.glowIntensity * 8);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Aplicar alpha para pulsação
    ctx.globalAlpha = glowIntensity;
      // Desenhar o sprite
    ctx.drawImage(
      this.sprite,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    
    // Resetar configurações
    ctx.restore();
    
    // Debug: Mostrar hitbox quando debug estiver ativo
    if (window.DEBUG_MODE) {
      this.renderDebugHitbox(ctx);
    }
  }
    // Renderizar hitbox para debug
  renderDebugHitbox(ctx) {
    ctx.save();
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Mostrar área de colisão expandida
    const margin = 20;
    ctx.strokeRect(
      this.x - margin,
      this.y - margin,
      this.width + (margin * 2),
      this.height + (margin * 2)
    );
    
    // Mostrar área normal do power-up
    ctx.strokeStyle = '#00FF00';
    ctx.setLineDash([]);
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    // Mostrar posição central
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(this.x + this.width/2 - 2, this.y + this.height/2 - 2, 4, 4);
    
    // Mostrar coordenadas
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Arial';
    ctx.fillText(`(${Math.round(this.x)}, ${Math.round(this.y)})`, this.x, this.y - 5);
    
    ctx.restore();
  }  // Verifica colisão com o jogador
  checkCollision(player) {
    if (!this.isActive || this.isCollected) return false;
    
    // SIMPLIFICADO: Usar posição direta do player na tela (não sistema físico)
    // Calcular onde o player realmente aparece na tela
    const groundY = 600 - -15; // Base onde o player fica
    const playerScreenY = groundY - player.y; // Posição Y real do player na tela
    const playerScreenX = player.x; // Posição X é direta
    
    // Área de colisão com margem generosa
    const margin = 0; // Margem bem tolerante
    
    // Área do power-up (com margem)
    const powerLeft = this.x - margin;
    const powerRight = this.x + this.width + margin;
    const powerTop = this.y - margin;
    const powerBottom = this.y + this.height + margin;
    
    // Área do player na tela (com margem)
    const playerLeft = playerScreenX - margin;
    const playerRight = playerScreenX + 130 + margin; // Largura do player
    const playerTop = playerScreenY - margin;
    const playerBottom = playerScreenY + 250 + margin; // Altura do player
    
    // Verificar se as áreas se sobrepõem
    const horizontalOverlap = powerLeft < playerRight && powerRight > playerLeft;
    const verticalOverlap = powerTop < playerBottom && powerBottom > playerTop;
    
    const collision = horizontalOverlap && verticalOverlap;
    
    // Debug simples
    if (window.DEBUG_MODE) {
      console.log(`Power: (${Math.round(this.x)}, ${Math.round(this.y)})`);
      console.log(`Player: (${Math.round(playerScreenX)}, ${Math.round(playerScreenY)})`);
      console.log(`Collision: ${collision}`);
      
      if (collision) {
        console.log('💚 VIDA COLETADA!');
      }
    }
    
    return collision;
  }
  
  // Coleta o power-up
  collect() {
    if (!this.isActive || this.isCollected) return false;
    
    this.isCollected = true;
    this.isActive = false;
    
    return true;
  }
  
  // Getters para verificação
  get bounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
  
  get isAlive() {
    return this.isActive && !this.isCollected;
  }
}
