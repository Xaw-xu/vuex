import { forEach } from "../utils";

export class Module {
  constructor(rootModule) {
    this._raw = rootModule;
    this._children = {};
    this.state = rootModule.state;
  }
  get namspaced() {
    return this._raw.namspaced
  }
  getChild(path) {
    return this._children[path];
  }
  addChild(path, module) {
    this._children[path] = module;
  }
  forEachMutation(fn) {
    if (this._raw.mutations) {
      forEach(this._raw.mutations, fn);
    }
  }
  forEachAction(fn) {
    if (this._raw.actions) {
      forEach(this._raw.actions, fn);
    }
  }
  forEachGetter(fn) {
    if (this._raw.getters) {
      forEach(this._raw.getters, fn);
    }
  }
  forEachChild(fn) {
    if (this._children) {
      forEach(this._children, fn);
    }
  }
}
