export default class AssetLoader {
  static async load({ images = {}, sounds = {} }) {
    const [imgAssets, sndAssets] = await Promise.all([
      this.#loadImages(images),
      this.#loadSounds(sounds)
    ]);
    return { images: imgAssets, sounds: sndAssets };
  }

  static #loadImages(map) {
    const entries = Object.entries(map);
    const result = {};
    return Promise.all(entries.map(([key, src]) => new Promise(res => {
      const img = new Image();
      img.src = src;
      img.onload = () => { result[key] = img; res(); };
      img.onerror = () => { console.warn('Image not found:', src); result[key] = img; res(); };
    }))).then(() => result);
  }
  static #loadSounds(map) {
    const entries = Object.entries(map);
    const result = {};
    
    if (entries.length === 0) {
      return Promise.resolve(result);
    }

    // Criamos o contexto de áudio apenas se houver sons para carregar
    let ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not supported');
      return Promise.resolve(result);
    }

    return Promise.all(entries.map(([key, src]) =>
      fetch(src).then(r => r.arrayBuffer()).then(buf =>
        ctx.decodeAudioData(buf).then(decoded => {
          result[key] = { ctx, buffer: decoded };
        }).catch(() => console.warn('Sound decode failed:', src))
      ).catch(() => console.warn('Sound fetch failed:', src))
    )).then(() => result);
  }  
  static currentLoopingSource = null;

  static async playSound(asset, volume = 1){    
    if(!asset || !asset.ctx || !asset.buffer) {
      console.warn('Asset de som inválido:', asset);
      return;
    }
    
    const { ctx, buffer } = asset;  
    
    // Resume audio context if suspended
    if (ctx.state === 'suspended') {      
      try {
        await ctx.resume();        
      } catch (e) {        
        return;
      }
    }
    
    try {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      src.connect(gainNode).connect(ctx.destination);
      src.start(0);      
    } catch (e) {
      console.warn('Could not play sound:', e);
    }
  }
  
  static async playLoopingSound(asset, volume = 1) {    
    if(!asset || !asset.ctx || !asset.buffer) {
      console.warn('Asset de som inválido:', asset);
      return null;
    }
    
    const { ctx, buffer } = asset;    
    
    // Resume audio context if suspended
    if (ctx.state === 'suspended') {      
      try {
        await ctx.resume();       
      } catch (e) {
        console.warn('Could not resume audio context:', e);
        return null;
      }
    }
    
    try {
      // Para qualquer som em loop anterior
      this.stopLoopingSound();
      
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true; // Definir para fazer loop
      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;
      src.connect(gainNode).connect(ctx.destination);
      src.start(0);
      
      // Guardar referência para poder parar depois
      this.currentLoopingSource = src;     
      
      return src;
    } catch (e) {
      console.warn('Could not play looping sound:', e);
      return null;
    }
  }
  
  static stopLoopingSound() {
    if (this.currentLoopingSource) {
      try {
        this.currentLoopingSource.stop();       
      } catch (e) {
        console.warn('Erro ao parar som em loop:', e);
      }
      this.currentLoopingSource = null;
    }
  }
}
