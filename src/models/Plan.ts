// План использования продукта

import { RecordToType } from 'parse-server';
import schema from '../schema/Plan.schema.js';
import User from './User.js';

const possiblePlans = ['spect1x', 'spect4x', 'spect16x'] as const;

interface hiddenParams {
    duration: number;
    remaining: number;
    sig: string;
}
type t = RecordToType<typeof schema.fields> & Partial<hiddenParams>;
const className = 'Plan';

export default class Plan extends Parse.Object<t> {
    static {
        Parse.Object.registerSubclass(className, this);
    }
    constructor() {
        super(className, {});
    }
    static query(user: User) {
        return new Parse.Query(Plan).select('name', 'ds', 'de', 'dr').equalTo('user', user);
    }
    static createRecord(user: User, name: (typeof possiblePlans)[number]) {
        const availableNames = possiblePlans;
        if (!name) throw new Error(`Name "${name}" is not specified`);
        if (!availableNames.includes(name)) throw new Error(`Name "${name}" is not available`);
        {
            const plan = new Plan();
            plan.set('user', user);
            plan.set('name', name);
            plan.setDuration(0);
            plan.setRemaining(0);
            plan.start();
            return plan;
        }
    }
    static getUserPlanByName(user: User, name: string) {
        if (!user) throw new Error('User must be set');
        if (!name) throw new Error('Name of plan must be set');
        const plan = new Parse.Query(Plan)
            .select('name', 'ds', 'de', 'dr', 'user')
            .equalTo('user', user)
            .equalTo('name', name)
            .first();
        return plan;
    }

    /**
     * Для верного старта необходимо установить
     * duration in seconds,
     * remaining in seconds,
     * user
     */
    start() {
        // if(!(this.get('duration') > 0)) throw new Error('"duration" must be greater than 0')
        // if(!(this.get('remaining') > 0)) throw new Error('"remaining" must be greater than 0')
        // if(this.get('status') !== 'stopped') throw new Error('Plan "status" must be "stopped"')
        if (!this.get('name')) throw new Error('Plan "name" must be set');
        if (!this.get('user')) throw new Error('Plan "user" must be set');
        // this.set('status', 'started')
        this.set('ds', new Date());
        // this.set('de', new Date(new Date().getTime() + (this.get('duration') * 1000)))
        // this.set('dr', new Date(new Date().getTime() + (this.get('remaining') * 1000)))
    }
    /** @returns in seconds*/
    getDurationLeft() {
        return Math.max(0, 0 | ((this.get('de').getTime() - new Date().getTime()) / 1000));
    }
    /** @returns in seconds*/
    getRemainingLeft() {
        return Math.max(0, 0 | ((this.get('dr').getTime() - new Date().getTime()) / 1000));
    }
    setDuration(ms: number) {
        this.set('de', new Date(new Date().getTime() + ms));
    }
    setRemaining(ms: number) {
        this.set('dr', new Date(new Date().getTime() + ms));
    }
}
