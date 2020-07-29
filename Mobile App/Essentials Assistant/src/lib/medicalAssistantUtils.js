import moment from "moment"


export const getTimeSlot = (t) => {
  t =  t.toString().length === 3? "0" +t.toString() : t.toString()
  let hr1 = parseInt(t.toString().substr(0,2))
  let min1 = t.toString().substr(2,4)
  let hr2 = parseInt(min1) + 30 < 60 ? hr1 : hr1 + 1
  let timeAM = hr1 >= 12 ? "PM" :"AM"
  hr1 = hr1 > 12 ? hr1 - 12 : hr1

  let sec = "00"
  let time1 = hr1+":"+min1+"  "+timeAM

  let timeAM2 = hr2 >= 12 ? "PM" :"AM"
  hr2 = hr2 > 12 ? hr2 - 12 : hr2
  let min2 =  parseInt(min1) + 30 < 60 ? parseInt(min1) + 30 : parseInt(min1) + 30 - 60
  min2 = min2 === 0 ? "00" : min2 
  let time2 = hr2+":"+min2+"  "+timeAM2
  let time = time1+" - "+time2
  return time
} 

  
export const getTimeSlotsFromStartTime = (list) =>{
  const timeSlots = []

    for(let t of list)
    {
      timeSlots.push(getTimeSlot(t))
    }
    return timeSlots
}

const getStartTimeList = (startTime, endTime) =>{
  const startTimeList = []
  startTime = (startTime.toString().length === 3) ? "0" + startTime : startTime
  let hr = startTime.toString().substr(0,2)
  let min =  startTime.toString().substr(2,4)
  let time = hr+min

  while(parseInt(time) < parseInt(endTime))
  {
    if(parseInt(time) !== parseInt(endTime))
    {
      startTimeList.push(+time)
    }
    let newhr = parseInt(min) + 30 < 60 ? parseInt(hr) : parseInt(hr) + 1
    let newmin =  parseInt(min) + 30 < 60 ? parseInt(min) + 30 : parseInt(min) + 30 - 60

    newmin = newmin === 0 ? "00" : newmin 
    time = newhr+""+newmin      
      
    hr = parseInt(newhr)
    min = parseInt(newmin)
  }
  return startTimeList
}

export const getAvailableTimeSlots = (startTime, endTime, bookedStartTimeList, date) => {

  let availableTimeSlots = []
  let allStartTimeList = []
  allStartTimeList = getStartTimeList(startTime,endTime)
    if(bookedStartTimeList === [])
    {
        availableTimeSlots = getTimeSlotsFromStartTime(allStartTimeList)
    }
    else
    {
        let availableStartTimeList = allStartTimeList.filter((item) => bookedStartTimeList.indexOf(item) === -1);
        availableTimeSlots = getTimeSlotsFromStartTime(availableStartTimeList)
    }
    availableTimeSlots = availableTimeSlots.map(x => {
      return ({ ts: x, date });
    })
    return availableTimeSlots
}

export const getModifyAppointment = (appObject) => {
    let timestamp = appObject.appointmentDateTime
    console.log("timestampo", timestamp)
    let datetime1 = moment(timestamp, "x").format("DD-MM-YYYY hhmm")
    console.log("datetime1",datetime1)
    let date = datetime1.split(' ')[0]
    let time = datetime1.split(' ')[1]
    time = getTimeSlot(time)
    let fromTime = (time.split('-')[0]).trim()
    let toTime = (time.split('-')[1]).trim() 
    return {date, fromTime, toTime}    
}