/**
 * The default view templates for the provided services and scenes.
 * The view templates are organized according to the `Module.name` property.
 * @type {Object}
 */
const defaultViewContent = {
  /**
   * `globals` is populated with server `appName` and
   * shared between all view templates
   */
  'globals': {},
  'service:checkin': {
    labelPrefix: 'Go to',
    labelPostfix: 'Touch the screen<br class="portrait-only" />when you are ready.',
    error: false,
    errorMessage: 'Sorry, no place is available',
    wait: 'Please wait...',
    label: '',
  },
  'service:loader': {
    loading: 'Loading sounds…',
  },
  'service:locator': {
    instructions: 'Define your position in the area',
    send: 'Send',
    showBtn: false,
  },
  'service:placer': {
    instructions: 'Select your position',
    send: 'Send',
    reject: 'Sorry, no place is available',
    showBtn: false,
    rejected: false,
  },
  'service:platform': {
    errorMessage: 'Sorry,<br />Your device is not compatible with the application.',
  },
  'service:sync': {
    wait: `Clock syncing,<br />stand by&hellip;`,
  },
  'service:welcome': {
    welcome: 'Welcome to',
    touchScreen: 'Touch the screen to join!',
    errorIosVersion: 'This application requires at least iOS 7 with Safari or Chrome.',
    errorAndroidVersion: 'This application requires at least Android 4.2 with Chrome.',
    errorRequireMobile: 'This application is designed for iOS and Android mobile devices.',
    errorDefault: 'Sorry, the application cannot work properly on your device.',
  },

  'survey': {
    next: 'Next',
    validate: 'Validate',
    thanks: 'Thanks!',
    length: '-',
  },
};

export default defaultViewContent;
