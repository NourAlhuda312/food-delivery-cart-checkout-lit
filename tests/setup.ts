if (typeof globalThis.CustomEvent === 'undefined') {
  class CustomEventPolyfill<T = unknown> extends Event implements CustomEvent<T> {
    readonly detail: T;
    initCustomEvent(): void {}
    constructor(type: string, init: CustomEventInit<T> = {}) {
      super(type, init);
      this.detail = init.detail as T;
    }
  }
  Object.defineProperty(globalThis, 'CustomEvent', { value: CustomEventPolyfill, configurable: true });
}
