const GRAVITY = 0.4;
export function apply(entity, floorY, dt=1){
  entity.velY += GRAVITY;
  entity.x += entity.velX;
  entity.y += entity.velY;
  if(entity.y + entity.h > floorY){
    entity.y = floorY - entity.h;
    entity.velY = 0;
    entity.onGround = true;
  } else {
    entity.onGround = false;
  }
}
