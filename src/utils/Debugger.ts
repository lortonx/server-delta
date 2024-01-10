type Constructor<T = {}> = new (...args: any[]) => T;

export function DebuggerMixin<T extends Constructor<{}>>(Base: T) {
    return class DebuggerBase extends Base {
        private bindings: { [P in keyof Console]?: Console[P] } = {};
        private prefix: string[] = [];
        private _useProxy = false;
        isLogging = true;
        private dummy() {}
        private proxy: Console['log'] = () => {};

        private resetBindings() {
            this.bindings = {};
        }

        set useProxy(value: boolean) {
            this.resetBindings();
            this._useProxy = value;
        }

        get useProxy(): boolean {
            this.resetBindings();
            return this._useProxy;
        }

        setPrefix(...prefix: string[]): void {
            this.resetBindings();
            this.prefix = prefix;
        }

        getBindinng<T extends keyof Console>(method: T): Console[T] | (() => void) {
            if (this.isLogging) {
                if (!this._useProxy) {
                    return (
                        this.bindings[method] || //@ts-ignore
                        (this.bindings[method] = console[method].bind(console, ...this.prefix))
                    );
                } else {
                    return (
                        this.bindings[method] || //@ts-ignore
                        (this.bindings[method] = new Proxy(console[method].bind(console[method]), {
                            apply: (target, thisArg, argumentsList) => {
                                this.proxy(method, argumentsList);
                                return Reflect.apply(target, thisArg, argumentsList);
                            }
                        }))
                    );
                }
            } else {
                return this.dummy;
            }
        }

        get info() {
            return this.getBindinng('info');
        }
        get log() {
            return this.getBindinng('log');
        }
        get warn() {
            return this.getBindinng('warn');
        }
        get access() {
            return this.getBindinng('warn');
        }
        get debug() {
            return this.getBindinng('debug');
        }
        get error() {
            return this.getBindinng('error');
        }
        get fatal() {
            return this.getBindinng('error');
        }
        get print() {
            return this.getBindinng('log');
        }
        get trace() {
            return this.getBindinng('trace');
        }
        get groupCollapsed() {
            return this.getBindinng('groupCollapsed');
        }
    };
}

export class Debugger extends DebuggerMixin(class {}) {}
