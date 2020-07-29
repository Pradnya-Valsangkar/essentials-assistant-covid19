import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import ValidationComponent from 'react-native-form-validator';
import { CheckedIcon, UncheckedIcon } from '../images/svg-icons';
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
  label: {
    fontFamily: 'IBMPlexSans-Medium',
    color: '#000',
    fontSize: 14,
    paddingBottom: 5,
  },
  selector: {
    fontFamily: 'IBMPlexSans-Medium',
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 10,
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
  outerView: {
    backgroundColor: '#FFF',
    width: '100%',
    height: '100%',
  },
  inputsView: {
    backgroundColor: '#F1F0EE',
    padding: 22,
  },
  label: {
    fontFamily: 'IBMPlexSans-Medium',
    color: '#000',
    fontSize: 16,
    paddingBottom: 5,
  },
  selector: {
    fontFamily: 'IBMPlexSans-Medium',
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  textInput: {
    fontFamily: 'IBMPlexSans-Medium',
    backgroundColor: '#fff',
    padding: 8,
    marginBottom: 10,
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
    marginBottom: 10,
  },
  checkboxLabel: {
    fontFamily: 'IBMPlexSans-Light',
    fontSize: 13,
  },
});

class GroceryRegistration extends ValidationComponent {
  
  register = () => {
    var isValid = this.validate({
      ownerName: {required: true},
      nameOfStore: {required: true},
      storeLocation: {required: true},
      password: {required: true},
      phoneNumber: {numbers: true, required: true},
    });
    console.log('Name of owner: ' + this.state.ownerName);
    console.log('Name of store: ' + this.state.nameOfStore);
    console.log('Location of store: ' + this.state.storeLocation);
    console.log('password: ' + this.state.password);
    console.log('Phone number: ' + this.state.phoneNumber);
    if (this.state.useLocation) {
      console.log('uselocation ');
      if (
        (this.state.latitude === '' && this.state.longitude === '') ||
        (this.state.latitude === undefined &&
          this.state.longitude === undefined)
      ) {
        alert('Please wait till getting your location');
        isValid = false
      }
    } else {
      console.log('not uselocation ');
      if (this.state.address === '' || this.state.address === undefined) {
        alert('Please specify the address');
        isValid = false
      }
    }
    if(isValid){
      let item = {
        deviceUniqueID : userID(),
        name : this.state.ownerName,
        phoneNumber : this.state.phoneNumber,
        password : this.state.password,
        nameOfStore : this.state.nameOfStore,
        address : this.state.address,
        latitude: this.state.latitude,
        longitude: this.state.longitude,
      }
      userRegistration("Service Provider", item).then(({message}) => {
        if(message)
        {
          console.log("doctor registraation message ",message)
          alert(message)
        }else{
          console.log("Service provider reg state ",this.state)
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
      ownerName:'',
      nameOfStore: '',
      password: '',
      useLocation: true,
      latitude: '',
      longitude: '',
      address: '',
      phoneNumber: '',
    };
  }

  getUserLocation = () => {
    console.log('In get location ');

    Geolocation.getCurrentPosition(
      position => {
        let latitude = JSON.stringify(position.coords.latitude);
        let longitude = JSON.stringify(position.coords.longitude);
        if (
          latitude != undefined &&
          longitude != undefined &&
          latitude != '' &&
          longitude != ''
        ) {
          this.setState({latitude: latitude, longitude: longitude});
        }
      },
      error => {
        //Alert.alert(error.message)
      },
      {enableHighAccuracy: true, timeout: 30000, maximumAge: 1000},
    );
  };

  toggleUseLocation = () => {
    if (!this.state.useLocation) {
      this.setState({address: ''});
    }
    this.setState({useLocation: !this.state.useLocation});
  };

  render() {
    console.log("In GroceryRegistration ",this.props)
    this.getUserLocation();
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.outerView}>
          <View style={styles.inputsView}>
          <Text style={styles.label}>Name of Owner</Text>
            <TextInput
              ref="ownerName"
              style={styles.textInput}
              value={this.state.ownerName}
              onChangeText={ownerName => this.setState({ownerName})}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
            />
            {this.isFieldInError('ownerName') &&
              this.getErrorsInField('ownerName').map(errorMessage => (
                <Text style={{color: 'red'}}>
                  *Please specify name of owner
                </Text>
              ))}
            <Text style={styles.label}>Name of Store</Text>
            <TextInput
              ref="nameOfStore"
              style={styles.textInput}
              value={this.state.nameOfStore}
              onChangeText={nameOfStore => this.setState({nameOfStore})}
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
            />
            {this.isFieldInError('nameOfStore') &&
              this.getErrorsInField('nameOfStore').map(errorMessage => (
                <Text style={{color: 'red'}}>
                  *Please specify name of store
                </Text>
              ))}
            <Text style={styles.label}>Location</Text>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity onPress={this.toggleUseLocation}>
              {(this.state.useLocation)
                  ?
                  <CheckedIcon height='18' width='18'/>
                  :
                  <UncheckedIcon height='18' width='18'/>
              }
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}> Use my current location </Text>
            </View>
            {this.state.useLocation ? (
              <TextInput
                ref="latitude"
                style={
                  this.state.useLocation
                    ? styles.textInputDisabled
                    : styles.textInput
                }
                value={this.state.latitude + ',' + this.state.longitude}
                returnKeyType="send"
                enablesReturnKeyAutomatically={true}
                placeholder="street address, city, state"
                editable={!this.state.useLocation}
              />
            ) : (
              <TextInput
                ref="address"
                style={
                  this.state.useLocation
                    ? styles.textInputDisabled
                    : styles.textInput
                }
                value={this.state.address}
                onChangeText={t => this.setState({address: t})}
                //onSubmitEditing={sendItem}
                returnKeyType="send"
                enablesReturnKeyAutomatically={true}
                placeholder="street address, city, state"
                editable={!this.state.useLocation}
              />
            )}
            <Text style={styles.label}>Phone Number</Text>
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
                <Text style={{color: 'red'}}>*Please specify phone number</Text>
              ))}
            <Text style={styles.label}>Set Password</Text>
            <TextInput
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

GroceryRegistration = connect(mapStateToProps, mapDispatchToProps)(GroceryRegistration);

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

export default GroceryRegistration;