import Player from '../entities/Player.js';
export default class LevelCity{
  constructor(manager, heroId){
    this.mgr  = manager;
    this.player = new Player(manager.assets, heroId);
    /* carregar tilemap, etc. */
  }
  update(dt,input){ this.player.update(dt,input); /* … */ }
  render(ctx){ /* desenha BG, tiles */ this.player.render(ctx); }
}
