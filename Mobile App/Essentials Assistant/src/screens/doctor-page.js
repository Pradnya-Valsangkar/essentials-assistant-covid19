import * as React from 'react';
import { StyleSheet, Alert, Text, View, Button, FlatList, TouchableOpacity, Linking, Platform } from 'react-native';  
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { connect, Provider } from 'react-redux'
import ConfigureStore from './configure-store'
import Videocall from './video-call'
import { createStackNavigator } from '@react-navigation/stack';
import { getDoctorNotify, createConfirmAppointment, getAppointmentSchedule } from '../lib/fetch-data-from-API'
import { getTimeSlot, getModifyAppointment } from "../lib/medicalAssistantUtils"

const store = ConfigureStore();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  button:{
    fontFamily: 'Calibri',
    fontSize: 20,
    overflow: 'hidden',
    padding: 10,
    textAlign: 'center',
    width:180
  }, 
  flatListView: {
    backgroundColor: '#FFF',
  },
  itemTouchable: {
    flexDirection: 'column',
    padding: 15,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderBottomColor: '#dddddd',
    borderBottomWidth: 0.25,
  },
  appointmentButtonsView: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginTop:10,
    marginRight:50
  },
  newAppointmentButtonsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft:210,
  },
  itemView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 22,
    fontFamily: 'IBMPlexSans-Medium',
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    color: 'gray',
  },
  acceptButton: {
    backgroundColor: '#008000',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 14,
    overflow: 'hidden',
    padding: 5,
    textAlign: 'center',
    marginTop: 5,
    marginRight:10
  },
  rejectButton: {
    backgroundColor: '#FF0000',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 14,
    overflow: 'hidden',
    padding: 5,
    textAlign: 'center',
    marginTop: 5,
  },
  cancelButton: {
    backgroundColor: '#FF0000',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 14,
    overflow: 'hidden',
    padding: 5,
    textAlign: 'center',
    marginTop: 5,
    marginLeft:100,
    
  }  
});

const exportData = {}

class NewAppointment extends React.Component{

  updateNotify = (props, msg) => {
    console.log("from time new appointment"+ props.fromTime+ "sd")
    let am = (props.fromTime.split("  ")[1]).trim()
    console.log("new appoint am = "+am)
    let adder = am === "AM" ? 0 : 1200
    let time = props.fromTime.split(' ')[0]
    time = time.replace(':','')
    let appointmentTime =  time < 1200 ? parseInt(time) + adder : parseInt(time)
    item ={
      userName: props.patientName,
      userPhoneNumber: props.contact,
      appointmentDate :props.date,
      appointmentTime, 
      msg,
      compareTime : getTimeSlot(appointmentTime),
      isCancelType:false
    }
    createConfirmAppointment(item).then((res) => {
      console.log(res)
      props.parentClass.refreshList()
      alert("You have "+msg+" the appointment")
    })
  }

  render(){
    console.log("In New Appointment ", this.props)
    return (
      <TouchableOpacity style={styles.itemTouchable}
          onPress={() => { Alert.alert(this.props.patientName+" selected") }}>
        <View style={styles.itemView}>
            <Text style={styles.itemName}>{this.props.patientName}</Text>
        </View>

        <View style={styles.itemView}>
            <Text style={styles.itemDescription}>{this.props.date}</Text>
            <Text style={styles.itemDescription}>{this.props.fromTime} - {this.props.toTime}</Text>
        </View>

        <View style={styles.newAppointmentButtonsView}>
            <TouchableOpacity onPress= {() => { this.updateNotify(this.props, "accepted") }}>
            <Text style={styles.acceptButton}>Accept</Text>
            </TouchableOpacity>
         
            <TouchableOpacity onPress= {() => { this.updateNotify(this.props, "rejected") }}>
            <Text style={styles.rejectButton}>Reject</Text>
            </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }
};

NewAppointment = connect(mapStateToProps, dispatchStateToProps)(NewAppointment);

class HistoryAppointmentDetails extends React.Component {
  
  render(){
    return (
      <TouchableOpacity style={styles.itemTouchable}
          onPress={() => { alert("selected") }}>
        <View style={styles.itemView}>
            <Text style={styles.itemName}>{this.props.patientName}</Text>
        </View>

        <View style={styles.itemView}>
            <Text style={styles.itemDescription}>{this.props.date}</Text>
            <Text style={styles.itemDescription}>{this.props.fromTime} - {this.props.toTime}</Text>
        </View>  
      </TouchableOpacity>
    );
  }
};

class Appointment extends React.Component {
    
  storeAppointmentDetails = ({id}) => {
    exportData.appointment = {id}
    this.props.setVideoCallData()
  }

