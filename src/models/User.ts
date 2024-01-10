import { RecordToType } from 'parse-server';
import schema from '../schema/User.schema';

Parse.User.allowCustomUserClass(true);

type t = RecordToType<typeof schema.fields>;
export default class User extends Parse.User<t> {
    get defaultCurrency(): string {
        return this.get('defaultCurrency');
    }

    set defaultCurrency(currency: string) {
        this.set('defaultCurrency', currency);
    }

    get locale(): string {
        return this.get('locale');
    }

    set locale(locale: string) {
        this.set('locale', locale);
    }
}

Parse.Object.registerSubclass('_User', User);
