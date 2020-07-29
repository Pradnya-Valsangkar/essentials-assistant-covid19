
const underscore = require('underscore')
const moment = require('moment')

const notifyTemp = {
    type: "",
    data : {}
}

const addNotify = (data, notifyBodyItem, otherdata, notifyType) => {
        let s = notifyTemp
        console.log("otherdata", notifyType, otherdata)
        if (notifyType && notifyType == "request")
        {
            s.type = notifyType 
            s.data = {
                date : notifyBodyItem.date,
                time : notifyBodyItem.ts,
                userPhoneNumber : notifyBodyItem.userPhoneNumber
            }
            if (otherdata) {
                otherdata = JSON.parse(otherdata)
                console.log("username", otherdata[0].name)
                s.data.userName = otherdata[0].name
            }
        } else if (notifyType && notifyType == "pending") {
            s.type = notifyType
            s.data = {
                date : notifyBodyItem.date,
                time : notifyBodyItem.ts,
                doctorPhoneNumber : notifyBodyItem.doctorPhoneNumber,
                doctorName : notifyBodyItem.doctorName
            }
        }
        data['notify'].push(s)
    return data
}

const removeNotifyAndUpdateSchedules = (data, req) => {
    data.notify = data.notify.filter((notifyArrayItem) => {
        return !(notifyArrayItem.data.time === req.body.compareTime &&
             notifyArrayItem.data.date === req.body.appointmentDate) 
    })
    
    // calculating date 
    if (req.query.type === 'doctor' && req.query.requestType === 'Accept') {
        console.log('*********inside')
        let requestDate = new Date(req.body.appointmentDate).getDate()
        let finalDate = new Date(new Date());
        let tomorrowDate = new Date(finalDate.setDate(finalDate.getDate() + 1)).getDate();
        let dayAfterTomorrowDate = new Date(finalDate.setDate(finalDate.getDate() + 1)).getDate();
        if (requestDate == tomorrowDate) {
            data['scheduleTomorrow'].push(req.body.appointmentTime)
        } else if (requestDate === dayAfterTomorrowDate) {
            data['scheduleDATomorrow'].push(req.body.appointmentTime)
        } else {
            data['scheduleToday'].push(req.body.appointmentTime)
        }
    }
    return data
}

const convertedDateTimeStamp = function convertedDateTimeStamp(req) {
    if (req.body.appointmentTime.length < 4) {
        console.log("Time Format needs to be in 24 Hour Format");
    } else {
        let myformat = req.body.appointmentDate + " " + req.body.appointmentTime.toString().substr(0, 2) + ":" + req.body.appointmentTime.toString().substr(2, 4);
        var datum = moment(myformat, "DD-MM-YYYY hh:mm").format('x')
        console.log("New time stap in ms", datum)
        req.body.numericDateTimetamp = datum;
    }
    return req
}

module.exports = {
    addNotify,
    removeNotifyAndUpdateSchedules,
    convertedDateTimeStamp
}