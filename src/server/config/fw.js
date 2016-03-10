import path from 'path';

/**
 * Configuration parameters of the Soundworks framework.
 * These parameters allow for configuring components of the framework such as Express and SocketIO.
 */
export default {
  useHttps: false,
  publicFolder: path.join(process.cwd(), 'public'),
  templateFolder: path.join(process.cwd(), 'html'),
  defaultClient: 'player',
  assetsDomain: '', // override to download assets from a different serveur (nginx)
  socketIO: {
    url: '',
    transports: ['websocket'],
    pingTimeout: 60000, // configure client side too ?
    pingInterval: 50000, // configure client side too ?
    // @note: EngineIO defaults
    // pingTimeout: 3000,
    // pingInterval: 1000,
    // upgradeTimeout: 10000,
    // maxHttpBufferSize: 10E7,
  },
  errorReporterDirectory: 'logs/clients',
  dbDirectory: 'db',
};
