import client from './client';
import Module from './Module';


/**
 * The {@link ClientSetup} module retrieves the setup information from the server.
 * It never has a view.
 * (To rendering the setup graphically, see {@link ClientSpace}.)
 */
export default class ClientSetup extends Module {
  /**
   * Creates an instance of the class.
   * @param {Object} [options={}] Options.
   * @param {String} [options.name='setup'] Name of the module.
   */
  constructor(options = {}) {
    super(options.name || 'setup', false);

    /**
     * Width of the setup (in meters).
     * @type {Number}
     */
    this.width = 1;

    /**
     * Height of the setup (in meters).
     * @type {Number}
     */
    this.height = 1;

    /**
     * Default spacing between positions (in meters).
     * @type {Number}
     */
    this.spacing = 1;

    /**
     * Array of the positions' labels.
     * @type {String[]}
     */
    this.labels = [];

    /**
     * Array of the positions' coordinates (in the format `[x:Number, y:Number]`).
     * @type {Array[]}
     */
    this.coordinates = [];

    /**
     * Type of the setup (values currently supported: `'matrix'`, `'surface'`).
     * @type {String}
     * @todo Remove?
     */
    this.type = undefined;

    /**
     * Background image URL.
     * @type {String}
     */
    this.background = undefined;

    this._xFactor = 1;
    this._yFactor = 1;

    this._init = this._init.bind(this);
  }

  _init(setup) {
    this.width = setup.width;
    this.height = setup.height;
    this.spacing = setup.spacing;
    this.labels = setup.labels;
    this.coordinates = setup.coordinates;
    this.type = setup.type;
    this.background = setup.background;

    this.done();
  }

  /**
   * Starts the module.
   * @private
   */
  start() {
    super.start();

    this.receive('init', this._init);
    this.send('request');
  }

  /**
   * Restarts the module.
   * @private
   */
  restart() {
    super.restart();
    this.done();
  }

  /**
   * Resets the module.
   * @private
   */
  reset() {
    super.reset();
    this.removeListener('init', this._init);
  }

  /**
   * Returns the number of positions in the setup.
   * @return {Number} Number of positions in the setup.
   */
  getNumPositions() {
    if (this.labels.length || this.coordinates.length) {
      var numLabels = this.labels.length || Infinity;
      var numCoordinates = this.coordinates.length || Infinity;

      return Math.min(numLabels, numCoordinates);
    }

    return 0;
  }
}
