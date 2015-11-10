import client from './client';
import Module from './Module';

/**
 * The {@link Filelist} module requests the file list of a folder from the server. The results can be filtered by file extensions.
 */
export default class Filelist extends Module {
  /**
   * Creates an instance of the class. Never has a view.
   * @param {Object} [options={}] Options.
   * @param {Object} [options.name='filelist'] Name of the module.
   * @param {Object} [options.folder=''] Folder in which to retrieve the file list.
   * @param {Object} [options.extentions=undefined] Extensions of the files to retrieve.
   */
  constructor(options = {}) {
    super(options.name || 'filelist', false);

    /**
     * Array of file paths sent by the server.
     * @type {String[]}
     */
    this.files = null;

    this._folder = options.folder || '';
    this._extensions = options.extensions || undefined;
  }

  /**
   * Starts the module.
   * Sends a request to the server and listens for the answer.
   * @emits {this.name + ':files'} The file path list when it is received from the server.
   */
  start() {
    super.start();

    client.send(this.name + ':request', this._folder, this._extensions);

    client.receive(this.name + ':files', (files) => {
      this.files = files;
      this.emit(this.name + ':files', files);
      this.done();
    }, this);
  }
}
