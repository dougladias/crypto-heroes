import Sprite from "../engine/Sprite.js";

/**
 * Controlador específico para movimento de agachar
 * Gerencia altura, tamanho e frames do personagem quando agachado
 */
export default class CrouchController {
  constructor(assets, heroId) {
    this.assets = assets;
    this.heroId = heroId;
    
    // Configurações específicas do agachar
    this.config = {
      // Dimensões quando agachado
      visualHeight: 90,     // Altura visual renderizada
      visualWidth: 190,      // Largura visual (mantém a mesma)
      collisionHeight: 30,   // Altura da hitbox de colisão
      collisionWidth: 20,    // Largura da hitbox de colisão
      
      // Ajuste de posição
      yOffset: 90,           // Offset vertical para ajustar posição visual
      
      // Configurações da animação
      frameCount: 1,         // 1 frame estático para agachar
      frameRate: 1,          // Frame rate (irrelevante para 1 frame)
      frameRange: [0]        // Apenas o primeiro frame
    };
    
    // Sprite específico para agachar
    this.crouchSprite = new Sprite(
      assets.images[`${heroId}_crouch`], 
      this.config.frameCount, 
      this.config.frameRate
    );
    
    // Configurar frame range
    this.crouchSprite.setFrameRange(this.config.frameRange);
    
    // Estado atual
    this.isActive = false;
    this.transitionDuration = 0; // Para futuras animações de transição
  }
  
  /**
   * Ativa o modo agachar
   */
  activate() {
    if (!this.isActive) {
      this.isActive = true;
      this.crouchSprite.reset();
    }
  }
  
  /**
   * Desativa o modo agachar
   */
  deactivate() {
    this.isActive = false;
  }
  
  /**
   * Atualiza o estado do agachar
   * @param {number} dt - Delta time em milissegundos
   */
  update(dt) {
    if (this.isActive) {
      // Para 1 frame estático, não precisa de step
      // Mas mantemos para consistência e futuras expansões
      this.crouchSprite.step(dt);
    }
  }
  
  /**
   * Renderiza o sprite de agachar
   * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
   * @param {number} x - Posição X do personagem
   * @param {number} y - Posição Y do personagem
   * @param {number} facing - Direção que o personagem está olhando (1 ou -1)
   */
  render(ctx, x, y, facing) {
    if (!this.isActive) return;
    
    // Ajustar posição Y para o boneco ficar no chão
    const groundY = ctx.canvas.height - 305;
    const renderY = groundY - y;
    const renderYAdjusted = renderY + this.config.yOffset;
    
    // Aplicar efeito visual de agachar
    ctx.save();
    ctx.shadowColor = "rgba(0, 255, 0, 0.3)";
    ctx.shadowBlur = 5;
    
    // Renderizar sprite de agachar
    this.crouchSprite.draw(
      ctx,
      x,
      renderYAdjusted,
      this.config.visualWidth,
      this.config.visualHeight,
      facing === -1 // Flip horizontal se estiver virado para esquerda
    );
    
    ctx.restore();
  }
  
  /**
   * Retorna as dimensões de colisão quando agachado
   * @returns {Object} Dimensões de colisão
   */
  getCollisionDimensions() {
    return {
      width: this.config.collisionWidth,
      height: this.config.collisionHeight
    };
  }
  
  /**
   * Retorna as dimensões visuais quando agachado
   * @returns {Object} Dimensões visuais
   */
  getVisualDimensions() {
    return {
      width: this.config.visualWidth,
      height: this.config.visualHeight,
      yOffset: this.config.yOffset
    };
  }
  
  /**
   * Permite personalizar as configurações do agachar
   * @param {Object} newConfig - Novas configurações
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Recriar sprite se necessário
    if (newConfig.frameCount || newConfig.frameRate) {
      this.crouchSprite = new Sprite(
        this.assets.images[`${this.heroId}_crouch`], 
        this.config.frameCount, 
        this.config.frameRate
      );
      this.crouchSprite.setFrameRange(this.config.frameRange);
    }
  }
  
  /**
   * Verifica se o modo agachar está ativo
   * @returns {boolean} True se estiver agachado
   */
  isActivated() {
    return this.isActive;
  }
  
  /**
   * Obtém informações de debug
   * @returns {Object} Informações de debug
   */
  getDebugInfo() {
    return {
      isActive: this.isActive,
      frameCount: this.config.frameCount,
      frameRate: this.config.frameRate,
      currentFrame: this.crouchSprite.frame,
      visualDimensions: this.getVisualDimensions(),
      collisionDimensions: this.getCollisionDimensions()
    };
  }
}
