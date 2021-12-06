import * as PIXI from 'pixi.js';
import { Vector2 } from '../../../models/Arena/Glad';

const zeroVector: Vector2 = { x: 0, y: 0 };

export default class PhysicObject extends PIXI.Sprite {
  readonly velocity: Vector2;
  readonly gravity: number;

  constructor(texture?: PIXI.Texture, position = zeroVector, velocity = zeroVector, gravity = 0) {
    super(texture);
    this.position.x = position.x;
    this.position.y = position.y;
    this.velocity = { ...velocity };
    this.gravity = gravity;
  }

  updatePosition(dt: number): void {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    this.velocity.y += this.gravity * dt;
  }
}
