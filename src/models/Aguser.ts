import { RecordToType } from 'parse-server';
import schema from '../schema/AgUser.schema';

type t = RecordToType<typeof schema.fields>;
const className = 'aguser';
export default class Aguser extends Parse.Object<t> {
    constructor() {
        super(className, {});
    }
}

Parse.Object.registerSubclass(className, Aguser);
