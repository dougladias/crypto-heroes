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

  // Sprites de animação Andar (Desenvolvimento)
  btc_idle:    'assets/person/bitcoin/bitcoin-sprites.png',
  eth_idle:    'assets/person/ethereum/ethereum-sprites.png',    
  gbrl_idle:   'assets/person/globoo-br/real-sprites.png',      
  gusd_idle:   'assets/person/globoo-usd/dollar-sprites.png',    

  // Sprites de animação Poder (Desenvolvimento)
  btc_power:   'assets/person/bitcoin/bitcoin-power-sprites.png', 
  eth_power:   'assets/person/ethereum/ethereum-power-sprites.png',  
  gbrl_power:  'assets/person/globoo-br/real-power-sprites.png',    
  gusd_power:  'assets/person/globoo-usd/dollar-power-sprites.png',   
  
  // Objetos
  power: 'assets/object/power.png',
  platform: 'assets/object/platform.png',

  // Cenários  
  night:       'assets/background/night-sky.png',  
  cyberpunk:   'assets/background/cyberpunk-sky.png',  
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
    const assets = await AssetLoader.load({ images: IMAGES, sounds: SOUNDS });
    const input  = new InputManager();
    const scenes = new SceneManager(ctx, input, assets);
    
    // fluxo: Intro → Menu → Level
    const introScene = new IntroScene(scenes, () => {
      scenes.changeScene(new MenuScene(scenes));
    });
    
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
    
    requestAnimationFrame(gameLoop);
  } catch(e){
    console.error('Erro ao inicializar o jogo:', e);
  }
}

init();
