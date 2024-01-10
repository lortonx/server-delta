import CustomRecord from '../../models/CustomRecord';

Parse.Cloud.define(
    'processCustomRecord',
    async (req) => {
        const data = req.params;
        const record = new CustomRecord();
        record.set('data', data.data);
        record.set('ip', data.ip);
        record.set('name', data.name);
        record.set('objectType', data.objectType);
        await record.save(null, { useMasterKey: true });
        return;
    },
    {
        requireUser: false
        // fields : ['objectId'],
    }
);