  updateNotify = (props, msg) => {
    console.log("from time booked appointment"+ props.fromTime)
    let am = (props.fromTime.split("  ")[1]).trim()
    console.log("booked appoint am = "+am)
    let adder = am === "AM" ? 0 : 1200
    let time = props.fromTime.split(' ')[0]
    time = time.replace(':','')
    let appointmentTime =  time < 1200 ? parseInt(time) + adder : parseInt(time)
    item ={
      userName: props.userName,
      userPhoneNumber: props.userPhoneNumber,
      appointmentDate :props.date,
      appointmentTime, 
      msg,
      compareTime : getTimeSlot(appointmentTime),
      isCancelType:true
    }
    createConfirmAppointment(item).then((res) => {
      console.log(res)
      props.parentClass.refreshList()
      alert("You have "+msg+" the appointment")
    })
  }

  render(){
    console.log("In Appointment ", this.props)
    return (
      <TouchableOpacity style={styles.itemTouchable}
          onPress={() => { alert("selected") }}>
        <View style={styles.itemView}>
            <Text style={styles.itemName}>{this.props.userName}</Text>
        </View>

        <View style={styles.itemView}>
            <Text style={styles.itemDescription}>{this.props.date}</Text>
            <Text style={styles.itemDescription}>{this.props.fromTime} - {this.props.toTime}</Text>
        </View>

        <View style={styles.appointmentButtonsView}>
            {/* <TouchableOpacity onPress= {() => { navigation.navigate('Map', { item: props }); }}>
                <Text style={styles.acceptButton}>Chat</Text>
            </TouchableOpacity> */}
            <TouchableOpacity onPress= {() => { call(this.props.userPhoneNumber) }}>
                <Text style={styles.acceptButton}>Phone Call</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress= {() =>  { this.storeAppointmentDetails(this.props)}}>
                <Text style={styles.acceptButton}>Video Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress= {() => { this.updateNotify(this.props, "rejected") }}>
                <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
        </View>        
      </TouchableOpacity>
    );
  }
};

Appointment = connect(mapStateToProps, dispatchStateToProps)(Appointment);

export class NewRequests extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      refreshing : false,
      newRequestList: []
    }
  }

  getPendingNotify = () =>{
    const doctorNotify = getDoctorNotify()
    return doctorNotify.then((notifyData) => {
      console.log("result from pending REquest list", notifyData)
      let pending = notifyData.filter(({type}) => type === "request")
      pending = pending.map(({data}) => {
            return ({ 
            date: data.date,
            fromTime: data.time.split('-')[0],
            toTime: data.time.split('-')[1],
            contact: data.userPhoneNumber,
            patientName: data.userName 
          });
          })
        return pending
    }).catch(err => {
      console.log(err);
      return []
    });
  }

  getAppointmentList = () => {
    this.getPendingNotify().then((app) => {
      this.setState({newRequestList:app,refreshing:false})
      console.log("in state data ", this.state)
    }).catch(err => {
      console.log(err);
      this.setState({appointments:[],refreshing:false})
    });
    }
  
  componentDidMount () {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      console.log("in foucus listener New Request call")
      this.setState({refreshing:true})
      this.getAppointmentList()
    });
  }
  
  refreshList = () => {
    this.setState({
      refreshing : true
    }, () => {
      this.getAppointmentList()
    })
  }

  emptyList = () => {
    return(
      <View style={styles.MainContainer}>
        <Text style={{ textAlign: 'center' }}>No New Requests Found</Text>
      </View>
    )
  }

  render(){
    console.log("In NewRequest ", this.props)
    return (
      <View>
          <FlatList style={styles.flatListView}
            data={this.state.newRequestList}
            renderItem={({ item }) => <NewAppointment parentClass={this} {...item} />}
            keyExtractor={item => item.id || item.recordid}
            refreshing={this.state.refreshing}
            onRefresh={this.refreshList}
            ListEmptyComponent={this.emptyList}
          />
      </View>
    );
  }
}
 
export class MyAppointments extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      appointments:[],
      refreshing:false          
    }
  }

  getScheduledData = () =>{ 
    console.log("calling getScheduleData") 
    const appFunc = getAppointmentSchedule("Upcoming")
      appFunc.then((app) => {
        console.log("in doctor app list result", app)
        let updatedAppList = app.map((data) => {
          return ({
            ...data,
            ...getModifyAppointment(data)
          })
        })

        console.log("Doctors appointments: ",updatedAppList)
        this.setState({appointments:updatedAppList,refreshing:false})
        console.log("in state data ", this.state)
      }).catch(err => {
      console.log(err);
      this.setState({appointments:[],refreshing:false})
    });
  }

  componentDidMount(){
    const { navigation } = this.props;
    console.log("componetDidMount Called -> MyAppointments")
    this.focusListener = navigation.addListener('focus', () => {
      console.log("in foucus listener MyAppointments call")
      this.setState({refreshing:true})
      this.getScheduledData()
    });
  }

  refreshList = () => {
    this.setState({
      refreshing : true
    }, () => {
      this.getScheduledData()
    })
  }

  emptyList = () => {
    return(
      <View style={styles.MainContainer}>
        <Text style={{ textAlign: 'center' }}>No Appointments Found</Text>
      </View>
    )
  }

  render(){
    console.log("In MyAppointments ", this.props)
    return (
      <View>
        <FlatList style={styles.flatListView}
          data={this.state.appointments}
          renderItem={({ item }) => <Appointment parentClass={this} {...item} />}
          keyExtractor={item => item.id || item.recordid}
          refreshing={this.state.refreshing}
          onRefresh={this.refreshList}
          ListEmptyComponent={this.emptyList}
        />
      </View>
    );
  }
}

