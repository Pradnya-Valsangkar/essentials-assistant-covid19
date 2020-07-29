import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView, 
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import ValidationComponent from 'react-native-form-validator';
import { connect } from 'react-redux';
import {userRegistration} from '../lib/fetch-data-from-API'
import {userID} from '../lib/utils'

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  outerView: {
    backgroundColor: '#FFF',
    width: '100%',
    height: '100%',
  },
  inputsView: {
    backgroundColor: '#F1F0EE',
    padding: 16,
    padding: 22,
  },
  timingView: {
    backgroundColor: '#F1F0EE',
    flexDirection:'row',
    justifyContent: 'space-between',
    paddingLeft:10,
    paddingRight:50
  },
  label: {
    fontFamily: 'IBMPlexSans-Medium',
    color: '#000',
    fontSize: 14,
    paddingBottom: 5,
  },
  textInput: {
    fontFamily: 'IBMPlexSans-Medium',
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#1062FE',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 16,
    overflow: 'hidden',
    padding: 12,
    textAlign: 'center',
    marginTop: 15,
  },
  timeButton:{
    backgroundColor: '#33AFFF',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 16,
    overflow: 'hidden',
    padding: 12,
    textAlign: 'center',
    marginTop: 15,
    marginLeft:30,
    borderRadius:50,
    width:150
  },
  registerButton: {
    backgroundColor: '#33AFFF',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 16,
    overflow: 'hidden',
    padding: 12,
    textAlign: 'center',
    marginTop: 15,
    borderRadius:50,    
  }
});

