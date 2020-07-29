import * as React from 'react';
import 'react-native-gesture-handler';
import {Button} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from './src/screens/home';
import Chat from './src/screens/chat';
import SearchResources from './src/screens/resources-search';
import AddResource from './src/screens/resource-add';
import EditResource from './src/screens/resource-edit';
import MyResources from './src/screens/resources-my';
import Map from './src/screens/map';
import {
  HomeIcon,
  DonateIcon,
  SearchIcon,
  MapIcon,
  CheckedIcon
} from './src/images/svg-icons';
import NearByEssentials from './src/screens/nearby-essentials';
import MedicalAssistant from './src/screens/medical-assistant';
import { connect } from 'react-redux';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import ListOfCustomers from './src/screens/grocery-customer-list'


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();


const ResourcesStackOptions = ({navigation}) => {
  return {
    headerRight: () => (
      <Button onPress={() => navigation.navigate('Chat')} title="Chat " />
    ),
  };
};

const DonationsStackOptions = ({navigation}) => {
  return {
    headerRight: () => (
      <Button
        onPress={() => navigation.navigate('Add Donation')}
        title="Add "
      />
    ),
  };
};

const tabBarOptions = {
  //showLabel: false,
  activeTintColor: '#1062FE',
  inactiveTintColor: '#000',
  style: {
    backgroundColor: '#F1F0EE',
    paddingTop: 5,
  },
};

const authInfo = {}
export function GetAuthenticationInfo(){
  console.log("In GetAuthenticationInfo", authInfo)
  return authInfo
}

class TabLayout extends React.Component{
  render(){
    console.log("In Mytab ", this.props)
    return(
      
      <Tab.Navigator
        style={{paddingTop: 50}}
        initialRouteName="Home"
        tabBarOptions={tabBarOptions}>
        <Tab.Screen
          name="Home"
          component={HomeLayout}
          options={{
            tabBarIcon: ({color}) => <HomeIcon fill={color} />,
          }}
        />
        {
          this.props.role === 'Service Provider' &&
        <Tab.Screen
          name="Customers"
          component={CustomersLayout}
          options={{
            tabBarIcon: ({color}) => <DonateIcon fill={color} />,
          }}
        />
        }
        <Tab.Screen
          name="Find Essentials"
          component={NearByEssentialsLayout}
          options={{
            tabBarIcon: ({color}) => <SearchIcon fill={color} />,
          }}
        />
        <Tab.Screen
          name="Medical Assistant"
          component={ () => <MedicalAssistantLayout />}
          options={{
            title:"Medical Assistant",
            tabBarIcon: ({color}) => <CheckedIcon fill={color} />,
          }}
        />
        <Tab.Screen
          name="Donate"
          component={DonateStackLayout}
          options={{
            tabBarIcon: ({color}) => <MapIcon fill={color} />,
          }}
        />
        <Tab.Screen
          name="Search Donations"
          component={SearchStackLayout}
          options={{
            tabBarIcon: ({color}) => <SearchIcon fill={color} />,
          }}
        />
      </Tab.Navigator>
    )
  }
}

TabLayout = connect(mapStateToProps, mapDispatchToProps)(TabLayout);

const HomeLayout = () => (
  <Stack.Navigator>
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="Chat" component={Chat} />
  </Stack.Navigator>
);

class MedicalAssistantLayout extends React.Component{
  render()
  {
    console.log("In Medical Ass layout ",this.props)
    return(
      <Stack.Navigator>
        <Stack.Screen name="Remote Medical Assistant" component={ () => <MedicalAssistant auth={this.props}/>} />
      </Stack.Navigator>
    ); 
  }
}

MedicalAssistantLayout = connect(mapStateToProps, mapDispatchToProps)(MedicalAssistantLayout);

const NearByEssentialsLayout = () => (
  
  <Stack.Navigator>
    <Stack.Screen name="Nearby Essentials" component={NearByEssentials} />
  </Stack.Navigator>
);

const CustomersLayout = () => (
  <Stack.Navigator>
    <Stack.Screen name="Customer List" component={ListOfCustomers} />
  </Stack.Navigator>
);

const DonateStackLayout = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="My Donations"
      component={MyResources}
      options={DonationsStackOptions}
    />
    <Stack.Screen name="Add Donation" component={AddResource} />
    <Stack.Screen name="Edit Donation" component={EditResource} />
  </Stack.Navigator>
);

const SearchStackLayout = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Search Resources"
      component={SearchResources}
      options={ResourcesStackOptions}
    />
    <Stack.Screen name="Chat" component={Chat} />
    <Stack.Screen name="Map" component={Map} />
  </Stack.Navigator>
);

function checkGPS()
{
  RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
      .then(data => {
        //enabled
      }).catch(err => {
        //not enabled
        alert("Please on your GPS to get the service.")
      })
}
class App extends React.Component {
    render()
    {
      console.log("In App ", this.props)
      authInfo.auth = this.props
      console.log("In App auth", authInfo)
      checkGPS()
      return (
        <NavigationContainer independent={true}>
          <TabLayout/>
        </NavigationContainer>
      );
    }
};

App = connect(mapStateToProps, mapDispatchToProps)(App);

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
    address : state.auth.address    
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

export default App;