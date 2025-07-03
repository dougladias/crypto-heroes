
// Controles de jogo
// Esta cena exibe os controles do jogo e permite que o jogador prossiga pressionando qualquer tecla
// ou aguardando um tempo limite de 5 segundos
export default class ControlScene {
  constructor(sceneManager, onComplete = null) {    
    this.sceneManager = sceneManager;
    this.onComplete = onComplete;
    this.assets = sceneManager.assets;
    
    // Timer automático de 5 segundos
    this.autoStartTimer = 5000; 
    this.currentTime = 0;
    
    // Estados de transição
    this.fadeIn = true;
    this.fadeAlpha = 1.0;
    this.fadeSpeed = 3.0;
    
    // Animação do texto
    this.textScale = 1.0;
    this.textScaleDirection = 1;
    this.textScaleSpeed = 0.8;
  }
    // Método chamado quando a cena é ativada
  onEnter() {
    // Garantir que o cursor seja default na tela de controles
    const canvas = this.sceneManager.ctx.canvas;
    canvas.style.cursor = 'default';
  }
    update(dt, input) {
    // Animação de fade in
    if (this.fadeIn) {
      this.fadeAlpha -= this.fadeSpeed * dt / 1000;
      if (this.fadeAlpha <= 0) {
        this.fadeAlpha = 0;
        this.fadeIn = false;
      }
    }
    
    // Atualizar timer automático
    this.currentTime += dt;
    
    // Animação do texto "Pressione qualquer tecla"
    this.textScale += this.textScaleDirection * this.textScaleSpeed * dt / 1000;
    if (this.textScale >= 1.2) {
      this.textScale = 1.2;
      this.textScaleDirection = -1;
    } else if (this.textScale <= 0.9) {
      this.textScale = 0.9;
      this.textScaleDirection = 1;
    }    // Verificar se pode prosseguir (qualquer tecla ou tempo esgotado)
    const canProceed = this.currentTime >= this.autoStartTimer ||
                      (input.isDown('Enter') && this.tick('Enter')) ||
                      (input.isDown('Action') && this.tick('Action')) ||
                      (input.isDown('Jump') && this.tick('Jump')) ||
                      (input.isDown('Power') && this.tick('Power')) ||
                      (input.isDown('Left') && this.tick('Left')) ||
                      (input.isDown('Right') && this.tick('Right')) ||
                      (input.isDown('Escape') && this.tick('Escape'));
    
    if (canProceed) {      
      this.startGame();
    }
  }
  
  // Impede repetição rápida de tecla
  tick(key) {
    if (!this.cool) this.cool = {};
    if (!this.cool[key] || this.cool[key] <= 0) {
      this.cool[key] = 200;
      return true;
    }
    return false;
  }
  // Inicia o jogo ou transição para a próxima cena
  // Chama o callback onComplete se definido
    startGame() {    
    if (this.onComplete) {
      this.onComplete();
    }
  }
  // Limpa o cooldown de teclas
    render() {
    const ctx = this.sceneManager.ctx;
    const canvas = ctx.canvas;
    
    // Reduzir cooldown de teclas
    if (this.cool) {
      Object.keys(this.cool).forEach(k => this.cool[k] -= 16);
    }
    
    // Limpar tela
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Renderizar background de controles
    if (this.assets.images.control) {      
      ctx.drawImage(this.assets.images.control, 0, 0, canvas.width, canvas.height);
    } else {      
      // Fallback: fundo cinza
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Calcular tempo restante
    const timeLeft = Math.max(0, Math.ceil((this.autoStartTimer - this.currentTime) / 1000));
    
    // Renderizar texto de instrução no canto inferior
    ctx.save();
    ctx.globalAlpha = 1 - this.fadeAlpha; 
    

    // Sombra do texto
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Pressione qualquer tecla para continuar', 2, 2);   
    
    // Contador regressivo
    if (timeLeft > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Início automático em: ${timeLeft}s`, canvas.width / 2, canvas.height - 40);
    }
    
    // Texto animado
    ctx.restore();
    
    // Fade overlay
    if (this.fadeAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
}
