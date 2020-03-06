class Router {
  capabilities = Capabilities.coreCapabilities;

  register(pathChangeHandler: VoidFunction, capabilities: Capabilities) {
    this.capabilities = capabilities;
    history.pushState = (f => function pushState() {
      var ret = f.apply(this, arguments);
      pathChangeHandler();
      return ret;
    })(history.pushState);

    history.replaceState = (f => function replaceState() {
      var ret = f.apply(this, arguments);
      pathChangeHandler();
      return ret;
    })(history.replaceState);

    window.addEventListener('popstate', () => {
      pathChangeHandler();
    });
  }

  navigateTo(path: string) {
    var newUrl = window.location.protocol + "//" + window.location.host + path;
    window.history.pushState({ path: newUrl }, '', newUrl);
  }


  navigateToInvocation(invocationId: string) {
    if (!this.capabilities.canNavigateToInvocation()) {
      alert(`Invocations are not available in ${this.capabilities.name}`);
      return;
    }
    this.navigateTo(Path.invocationPath + invocationId);
  }

  navigateToUserHistory(user: string) {
    if (!this.capabilities.canNavigateToUserHistory()) {
      alert(`User history is not available in ${this.capabilities.name}`);
      return;
    }
    this.navigateTo(Path.userHistoryPath + user);
  }

  navigateToHostHistory(host: string) {
    if (!this.capabilities.canNavigateToHostHistory()) {
      alert(`Host history is not available in ${this.capabilities.name}`);
      return;
    }
    this.navigateTo(Path.hostHistoryPath + host);
  }

  updateParams(params: any) {
    let keys = Object.keys(params);
    let queryParam = keys.map(key => `${key}=${params[key]}`).join('&');
    var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + queryParam + window.location.hash;
    window.history.pushState({ path: newUrl }, '', newUrl);
  }

  getLastPathComponent(path: string, pathPrefix: string) {
    if (!path.startsWith(pathPrefix)) {
      return null;
    }
    return path.replace(pathPrefix, "");
  }

  getInvocationId(path: string) {
    return this.getLastPathComponent(path, Path.invocationPath);
  }

  getHistoryUser(path: string) {
    return this.getLastPathComponent(path, Path.userHistoryPath);
  }

  getHistoryHost(path: string) {
    return this.getLastPathComponent(path, Path.hostHistoryPath);
  }
}

class Path {
  static invocationPath = "/invocation/";
  static userHistoryPath = "/history/user/";
  static hostHistoryPath = "/history/host/";
}

export class Capabilities {
  name: string;
  paths: Set<string>;

  constructor(name: string, paths: Set<string>) {
    this.name = name;
    this.paths = paths;
  }

  canNavigateToInvocation() {
    return this.paths.has(Path.invocationPath);
  }

  canNavigateToUserHistory() {
    return this.paths.has(Path.userHistoryPath);
  }

  canNavigateToHostHistory() {
    return this.paths.has(Path.hostHistoryPath);
  }

  static coreCapabilities = new Capabilities("BuildBuddy Community Edition", new Set([Path.invocationPath]));
  static enterpriseCapabilities = new Capabilities("Buildbuddy Enterprise", new Set([Path.invocationPath, Path.userHistoryPath, Path.hostHistoryPath]));
}

export default new Router();