import Sprite from '../engine/Sprite.js';

export default class Player {
  constructor(assets, heroId) {
    const sheet = {
      btc: assets.images.btc_idle,
      eth: assets.images.eth_idle,
      /* … */
    }[heroId];

    this.sprite = new Sprite(sheet, /*frames*/6, 10);
    this.x = 100;
    this.y = 0;
  }
  update(dt,input){ /* física & animação */ }
  render(ctx){ this.sprite.draw(ctx,this.x,this.y,96,96); }
}
