import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  Picker
} from 'react-native';
import { CheckedIcon, UncheckedIcon } from '../images/svg-icons';
import { connect } from 'react-redux';
import Geolocation from '@react-native-community/geolocation';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import ValidationComponent from 'react-native-form-validator';
import { ScrollView } from 'react-native-gesture-handler';
import {loginVerification} from '../lib/fetch-data-from-API'

const styles = StyleSheet.create({
  outerView: {
    backgroundColor: '#FFF',
    width: '100%',
    height: '100%',
  },
  inputsView: {
    backgroundColor: '#F1F0EE',
    padding: 22,
  },
  roleView: {
    backgroundColor: '#F1F0EE',
    flexDirection:'row',
    justifyContent: 'space-between',
    paddingLeft:22,
    paddingRight:22
  },
  registerView: {
    backgroundColor: '#F1F0EE',
    padding: 16,
    marginTop:35,
    justifyContent: 'flex-end',
  },
  title: {
    fontFamily: 'IBMPlexSans-Medium',
    color: '#000',
    fontSize: 20,
    paddingBottom: 5,
  },
  label: {
    fontFamily: 'IBMPlexSans-Medium',
    color: '#000',
    fontSize: 16,
    paddingBottom: 5,
  },
  roleLabel: {
    fontFamily: 'IBMPlexSans-Medium',
    color: '#000',
    fontSize: 16,
    paddingBottom: 5,
    marginTop:12
  },
  selector: {
    fontFamily: 'IBMPlexSans-Medium',
    backgroundColor: '#fff',
  },
  textInput: {
    fontFamily: 'IBMPlexSans-Medium',
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#008000',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 16,
    overflow: 'hidden',
    padding: 12,
    textAlign: 'center',
    marginTop: 15,
    borderRadius:50
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
    borderRadius:50
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  checkboxLabel: {
    fontFamily: 'IBMPlexSans-Light',
    fontSize: 13
  }
});

var userRoles = ["Consumer","Doctor","Service Provider"]

const loginDetails = {}
export const GetLoginDetails = () => {
  console.log("Login details ",JSON.stringify(loginDetails))
  return loginDetails
}

const roleDetails = {}
export const GetUserRole = () => {
  console.log("User role details  ",JSON.stringify(roleDetails))
  return roleDetails
}

const exportRoleDetails = ({role}) => {
  roleDetails.role = role
}

const exportLoginDetails = ({role, phoneNumber, password, latitude, longitude, address, city}) => {
  loginDetails.role = role,
  loginDetails.phoneNumber = phoneNumber,
  loginDetails.password = password,
  loginDetails.latitude = latitude,
  loginDetails.longitude = longitude,
  loginDetails.address = address,
  loginDetails.city = city
}

class LoginScreen extends ValidationComponent {

  constructor(props){
    super(props);
    this.state = {
      role : this.props.role,  
      phoneNumber : this.props.phoneNumber,
      password : this.props.password,
      useLocation : true,
      latitude : this.props.latitude,
      longitude : this.props.longitude,
      address : this.props.address    
    }
  }
  setLoginData = () => {
    console.log("On login ",this.state)
    let isValid =false
    isValid = this.validate({
      phoneNumber: {required: true,numbers:true,maxNumber:11,minLength:10},
      password: {required: true},     
    });
    if(this.state.useLocation){
      console.log("uselocation ")
      if((this.state.latitude === "" && this.state.longitude === "") || (this.state.latitude === undefined && this.state.longitude === undefined))
      {
        alert("Please wait till getting your location")
        isValid = false
      }
    }else{
      console.log("not uselocation ")
      if(this.state.address === "" || this.state.address === undefined){
        alert("Please specify the address")
        isValid = false
      }
    }
    if(isValid){
      let item = {
        phoneNumber: this.state.phoneNumber,
        password: this.state.password,
        address: this.state.address || undefined,
        latitude: this.state.latitude,
        longitude: this.state.longitude
      }
      loginVerification(this.state.role, item).then(({message, city, latitude, longitude, address}) => {
        if (message) {
          console.log("Error msg in login veri...", message)
          alert(message)
        }else {
          console.log("Login verification result ",address)
          this.setState({city, latitude, longitude, address})
          console.log(JSON.stringify(this.state))
          exportLoginDetails(this.state)
          var userData = this.props.setLoginDetails()
          console.log("User data in redux ",userData)
        }
      })
    }
  } 

  onRoleSelect = (userRole) => {
    console.log("role ",userRole)
    this.setState({role:userRole})
    exportRoleDetails({role:userRole})
    this.props.setUserRole()
  }

  getUserLocation = () =>{
    console.log("In get location ")
    Geolocation.getCurrentPosition(
			position => {
        let latitude = JSON.stringify(position.coords.latitude)
        let longitude = JSON.stringify(position.coords.longitude)
        if(latitude != undefined && longitude != undefined && latitude != "" && longitude != "")
        {
          this.setState({latitude:latitude,longitude:longitude})
        }
			},
      error => {//Alert.alert(error.message)
      },
			{ enableHighAccuracy: true, timeout: 30000, maximumAge: 1000 }
    );
  }
  
  checkGPS(){
    console.log("Checking GPS...")
    RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
        .then(data => {
          //enabled
        }).catch(err => {
          //not enabled
          alert("Please on your GPS to get the service.")
        })
  }

  toggleUseLocation = () => {
    if (!this.state.useLocation) {
        this.setState({address:""})
    }
    this.setState({useLocation:!this.state.useLocation});
  };

  render(){
    this.checkGPS()
    this.getUserLocation()
    console.log("In Login screen ",this.props)
    console.log("Login screen state ",this.state)
    
    return (
      <ScrollView>
        <View style={styles.outerView}>
          <View style={styles.inputsView}>
           <Text style={styles.title}>Sign In</Text>
          </View>

          <View style={styles.roleView}>
            <Text style={styles.roleLabel}>Select Role</Text>
            <Picker
            //mode="dropdown"
            style={styles.selector}
            value={this.state.role}
            selectedValue={this.state.role}
            style={{ width: 150 }}
            enablesReturnKeyAutomatically={true}
            blurOnSubmit={false}
            onValueChange={(role) => this.onRoleSelect(role)}
            >
            <Picker.Item label={userRoles[0]} value={userRoles[0]}/>
            <Picker.Item label={userRoles[1]} value={userRoles[1]}/>
            <Picker.Item label={userRoles[2]} value={userRoles[2]}/>
            </Picker>
          </View>

          <View style={styles.inputsView}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              keyboardType={'phone-pad'}
            ref="phoneNumber"
              style={styles.textInput}
              value={this.state.phoneNumber}
              onChangeText={phoneNumber => this.setState({phoneNumber})}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
            />
            {this.isFieldInError('phoneNumber') &&
              this.getErrorsInField('phoneNumber').map(errorMessage => (
                <Text style={{color: 'red'}}>*Please specify phone number</Text>
              ))}
            <Text style={styles.label}>Password</Text>
            <TextInput
              ref="password"
              style={styles.textInput}
              value={this.state.password}
              onChangeText={password => this.setState({password})}
              returnKeyType="send"
              secureTextEntry={true}
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
            />
            {this.isFieldInError('password') &&
              this.getErrorsInField('password').map(errorMessage => (
                <Text style={{color: 'red'}}>*Please set your password </Text>
              ))}
            <Text style={styles.label}>Location</Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity onPress={this.toggleUseLocation}>
                {
                  (this.state.useLocation)
                    ?
                    <CheckedIcon height='18' width='18'/>
                    :
                    <UncheckedIcon height='18' width='18'/>
                }
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}> Use my current location </Text>
            </View>
            {this.state.useLocation ?(
                <TextInput
                ref="latitude"
                style={this.state.useLocation ? styles.textInputDisabled : styles.textInput}
                value={this.state.latitude+","+this.state.longitude}
                returnKeyType='send'
                enablesReturnKeyAutomatically={true}
                placeholder='street address, city, state'
                editable={!this.state.useLocation}
              />
            ):(
            <TextInput
              ref="address"
              style={this.state.useLocation ? styles.textInputDisabled : styles.textInput}
              value={this.state.address}
              onChangeText={(t) => this.setState({address:t})}
              //onSubmitEditing={sendItem}
              returnKeyType='send'
              enablesReturnKeyAutomatically={true}
              placeholder='street address, city, state'
              editable={!this.state.useLocation}
            />)}
            
            <TouchableOpacity onPress={this.setLoginData}>
              <Text style={styles.loginButton}>Login</Text>
            </TouchableOpacity>
          </View>
        
          <View style={styles.registerView}>
            <Text style={styles.label}>New User?</Text>
            <TouchableOpacity onPress={() => this.props.onRegisterUser()}>
                <Text style={styles.registerButton}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>  
    );
  }
};

LoginScreen = connect(mapStateToProps, mapDispatchToProps)(LoginScreen);

function mapStateToProps(state) {
  return {
    isLoading: state.auth.isLoading,
    isSignedIn: state.auth.isSignedIn,
    isNewUser: state.auth.isNewUser,
    isLoading: state.auth.isLoading,
    role: state.auth.role,
    phoneNumber: state.auth.phoneNumber,
    password: state.auth.password,
    latitude: state.auth.latitude,
    longitude: state.auth.longitude,
    address:state.auth.address,
  };
};

function mapDispatchToProps(dispatch) {
  return {
    setLoginDetails: (phoneNumber, password) => dispatch({ type: 'setLoginDetails' }),
    onSignOut: () => dispatch({ type: 'onSignOut' }),
    onRegisterUser: () => dispatch({ type: 'onRegisterUser' }),
    onCompleteRegistration: () => dispatch({ type: 'onCompleteRegistration' }),
    onCompleteLoading: () => dispatch({ type: 'onCompleteLoading' }),
    setUserRole: () => dispatch({ type: 'setUserRole' })
  };
};

export default LoginScreen;