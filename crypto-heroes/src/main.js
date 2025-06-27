import AssetLoader from './engine/AssetLoader.js';
import SceneManager from './engine/SceneManager.js';
import InputManager from './engine/InputManager.js';

import IntroScene from './scenes/IntroScene.js';
import MenuScene from './scenes/MenuScene.js';

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
  hero_gusd:    'assets/icon/hero_gusd.png',  
  hero_sol:    'assets/icon/hero_sol.png',

  // Sprites de animação Andar
  btc_idle:    'assets/person/bitcoin/bitcoin-sprites.png',
  eth_idle:    'assets/person/ethereum/ethereum-sprites.png',  
  solana_idle: 'assets/person/solana/solana-sprites.png',
  real_idle:   'assets/person/globoo-br/real-sprites.png',
  dollar_idle: 'assets/person/globoo-usd/dollar-sprites.png',

  // Sprites de animação Lutar

  // Cenários
  desert:      'assets/background/desert-wasteland.png',  
  night:       'assets/background/night-sky.png',
  light:       'assets/background/light-sky.png',
};

const SOUNDS = {
  intro:     'assets/audio/intro_theme.wav',
  punch:     'assets/audio/punch.wav',
  kick:      'assets/audio/kick.wav',
  power:     'assets/audio/power.wav',
  crowd:     'assets/audio/crowd.wav',
  whoosh:    'assets/audio/whoosh.wav',
  block:     'assets/audio/block.wav'
};

// bootstrap
async function init() {
  try {
    console.log('Iniciando carregamento de assets...');
    const assets = await AssetLoader.load({ images: IMAGES, sounds: SOUNDS });
    console.log('Assets carregados:', assets);
    
    const input  = new InputManager();
    const scenes = new SceneManager(ctx, input, assets);
    
    // fluxo: Intro → Menu → Level
    const introScene = new IntroScene(scenes, () => {
      scenes.changeScene(new MenuScene(scenes));
    });

    console.log('Mudando para IntroScene...');
    scenes.changeScene(introScene);

    let last = performance.now();
    let acc  = 0;
    const STEP = 1000/120;

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
    
    console.log('Iniciando game loop...');
    requestAnimationFrame(gameLoop);
  } catch(e){
    console.error('Erro ao inicializar o jogo:', e);
  }
}

init();
