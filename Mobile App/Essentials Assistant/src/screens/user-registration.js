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
import ValidationComponent from 'react-native-form-validator';
import {connect} from 'react-redux';
import {userID} from '../lib/utils'
import {userRegistration} from '../lib/fetch-data-from-API'

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
});


class UserRegistration extends ValidationComponent {
  register = () => {
    var isValid= this.validate({
      name: {required: true},
      password: {required: true},
      phoneNumber: {numbers: true, required: true, isNumber:true},
    });
    if(isValid)
    {
      console.log("user reg state ",this.state)
      let item = {
        deviceUniqueID :userID(),
        name : this.state.name,
        phoneNumber :this.state.phoneNumber,
        password :this.state.password
      }
      userRegistration("Consumer", item).then(({message}) => {
        if(message)
        {
          console.log("user registraation message ",message)
          alert(message)
        }else{
          this.props.onCompleteRegistration()
          Alert.alert("Succes","You have registered successfully !")
        }
      }).catch(err => { 
        console.log("Error in user registration ",err)
      })
    }   
  };
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      password: '',
      phoneNumber: '',
    };
  }

  render() {
    console.log("In Register User ",this.props)
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.outerView}>
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

UserRegistration = connect(mapStateToProps, mapDispatchToProps)(UserRegistration);

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

export default UserRegistration;