import { mat4, vec3 }   from '@typhonjs-fvtt/svelte/math';

export class BoundingData
{
   constructor()
   {
      this.boundingRect = new DOMRect();
      this.mat4 = mat4.create();
      this.points = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
   }
}
