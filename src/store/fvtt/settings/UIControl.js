import { writable }        from '#svelte/store';

import {
   ripple,
   rippleFocus }           from '#runtime/svelte/action/animate';

import { TJSSvelteUtil }   from '#runtime/svelte/util';
import { isObject }        from '#runtime/util/object';

import { TJSDialog }       from '#svelte-fvtt/application';
import { localize }        from '#svelte-fvtt/helper';

/**
 * Controls preparation and processing of registered game settings w/ TJSGameSettings. Game settings are parsed
 * for UI display by TJSSettingsEdit. The store `showSettings` is utilized in TJSSettingsSwap component to provide
 * an easy way to flip between settings component or any main slotted component.
 */
export class UIControl
{
   /** @type {import('./types').TJSSettingsCustomSection[]} */
   #sections = [];

   /** @type {import('./').TJSGameSettings} */
   #settings;

   /** @type {boolean} */
   #showSettings = false;

   /** @type {Function} */
   #showSettingsSet;

   /** @type {{showSettings: import('svelte/store').Readable<boolean>}} */
   #stores;

   /**
    * @param {import('./').TJSGameSettings}   settings -
    */
   constructor(settings)
   {
      this.#settings = settings;

      const showSettings = writable(this.#showSettings);
      this.#showSettingsSet = showSettings.set;

      this.#stores = {
         showSettings: { subscribe: showSettings.subscribe }
      };

      Object.freeze(this.#stores);
   }

   /**
    * @returns {boolean} Current `showSettings` state.
    */
   get showSettings()
   {
      return this.#showSettings;
   }

   /**
    * @returns {{ showSettings: import('svelte/store').Readable<boolean> }} Returns the managed stores.
    */
   get stores()
   {
      return this.#stores;
   }

   /**
    * Sets current `showSettings` state.
    *
    * @param {boolean}  showSettings - New `showSettings` state.
    */
   set showSettings(showSettings)
   {
      this.#showSettings = showSettings;
      this.#showSettingsSet(this.#showSettings);
   }

   /**
    * Adds a custom section / folder defined by the provided TJSSettingsCustomSection options object.
    *
    * @param {import('./types').TJSSettingsCustomSection} options - The configuration object for the custom section.
    */
   addSection(options)
   {
      if (!isObject(options)) { throw new TypeError(`'options' is not an object.`); }

      if (!TJSSvelteUtil.isComponent(options.class))
      {
         throw new TypeError(`'options.class' is not a Svelte component.`);
      }

      if (options.props !== void 0 && !isObject(options.props))
      {
         throw new TypeError(`'options.props' is not an object.`);
      }

      if (options.folder !== void 0)
      {
         const folder = options.folder;

         if (typeof folder !== 'string' && !isObject(folder))
         {
            throw new TypeError(`'options.folder' is not a string or object.`);
         }

         if (isObject(folder))
         {
            if (typeof folder.label !== 'string') { throw new TypeError(`'options.folder.label' is not a string.`); }

            // Validate custom component set as folder summary end.
            if (folder.summaryEnd !== void 0)
            {
               if (!isObject(folder.summaryEnd))
               {
                  throw new TypeError(`'options.folder.summaryEnd' is not an object.`);
               }

               if (!TJSSvelteUtil.isComponent(folder.summaryEnd.class))
               {
                  throw new TypeError(`'options.folder.summaryEnd.class' is not a Svelte component.`);
               }

               if (folder.summaryEnd.props !== void 0 && !isObject(folder.summaryEnd.props))
               {
                  throw new TypeError(`'options.folder.summaryEnd.props' is not an object.`);
               }
            }

            // Validate that folder inline styles is an object.
            if (folder.styles !== void 0 && !isObject(folder.styles))
            {
               throw new TypeError(`'options.folder.styles' is not an object.`);
            }
         }
      }

      // Validate that section inline styles is an object.
      if (options.styles !== void 0 && !isObject(options.styles))
      {
         throw new TypeError(`'options.styles' is not an object.`);
      }

      this.#sections.push(options);
   }

   /**
    * Creates the UISettingsData object by parsing stored settings in
    *
    * @param {import('./types').TJSSettingsCreateOptions} [options] - Optional parameters.
    *
    * @returns {import('./types').TJSSettingsUIData} Parsed UI settings data.
    */
   create(options)
   {
      const settings = this.#parseSettings(options);
      const destroy = () => this.#destroy(settings);

      return {
         ...settings,
         destroy
      };
   }

   /**
    * Destroy callback. Checks for any `requiresReload` parameter in each setting comparing against initial value
    * when `settings` is created and current value. If there is a difference then show a modal dialog asking the user
    * if they want to reload for those settings to take effect.
    *
    * @param {import('./types').TJSSettingsUIData}   settings - The UI data object initiated w/ `create`.
    */
   #destroy(settings)
   {
      let requiresClientReload = false;
      let requiresWorldReload = false;

      if (Array.isArray(settings.topLevel))
      {
         for (const setting of settings.topLevel)
         {
            const current = globalThis.game.settings.get(setting.namespace, setting.key);
            if (current === setting.initialValue) { continue; }

            requiresClientReload ||= (setting.scope === 'client') && setting.requiresReload;
            requiresWorldReload ||= (setting.scope === 'world') && setting.requiresReload;
         }
      }

      if (Array.isArray(settings.folders))
      {
         for (const folder of settings.folders)
         {
            if (Array.isArray(folder.settings))
            {
               for (const setting of folder.settings)
               {
                  const current = globalThis.game.settings.get(setting.namespace, setting.key);
                  if (current === setting.initialValue) { continue; }

                  requiresClientReload ||= (setting.scope === 'client') && setting.requiresReload;
                  requiresWorldReload ||= (setting.scope === 'world') && setting.requiresReload;
               }
            }
         }
      }

      if (requiresClientReload || requiresWorldReload) { this.#reloadConfirm({ world: requiresWorldReload }); }

      this.#showSettings = false;
      this.#showSettingsSet(this.#showSettings);
   }

   /**
    * @param {import('./types').TJSSettingsCreateOptions} [options] - Optional parameters.
    *
    * @returns {import('./types').TJSSettingsUIData} Parsed UI settings data.
    */
   #parseSettings({ efx = 'ripple', storage } = {})
   {
      const namespace = this.#settings.namespace;

      if (storage && typeof namespace !== 'string')
      {
         console.warn(
          `TJSGameSettings warning: 'options.storage' defined, but 'namespace' not defined in TJSGameSettings.`);
      }

      const hasStorage = storage && typeof namespace === 'string';

      const uiSettings = [];

      const canConfigure = globalThis.game.user.can('SETTINGS_MODIFY');

      for (const setting of this.#settings.data())
      {
         if (!setting.config || (!canConfigure && (setting.scope !== 'client'))) { continue; }

         let options;

         if (isObject(setting.choices))
         {
            options = Object.entries(setting.choices).map((entry) => ({ value: entry[0], label: localize(entry[1]) }));
         }

         let range;
         if (isObject(setting.range))
         {
            range = {};

            // TODO Better error messages.
            // Verify range data.
            if (typeof setting.range.min !== 'number') { throw new TypeError(`Setting 'range.min' is not a number.`); }
            if (typeof setting.range.max !== 'number') { throw new TypeError(`Setting 'range.max' is not a number.`); }
            if (setting.range.step !== void 0 && typeof setting.range.step !== 'number')
            {
               throw new TypeError(`Setting 'range.step' is not a number.`);
            }

            range.min = setting.range.min;
            range.max = setting.range.max;
            range.step = setting.range.step ? setting.range.step : 1;
         }

         // Default to `String` if no type is provided.
         const type = setting.type instanceof Function ? setting.type.name : 'String';

         // Only configure file picker if setting type is a string.
         let filePicker;
         if (type === 'String')
         {
            filePicker = setting.filePicker === true ? 'any' : setting.filePicker;
         }

         let buttonData;
         if (filePicker)
         {
            buttonData = {
               icon: 'fas fa-file-import fa-fw',
               efx: efx === 'ripple' ? ripple() : void 0,
               title: 'FILES.BrowseTooltip',
               styles: { 'margin-left': '0.25em' }
            };
         }

         const store = this.#settings.getStore(setting.key);

         let selectData;

         /** @type {string} */
         let componentType = 'text';

         if (setting.type === Boolean)
         {
            componentType = 'checkbox';
         }
         else if (options !== void 0)
         {
            componentType = 'select';

            selectData = {
               store,
               efx: efx === 'ripple' ? rippleFocus() : void 0,
               type: componentType,
               options
            };
         }
         else if (setting.type === Number)
         {
            componentType = isObject(setting.range) ? 'range' : 'number';
         }

         let inputData;
         if (componentType === 'text' || componentType === 'number')
         {
            inputData = {
               store,
               efx: efx === 'ripple' ? rippleFocus() : void 0,
               type: componentType
            };
         }

         uiSettings.push({
            id: `${setting.namespace}.${setting.key}`,
            namespace: setting.namespace,
            folder: setting.folder,
            key: setting.key,
            name: localize(setting.name),
            hint: localize(setting.hint),
            type,
            componentType,
            filePicker,
            range,
            store,
            initialValue: globalThis.game.settings.get(setting.namespace, setting.key),
            scope: setting.scope,
            requiresReload: typeof setting.requiresReload === 'boolean' ? setting.requiresReload : false,
            buttonData,
            inputData,
            selectData
         });
      }

      // If storage is available then create a key otherwise create a dummy store, so `applyScrolltop` works.
      const storeScrollbar = hasStorage ? storage.getStore(`${namespace}-settings-scrollbar`) : writable(0);

      const topLevel = [];

      const folderData = {};

      // Sort into folders
      for (const setting of uiSettings)
      {
         if (typeof setting.folder === 'string')
         {
            const folderName = localize(setting.folder);

            // Create folder array if one doesn't exist already.
            if (!Array.isArray(folderData[folderName])) { folderData[folderName] = []; }
            folderData[folderName].push(setting);
         }
         else // Add to 'toplevel' settings
         {
            topLevel.push(setting);
         }
      }

      // Convert folderData object to array.
      const folders = Object.entries(folderData).map((entry) =>
      {
         return {
            label: entry[0],
            store: hasStorage ? storage.getStore(`${namespace}-settings-folder-${entry[0]}`) : void 0,
            settings: entry[1],
         };
      });

      const sections = [];

      // Parse custom component sections
      for (const section of this.#sections)
      {
         const parsedSection = {
            class: section.class,
            props: section.props,
            styles: section.styles
         };

         if (typeof section.folder === 'string')
         {
            const label = localize(section.folder);

            parsedSection.folder = {
               label,
               store: hasStorage ? storage.getStore(`${namespace}-settings-folder-${label}`) : void 0
            };
         }
         else if (isObject(section.folder))
         {
            const label = localize(section.folder.label);

            parsedSection.folder = {
               label,
               store: hasStorage ? storage.getStore(`${namespace}-settings-folder-${label}`) : void 0,
               summaryEnd: section.folder.summaryEnd,
               styles: section.folder.styles
            };
         }

         sections.push(parsedSection);
      }

      return {
         storeScrollbar,
         topLevel,
         folders,
         sections
      };
   }

   async #reloadConfirm({ world = false } = {})
   {
      let title = localize('SETTINGS.ReloadPromptTitle');
      let label = localize('SETTINGS.ReloadPromptBody');

      // Foundry v9 doesn't have the reload lang keys, so substitute just for English translation.
      // TODO: FOUNDRY_V9 - remove when support for v9 is dropped.
      title = title !== 'SETTINGS.ReloadPromptTitle' ? title : 'Reload Application?';
      label = label !== 'SETTINGS.ReloadPromptBody' ? label :
       'Some of the changed settings require a reload of the application to take effect. Would you like to reload now?';

      const reload = await TJSDialog.confirm({
         modal: true,
         draggable: false,
         title,
         content: `<p>${label}</p>`
      });

      if (!reload) { return; }

      // Reload all connected clients. Note: Foundry v9 might not support this event.
      if (world && globalThis.game.user.isGM) { globalThis.game.socket.emit('reload'); }

      // Reload locally.
      window.location.reload();
   }

   /**
    * Convenience method to swap `showSettings`.
    *
    * @returns {boolean} New `showSettings` state.
    */
   swapShowSettings()
   {
      this.#showSettings = !this.#showSettings;
      this.#showSettingsSet(this.#showSettings);
      return this.#showSettings;
   }
}
