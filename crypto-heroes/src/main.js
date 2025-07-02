import AssetLoader from './engine/AssetLoader.js';
import SceneManager from './engine/SceneManager.js';
import InputManager from './engine/InputManager.js';
import IntroScene from './scenes/IntroScene.js';
import MenuScene from './scenes/MenuScene.js';

// ctx é o contexto de renderização do canvas
// Ele é usado para desenhar os gráficos do jogo
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Asset manifest
const IMAGES = {
  // Tela inicial
  logo: 'assets/logo/logo-night.png',

  // Tela de seleção de personagem
  selectPerson: 'assets/background/selectPerson.png',
  
  // Ícones circulares dos heróis
  hero_btc:    'assets/icon/hero_btc.png',
  hero_eth:    'assets/icon/hero_eth.png',
  hero_gbrl:   'assets/icon/hero_gbrl.png',
  hero_gusd:   'assets/icon/hero_gusd.png',
  hero_sol:    'assets/icon/hero_sol.png',
  hero_geur:   'assets/icon/hero_geur.png',

  // Sprites de animação correr 
  btc_run:    'assets/person/bitcoin/bitcoin-sprites.png',
  eth_run:    'assets/person/ethereum/ethereum-sprites.png',    
  gbrl_run:   'assets/person/globoo-br/real-sprites.png',      
  gusd_run:   'assets/person/globoo-usd/dollar-sprites.png',
  geur_run:   'assets/person/globoo-eur/euro-sprites.png',

  // Sprites de animação Poder 
  btc_power:   'assets/person/bitcoin/bitcoin-power-sprites.png', 
  eth_power:   'assets/person/ethereum/ethereum-power-sprites.png',  
  gbrl_power:  'assets/person/globoo-br/real-power-sprites.png',    
  gusd_power:  'assets/person/globoo-usd/dollar-power-sprites.png',
  geur_power:  'assets/person/globoo-eur/euro-power-sprites.png',   
  // Poderes dos heróis
  power_brl: 'assets/object/power-brl.png',
  power_eur: 'assets/object/power-eur.png',
  power_usd: 'assets/object/power-usd.png',

  // Objetos de cenário
  platform: 'assets/object/platform.png',
  piso: 'assets/object/piso.png',
  predio: 'assets/object/predio.png',

  // Personagens Inimigos
  enemy_goblin:   'assets/enemy/gas-goblin.png',
  enemy_reaper:   'assets/enemy/rug-reaper.png',
  enemy_squid:    'assets/enemy/squid-game.png',  
  tucano:         'assets/enemy/tucano.png',

  // Cenários     
  cyberpunk:   'assets/background/cyberpunk-sky.png',
  gameOver:    'assets/background/game-over.png',  
};

// Sons do jogo
const SOUNDS = {
  intro:     'assets/audio/intro_theme.wav',
  punch:     'assets/audio/punch.wav',
  kick:      'assets/audio/kick.wav',
  power:     'assets/audio/power.wav',
  crowd:     'assets/audio/crowd.wav',
  whoosh:    'assets/audio/whoosh.wav',
  block:     'assets/audio/block.wav'
};

// Expor o SceneManager globalmente para depuração 
window.gameScenes = null;

// Função de inicialização do jogo
// Carrega os assets, cria o gerenciador de cenas e inicia o loop do jogo
async function init() {
  try {    
    const assets = await AssetLoader.load({ images: IMAGES, sounds: SOUNDS });
    const input  = new InputManager();
    const scenes = new SceneManager(ctx, input, assets);
    window.gameScenes = scenes; // Expor para depuração
    
    // fluxo: Intro → Menu → Level
    // Cena de introdução que leva ao menu
    const introScene = new IntroScene(scenes, () => {
      scenes.changeScene(new MenuScene(scenes));
    });
    
    // Cena de menu que leva ao jogo
    // O menu permite escolher o personagem e iniciar o jogo
    scenes.changeScene(introScene);
    window.gameScenes = scenes; 

    // Inicia o loop de jogo
    // O loop chama as funções de atualização e renderização das cenas
    let last = performance.now();
    let acc  = 0;
    const STEP = 1000/120;

    // Função principal do loop do jogo
    // Atualiza o estado do jogo e renderiza a cena atual
    function gameLoop(now){
      acc += now - last;
      last = now;
      while(acc >= STEP){
        scenes.update(STEP);
        acc -= STEP;
      }
      scenes.render();
      requestAnimationFrame(gameLoop);
    }    
    
    // Inicia o loop de animação
    // A função gameLoop é chamada repetidamente para atualizar e renderizar o jogo
    requestAnimationFrame(gameLoop);
  } catch(e){
    console.error('Erro ao inicializar o jogo:', e);
  }
}

init();
