import { SchemaMigrations } from 'parse-server';

export default SchemaMigrations.makeSchema('BmcDonation', {
    fields: {
        id: { type: 'Number', defaultValue: 0 },
        amount: { type: 'Number', defaultValue: 0 },
        status: { type: 'String' },
        message: { type: 'String' },
        currency: { type: 'String' },
        created_at: { type: 'Date' },
        note_hidden: { type: 'String' },
        refunded: { type: 'Boolean', defaultValue: false },
        refunded_at: { type: 'Date' },
        support_note: { type: 'String' },
        support_type: { type: 'String' },
        supporter_name: { type: 'String' },
        transaction_id: { type: 'String' },
        application_fee: { type: 'Number' },
        supporter_email: { type: 'String' },
        total_amount_charged: { type: 'Number', defaultValue: 0 },
        support: { type: 'Pointer', targetClass: 'BmcSupport' },
        usedAt: { type: 'Date' },
        usedBy: { type: 'Pointer', targetClass: '_User' }
    },
    indexes: {
        supporter_email: { supporter_email: 1 }
    },
    classLevelPermissions: {
        ...SchemaMigrations.CLP.allow({
            ['role:Administrator']: ['count', 'create', 'delete', 'find', 'get', 'update']
        })
    }
});

// class Monster extends Parse.Object {
//     constructor() {
//       // Pass the ClassName to the Parse.Object constructor
//       super('Monster');
//       // All other initialization
//       this.sound = 'Rawr';
//     }

//     hasSuperHumanStrength() {
//       return this.get('strength') > 18;
//     }

//     static spawn(strength) {
//       const monster = new Monster();
//       monster.set('strength', strength);
//       return monster;
//     }
//   }
