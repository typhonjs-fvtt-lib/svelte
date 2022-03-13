import { degToRad, mat4, vec3 }  from '@typhonjs-fvtt/svelte/math';

import * as constants            from './constants.js';

const s_SCALE_VECTOR = [1, 1, 1];
const s_MAT4_RESULT = mat4.create();
const s_MAT4_TEMP = mat4.create();
const s_MAT4_TEMP_TRANSLATE = [mat4.create(), mat4.create()];
const s_RECT_TEMP = [vec3.create(), vec3.create(), vec3.create(), vec3.create()];
const s_VEC3_TEMP = vec3.create();

export class Transforms
{
   constructor()
   {
      this._data = {};
   }

   /**
    * Provides an iterator for transform keys.
    *
    * @returns {Generator<string>} Generator / iterator of transform keys.
    * @yields {string}
    */
   *[Symbol.iterator]()
   {
      for (const key in this._data) { yield key; }
   }

   /**
    *
    * @param {PositionData} position -
    *
    * @param {DOMRect}      [output] -
    *
    * @returns {DOMRect} The output DOMRect.
    */
   getBoundingBox(position, output = new DOMRect())
   {
      const rect = s_RECT_TEMP;

      // TODO: Must make this detect transform from position.
      if (Object.keys(this._data).length)
      {
         rect[0][0] = rect[0][1] = rect[0][2] = 0;
         rect[1][0] = position.width;
         rect[1][1] = rect[1][2] = 0;
         rect[2][0] = position.width;
         rect[2][1] = position.height;
         rect[2][2] = 0;
         rect[3][0] = 0;
         rect[3][1] = position.height;
         rect[3][2] = 0;

         const matrix = this.getMat4FromTransforms(position);

         if (constants.transformOriginDefault === position.transformOrigin)
         {
            vec3.transformMat4(rect[0], rect[0], matrix);
            vec3.transformMat4(rect[1], rect[1], matrix);
            vec3.transformMat4(rect[2], rect[2], matrix);
            vec3.transformMat4(rect[3], rect[3], matrix);
         }
         else
         {
            const translate = s_GET_ORIGIN_TRANSLATE(position, s_MAT4_TEMP_TRANSLATE);

            vec3.transformMat4(rect[0], rect[0], translate[0]);
            vec3.transformMat4(rect[0], rect[0], matrix);
            vec3.transformMat4(rect[0], rect[0], translate[1]);

            vec3.transformMat4(rect[1], rect[1], translate[0]);
            vec3.transformMat4(rect[1], rect[1], matrix);
            vec3.transformMat4(rect[1], rect[1], translate[1]);

            vec3.transformMat4(rect[2], rect[2], translate[0]);
            vec3.transformMat4(rect[2], rect[2], matrix);
            vec3.transformMat4(rect[2], rect[2], translate[1]);

            vec3.transformMat4(rect[3], rect[3], translate[0]);
            vec3.transformMat4(rect[3], rect[3], matrix);
            vec3.transformMat4(rect[3], rect[3], translate[1]);
         }

         rect[0][0] = position.left + rect[0][0];
         rect[0][1] = position.top + rect[0][1];
         rect[1][0] = position.left + rect[1][0];
         rect[1][1] = position.top + rect[1][1];
         rect[2][0] = position.left + rect[2][0];
         rect[2][1] = position.top + rect[2][1];
         rect[3][0] = position.left + rect[3][0];
         rect[3][1] = position.top + rect[3][1];
      }
      else
      {
         rect[0][0] = position.left;
         rect[0][1] = position.top;
         rect[1][0] = position.left + position.width;
         rect[1][1] = position.top;
         rect[2][0] = position.left + position.width;
         rect[2][1] = position.top + position.height;
         rect[3][0] = position.left;
         rect[3][1] = position.top + position.height;
      }

      let maxX = Number.MIN_SAFE_INTEGER;
      let maxY = Number.MIN_SAFE_INTEGER;
      let minX = Number.MAX_SAFE_INTEGER;
      let minY = Number.MAX_SAFE_INTEGER;

      for (let cntr = 4; --cntr >= 0;)
      {
         if (rect[cntr][0] > maxX) { maxX = rect[cntr][0]; }
         if (rect[cntr][0] < minX) { minX = rect[cntr][0]; }
         if (rect[cntr][1] > maxY) { maxY = rect[cntr][1]; }
         if (rect[cntr][1] < minY) { minY = rect[cntr][1]; }
      }

      output.x = minX;
      output.y = minY;
      output.width = maxX - minX;
      output.height = maxY - minY;

      return output;
   }

   /**
    * Returns the matrix3d CSS transform for the given position / transform data.
    *
    * @param data -
    *
    * @returns {string}
    */
   getTransformString(data = this._data)
   {
      return `matrix3d(${this.getMat4FromTransforms(data).join(',')})`;
   }

