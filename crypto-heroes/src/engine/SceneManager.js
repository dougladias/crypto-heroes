export default class SceneManager{
  constructor(ctx, input, assets){
    this.ctx = ctx;
    this.input = input;
    this.assets = assets;
    this.current = null;
  }
  changeScene(scene){
    if(this.current && this.current.onExit) this.current.onExit();
    this.current = scene;
    if(this.current.onEnter) this.current.onEnter();
  }
  update(dt){
    if(this.current && this.current.update) this.current.update(dt, this.input);
  }
  render(){
    this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
    if(this.current && this.current.render) this.current.render(this.ctx);
  }
}
