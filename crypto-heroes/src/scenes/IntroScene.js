import AssetLoader from '../engine/AssetLoader.js';
export default class IntroScene{
  constructor(manager, onComplete){
    this.mgr = manager;
    this.onComplete = onComplete; // callback para ir ao menu
    this.timer = 0;
    this.fade = 1; // start black
    this.audioStarted = false;
    this.showPrompt = true;
    this.transitionTimer = 0; // timer para transição
  }  onEnter(){
    // Não tentar tocar áudio automaticamente
    console.log('IntroScene iniciada');
  }
  onExit(){
    // Parar música em loop quando sair da cena
    AssetLoader.stopLoopingSound();
    console.log('IntroScene finalizada - música parada');
  }update(dt,input){
    this.timer += dt;
    if(this.fade > 0) this.fade -= dt/1000; // 1s fade in
    
    // Debug: verificar se input está funcionando
    const hasInput = input.isDown('Action') || input.isDown('Left') || input.isDown('Right') || input.isDown('Up');
    
    // Tentar iniciar áudio com qualquer interação do usuário
    if(!this.audioStarted && hasInput){
      console.log('Tecla detectada na IntroScene via InputManager!');
      this.audioStarted = true;
      this.showPrompt = false;
      this.transitionTimer = 0; // resetar timer de transição
      AssetLoader.playLoopingSound(this.mgr.assets.sounds.intro, 0.8);
      console.log('Áudio em loop iniciado após interação do usuário');
    }
    
    // Se áudio foi iniciado, contar tempo para transição
    if(this.audioStarted){
      this.transitionTimer += dt;
      
      // Após 3 segundos, ir para o menu
      if(this.transitionTimer >= 3000){
        console.log('Executando transição automática para menu');
        if(this.onComplete) {
          this.onComplete();
        }
      }
    }
  }
  
  render(ctx){
    const { images } = this.mgr.assets;
    const logo = images.logo;
    
    // ✨ NOVA COR DE FUNDO - Você pode alterar esta linha!   
    ctx.fillStyle = '#000'; 
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Desenhar logo no centro
    if(logo && logo.complete && logo.naturalWidth > 0){
      // ✨ AUMENTAR O TAMANHO DO CARD/LOGO
      const scale = 0.8; 
      const scalex = 1;
      const w = logo.width * scalex;
      const h = logo.height * scale;
      const x = (ctx.canvas.width - w) / 2;
      const y = (ctx.canvas.height - h) / 2;
      ctx.drawImage(logo, x, y, w, h);
    } else {
      // Fallback: mostrar texto se a imagem não carregar
      ctx.fillStyle = '#ffffff';
      ctx.font = '64px Arial'; 
      ctx.textAlign = 'center';
      ctx.fillText('CRYPTO HEROES', ctx.canvas.width / 2, ctx.canvas.height / 2);
    }    // Mostrar prompt para iniciar áudio
    if(this.showPrompt && this.fade <= 0.5){
      ctx.fillStyle = '#00ff88'; 
      ctx.font = '28px Arial'; 
      ctx.textAlign = 'center';
      ctx.fillText('Pressione Qualquer Tecla Para Iniciar', ctx.canvas.width / 2, ctx.canvas.height - 80);
    }
      // Mostrar quando áudio iniciou
    if(this.audioStarted && !this.showPrompt){
      ctx.fillStyle = '#ffff00'; 
      ctx.font = '24px Arial'; 
      ctx.textAlign = 'center';
      const remaining = Math.max(0, 3000 - this.transitionTimer);
      const seconds = Math.ceil(remaining / 1000);
      ctx.fillText(`Carregando menu... ${seconds}s`, ctx.canvas.width / 2, ctx.canvas.height - 80);   
    }
    
    // Fade effect
    if(this.fade > 0){
      ctx.fillStyle = `rgba(0,0,0,${this.fade})`;
      ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);
    }
  }
}
