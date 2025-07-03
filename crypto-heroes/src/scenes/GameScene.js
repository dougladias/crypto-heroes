export default class GameOverScene {
  constructor(sceneManager, onRestart = null, onBackToMenu = null, isVictory = false) {
    this.sceneManager = sceneManager;
    this.onRestart = onRestart;
    this.onBackToMenu = onBackToMenu;
    this.assets = sceneManager.assets;
    this.isVictory = isVictory; 
    
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
  }  render() {
    const ctx = this.sceneManager.ctx;
    const canvas = ctx.canvas;
    
    // Limpar tela
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Renderizar background baseado em vitória ou derrota
    if (this.isVictory) {
      // Tentar usar game win se existir, senão usar gameOver como fallback
      const backgroundImage = this.assets.images.gameWin || this.assets.images.gameOver;
      if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      }
    } else {
      // Renderizar background de game over se disponível
      if (this.assets.images.gameOver) {
        ctx.drawImage(this.assets.images.gameOver, 0, 0, canvas.width, canvas.height);
      }
    } 
  }
}
