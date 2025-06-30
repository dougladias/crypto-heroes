import Player from '../entities/Player.js';
import AssetLoader from '../engine/AssetLoader.js';

export default class LevelCity{  constructor(manager, heroId){
    this.mgr  = manager;
    this.player = new Player(manager.assets, heroId);
    this.heroId = heroId; 
    
    // ✨ NOVO: Sistema de vidas
    this.playerLives = 3; 
      // Lista de cenários disponíveis
    this.backgrounds = ['cyberpunk', 'night']; 

    // Selecionar um cenário aleatório para esta partida
    this.currentBackground = this.backgrounds[Math.floor(Math.random() * this.backgrounds.length)];
    this.platform = {
      x: 340,          // ← Posição horizontal (esquerda/direita)
      y: 140,          // ← Altura da plataforma (maior = mais alto)
      width: 480,      // ← LARGURA da plataforma (era 200)
      height: 225,      // ← ALTURA/ESPESSURA da plataforma (era 40)
      color: '#8B4513' // Cor marrom da plataforma (fallback)
    };
      console.log(`Cenário selecionado: ${this.currentBackground}`);
    // console.log(`Plataforma criada em (${this.platform.x}, ${this.platform.y})`); // Debug removido
    
    // Tocar som quando entrar na arena de luta
    AssetLoader.playSound(this.mgr.assets.sounds.crowd, 0.4);
  }  update(dt,input){ 
    this.player.update(dt,input);
    
    // ✨ NOVA LÓGICA - Verificar colisão com a plataforma
    this.checkPlatformCollision();
  }
    // ✨ NOVA FUNÇÃO - Verificar se o player está na plataforma
  checkPlatformCollision() {
    const playerLeft = this.player.x;
    const playerRight = this.player.x + 130; // Largura do player
    const playerBottom = this.player.y; // Y=0 é o chão, Y>0 é para cima
    
    const platformLeft = this.platform.x;
    const platformRight = this.platform.x + this.platform.width;
    const platformTop = this.platform.y;
      // ✨ AJUSTE: Verificar se o player está sobre a plataforma horizontalmente com margem
    const marginLeft = 90;  // Margem esquerda - personagem cai antes da borda
    const marginRight = 90; // Margem direita - personagem cai antes da borda
    const isOverPlatform = playerRight > (platformLeft + marginLeft) && playerLeft < (platformRight - marginRight);
      // ✨ DETECÇÃO ANTECIPADA - Parar ANTES de entrar na plataforma
    if (isOverPlatform && !this.player.isGrounded && this.player.jumpVelocity <= 0) {
      // ✨ DETECÇÃO MAIS ANTECIPADA - parar BEM antes de chegar na plataforma
      if (this.player.y <= platformTop + 130 && this.player.y >= platformTop + 100) {
        // ✨ POSICIONAR IMEDIATAMENTE na altura correta
        this.player.y = platformTop + 110; // Altura exata
        this.player.jumpVelocity = 0;      // Parar movimento vertical
        this.player.isGrounded = true;     // Marcar como no chão
        
        // ✨ DEBUG: confirmar que pousou
        console.log(`Player pousou na plataforma - Y: ${this.player.y}`);
      }
    }
    
    // Verificar se o player saiu da plataforma (para cair)
    if (this.player.isGrounded && this.player.y > 0) {
      if (!isOverPlatform) {
        this.player.isGrounded = false;
        this.player.jumpVelocity = 0;
        console.log('Player saiu da plataforma');
      }
    }
  }render(ctx){   // ✨ CORREÇÃO DO BACKGROUND - usar o nome correto do asset
  const currentBg = this.mgr.assets.images[this.currentBackground];
  
  if(currentBg && currentBg.complete && currentBg.naturalWidth > 0){
    // Escalar a imagem para cobrir toda a tela
    const scaleX = ctx.canvas.width / currentBg.width;
    const scaleY = ctx.canvas.height / currentBg.height;
    const scale = Math.max(scaleX, scaleY);
    
    const scaledWidth = currentBg.width * scale;
    const scaledHeight = currentBg.height * scale;
    const x = (ctx.canvas.width - scaledWidth) / 2;
    const y = (ctx.canvas.height - scaledHeight) / 2;
    
    ctx.drawImage(currentBg, x, y, scaledWidth, scaledHeight);
  } else {
    // ✨ FALLBACK MELHOR - usar cor baseada no cenário
    this.drawFallbackBackground(ctx);
  }
    // ✨ NOVA RENDERIZAÇÃO - Desenhar a plataforma
    this.drawPlatform(ctx);
    
    // Desenhar o player
    this.player.render(ctx);
    
    // ✨ NOVO: Desenhar HUD (logo + vidas) no canto direito
    this.drawHUD(ctx);
  }
  // ✨ NOVA FUNÇÃO - Desenhar a plataforma usando a imagem
  drawPlatform(ctx) {
    const groundY = ctx.canvas.height - 340; // Mesma altura base do player
    const platformRenderY = groundY - this.platform.y; // Calcular posição Y para renderização
    
    // Verificar se a imagem da plataforma foi carregada
    const platformImage = this.mgr.assets.images.platform;
    
    if (platformImage && platformImage.complete) {
      // Desenhar a imagem da plataforma
      ctx.drawImage(
        platformImage,
        this.platform.x,
        platformRenderY,
        this.platform.width,
        this.platform.height
      );
    } else {
      // Fallback: desenhar plataforma simples se a imagem não carregar
      console.warn('Imagem da plataforma não encontrada, usando fallback');
      
      // Desenhar sombra da plataforma
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(
        this.platform.x + 3, 
        platformRenderY + 3, 
        this.platform.width, 
        this.platform.height
      );
      
      // Desenhar plataforma principal
      ctx.fillStyle = this.platform.color;
      ctx.fillRect(
        this.platform.x, 
        platformRenderY, 
        this.platform.width, 
        this.platform.height
      );
      
      // Adicionar bordas para dar profundidade
      ctx.strokeStyle = '#654321'; // Marrom mais escuro
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.platform.x, 
        platformRenderY, 
        this.platform.width, 
        this.platform.height
      );
    }
  }
  drawFallbackBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
    
    // Gradientes diferentes para cada cenário
    switch(this.currentBackground) {
      case 'cyberpunk':
        gradient.addColorStop(0, '#1a0d2e');
        gradient.addColorStop(1, '#16213e');
        break;
      case 'night':
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(1, '#003366');
        break;
      case 'light':
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#4682B4');
        break;
      default:
        gradient.addColorStop(0, '#1a0d2e');
        gradient.addColorStop(1, '#16213e');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }
    // ✨ NOVA FUNÇÃO - Desenhar HUD (logo do herói + vidas)
  drawHUD(ctx) {
    const hudX = 20; // ✨ MUDANÇA: Posição X no canto esquerdo
    const hudY = 20; // Posição Y no topo
    
    // Desenhar fundo semi-transparente para a HUD
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(hudX - 10, hudY - 10, 140, 80);
    
    // Adicionar borda
    ctx.strokeStyle = '#FFD700'; // Dourado
    ctx.lineWidth = 2;
    ctx.strokeRect(hudX - 10, hudY - 10, 140, 80);
    
    // Desenhar logo do herói
    const heroIcon = this.mgr.assets.images[`hero_${this.heroId}`];
    if (heroIcon && heroIcon.complete) {
      ctx.drawImage(heroIcon, hudX, hudY, 50, 50);
    } else {
      // Fallback: círculo colorido
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(hudX + 25, hudY + 25, 20, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Desenhar texto de vidas
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Vidas: ${this.playerLives}`, hudX + 60, hudY + 20);
    
    // Desenhar corações para as vidas
    for (let i = 0; i < this.playerLives; i++) {
      const heartX = hudX + 60 + (i * 20);
      const heartY = hudY + 35;
      
      // Desenhar coração simples
      ctx.fillStyle = '#FF0000';
      ctx.font = '16px Arial';
      ctx.fillText('♥', heartX, heartY);
    }
  }
}
