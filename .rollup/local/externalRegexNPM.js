/**
 * The following package regex / strings are always marked as external. Further path remapping occurs in
 * `externalPathsNPM`.
 *
 * @type {(RegExp|string)[]}
 */
export const externalRegexNPM = [
   /@typhonjs-svelte\/runtime-base\/*/gm,
   /@typhonjs-fvtt\/svelte\/*/gm,
   'svelte',
   /^svelte\/*/gm
];
