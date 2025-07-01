import AssetLoader from './engine/AssetLoader.js';
import SceneManager from './engine/SceneManager.js';
import InputManager from './engine/InputManager.js';

import IntroScene from './scenes/IntroScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameOverScene from './scenes/GameOverScene.js';

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

  // Sprites de animação correr (Desenvolvimento)
  btc_run:    'assets/person/bitcoin/bitcoin-sprites.png',
  eth_run:    'assets/person/ethereum/ethereum-sprites.png',    
  gbrl_run:   'assets/person/globoo-br/real-sprites.png',      
  gusd_run:   'assets/person/globoo-usd/dollar-sprites.png',
  geur_run:   'assets/person/globoo-eur/euro-sprites.png',

  // Sprites de animação Poder (Desenvolvimento)
  btc_power:   'assets/person/bitcoin/bitcoin-power-sprites.png', 
  eth_power:   'assets/person/ethereum/ethereum-power-sprites.png',  
  gbrl_power:  'assets/person/globoo-br/real-power-sprites.png',    
  gusd_power:  'assets/person/globoo-usd/dollar-power-sprites.png',
  geur_power:  'assets/person/globoo-eur/euro-power-sprites.png',   

  // Objetos
  power: 'assets/object/power.png',
  platform: 'assets/object/platform.png',
  piso: 'assets/object/piso.png',
  predio: 'assets/object/predio.png',

  // Personagens Inimigos
  enemy_goblin:   'assets/enemy/gas-goblin.png',
  enemy_reaper:   'assets/enemy/rug-reaper.png',
  sub:            'assets/enemy/sub.png',
  tucano:         'assets/enemy/tucano.png',

  // Cenários     
  cyberpunk:   'assets/background/cyberpunk-sky.png',
  gameOver:    'assets/background/game-over.png',  
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

// Expor o SceneManager globalmente para depuração (opcional)
window.gameScenes = null;

// bootstrap
async function init() {
  try {    
    const assets = await AssetLoader.load({ images: IMAGES, sounds: SOUNDS });
    const input  = new InputManager();
    const scenes = new SceneManager(ctx, input, assets);
    window.gameScenes = scenes; // Expor para depuração
    
    // fluxo: Intro → Menu → Level
    const introScene = new IntroScene(scenes, () => {
      scenes.changeScene(new MenuScene(scenes));
    });
    
    scenes.changeScene(introScene);
    window.gameScenes = scenes; // Atribuir à variável global

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
