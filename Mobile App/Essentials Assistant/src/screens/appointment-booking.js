import React from 'react'
import { StyleSheet, Alert, Text, View, FlatList, TouchableOpacity, Platform } from 'react-native';
import { getAvailableTimeSlots } from "../lib/medicalAssistantUtils"
import { ScrollView } from 'react-native-gesture-handler';
import moment from "moment"
import {getExportData, exportData} from "../screens/patient-page"
import {userBookAppointment} from "../lib/fetch-data-from-API"

const timeSlot = {}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  flatListView: {
    backgroundColor: '#e6e6e6',
  },
  itemTouchable: {
    flexDirection: 'column',
    padding: 15,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderBottomColor: '#dddddd',
    borderBottomWidth: 0.25,
  },
  contact: {
    color: 'blue',
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  timeslotView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: "#D3D3D3",
    marginTop: 5,

  },
  itemView: {
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  itemName: {
    fontSize: 22,
    fontFamily: 'IBMPlexSans-Medium',
    // textShadowColor:'#585858',
    // textShadowOffset:{width: 5, height: 5},
    // textShadowRadius:10,
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    color: 'gray',
  },
  itemDescription: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Medium',
    color: 'gray',
  },
  button: {
    backgroundColor: '#008000',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 18,
    overflow: 'hidden',
    padding: 10,
    textAlign: 'center',
    marginTop: 5,
    borderRadius: 50,
    margin: 80,
  },
})

class TimeSlot extends React.Component {

  renderSelectTime = ({sts, ts, date}) => {
    timeSlot.data = {ts, date}
    sts()
    console.log("time data" , timeSlot.data)
    //alert(data.ts + " selected")
  }

  render() {
    console.log("In time slot ", this.props)

    return (
      <TouchableOpacity style={styles.itemTouchable}
        onPress={() => { this.renderSelectTime(this.props) }}>
        <View style={{ borderWidth: 2, borderRadius: 50, marginLeft: 30, marginRight: 70 }}>
          <Text style={styles.itemDescription}>    {this.props.ts}</Text>
        </View>
      </TouchableOpacity>
    );
  }
};

class Appointment extends React.Component {

  render() {
    console.log("In appointment ", this.props)
    return (
      <TouchableOpacity style={styles.itemTouchable}
        onPress={() => { alert("selected") }}>
        <View style={styles.itemView}>
          <Text style={styles.itemName}>{this.props.date}</Text>
        </View>
        <View>
          <FlatList style={styles.timeslotView}
            data={this.props.timeSlots}
            renderItem={({ item }) => <TimeSlot sts={this.props.sts} {...item} />}
            keyExtractor={item => item.id || item.recordid}
          />
        </View>
      </TouchableOpacity>
    );
  }
};

export default class AppointmentBooking extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      selectedTimeSlot:{}
    }
  }

  setUserAppointment = () => {
    //updateDB
    console.log("setUserAppointment")
    const payload = {
      doctorName:this.currentDr.name,
      doctorPhoneNumber:this.currentDr.phoneNumber,
      ...timeSlot.data
    };
    console.log("user selected payload", payload)
    userBookAppointment(payload).then((data) => {
      console.log("t result", data)
      alert("Your appointment has been sent to doctor.")
      delete exportData.currentDr
      delete timeSlot.data
      console.log("user time", timeSlot)
    })
    this.props.book.resetBookAppointmentVisibility()
  }

  updateTimeSlot = () => {
    console.log("Updating the timeslot state")
    this.setState({selectedTimeSlot:{...timeSlot.data}})
  }
  render() {
    const slotData = this.getThreeDates()
    console.log("In Appointment book ", this.props)
    return (
      <ScrollView>
        <View>
          <FlatList style={styles.flatListView}
            data={slotData}
            renderItem={({ item }) => <Appointment sts={this.updateTimeSlot} {...item} />}
            keyExtractor={item => item.id || item.recordid}
          />
        </View>
        <View style={{ marginTop: 50 }}>
          <TouchableOpacity disabled = {timeSlot.data === undefined} onPress={() => { this.setUserAppointment() }}>
            <Text style={styles.button}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  getThreeDates = () =>{
    const exportDataloc = getExportData()
    this.currentDr = exportDataloc.currentDr
    console.log("patient page currentDr", this.currentDr)
    const timeSlotsData = []
    let today = moment(new Date()).format('DD-MM-YYYY');
    console.log("entry _____________" ,timeSlotsData)
   
    timeSlotsData.push({id:"1", date:today, timeSlots:getAvailableTimeSlots(this.currentDr.clinicStartTime, this.currentDr.clinicEndTime, this.currentDr.scheduleToday, today)})
    console.log("entry _____________" ,timeSlotsData)
    let tomorrow = new Date();
    tomorrow = moment(tomorrow).add(1, 'day').format('DD-MM-YYYY');
    timeSlotsData.push({id:"2", date:tomorrow, timeSlots:getAvailableTimeSlots(this.currentDr.clinicStartTime, this.currentDr.clinicEndTime, this.currentDr.scheduleTomorrow, tomorrow)})
    console.log("entry _____________" ,timeSlotsData)

    let dayAfterTomorrow = new Date();
    dayAfterTomorrow = moment(dayAfterTomorrow).add(2, 'day').format('DD-MM-YYYY');
    timeSlotsData.push({id:"3", date:dayAfterTomorrow, timeSlots:getAvailableTimeSlots(this.currentDr.clinicStartTime, this.currentDr.clinicEndTime, this.currentDr.scheduleDATomorrow, dayAfterTomorrow)})
    console.log("entry _____________" ,timeSlotsData)

    console.log("\nToday "+today+"\nTomorrow "+tomorrow+"\nDay after tomorrow "+dayAfterTomorrow);
    return timeSlotsData
  }
}