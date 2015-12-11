import ObservableObject from 'common/object/observable';
import { Registry } from 'common/registry';
import { NotifierCollection } from 'common/notifiers';
import { InitializeMessage, LoadMessage } from 'base/messages';
import sift from 'sift';

class BaseApplication extends ObservableObject {

  static plugins = [];

  constructor(properties) {
    super(properties);

    // class registry such as components classes, tools, models
    this.plugins = this.registry = Registry.create(void 0, this.constructor.plugins);

    // central communication object
    this.notifier = NotifierCollection.create();
    this._usePlugins();
  }

  /**
   */

  _usePlugins() {
    for (var plugin of this.plugins.filter(sift({ type: 'application' }))) {
      plugin.factory.create({ app: this });
    }
  }

  /**
   * initializes the app
   */

  async initialize(config) {

    this.config = config;

    // first load the app
    await this.notifier.notify(LoadMessage.create()).then(this.didLoad.bind(this));

    // then initialize
    await this.notifier.notify(InitializeMessage.create()).then(this.didInitialize.bind(this));
  }

  /**
   */

  didLoad() {

  }

  /**
   */

  didInitialize() {

  }
}

export default BaseApplication;
