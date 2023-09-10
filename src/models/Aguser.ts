import { RecordToType } from 'parse-server';
import AgUserSchema from '../schema/AgUser.schema';

type t = RecordToType<typeof AgUserSchema.fields>;
export default class Aguser extends Parse.Object<t> {
    constructor() {
        super('aguser', {});
    }
}

Parse.Object.registerSubclass('aguser', Aguser);
