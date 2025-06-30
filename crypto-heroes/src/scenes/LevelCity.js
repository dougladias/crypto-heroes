import Player from '../entities/Player.js';
import AssetLoader from '../engine/AssetLoader.js';

export default class LevelCity{  constructor(manager, heroId){
    this.mgr  = manager;
    this.player = new Player(manager.assets, heroId);
    this.heroId = heroId; 
    
    // ✨ NOVO: Sistema de vidas
    this.playerLives = 3; 
    
    // ✨ NOVO: Sistema de Oponente
    this.availableOpponents = ['btc', 'eth', 'gbrl', 'gusd'];
    this.opponentId = this.selectRandomOpponent(heroId);
    this.opponent = new Player(manager.assets, this.opponentId);
    this.opponentLives = 3; // Oponente também tem 3 vidas
    
    // Configurar oponente do lado direito
    this.opponent.x = 800; // Posição do lado direito
    this.opponent.facing = -1; // Olhando para esquerda (para o jogador)
    
    console.log(`Player: ${heroId} vs Oponente: ${this.opponentId}`);
    
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
  }
  
  // ✨ NOVA FUNÇÃO: Selecionar oponente aleatório diferente do jogador
  selectRandomOpponent(playerHeroId) {
    const possibleOpponents = this.availableOpponents.filter(id => id !== playerHeroId);
    const randomIndex = Math.floor(Math.random() * possibleOpponents.length);
    return possibleOpponents[randomIndex];
  }  update(dt,input){ 
    this.player.update(dt,input);
    
    // ✨ NOVO: Atualizar oponente (sem input - será IA simples)
    this.updateOpponent(dt);
    
    // ✨ NOVA LÓGICA - Verificar colisão com a plataforma para ambos
    this.checkPlatformCollision();
    this.checkOpponentPlatformCollision();
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
    
    // ✨ NOVO: Desenhar o oponente
    this.opponent.render(ctx);
    
    // ✨ NOVO: Desenhar HUD (logo + vidas) no canto esquerdo
    this.drawHUD(ctx);
    
    // ✨ NOVO: Desenhar HUD do oponente no canto direito
    this.drawOpponentHUD(ctx);
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
      ctx.font = '16px Arial';      ctx.fillText('♥', heartX, heartY);
    }
  }  // ✨ IA SUPER INTELIGENTE: Oponente natural e estratégico
  updateOpponent(dt) {
    // Atualizar timers internos da IA
    this.updateAITimers(dt);
    
    // Análise do estado atual do jogo
    const gameState = this.analyzeGameState();
    
    // Decidir estratégia baseada no estado
    const strategy = this.decideStrategy(gameState);
    
    // Executar ações com base na estratégia
    const aiInput = this.executeStrategy(strategy, gameState);
    
    // Atualizar física do oponente
    this.opponent.update(dt, aiInput);
    
    // Verificar colisões de poder
    this.checkPowerCollisions();
  }
  
  // ✨ NOVA FUNÇÃO: Inicializar timers da IA
  initializeAITimers() {
    this.aiTimers = {
      actionCooldown: 0,      // Cooldown entre ações
      movementChange: 0,      // Timer para mudança de direção
      combatDecision: 0,      // Timer para decisões de combate
      platformStrategy: 0,    // Timer para estratégia de plataforma
      lastPlayerX: this.player.x,  // Última posição X do player
      movementPattern: Math.random() < 0.5 ? 'aggressive' : 'defensive'
    };
  }
  
  // ✨ NOVA FUNÇÃO: Atualizar timers da IA
  updateAITimers(dt) {
    if (!this.aiTimers) this.initializeAITimers();
    
    Object.keys(this.aiTimers).forEach(key => {
      if (typeof this.aiTimers[key] === 'number' && key !== 'lastPlayerX') {
        this.aiTimers[key] = Math.max(0, this.aiTimers[key] - dt);
      }
    });
    
    // Mudar padrão de movimento ocasionalmente
    if (this.aiTimers.movementChange <= 0) {
      this.aiTimers.movementPattern = Math.random() < 0.3 ? 'aggressive' : 
                                     Math.random() < 0.6 ? 'defensive' : 'tactical';
      this.aiTimers.movementChange = 2000 + Math.random() * 3000; // 2-5 segundos
    }
  }
  
  // ✨ NOVA FUNÇÃO: Analisar estado do jogo
  analyzeGameState() {
    const distance = Math.abs(this.opponent.x - this.player.x);
    const playerMoving = Math.abs(this.player.x - this.aiTimers.lastPlayerX) > 5;
    this.aiTimers.lastPlayerX = this.player.x;
    
    return {
      distance: distance,
      playerX: this.player.x,
      playerY: this.player.y,
      playerMoving: playerMoving,
      playerOnPlatform: this.player.y > 50,
      opponentOnPlatform: this.opponent.y > 50,
      playerDirection: this.player.facing,
      opponentHealth: this.opponentLives,
      playerHealth: this.playerLives,
      playerPowers: this.player.getPowerObjects().length,
      opponentPowers: this.opponent.getPowerObjects().length,
      platformCenter: this.platform.x + this.platform.width / 2
    };
  }
  
  // ✨ NOVA FUNÇÃO: Decidir estratégia
  decideStrategy(state) {
    const healthRatio = this.opponentLives / this.playerLives;
    const pattern = this.aiTimers.movementPattern;
    
    // Estratégia baseada na vida
    if (healthRatio < 0.5) {
      return 'desperate'; // Muito agressivo quando perdendo
    } else if (healthRatio > 1.5) {
      return 'dominant'; // Controlado quando ganhando
    } else if (pattern === 'aggressive') {
      return 'aggressive';
    } else if (pattern === 'defensive') {
      return 'defensive';
    } else {
      return 'tactical';
    }
  }
  
  // ✨ NOVA FUNÇÃO: Executar estratégia
  executeStrategy(strategy, state) {
    const actions = {
      moveLeft: false,
      moveRight: false,
      jump: false,
      power: false
    };
    
    // Movimento baseado na estratégia
    const movement = this.calculateMovement(strategy, state);
    actions.moveLeft = movement.left;
    actions.moveRight = movement.right;
    
    // Ações de combate
    const combat = this.calculateCombat(strategy, state);
    actions.jump = combat.jump;
    actions.power = combat.power;
    
    // Simular input
    return {
      isDown: (key) => {
        switch(key) {
          case 'Left': return actions.moveLeft;
          case 'Right': return actions.moveRight;
          default: return false;
        }
      },
      wasPressed: (key) => {
        switch(key) {
          case 'Jump': return actions.jump;
          case 'Power': return actions.power;
          default: return false;
        }
      }
    };
  }
  
  // ✨ NOVA FUNÇÃO: Calcular movimento inteligente
  calculateMovement(strategy, state) {
    let left = false, right = false;
    const optimalRange = strategy === 'aggressive' ? 120 : 180;
    const personalSpace = 60;
    
    // Lógica de movimento fluida
    if (state.distance < personalSpace) {
      // Muito próximo - criar espaço
      if (this.opponent.x > state.playerX) {
        right = Math.random() < 0.7; // 70% chance de recuar
      } else {
        left = Math.random() < 0.7;
      }
    } else if (state.distance > optimalRange * 2) {
      // Muito longe - aproximar
      if (this.opponent.x > state.playerX) {
        left = Math.random() < 0.8; // 80% chance de aproximar
      } else {
        right = Math.random() < 0.8;
      }
    } else if (state.distance > optimalRange) {
      // Longe - aproximar moderadamente
      if (this.opponent.x > state.playerX) {
        left = Math.random() < 0.4;
      } else {
        right = Math.random() < 0.4;
      }
    } else {
      // Distância boa - movimento tático
      const shouldMove = Math.random() < 0.15; // 15% chance de movimento
      if (shouldMove) {
        if (state.playerMoving) {
          // Acompanhar movimento do player
          if (this.opponent.x > state.playerX) {
            left = Math.random() < 0.6;
          } else {
            right = Math.random() < 0.6;
          }
        } else {
          // Movimento aleatório tático
          left = Math.random() < 0.5;
          right = !left && Math.random() < 0.5;
        }
      }
    }
    
    // Evitar sair da tela
    if (this.opponent.x < 50) right = true, left = false;
    if (this.opponent.x > 950) left = true, right = false;
    
    return { left, right };
  }
  
  // ✨ NOVA FUNÇÃO: Calcular ações de combate
  calculateCombat(strategy, state) {
    let jump = false, power = false;
    
    // Usar poder estrategicamente
    if (this.aiTimers.combatDecision <= 0) {
      const powerChance = this.calculatePowerChance(strategy, state);
      power = Math.random() < powerChance;
      
      if (power) {
        this.aiTimers.combatDecision = 1500 + Math.random() * 1000; // Cooldown 1.5-2.5s
      }
    }
    
    // Pular estrategicamente
    if (this.opponent.isGrounded) {
      const jumpChance = this.calculateJumpChance(strategy, state);
      jump = Math.random() < jumpChance;
    }
    
    return { jump, power };
  }
  
  // ✨ NOVA FUNÇÃO: Calcular chance de usar poder
  calculatePowerChance(strategy, state) {
    let baseChance = 0.003; // 0.3% base
    
    // Ajustar baseado na estratégia
    switch(strategy) {
      case 'aggressive': baseChance *= 2; break;
      case 'desperate': baseChance *= 3; break;
      case 'defensive': baseChance *= 0.5; break;
    }
    
    // Ajustar baseado na distância
    if (state.distance < 200) baseChance *= 2;
    if (state.distance < 150) baseChance *= 1.5;
    
    // Contra-ataque se player tem poderes
    if (state.playerPowers > 0) baseChance *= 2;
    
    // Mais agressivo se player está na plataforma e oponente no chão
    if (state.playerOnPlatform && !state.opponentOnPlatform) baseChance *= 1.5;
    
    return Math.min(baseChance, 0.02); // Máximo 2%
  }
  
  // ✨ NOVA FUNÇÃO: Calcular chance de pular
  calculateJumpChance(strategy, state) {
    let baseChance = 0.005; // 0.5% base
    
    // Pular para plataforma se player está lá
    if (state.playerOnPlatform && !state.opponentOnPlatform) {
      const nearPlatform = Math.abs(this.opponent.x - state.platformCenter) < 200;
      if (nearPlatform) baseChance = 0.02; // 2% chance
    }
    
    // Pulo tático para esquivar
    if (state.playerPowers > 0) baseChance *= 2;
    
    // Movimento imprevisível
    if (strategy === 'tactical') baseChance *= 1.5;
    
    return Math.min(baseChance, 0.03); // Máximo 3%
  }  
  // ✨ NOVA FUNÇÃO: Verificar colisão da plataforma para o oponente
  checkOpponentPlatformCollision() {
    const playerLeft = this.opponent.x;
    const playerRight = this.opponent.x + 130;
    
    const platformLeft = this.platform.x;
    const platformRight = this.platform.x + this.platform.width;
    const platformTop = this.platform.y;
    
    const marginLeft = 90;
    const marginRight = 90;
    const isOverPlatform = playerRight > (platformLeft + marginLeft) && playerLeft < (platformRight - marginRight);
    
    // Detecção de pouso na plataforma
    if (isOverPlatform && !this.opponent.isGrounded && this.opponent.jumpVelocity <= 0) {
      if (this.opponent.y <= platformTop + 130 && this.opponent.y >= platformTop + 100) {
        this.opponent.y = platformTop + 110;
        this.opponent.jumpVelocity = 0;
        this.opponent.isGrounded = true;
      }
    }
    
    // Verificar se saiu da plataforma
    if (this.opponent.isGrounded && this.opponent.y > 0) {
      if (!isOverPlatform) {
        this.opponent.isGrounded = false;
        this.opponent.jumpVelocity = 0;
      }
    }
  }
  
  // ✨ NOVA FUNÇÃO: Desenhar HUD do oponente no canto direito
  drawOpponentHUD(ctx) {
    const hudX = ctx.canvas.width - 150; // Canto direito
    const hudY = 20;
    
    // Fundo semi-transparente
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(hudX - 10, hudY - 10, 140, 80);
    
    // Borda vermelha (oponente)
    ctx.strokeStyle = '#FF4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(hudX - 10, hudY - 10, 140, 80);
    
    // Logo do oponente
    const heroIcon = this.mgr.assets.images[`hero_${this.opponentId}`];
    if (heroIcon && heroIcon.complete) {
      ctx.drawImage(heroIcon, hudX, hudY, 50, 50);
    } else {
      // Fallback
      ctx.fillStyle = '#FF4444';
      ctx.beginPath();
      ctx.arc(hudX + 25, hudY + 25, 20, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Texto de vidas
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Vidas: ${this.opponentLives}`, hudX + 60, hudY + 20);
    
    // Corações do oponente
    for (let i = 0; i < this.opponentLives; i++) {
      const heartX = hudX + 60 + (i * 20);
      const heartY = hudY + 35;
        ctx.fillStyle = '#FF4444'; // Corações vermelhos para oponente
      ctx.font = '16px Arial';
      ctx.fillText('♥', heartX, heartY);
    }
  }
    // ✨ NOVA FUNÇÃO: Verificar colisões de objetos de poder
  checkPowerCollisions() {    // Verificar se objetos de poder do jogador atingem o oponente
    const playerPowerObjects = this.player.getPowerObjects();
    for (let i = playerPowerObjects.length - 1; i >= 0; i--) {
      const powerObj = playerPowerObjects[i];
      
      // ✨ CORREÇÃO IMPORTANTE: Usar coordenadas físicas (do mundo) para ambos
      // Tanto o power quanto os personagens devem usar o mesmo sistema de coordenadas
      
      // Área de colisão do poder (coordenadas físicas)
      const powerLeft = powerObj.x - 40;   // Área generosa para facilitar acerto
      const powerRight = powerObj.x + 40;
      const powerTop = powerObj.y - 40;
      const powerBottom = powerObj.y + 40;
      
      // Área de colisão do oponente (coordenadas físicas)
      const opponentLeft = this.opponent.x;
      const opponentRight = this.opponent.x + 130;
      const opponentTop = this.opponent.y;                    // ✨ Usar Y físico
      const opponentBottom = this.opponent.y + 280;          // ✨ Usar Y físico
      
      // ✨ DEBUG: Log das posições para verificar (apenas quando próximos)
      if (Math.abs(powerObj.x - this.opponent.x) < 150) {
        console.log(`⚡ Colisão check: Power físico(${powerObj.x}, ${powerObj.y}) vs Oponente físico(${this.opponent.x}, ${this.opponent.y})`);
      }
      
      // Verificar colisão
      if (powerRight > opponentLeft && powerLeft < opponentRight &&
          powerBottom > opponentTop && powerTop < opponentBottom) {
        
        // Oponente foi atingido!
        this.opponentLives = Math.max(0, this.opponentLives - 1);
        console.log(`🎯 OPONENTE ATINGIDO! Vidas restantes: ${this.opponentLives}`);
        
        // Remover objeto de poder
        playerPowerObjects.splice(i, 1);
        
        // Som de impacto
        AssetLoader.playSound(this.mgr.assets.sounds.punch, 0.8);
        
        // Verificar se oponente foi derrotado
        if (this.opponentLives <= 0) {
          console.log('🏆 Oponente derrotado! Você venceu!');
          // Aqui você pode adicionar lógica de vitória
        }
        
        break; // Sair do loop após acerto
      }
    }
      // Verificar se objetos de poder do oponente atingem o jogador
    const opponentPowerObjects = this.opponent.getPowerObjects();
    for (let i = opponentPowerObjects.length - 1; i >= 0; i--) {
      const powerObj = opponentPowerObjects[i];
      
      // ✨ CORREÇÃO IMPORTANTE: Usar coordenadas físicas (do mundo) para ambos
      
      // Área de colisão do poder (coordenadas físicas)
      const powerLeft = powerObj.x - 40;   // Área generosa para facilitar acerto
      const powerRight = powerObj.x + 40;
      const powerTop = powerObj.y - 40;
      const powerBottom = powerObj.y + 40;
      
      // Área de colisão do jogador (coordenadas físicas)
      const playerLeft = this.player.x;
      const playerRight = this.player.x + 130;
      const playerTop = this.player.y;                        // ✨ Usar Y físico
      const playerBottom = this.player.y + 280;              // ✨ Usar Y físico
      
      // Verificar colisão
      if (powerRight > playerLeft && powerLeft < playerRight &&
          powerBottom > playerTop && powerTop < playerBottom) {
        
        // Jogador foi atingido!
        this.playerLives = Math.max(0, this.playerLives - 1);
        console.log(`💥 JOGADOR ATINGIDO! Vidas restantes: ${this.playerLives}`);
        
        // Remover objeto de poder
        opponentPowerObjects.splice(i, 1);
        
        // Som de impacto
        AssetLoader.playSound(this.mgr.assets.sounds.kick, 0.8);
        
        // Verificar se jogador foi derrotado
        if (this.playerLives <= 0) {
          console.log('💀 Jogador derrotado! Game Over!');          // Aqui você pode adicionar lógica de game over
        }
        
        break; // Sair do loop após acerto
      }
    }
  }
}
