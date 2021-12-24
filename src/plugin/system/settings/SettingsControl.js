/**
 * Defines if logging setting changes to the console occurs.
 *
 * @type {boolean}
 */
let loggingEnabled = false;

/**
 * Defines a base class for dispatch handling from events triggered from the TJSGameSettings plugin. This is a
 * convenience mechanism and is not the only way to handle game settings related events. Use this for small to medium
 * scoped apps that do not have a lot of cross-cutting concerns.
 *
 * SettingsControl listens for all setting change events and attempts to invoke a method with the same name as the
 * setting located in the implementing child class.
 *
 * There is one additional event handled by SettingsControl:
 * `tjs:system:settings:control:log:enable` - When passed a truthy value console logging of setting changes occurs.
 */
export default class SettingsControl
{
   #handleDispatch(data)
   {
      if (typeof data.setting !== 'string') { return; }

      if (loggingEnabled)
      {
         console.log(`SettingsControl - handleDispatch - data:\n`, data);
      }

      const dispatchFunction = this[`handle_${data.setting}`];

      if (typeof dispatchFunction === 'function')
      {
         dispatchFunction.call(this, data.value);
      }
   }

   onPluginLoad(ev)
   {
      this._eventbus = ev.eventbus;

      const opts = { guard: true };

      ev.eventbus.on('tjs:system:game:settings:change:any', this.#handleDispatch, this, opts);

      // Enables local logging of setting changes.
      ev.eventbus.on('tjs:system:settings:control:log:enable', (enabled) => loggingEnabled = enabled, void 0, opts);
   }
}
