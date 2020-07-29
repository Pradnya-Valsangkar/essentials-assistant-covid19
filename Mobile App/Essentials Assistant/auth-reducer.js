import {GetLoginDetails} from './src/screens/login-screen'
import {GetUserRole} from './src/screens/login-screen'


const initialUserState = {
    isLoading:true,
    isSignedIn:false,
    isNewUser:false,
    role:"",
    phoneNumber:"",
    password:"",
    latitude:"",
    longitude:"",
    address:"",
    city:""
  }

const authReducer = (state= initialUserState, action) =>{
    let loginDetails = GetLoginDetails()
    let userRole = GetUserRole()
    console.log("authReducer ",JSON.stringify(userRole))
    switch(action.type)
    {
      case 'setLoginDetails': 
      return{
        ...state,
        isSignedIn:true,
        isNewUser:false,
        role:loginDetails.role,
        phoneNumber:loginDetails.phoneNumber,
        password:loginDetails.password,
        latitude:loginDetails.latitude,
        longitude:loginDetails.longitude,
        address:loginDetails.address,
        city:loginDetails.city
        };
      case 'onRegisterUser':
        return{
          ...state,
          isNewUser:true
        }
      case 'onCompleteRegistration':
        return{
          ...state,
          isNewUser:false
        }
        case 'setUserRole':
        return{
          ...state,
          role: userRole.role
        }
      case 'onCompleteLoading':
        return{
          ...state,
          isLoading:false
        }
      case 'onSignOut':
        return{
          ...state,
          isSignedIn:false,
          isNewUser:false,
          isLoading:true,
          phoneNumber:"",
          password:"",
          role:"",
          latitude:"",
          longitude:"",
          address:"",
          city:""
          };
    }
    return state;
}

export default authReducer;