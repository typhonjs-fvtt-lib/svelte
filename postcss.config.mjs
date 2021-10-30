import autoprefixer     from 'autoprefixer';             // Adds vendor specific extensions to CSS
import postcssPresetEnv from 'postcss-preset-env';       // Popular postcss plugin for next gen CSS usage.

// Provides a function to return a new PostCSS configuration setting the extract parameter.
export default function(extract)
{
   return {
      inject: false,                                        // Don't inject CSS into <HEAD>
      extract,
      extensions: ['.scss', '.sass', '.css'],               // File extensions
      plugins: [autoprefixer, postcssPresetEnv],            // Postcss plugins to use
      use: ['sass']                                         // Use sass / dart-sass
   }
};