   getMat4FromTransforms(data = this._data, output = s_MAT4_RESULT)
   {
      const matrix = mat4.identity(output);

      for (const key in this._data)
      {
         switch (key)
         {
            case 'rotateX':
               mat4.multiply(matrix, matrix, mat4.fromXRotation(s_MAT4_TEMP, degToRad(data[key])));
               break;

            case 'rotateY':
               mat4.multiply(matrix, matrix, mat4.fromYRotation(s_MAT4_TEMP, degToRad(data[key])));
               break;

            case 'rotateZ':
               mat4.multiply(matrix, matrix, mat4.fromZRotation(s_MAT4_TEMP, degToRad(data[key])));
               break;

            case 'scale':
               s_SCALE_VECTOR[0] = s_SCALE_VECTOR[1] = data[key];
               mat4.multiply(matrix, matrix, mat4.fromScaling(s_MAT4_TEMP, s_SCALE_VECTOR));
               break;
         }
      }

      return matrix;
   }

   // TODO: Figure out a better check for performance.
   get isActive() { return Object.keys(this._data).length !== 0; }

   get rotateX() { return this._data.rotateX; }
   get rotateY() { return this._data.rotateY; }
   get rotateZ() { return this._data.rotateZ; }
   get scale() { return this._data.scale; }

   set rotateX(value)
   {
      if (Number.isFinite(value)) { this._data.rotateX = value; }
      else { delete this._data.rotateX; }
   }

   set rotateY(value)
   {
      if (Number.isFinite(value)) { this._data.rotateY = value; }
      else { delete this._data.rotateY; }
   }

   set rotateZ(value)
   {
      if (Number.isFinite(value)) { this._data.rotateZ = value; }
      else { delete this._data.rotateZ; }
   }

   set scale(value)
   {
      if (Number.isFinite(value)) { this._data.scale = value; }
      else { delete this._data.scale; }
   }

   reset(data)
   {
      for (const key in data)
      {
         if (constants.transformKeys.includes(key) && Number.isFinite(data[key]))
         {
            this._data[key] = data[key];
         }
         else
         {
            delete this._data[key];
         }
      }
   }
}

/**
 * @param {PositionData}   position -
 *
 * @param {number[]}       output - Output Mat4 array.
 *
 * @returns {number[]} Output Mat4 array.
 */
function s_GET_ORIGIN_TRANSLATE(position, output = s_MAT4_TEMP_TRANSLATE)
{
   const vector = s_VEC3_TEMP;

   switch (position.transformOrigin)
   {
      case 'top left':
         vector[0] = vector[1] = 0;
         mat4.fromTranslation(output[0], vector);
         mat4.fromTranslation(output[1], vector);
         break;

      case 'top center':
         vector[0] = -position.width / 2;
         vector[1] = 0;
         mat4.fromTranslation(output[0], vector);
         vector[0] = position.width / 2;
         mat4.fromTranslation(output[1], vector);
         break;

      case 'top right':
         vector[0] = -position.width;
         vector[1] = 0;
         mat4.fromTranslation(output[0], vector);
         vector[0] = position.width;
         mat4.fromTranslation(output[1], vector);
         break;

      case 'center left':
         vector[0] = 0;
         vector[1] = -position.height / 2;
         mat4.fromTranslation(output[0], vector);
         vector[1] = position.height / 2;
         mat4.fromTranslation(output[1], vector);
         break;

      case 'center':
         vector[0] = -position.width / 2;
         vector[1] = -position.height / 2;
         mat4.fromTranslation(output[0], vector);
         vector[0] = position.width / 2;
         vector[1] = position.height / 2;
         mat4.fromTranslation(output[1], vector);
         break;

      case 'center right':
         vector[0] = -position.width;
         vector[1] = -position.height / 2;
         mat4.fromTranslation(output[0], vector);
         vector[0] = position.width;
         vector[1] = position.height / 2;
         mat4.fromTranslation(output[1], vector);
         break;

      case 'bottom left':
         vector[0] = 0;
         vector[1] = -position.height;
         mat4.fromTranslation(output[0], vector);
         vector[1] = position.height;
         mat4.fromTranslation(output[1], vector);
         break;

      case 'bottom center':
         vector[0] = -position.width / 2;
         vector[1] = -position.height;
         mat4.fromTranslation(output[0], vector);
         vector[0] = position.width / 2;
         vector[1] = position.height;
         mat4.fromTranslation(output[1], vector);
         break;

      case 'bottom right':
         vector[0] = -position.width;
         vector[1] = -position.height;
         mat4.fromTranslation(output[0], vector);
         vector[0] = position.width;
         vector[1] = position.height;
         mat4.fromTranslation(output[1], vector);
         break;
   }

   return output;
}
