import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from "react";
import { Text, Button } from "react-native";
import { connect, Provider } from 'react-redux';
import { persistStore } from 'redux-persist';
import { PersistGate } from 'redux-persist/integration/react';
import LoginScreen from './src/screens/login-screen';
import configureAuthStore from './configure-auth-store';
import LoadingScreen from './src/screens/loading';
import UserRegistration from './src/screens/user-registration'
import DoctorRegistration from './src/screens/DoctorRegistration'
import GroceryRegistration from './src/screens/grocery-registration'
import App from './App'

const store = configureAuthStore();
let persistor = persistStore(store);
const Stack = createStackNavigator();

console.disableYellowBox = true;

class AuthStackNavigator extends React.Component {
  constructor(props) {
    super(props);
  }

  render(){
    console.log("In Login app ",this.props)
    return (
      <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <Stack.Navigator >
      {
        this.props.isLoading ? (
          <Stack.Screen name='Loading' component={LoadingScreen} 
          />
        ) :this.props.isNewUser && this.props.role ==="Consumer" ?(
          <Stack.Screen name='Register' component={UserRegistration}
          options={{
            headerLeft: () => (
              <Button title="Back" onPress={() => this.props.onCompleteRegistration()}>
                <Text style={{color: 'white' }}>Back</Text>
              </Button>
            )
          }} 
          />
        ):this.props.isNewUser && this.props.role ==="Doctor"?(
          <Stack.Screen name='Register' component={DoctorRegistration}
          options={{
            headerLeft: () => (
              <Button title="Back" onPress={() => this.props.onCompleteRegistration()}>
                <Text style={{color: 'white' }}>Back</Text>
              </Button>
            )
          }} 
          />
        ):this.props.isNewUser && this.props.role ==="Service Provider"?(
          <Stack.Screen name='Register' component={GroceryRegistration}
          options={{
            headerLeft: () => (
              <Button title="Back" onPress={() => this.props.onCompleteRegistration()}>
                <Text style={{color: 'white' }}>Back</Text>
              </Button>
            )
          }} 
          />
        ) :!this.props.isSignedIn ? (
          <Stack.Screen name='Essentials Assistant' component={LoginScreen} />
        ) : (
              <Stack.Screen name='Essentials Assistant' component={App}
                options={{
                  headerRight: () => (
                    <Button title="Log out" onPress={() => this.props.onSignOut()}>
                      <Text style={{color: 'white'}}>LogOut</Text>
                    </Button>
                  )
                }} 
              />
        )
      }
      </Stack.Navigator>
      </PersistGate>
      </Provider>
    );
  }
}

AuthStackNavigator = connect(mapStateToProps, mapDispatchToProps)(AuthStackNavigator);

export default function LoginApp() {

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer independent={true}>
          <AuthStackNavigator></AuthStackNavigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  )
}

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