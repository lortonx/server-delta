import './Roles';
import { SchemaMigrations } from 'parse-server';
// List of schemas
import AgUserSchema from './AgUser.schema';
import BmcDonationSchema from './BmcDonation.schema';
import PlanScema from './Plan.schema';
import UserSchema from './User.schema';
import SubscriptionSchema from './Subscription.schema';
import UserSubscriptionSchema from './UserSubscription.schema';
import CustomRecord from './CustomRecord.schema';
// End list of schemas
export const schemas: SchemaMigrations.JSONSchema[] = [
    UserSchema,
    AgUserSchema,
    PlanScema,
    BmcDonationSchema,
    UserSubscriptionSchema,
    SubscriptionSchema,
    CustomRecord
];
