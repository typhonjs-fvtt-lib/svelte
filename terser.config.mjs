export default {
   compress: {
      booleans_as_integers: true,
      passes: 3
   },

   mangle: {
      keep_classnames: true,
      keep_fnames: true,
      toplevel: true
   },

   ecma: 2020,

   module: true
};