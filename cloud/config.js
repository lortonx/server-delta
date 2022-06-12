module.exports = {
    processUserDataInterval: 1*1*60*60*1000,
    get ts(){
        const date = new Date()
        const Utctime = (date.getTime() + date.getTimezoneOffset()*60*1000);
        return Utctime
    },
    get date(){
        return new Date().toISOString()
    }
}