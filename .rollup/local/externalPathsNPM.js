/**
 * Provide any path remapping from parent modules. Currently, there is no remapping, but once @typhonjs-svelte/lib
 * becomes active again those subpath exports need to be remapped to `@typhonjs-fvtt/svelte/*
 *
 * The keys in the object below are added to the Rollup external option and the key / value is added to the Rollup path
 * options.
 *
 * Note: There are regex patterns added for static external exports in `externalRegexNPM`.
 *
 * @type {{}}
 */
export const externalPathsNPM = {
};
