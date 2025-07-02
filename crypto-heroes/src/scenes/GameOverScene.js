export default class GameOverScene {
  constructor(sceneManager, onRestart = null, onBackToMenu = null) {
    this.sceneManager = sceneManager;
    this.onRestart = onRestart;
    this.onBackToMenu = onBackToMenu;
    this.assets = sceneManager.assets;
    
    // Estados de transição
    this.fadeIn = true;
    this.fadeAlpha = 1.0;
    this.fadeSpeed = 2.0;
    
    // Configurações visuais
    this.titleScale = 1.0;
    this.titleScaleDirection = 1;
    this.titleScaleSpeed = 0.5;
    
    // Botões
    this.buttons = [
      { 
        text: 'JOGAR NOVAMENTE', 
        y: 0, 
        width: 300, 
        height: 50,
        action: 'restart',
        hovered: false
      },
      { 
        text: 'MENU PRINCIPAL', 
        y: 0, 
        width: 300, 
        height: 50,
        action: 'menu',
        hovered: false
      }
    ];
    
    // Configurar posições dos botões
    this.setupButtons();  
  }
  
  setupButtons() {
    const canvas = this.sceneManager.ctx.canvas;
    const centerX = canvas.width / 2;
    const startY = canvas.height / 2 + 100;
    const spacing = 80;
    
    this.buttons.forEach((button, index) => {
      button.x = centerX - button.width / 2;
      button.y = startY + (index * spacing);
    });
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
    
    // Animação do título
    this.titleScale += this.titleScaleDirection * this.titleScaleSpeed * dt / 1000;
    if (this.titleScale >= 1.1) {
      this.titleScale = 1.1;
      this.titleScaleDirection = -1;
    } else if (this.titleScale <= 0.9) {
      this.titleScale = 0.9;
      this.titleScaleDirection = 1;
    }
    
    // Verificar hover nos botões
    const mouseX = input.mouseX || 0;
    const mouseY = input.mouseY || 0;
    
    this.buttons.forEach(button => {
      const isHovered = mouseX >= button.x && 
                       mouseX <= button.x + button.width &&
                       mouseY >= button.y && 
                       mouseY <= button.y + button.height;
      button.hovered = isHovered;
    });
      // Verificar cliques nos botões ou teclas
    if (input.wasPressed('Enter') || input.wasPressed('Jump')) {
      this.handleAction('restart');
    }
    
    if (input.wasPressed('Escape')) {
      this.handleAction('menu');
    }
    
    // Verificar cliques do mouse
    if (input.wasPressed('Click')) {
      this.buttons.forEach(button => {
        if (button.hovered) {
          this.handleAction(button.action);
        }
      });
    }
  }
  
  handleAction(action) {
    switch (action) {
      case 'restart':        
        if (this.onRestart) {
          this.onRestart();
        }
        break;
      case 'menu':        
        if (this.onBackToMenu) {
          this.onBackToMenu();
        }
        break;
    }
  }
  
  render() {
    const ctx = this.sceneManager.ctx;
    const canvas = ctx.canvas;
    
    // Limpar tela
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Renderizar background de game over se disponível
    if (this.assets.images.gameOver) {
      ctx.drawImage(this.assets.images.gameOver, 0, 0, canvas.width, canvas.height);
    }
    
    // Overlay escuro semi-transparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Título "GAME OVER" com animação
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 - 100);
    ctx.scale(this.titleScale, this.titleScale);
    
    // Sombra do título
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', 0, 0);
    
    // Resetar sombra
    ctx.shadowBlur = 0;
    ctx.restore();
    
    // Texto de instruções
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Suas vidas acabaram!', canvas.width / 2, canvas.height / 2 - 20);
    
    // Renderizar botões
    this.renderButtons(ctx);
      // Texto de controles
    ctx.fillStyle = '#999999';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ENTER/SPACE - Jogar Novamente | ESC - Menu Principal', canvas.width / 2, canvas.height - 30);
    
    // Fade in overlay
    if (this.fadeAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
  
  renderButtons(ctx) {
    this.buttons.forEach(button => {
      // Cor do botão baseada no hover
      if (button.hovered) {
        ctx.fillStyle = '#FF4444';
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = '#333333';
        ctx.shadowBlur = 0;
      }
      
      // Desenhar fundo do botão
      ctx.fillRect(button.x, button.y, button.width, button.height);
      
      // Desenhar borda
      ctx.strokeStyle = button.hovered ? '#FFFFFF' : '#666666';
      ctx.lineWidth = 2;
      ctx.strokeRect(button.x, button.y, button.width, button.height);
      
      // Desenhar texto do botão
      ctx.fillStyle = '#FFFFFF';
      ctx.font = button.hovered ? 'bold 18px Arial' : '18px Arial';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 0;
      ctx.fillText(
        button.text, 
        button.x + button.width / 2, 
        button.y + button.height / 2 + 6
      );
    });
  }
}
