import { SchemaMigrations } from 'parse-server';
import UserSchema from './User.schema';
import AgUserSchema from './AgUser.schema';
import BmcEventSchema from './BmcDonation.schema';

export const schemas: SchemaMigrations.JSONSchema[] = [UserSchema, AgUserSchema, BmcEventSchema];
