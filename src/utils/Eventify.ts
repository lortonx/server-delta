type OmitFirst<T extends any[]> = T extends [any, ...infer R] ? R : never;
type Constructor<T = {}> = new (...args: any[]) => T;
type LISTENER = (...agr: any[]) => unknown;
type EVENT = string | number;
type ConstructorOf<T extends Object, Args extends any[]> = {
    prototype: T;
    new (...args: Args): T;
};
type ConstructorOf2<T extends Object, Args extends any[]> = {
    prototype: T;
    new (...args: Args): T;
};

export function EventifyMixin<T extends Constructor<{}>>(Base: T) {
    return class EventifyBase extends Base {
        events: { [event: string]: Function[] } = {};
        ev: Array<[EventifyBase, string, LISTENER]> = [];
        // constructor(...args: any[]) {
        //     super(...args);
        // }

        on<T = LISTENER>(...rest: [string | number, ...string[], T]): T {
            if (arguments.length < 2) throw new Error('Eventify.on() need at least 2 arguments');
            let i, event;
            const length = arguments.length,
                listener = arguments[length - 1] as LISTENER;
            for (i = 0; length - 1 > i; i++) {
                event = arguments[i] as string | number;
                if (typeof this.events[event] !== 'object') {
                    this.events[event] = [];
                }
                this.events[event].push(listener);
            }
            return listener as T;
        }

        removeListener(event: EVENT, listener: LISTENER) {
            let idx;
            if (typeof this.events[event] === 'object') {
                idx = this.events[event].indexOf(listener);
                if (idx > -1) {
                    this.events[event].splice(idx, 1);
                }
            }
        }
        emit(event: EVENT, ...rest: unknown[]) {
            let i, listeners, length;
            const args = [].slice.call(arguments, 1);
            if (typeof this.events[event] === 'object') {
                listeners = this.events[event].slice();
                length = listeners.length;

                for (i = 0; i < length; i++) {
                    listeners[i].apply(this, args);
                }
            }
        }
        once(event: EVENT, listener: LISTENER) {
            const once_listener = function (this: EventifyBase, ...args: unknown[]) {
                this.removeListener(event, once_listener);
                listener.apply(this, args);
            };
            this.on(event, once_listener);
            return once_listener;
        }
        waitfor<T = (arg: Function) => unknown>(event: EVENT, timeout: number, reject_callback?: T) {
            let timer: unknown = -1;
            let is_rejected = false;
            return new Promise((resolve, reject) => {
                const rejection = () => {
                    if (is_rejected) return;
                    is_rejected = true;
                    clearTimeout(timer as number);
                    this.removeListener(event, resolve);
                    reject();
                };
                timer = setTimeout(() => rejection(), timeout);
                this.once(event, resolve);
                typeof reject_callback == 'function' && reject_callback(rejection);
            }).then((data) => {
                if (is_rejected) console.error('Fatal: Rejected cant be resolved');
                clearTimeout(timer as number);
                return data;
            });
        }
        delegateTo<L extends LISTENER>(target: EventifyBase, ...rest: [...string[], L]): L {
            if (arguments.length < 2) throw new Error('Eventify.on() need at least 2 arguments');
            let event: string;
            const length = arguments.length,
                listener = arguments[length - 1];
            for (let i = 1; length - 1 > i; i++) {
                event = arguments[i];
                if (typeof target.events[event] !== 'object') {
                    target.events[event] = [];
                }
                target.ev.push([this, event, listener]);
                this.on(event, listener);
            }
            return listener as L;
        }
        listenTo<E extends EventifyBase>(target: E, ...rest: OmitFirst<Parameters<E['delegateTo']>>): LISTENER {
            return target.delegateTo(this, ...rest);
        }
        listenSelf(...rest: [...string[], LISTENER]) {
            // @ts-ignore
            return this.listenTo(this, ...rest);
        }

        unlisten() {
            const before = this.ev.slice();
            for (let i = 0; before.length > i; i++) {
                const target = before[i][0],
                    eventName = before[i][1],
                    listener = before[i][2];
                target.removeListener(eventName, listener);
                const idx = this.ev.indexOf(before[i]);
                if (idx > -1) this.ev.splice(idx, 1);
            }
            if (this.ev.length > 0) {
                console.error('We have error in unlisten()', before, this.ev);
            }
        }
    };
}
export const Eventify = EventifyMixin(class {});

/* LIB : EVENTIFY ANY OBJECT */
export const eventify = function <T extends Object>(object: T) {
    const EVENTIFY = new Eventify();
    const props = [
        'on',
        'removeListener',
        'emit',
        'once',
        'listenTo',
        'delegateTo',
        'listenSelf',
        'unlisten',
        'ev',
        'events'
    ] as const;
    props.forEach((key) => {
        Object.defineProperty(object, key, { value: EVENTIFY[key], enumerable: false, writable: false });
    });
    return object as unknown as { [K in (typeof props)[number]]: InstanceType<typeof Eventify>[K] };
};

type EventObjectEvents<T> = keyof T | '*' | 'before*' | `change:${Extract<keyof T, string>}` | `change:*`;
type EventObjectCallback<T, P = EventObjectEvents<T>> = (
    curr: T[Extract<keyof T, P>],
    prev: T[Extract<keyof T, P>]
) => any;
type EventObjectReturnType<T> = T &
    Omit<InstanceType<typeof Eventify>, 'on' | 'delegateTo' | 'removeListener'> & {
        on: <L = EventObjectCallback<T>>(...rest: [EventObjectEvents<T>, ...Array<EventObjectEvents<T>>, L]) => L;
        listenSelf: <L = EventObjectCallback<T>>(...rest: [...Array<EventObjectEvents<T>>, L]) => L;
        removeListener: (arg1: EventObjectEvents<T>, arg2: LISTENER) => void;
        delegateTo: <L = EventObjectCallback<T>>(
            target: InstanceType<typeof Eventify>,
            ...rest: [...Array<EventObjectEvents<T>>, L]
        ) => L;
    };

export function EventObject<T extends Record<string, any>>(object: T) {
    eventify(object);
    const eventObject = new Proxy(object, {
        set(target: Record<string, any>, prop, val) {
            const prev = target[prop as string];
            const curr = val;
            target.emit('before*', prop, val);
            target[prop as string] = val;
            try {
                target.emit(prop, val, prev);
                if (prev !== curr) {
                    target.emit('change:*', prop, val);
                    target.emit('change:' + String(prop), val);
                }
                target.emit('*', prop, val, prev);
            } catch (message) {
                console.error(message);
            }
            return true;
        }
    });
    return eventObject as EventObjectReturnType<T>;
}

export function deferrify<T>() {
    let resolve = null as unknown as (value: T | PromiseLike<T>) => void;
    let reject = null as unknown as (reason?: any) => void;
    const promise = new Promise<T>((resolveFunc, rejectFunc) => {
        resolve = resolveFunc;
        reject = rejectFunc;
    });
    return { promise, resolve, reject };
}

const e1 = new Eventify();
const e2 = new Eventify();

const eo = EventObject({
    hello: 'world',
    world: 'hello'
});

eo.on('hello', (curr, prev) => {});

const list = e1.listenTo(e2, 'asd', '*', (curr, prev) => '123');
e1.listenTo(eo, 'hello', 'change:hello', () => {
    1;
});
eo.delegateTo(e1, 'hello', 'world', (curr, prev) => {
    return 1;
});
list();
e1.on('sex', 'love', () => 123);
eo.on('world', 'change:hello', () => {});
eo['hello'] = 'world';
eo.delegateTo(e1, 'hello', 'world', () => {});
