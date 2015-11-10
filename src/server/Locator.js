import Module from './Module';


/**
 * The {@link Locator} module allows to store the coordinates of a client when the user enters an approximate location through the interfacte provided by the {@link ClientLocator}.
 */
export default class Locator extends Module {
  /**
   * Creates an instance of the class.
   * @param {Object} [options={}] Options.
   * @param {Object} [options.name='locator'] Name of the module.
   * @param {Object} [options.setup] Setup used in the scenario, if any (cf. {@link ServerSetup}).
   */
  constructor(options = {}) {
    super(options.name || 'locator');

    this.setup = options.setup || null;
  }

  /**
   * @private
   */
  connect(client) {
    super.connect(client);

    client.receive(this.name + ':request', () => {
      if (this.setup) {
        let surface = this.setup.getSurface();
        client.send(this.name + ':surface', surface);
      } else {
        throw new Error("Locator requires a setup.");
      }
    });

    client.receive(this.name + ':coordinates', (coordinates) => {
      client.coordinates = coordinates;
    });

    client.receive(this.name + ':restart', (coordinates) => {
      client.coordinates = coordinates;
    });
  }
}
