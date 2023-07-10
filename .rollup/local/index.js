import { externalPathsNPM }   from './externalPathsNPM.js';
import { externalRegexNPM }   from './externalRegexNPM.js';

import { generatePlugin }     from '../generatePlugin.js';

/**
 * Creates the TyphonJS runtime library substitution plugin.
 *
 * @param {string[]} [exclude] - NPM packages to exclude from predefined list of packages.
 *
 * @returns {{name: string, options(*): void}} TyphonJS runtime plugin
 */
export function typhonjsRuntime({ exclude = [] } = {})
{
   return generatePlugin({
      externalPaths: externalPathsNPM,
      externalRegex: externalRegexNPM,
      exclude
   });
}
