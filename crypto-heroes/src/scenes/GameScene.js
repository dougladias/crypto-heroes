import AssetLoader from '../engine/AssetLoader.js';

// Cena de Game Over ou Vitória
// Exibe uma tela de Game Over ou Vitória com opções para reiniciar ou voltar ao menu
export default class GameOverScene {
  constructor(sceneManager, onRestart = null, onBackToMenu = null, isVictory = false) {
    this.sceneManager = sceneManager;
    this.onRestart = onRestart;
    this.onBackToMenu = onBackToMenu;
    this.assets = sceneManager.assets;
    this.isVictory = isVictory; 
    
    // Estados de animação
    this.fadeIn = true;
    this.fadeAlpha = 1.0;
    this.fadeSpeed = 2.0;
    
    // Tocar som apropriado baseado no resultado do jogo
    this.playSoundForGameResult();
    
    // Botões
    this.buttons = [
      { 
        text: 'PLAY AGAIN', 
        y: 0, 
        width: 300, 
        height: 50,
        action: 'restart',
        hovered: false
      },
      { 
        text: 'MAIN MENU', 
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
    playSoundForGameResult() {
    if (this.isVictory) {
      // Tocar som de vitória
      if (this.assets.sounds.victory) {
        AssetLoader.playSound(this.assets.sounds.victory, 0.7);
      }
    } else {
      // Tocar som de game over
      if (this.assets.sounds.over) {
        AssetLoader.playSound(this.assets.sounds.over, 0.7);
      }
    }
  }
  // Método chamado quando a cena é ativada
  onEnter() {
    // Garantir que o som seja tocado mesmo se não foi no construtor
    this.playSoundForGameResult();
    
    // Garantir que o cursor inicie como default
    const canvas = this.sceneManager.ctx.canvas;
    canvas.style.cursor = 'default';
  }
  
  // Método chamado quando a cena é desativada
  onExit() {
    // Resetar cursor para default quando sair da cena
    const canvas = this.sceneManager.ctx.canvas;
    canvas.style.cursor = 'default';
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
      // Obter coordenadas do mouse relativas ao canvas
    const canvas = this.sceneManager.ctx.canvas;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (input.mouseX || 0) - rect.left;
    const mouseY = (input.mouseY || 0) - rect.top;
      // Verificar hover nos botões
    let anyButtonHovered = false;
    this.buttons.forEach(button => {
      const isHovered = mouseX >= button.x && 
                       mouseX <= button.x + button.width &&
                       mouseY >= button.y && 
                       mouseY <= button.y + button.height;
      button.hovered = isHovered;
      if (isHovered) {
        anyButtonHovered = true;
      }
    });
    
    // Alterar cursor baseado no hover
    canvas.style.cursor = anyButtonHovered ? 'pointer' : 'default';
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
    // Resetar cursor antes de executar a ação
    const canvas = this.sceneManager.ctx.canvas;
    canvas.style.cursor = 'default';
    
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
  }render() {
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
    
    // Renderizar botões
    this.renderButtons(ctx);
    
    // Efeito de fade in
    if (this.fadeIn || this.fadeAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${this.fadeAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
  renderButtons(ctx) {
    this.buttons.forEach(button => {
      // Fundo do botão
      ctx.fillStyle = button.hovered ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(button.x, button.y, button.width, button.height);
      
      // Borda do botão
      ctx.strokeStyle = button.hovered ? '#FFFFFF' : '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.strokeRect(button.x, button.y, button.width, button.height);
      
      // Texto do botão
      ctx.fillStyle = button.hovered ? '#FF0000' : '#FFFFFF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const centerX = button.x + button.width / 2;
      const centerY = button.y + button.height / 2;
      
      ctx.fillText(button.text, centerX, centerY);
    });
  }
}
