import * as React from 'react';
import { StyleSheet, Alert, Text, View, DatePicker, FlatList, TouchableOpacity, Linking, Platform} from 'react-native'; 
import { createStackNavigator } from '@react-navigation/stack';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {Provider} from 'react-redux'
import {connect} from 'react-redux'
import AppointmentBooking from './appointment-booking'
import ConfigureStore from './configure-store'
import Videocall from './video-call'
import Geolocation from '@react-native-community/geolocation';
import { listOfDoctors, getAppointmentSchedule, getNotify} from '../lib/fetch-data-from-API'
import {getModifyAppointment} from "../lib/medicalAssistantUtils"

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  appointmentButtonsView: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginTop:10,
    marginRight:160,
  },
  button: {
    fontFamily: 'Calibri',
    fontSize: 20,
    overflow: 'hidden',
    padding: 10,
    textAlign: 'center',
    width: 180
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
  contact: {
    color: 'blue',
    fontSize: 14,
    textDecorationLine: 'underline'
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
  button: {
    backgroundColor: '#008000',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 14,
    overflow: 'hidden',
    padding: 5,
    textAlign: 'center',
    marginTop: 5,
  }
});

export const exportData = {}

export const getExportData = () => {
  return exportData
}
const store = ConfigureStore();
// let persistor = persistStore(store);

class ListOfDoctors extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      refreshing : false,
      doctorList: []
    };
  }

  callDoctorList = () => {
    listOfDoctors().then(doctors => {
      console.log("in list of doctor res ",typeof doctors)
      this.setState({doctorList : JSON.parse(doctors.data), refreshing:false})
      console.log("doctor list",this.state.doctorList)
    }).catch(err => {
      console.log(err);
      this.setState({doctorList :[], refreshing:false})
    });
  }

  componentDidMount() {
    const { navigation } = this.props;
    //Adding an event listner om focus    
    this.focusListener = navigation.addListener('focus',  () => {
      console.log("in foucus listener ListOfDoctors call")
      this.setState({refreshing:true})
      this.callDoctorList()
    });  
  }

  refreshList = () => {
    this.setState({
      refreshing:true
    }, () => {
      this.callDoctorList()
    })
  }

  emptyList = () => {
    return(
      <View style={styles.MainContainer}>
        <Text style={{ textAlign: 'center' }}>No Doctors Found</Text>
      </View>
    )
  }

  render() {
    console.log("In list of doctors. ", this.props)
    return (
      <View>
        <FlatList style={styles.flatListView}
          data={this.state.doctorList}
          renderItem={({ item }) => <Doctor {...item} />}
          keyExtractor={item => item.id || item['_id'] }
          refreshing={this.state.refreshing}
          onRefresh={this.refreshList}
          ListEmptyComponent={this.emptyList}
        />
      </View>
    )
  };
}

ListOfDoctors = connect(mapStateToProps, dispatchStateToProps)(ListOfDoctors);

export class MyAppointments extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      appointments:[],
      refreshing:false          
    }
  }
  getPendingNotify = () =>{
    return getNotify().then((notifyData) => {
      console.log("result from pending list", notifyData)
      let pending = notifyData.filter(({type}) => type === "pending")
      pending = pending.map(({data}) => {
           return ({  
           pending:true,
           date: data.date,
           fromTime: data.time.split('-')[0],
           toTime: data.time.split('-')[1],
           doctorPhoneNumber: data.doctorPhoneNumber,
           doctorName: data.doctorName });
         })
       return pending
    }).catch(err => {
      console.log(err);
      return []
    });
  
  }

  getScheduledData = () =>{ 
    console.log("calling getScheduleData") 
    const appFunc = getAppointmentSchedule("Upcoming")
    const pendingNotifyFunc = this.getPendingNotify()
    pendingNotifyFunc.then((pendingNotify) => {
      appFunc.then((app) => {
        let updatedAppList = app.map((data) => {
          return ({
            ...data,
            ...getModifyAppointment(data)
          })
        })
        updatedAppList = pendingNotify.concat(updatedAppList)
        this.setState({appointments:updatedAppList,refreshing:false})
        console.log("in state data ", this.state)
      })
     
    }).catch(err => {
      console.log(err);
      this.setState({appointments:[],refreshing:false})
    });
  }

  componentDidMount(){
    console.log("componetDidMount Called -> MyAppointments")
    const { navigation } = this.props;
    //Adding an event listner om focus    
    this.focusListener = navigation.addListener('focus',  () => {
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
    
    console.log("In My Appointment ",this.props)
    return (
        <View>
            <FlatList style={styles.flatListView}
            data={this.state.appointments}
            renderItem={({ item }) => <Appointment {...item} />}
            keyExtractor={item => item.id || item.recordid}
            refreshing={this.state.refreshing}
            onRefresh={this.refreshList}
            ListEmptyComponent={this.emptyList}
          />
        </View> 
    );
  }
}

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
    const { navigation } = this.props;
    //Adding an event listner om focus
    this.focusListener = navigation.addListener('focus',  () => {
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
          renderItem={({ item }) => <HistoryAppointment {...item} />}
          keyExtractor={item => item.id || item.recordid}
          refreshing={this.state.refreshing}
          onRefresh={this.refreshList}
          ListEmptyComponent={this.emptyList}
        />
      </View>
    );
  }
}