class DoctorRegistration extends ValidationComponent {
  register = () => {
    let isValid = this.validate({
      name: {required: true},
      password: {required: true},
      phoneNumber: {numbers: true, required: true},
      specialization: {required: true},
      clinicEndTime: {required: true},
      clinicStartTime: {required: true},
      city: {required: true},
      consultationFees: {required: true, numbers:true},
    });
    if(isValid){
      let item = {
        deviceUniqueID : userID(),
        name : this.state.name,
        phoneNumber : this.state.phoneNumber,
        password : this.state.password,
        specialization : this.state.specialization,
        clinicStartTime : this.state.clinicStartTime,
        clinicEndTime : this.state.clinicEndTime,
        city : this.state.city,
        consultationFees : this.state.consultationFees
      }
      userRegistration("Doctor", item).then(({message}) => {
        if(message){
          console.log("doctor registraation message ",message)
          alert(message)
        }else{
          console.log("doctor reg state ",this.state)
          this.props.onCompleteRegistration()
          Alert.alert("Succes","You have registered successfully !")
        }
      }).catch(err => { 
        console.log("Error in doctor registration ",err)
      })
    }
  };
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: '',
      phoneNumber: '',
      specialization: '',
      clinicStartTime: '',
      clinicEndTime: '',
      city: '',
      consultationFees:'',
      showTimePicker:false,
      isStartTime:false,
      isEndTime:false
    };
  }

  handleConfirm = (date) => {
    console.log("In confirm time ", date)
    let min = date.getMinutes() 
    min = min >= 0 && min < 20 ? 0 : min <= 45 ? 30 : 0
    let hrs =  min > 45 ? (parseInt(date.getHours()) + 1) % 24 : parseInt(date.getHours())
    let t = (hrs * 100) + min  
    appointmentTime = "" + t
    console.log("selected clinic time : ", appointmentTime)
    if(this.state.isStartTime){
      this.setState({isStartTime:false,clinicStartTime:appointmentTime,showTimePicker:false})
    }else if(this.state.isEndTime){
      this.setState({isEndTime:false,clinicEndTime:appointmentTime,showTimePicker:false})
    }
  };

  render() {
    console.log("Doctor registration", this.state)
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.outerView}>
        <View>
            <DateTimePickerModal
            isVisible={this.state.showTimePicker}
            mode="time"
            date= {new Date()}
            onConfirm={this.handleConfirm}
            //onCancel={hideDatePicker()}
        />
        </View>
        
          <View style={styles.inputsView}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              ref="name"
              style={styles.textInput}
              value={this.state.name}
              onChangeText={name => this.setState({name})}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
            />
            {this.isFieldInError('name') &&
              this.getErrorsInField('name').map(errorMessage => (
                <Text style={{color: 'red'}}>*Please specify name</Text>
              ))}
            <Text style={styles.label}>Specialization</Text>
            <TextInput
              ref="name"
              style={styles.textInput}
              value={this.state.specialization}
              onChangeText={specialization => this.setState({specialization})}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
            />
            {this.isFieldInError('specialization') &&
              this.getErrorsInField('specialization').map(errorMessage => (
                <Text style={{color: 'red'}}>
                  *Please specify specialization
                </Text>
              ))}
            <Text style={styles.label}>Phone number</Text>
            <TextInput
              keyboardType={'phone-pad'}
              style={styles.textInput}
              value={this.state.phoneNumber}
              onChangeText={phoneNumber => this.setState({phoneNumber})}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
            />
            {this.isFieldInError('phoneNumber') &&
              this.getErrorsInField('phoneNumber').map(errorMessage => (
                <Text style={{color: 'red'}}>*Please specify phoneNumber</Text>
              ))}
            <Text style={styles.label}>Select Clinic/Available Timings</Text>
            <View style={styles.timingView}>
              <TextInput
                ref="clinicStartTime"
                style={styles.textInputDisabled }
                value={this.state.clinicStartTime}
                returnKeyType='send'
                enablesReturnKeyAutomatically={true}
                placeholder='Select start time'
                editable={false}
              />
              <TouchableOpacity onPress={() =>this.setState({isStartTime:true,showTimePicker:true})}>
                <Text style={styles.timeButton}>Start Time</Text>
              </TouchableOpacity>
            </View>
            {
              this.isFieldInError('clinicStartTime') &&
              this.getErrorsInField('clinicStartTime').map(errorMessage => (
                <Text style={{color: 'red'}}>*Please specify clinic start time</Text>
              ))
              }
            <View style={styles.timingView}>
              <TextInput
                  ref="clinicEndTime"
                  style={styles.textInputDisabled}
                  value={this.state.clinicEndTime}
                  returnKeyType='send'
                  enablesReturnKeyAutomatically={true}
                  placeholder='Select end time'
                  editable={false}
                />
              <TouchableOpacity onPress={() =>this.setState({isEndTime:true,showTimePicker:true})}>
                <Text style={styles.timeButton}>End Time</Text>
              </TouchableOpacity>
              
            </View>
            {
              this.isFieldInError('clinicEndTime') &&
              this.getErrorsInField('clinicEndTime').map(errorMessage => (
                <Text style={{color: 'red'}}>*Please specify clinic end time</Text>
              ))
              }
            {this.isFieldInError('clinicTimings') &&
              this.getErrorsInField('clinicTimings').map(errorMessage => (
                <Text style={{color: 'red'}}>
                  *Please specify clinicTimings
                </Text>
              ))}

            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.textInput}
              value={this.state.city}
              onChangeText={city => this.setState({city})}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
            />
            {this.isFieldInError('city') &&
              this.getErrorsInField('city').map(errorMessage => (
                <Text style={{color: 'red'}}>
                  *Please specify city
                </Text>
              ))}

            <Text style={styles.label}>Consultation Fees</Text>
            <TextInput
              keyboardType={'phone-pad'}
              style={styles.textInput}
              value={this.state.consultationFees}
              onChangeText={consultationFees => this.setState({consultationFees})}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
            />
            {this.isFieldInError('consultationFeesv') &&
              this.getErrorsInField('consultationFees').map(errorMessage => (
                <Text style={{color: 'red'}}>
                  *Please specify consultation fees
                </Text>
              ))}

            <Text style={styles.label}>Set Password</Text>
            <TextInput
              style={styles.textInput}
              value={this.state.password}
              onChangeText={password => {this.setState({password})}}
              returnKeyType="send"
              secureTextEntry={true}
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
            />
            {this.isFieldInError('password') &&
              this.getErrorsInField('password').map(errorMessage => (
                <Text style={{color: 'red'}}>*Please set your password</Text>
              ))}
            <TouchableOpacity onPress={this.register}>
              <Text style={styles.registerButton}>Register</Text>
            </TouchableOpacity>
            
          </View>          
        </ScrollView>
      </SafeAreaView>
    );
  }
}

DoctorRegistration = connect(mapStateToProps, mapDispatchToProps)(DoctorRegistration);

function mapStateToProps(state) {
  return {
    isLoading: state.auth.isLoading,
    isSignedIn: state.auth.isSignedIn,
    isNewUser: state.auth.isNewUser,
    isLoading: state.auth.isLoading,
    role: state.auth.role,
    phoneNumber: state.auth.phoneNumber,
    password: state.auth.password,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    setLoginDetails: (phoneNumber, password) => dispatch({ type: 'setLoginDetails' }),
    onSignOut: () => dispatch({ type: 'onSignOut' }),
    onRegisterUser: () => dispatch({ type: 'onRegisterUser' }),
    onCompleteRegistration: () => dispatch({ type: 'onCompleteRegistration' }),
    onCompleteLoading: () => dispatch({ type: 'onCompleteLoading' })
  };
};

export default DoctorRegistration;