MyAppointments = connect(mapStateToProps, dispatchStateToProps)(MyAppointments);

class HistoryAppointments extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      refreshing : false,
      appointmentList : []
    }
  }

  getAppointmentList = () => {
    getAppointmentSchedule().then((app) => {
      let updatedAppList = app.map((data) => {
        return ({
          ...data,
          ...getModifyAppointment(data)
        })
      })
      this.setState({appointments:updatedAppList,refreshing:false})
      console.log("in state data ", this.state)
    }).catch(err => {
      console.log(err);
      this.setState({appointments:[],refreshing:false})
    });
  }

  componentDidMount () {
    console.log("props in HistoryAppointments", this.props)
    const { navigation } = this.props;
    console.log("componetDidMount Called -> HistoryAppointments")
    this.focusListener = navigation.addListener('focus', () => {
      console.log("in foucus listener HistoryAppointments call")
      this.setState({refreshing:true})
      this.getAppointmentList()
    });
  }

  refreshList = () => {
    this.setState({
      refreshing : true
    }, () => {
      this.getAppointmentList()
    })
  }

  emptyList = () => {
    return(
      <View style={styles.MainContainer}>
        <Text style={{ textAlign: 'center' }}>No History Appointments Found</Text>
      </View>
    )
  }
  
  render(){
    return (
      <View>
        <FlatList style={styles.flatListView}
          data={this.state.appointmentList}
          renderItem={({ item }) => <HistoryAppointmentDetails {...item} />}
          keyExtractor={item => item.id || item.recordid}
          refreshing={this.state.refreshing}
          onRefresh={this.refreshList}
          ListEmptyComponent={this.emptyList}
        />
      </View>
    );
  }
}

HistoryAppointments = connect(mapStateToProps, dispatchStateToProps)(HistoryAppointments);

function call(phoneNumber) {
  if (Platform.OS === 'android') {
    phoneNumber = 'tel:' + phoneNumber;
  }
  else {
    phoneNumber = 'telprompt:' + phoneNumber;
  }
  Linking.openURL(phoneNumber);
}

const Tab = createMaterialTopTabNavigator();

class MyTabs extends React.Component {
  render(){
    console.log("In My Tabs ", this.props)
    return (
      <Tab.Navigator
        initialRouteName="DoctorPage"
        tabBarOptions={{
          activeTintColor: '#000080', //navy blue
          labelStyle: {fontSize: 16},
          style: {backgroundColor: 'powderblue'},
        }}>
        <Tab.Screen
          name="New Requests"
          component={NewRequests}
          options={{tabBarLabel: 'New Requests'}}
        />
        <Tab.Screen
          name="My Schedule"
          component={MyAppointments}
          options={{tabBarLabel: 'My Schedule'}}
        />
        <Tab.Screen
            name="History"
            component={HistoryAppointments}
            options={{ tabBarLabel: 'History' }}
          />
      </Tab.Navigator>
    );
  }
}

MyTabs = connect(mapStateToProps, dispatchStateToProps)(MyTabs);

const Stack = createStackNavigator();

class SwitchScreens extends React.Component {
  render() {
    console.log("In SwitchScreens ",this.props)
    console.log("store data ",store.getState())
    return (
        <Stack.Navigator independent={true}>
          {this.props.startVideoCall ?(
            <Stack.Screen name='Video Call' component={() => <Videocall appointment={exportData.appointment} vc={this.props}/>} />
          ):(
            <Stack.Screen name='Remote Medical Assistant' component={() => <MyTabs/>} />
          )
          }
        </Stack.Navigator>
    )
  }
}

SwitchScreens = connect(mapStateToProps, dispatchStateToProps)(SwitchScreens);

export default class DoctorPage extends React.Component{
  render()
  {
    console.log("In Doctor Page ", this.props)
    return (
      <Provider store={store}>
        <SwitchScreens></SwitchScreens>
      </Provider>
    );
  }
}

function mapStateToProps(state) {
  console.log(" Doctor page Map State ",state)
  return {
    bookAppointment: state.appointment.bookAppointment,
    startVideoCall: state.videocall.startVideoCall
    
  }
}

function dispatchStateToProps(dispatch) {
  return {
    setBookAppointmentVisibility: () => dispatch({ type: 'setBookAppointmentVisibility' }),
    resetBookAppointmentVisibility: () => dispatch({ type: 'resetBookAppointmentVisibility' }),
    setVideoCallData: () => dispatch({ type: 'setVideoCallData' }),
    resetVideoCallData: () => dispatch({ type: 'resetVideoCallData' })
  }
}