class Doctor extends React.Component {
  
  callBookAppointment = (data) => {
      console.log("Inside callBookappointment")
      exportData.currentDr = {
        ...data
      }
      this.props.setBookAppointmentVisibility()
  }

  render() {
    console.log("In Doctor. ", this.props)
    return (
      <TouchableOpacity style={styles.itemTouchable}
        onPress={() => { Alert.alert(this.props.name + " selected") }}>
        <View style={styles.itemView}>
          <Text style={styles.itemName}>{this.props.name}</Text>
          <Text style={styles.itemDescription}>{this.props.specialisation}</Text>
        </View>
        <Text style={styles.itemDescription}>Consultation Fees: {this.props.consultationFees}</Text>
        <View style={styles.itemView}>
          <TouchableOpacity
            onPress={() => call(this.props.phoneNumber)}>
            <Text style={styles.contact}>Contact: {this.props.phoneNumber}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {this.callBookAppointment(this.props)}}>
            <Text style={styles.button}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  };
};

Doctor = connect(mapStateToProps, dispatchStateToProps)(Doctor);

class Appointment extends React.Component {

  storeAppointmentDetails = ({id}) => {
    exportData.appointment = {id}
    this.props.setVideoCallData()
  }

  render(){
    console.log("In Appointment ",this.props)
    return (
      <TouchableOpacity style={styles.itemTouchable}
        onPress={() => { alert("selected") }}>
        <View style={styles.itemView}>
          <Text style={styles.itemName}>{this.props.doctorName}</Text>
  
        </View>
        <View style={styles.itemView}>
          <Text style={styles.itemDescription}>{this.props.date}</Text>
          <Text style={styles.itemDescription}>{this.props.fromTime} - {this.props.toTime}</Text>
        </View>
        {
          this.props.pending ? (
            <Text style={styles.itemDescription}>Waiting for the doctor's approval.</Text>
          ):(
            <View style={styles.appointmentButtonsView}>
              {/* <TouchableOpacity onPress= {() => { navigation.navigate('Map', { item: props }); }}>
                  <Text style={styles.acceptButton}>Chat</Text>
              </TouchableOpacity> */}
              <TouchableOpacity onPress= {() => { call(this.props.contact) }}>
                  <Text style={styles.acceptButton}>Phone Call</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress= {() => {this.storeAppointmentDetails(this.props) }}>
                  <Text style={styles.acceptButton}>Video Call</Text>
              </TouchableOpacity>
          </View> 
          )
        }
      </TouchableOpacity>
    );
  }
};

Appointment = connect(mapStateToProps,dispatchStateToProps)(Appointment)

class HistoryAppointment extends React.Component {
  render(){
    return (
      <TouchableOpacity style={styles.itemTouchable}
        onPress={() => { alert("selected") }}>
        <View style={styles.itemView}>
          <Text style={styles.itemName}>{this.props.doctorName}</Text>
  
        </View>
        <View style={styles.itemView}>
          <Text style={styles.itemDescription}>{this.props.date}</Text>
          <Text style={styles.itemDescription}>{this.props.fromTime} - {this.props.toTime}</Text>
        </View>
      </TouchableOpacity>
    );
  }
};

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
  
  render() {
    console.log("In my tab ", this.props)
    return (
      <Tab.Navigator
        initialRouteName="Doctors"
        tabBarOptions={{
          activeTintColor: '#000080', //navy blue
          labelStyle: { fontSize: 16 },
          style: { backgroundColor: 'powderblue' },
        }} 
        >
        <Tab.Screen
          name="Doctors"
          component={ListOfDoctors}
          options={{ tabBarLabel: 'Doctors' }}
        />
        <Tab.Screen
          name="My Schedule"
          component={MyAppointments}
          options={{ tabBarLabel: 'My Schedule' }}
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
          {this.props.bookAppointment ? (
              <Stack.Screen name='Book Appointment' component={() => <AppointmentBooking book={this.props}/>} />
          ):this.props.startVideoCall ?(
            <Stack.Screen name='Video Call' component={() => <Videocall appointment={exportData.appointment} vc={this.props}/>} />
          ):(
            <Stack.Screen name='Remote Medical Assistant' component={() => <MyTabs/>} />
          )}
        </Stack.Navigator>
    )
  }
}

SwitchScreens = connect(mapStateToProps, dispatchStateToProps)(SwitchScreens);

class PatientPage extends React.Component{
  constructor(props){
    super(props)
    this.props=this.props.auth
  }
  render(){
    console.log("In Patient Page ",this.props.auth)
    return (
      <Provider store={store}>
        <SwitchScreens></SwitchScreens>
      </Provider>
    );
  }
}

function mapStateToProps(state) {
  console.log(" Patient page Map State ",state)
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

export default  PatientPage;