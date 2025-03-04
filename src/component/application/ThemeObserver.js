import { writable } from '#svelte/store';

/**
 * Provides reactive observation of the Foundry core theme applied to `document.body`. There are several stores
 * available to receive updates when the theme changes.
 */
export class ThemeObserver
{
   /**
    * All readable theme stores.
    *
    * @type {Readonly<({
    *    theme: Readonly<import('#svelte/store').Readable<'theme-dark' | 'theme-light'>>,
    *    themeDark: Readonly<import('#svelte/store').Readable<boolean>>,
    *    themeLight: Readonly<import('#svelte/store').Readable<boolean>>,
    * })>}
    */
   static #stores;

   /**
    * Internal setter for theme stores.
    *
    * @type {({
    *    theme: Function,
    *    themeDark: Function,
    *    themeLight: Function,
    * })}
    */
   static #storeSet;

   /**
    * Current theme.
    *
    * @type {string}
    */
   static #theme = '';

   /**
    * @returns {Readonly<({
    *    theme: Readonly<import('#svelte/store').Readable<'theme-dark' | 'theme-light'>>,
    *    themeDark: Readonly<import('#svelte/store').Readable<boolean>>,
    *    themeLight: Readonly<import('#svelte/store').Readable<boolean>>,
    * })>} Current core theme stores.
    */
   static get stores() { return this.#stores; }

   /**
    * @returns {'theme-dark' | 'theme-light'} Current core theme.
    */
   static get theme() { return this.#theme; }

   /**
    * @returns {boolean} Is the core theme `dark`.
    */
   static get themeDark() { return this.#theme === 'theme-dark'; }

   /**
    * @returns {boolean} Is the core theme `light`.
    */
   static get themeLight() { return this.#theme === 'theme-light'; }

   /**
    * Helper to apply current core theme to a given SvelteApp optional classes.
    *
    * @param {import('#svelte-fvtt/application').SvelteApp} application - Svelte application.
    *
    * @returns {string} App classes CSS string with current core theme applied.
    */
   static appClasses(application)
   {
      const classes = new Set([
         ...Array.isArray(application?.options?.classes) ? application.options.classes : [],
      ]);

      // In AppV1 `theme-light` is always applied. Remove it and add the actual AppV2 theme.
      classes.delete('theme-light');

      classes.add('themed');
      classes.add(this.#theme);

      return Array.from(classes).join(' ');
   }

   /**
    * Initialize `document.body` theme observation.
    */
   static initialize()
   {
      if (this.#stores !== void 0) { return; }

      const themeStore = writable(this.#theme);
      const themeDarkStore = writable(false);
      const themeLightStore = writable(false);

      this.#stores = Object.freeze({
         theme: Object.freeze({ subscribe: themeStore.subscribe }),
         themeDark: Object.freeze({ subscribe: themeDarkStore.subscribe }),
         themeLight: Object.freeze({ subscribe: themeLightStore.subscribe })
      });

      this.#storeSet = {
         theme: themeStore.set,
         themeDark: themeDarkStore.set,
         themeLight: themeLightStore.set
      };

      const observer = new MutationObserver(() =>
      {
         if (document.body.classList.contains('theme-light'))
         {
            this.#theme = 'theme-light';

            this.#storeSet.themeDark(false);
            this.#storeSet.themeLight(true);
         }
         else if (document.body.classList.contains('theme-dark'))
         {
            this.#theme = 'theme-dark';

            this.#storeSet.themeDark(true);
            this.#storeSet.themeLight(false);
         }

         this.#storeSet.theme(this.#theme);
      });

      // Only listen for class changes.
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
   }
}
