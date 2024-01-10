// This file contain duplicate types from Parse-Server that are not yet updated

declare module 'parse-server' {
    export default class {
        constructor(...args: any[]);
        start(): void;
        static createLiveQueryServer(...args: any[]): void;
    }

    export class ParseGraphQLServer {
        constructor(...args: any[]);
    }

    export namespace SchemaMigrations {
        export interface SchemaOptions {
            definitions: JSONSchema[];
            strict?: boolean;
            deleteExtraFields?: boolean;
            recreateModifiedFields?: boolean;
            lockSchemas?: boolean;
            beforeMigration?: () => void | Promise<void>;
            afterMigration?: () => void | Promise<void>;
        }

        export type FieldValueType =
            | 'String'
            | 'Boolean'
            | 'File'
            | 'Number'
            | 'Relation'
            | 'Pointer'
            | 'Date'
            | 'GeoPoint'
            | 'Polygon'
            | 'Array'
            | 'Object'
            | 'ACL';

        interface FieldInterface<T extends Parse.Object> {
            type: FieldValueType;
            targetClass?: string;
            p?: T;
            required?: boolean;
            defaultValue?: number | string | unknown;
        }

        type ClassNameType<T extends string> = '_User' | '_Role' | T;

        export interface ProtectedFieldsInterface {
            [key: string]: string[];
        }

        interface FieldsInterface {
            [key: string]: FieldInterface<Parse.Object>;
        }

        export interface IndexInterface {
            [key: string]: number;
        }

        export interface IndexesInterface {
            [key: string]: IndexInterface;
        }

        export type CLPOperation = 'find' | 'count' | 'get' | 'update' | 'create' | 'delete';
        type CLPPermission = 'requiresAuthentication' | '*' | `user:${string}` | `role:${string}`;
        type CLPInfo = { [key: string]: boolean };
        type CLPData = { [key: string]: CLPOperation[] };
        type CLPValue = { [key: string]: boolean };
        type CLPInterface = { [key: string]: CLPValue };

        export interface CPLsInterface {
            find?: CLPInterface;
            count?: CLPInterface;
            get?: CLPInterface;
            update?: CLPInterface;
            create?: CLPInterface;
            delete?: CLPInterface;
            addField?: CLPInterface;
            protectedFields?: ProtectedFieldsInterface;
        }

        export interface JSONSchema {
            fields: FieldsInterface;
            indexes: IndexesInterface;
            classLevelPermissions: CPLsInterface;
        }

        export interface MigrationsOptions {
            schemas: JSONSchema[];
            strict: boolean;
            deleteExtraFields: boolean;
            recreateModifiedFields: boolean;
        }

        export class CLP {
            static allow(perms: CLPData): CLPInterface;
        }

        function makeSchema<T extends JSONSchema, CN extends string>(
            className: ClassNameType<CN>,
            schema: T
        ): T & { className: ClassNameType<CN> };
    }

    interface FieldTypeToType<L> {
        String: string;
        Boolean: boolean;
        File: Parse.File;
        Number: number;
        Relation: Parse.Relation<any>;
        Pointer: L;
        Date: Date;
        GeoPoint: Parse.GeoPoint;
        Polygon: Parse.Polygon;
        Array: any[];
        Object: any;
        ACL: Parse.ACL;
    }

    export type RecordToType<T extends SchemaMigrations.FieldsInterface> = Partial<{
        [K in keyof T]: FieldTypeToType<T[K]['p']>[T[K]['type']];
    }> & {
        objectId?: string;
    } & Omit<Parse.Attributes, string>;
}
