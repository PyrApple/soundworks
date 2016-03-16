import Activity from '../core/Activity';
import serviceManager from '../core/serviceManager';
import server from '../core/server';


const SERVICE_ID = 'service:shared-config';

/**
 * [server] Service that acts as an accessor for the server config for both
 * server and client sides.
 */
class SharedConfig extends Activity {
  constructor() {
    super(SERVICE_ID);

    this._cache = {};
    this._clientItemsMap = {};
  }

  /** @inheritdoc */
  connect(client) {
    this.receive(client, 'request', this._onRequest(client));
  }

  /**
   * Returns an item of the server configuration from its path. For server-side use.
   * @param {String} item - String representing the path to the configuration
   *  ex. `'setup.area'` will search for the `area` entry of the '`setup`' entry
   *  of the server configuration.
   * @returns {Mixed} - The value of the request item. Returns `null` if
   *  the given item does not exists.
   */
  get(item) {
    const parts = item.split('.');
    let value = server.config;
    // search item through config
    parts.forEach((attr) => {
      if (value[attr])
        value = value[attr];
      else
        value = null;
    });

    return value;
  }

  /**
   * Add a required item from server side to a specific client. This should be
   * called at the activity's initialization.
   *
   */
  addItem(item, clientType) {
    if (!this._clientItemsMap[clientType])
      this._clientItemsMap[clientType] = new Set();;

    this._clientItemsMap[clientType].add(item);
  }

  /**
   * Generate a object according to the given items. The result is cached
   * @param {Array<String>} items - The path to the items to be shared.
   * @returns {Object} - An optimized object containing all the requested items.
   */
  _getValues(clientType) {
    if (this._cache[clientType])
      return this._cache[clientType];

    const items = this._clientItemsMap[clientType];
    const serverConfig = server.config;
    const data = {};

    // build data tree
    items.forEach((item) => {
      const parts = item.split('.');
      let pointer = data;

      parts.forEach((attr) => {
        if (!pointer[attr])
          pointer[attr] = {};

        pointer = pointer[attr];
      });
    });

    // populate previously builded tree
    items.forEach((item) => {
      const parts = item.split('.');
      const len = parts.length;
      let value = serverConfig;
      let pointer = data;

      parts.forEach((attr, index) => {
        value = value[attr];

        if (index < len - 1)
          pointer = pointer[attr];
        else
          pointer[attr] = value;
      });
    });

    this._cache[clientType] = data;
    return data;
  }

  _onRequest(client) {
    // generate an optimized config bundle to return the client
    return (items) => {
      items.forEach((item) => this.addItem(item, client.type));

      const config = this._getValues(client.type);
      this.send(client, 'config', config);
    }
  }
}

serviceManager.register(SERVICE_ID, SharedConfig);

export default SharedConfig;