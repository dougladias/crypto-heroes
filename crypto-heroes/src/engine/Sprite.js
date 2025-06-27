export default class Sprite{
  constructor(img, frameCount=1, frameRate=10){
    this.img = img;
    this.frames = frameCount;
    this.rate = frameRate;
    this.frame = 0;
    this.acc = 0;
  }
  step(dt){
    this.acc += dt;
    if(this.acc >= 1000/this.rate){
      this.frame = (this.frame+1) % this.frames;
      this.acc = 0;
    }
  }
  draw(ctx,x,y,w,h,flip=false){
    ctx.save();
    if(flip){
      ctx.translate(x+w,y);
      ctx.scale(-1,1);
      x = 0;
      y = 0;
    }
    ctx.drawImage(
      this.img,
      this.frame * this.img.width/this.frames, 0,
      this.img.width/this.frames, this.img.height,
      x, y, w, h
    );
    ctx.restore();
  }
}
