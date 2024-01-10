import { RecordToType } from 'parse-server';
import schema from '../schema/CustomRecord.schema';

type t = RecordToType<typeof schema.fields>;
const className = 'CustomRecord';
export default class CustomRecord extends Parse.Object<t> {
    constructor() {
        super(className, {});
    }
}

Parse.Object.registerSubclass(className, CustomRecord);
