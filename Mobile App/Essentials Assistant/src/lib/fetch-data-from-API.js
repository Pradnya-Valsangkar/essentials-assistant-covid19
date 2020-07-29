import Config from 'react-native-config';
import {GetAuthenticationInfo} from '../../App'
import {userID} from "./utils";


let serverUrl = Config.STARTER_KIT_SERVER_URL;
if (serverUrl.endsWith('/')) {
  serverUrl = serverUrl.slice(0, -1)
}

export const getUserDetails = () => {
  const {auth} = GetAuthenticationInfo()
  console.log("user data in redux ",auth)
  return {
    phoneNumber:auth.phoneNumber,
    role:auth.role,
    address: auth.address,
    latitude:auth.latitude,
    longitude:auth.longitude,
    password:auth.password,
    city:auth.city
  }
}
  
export const listOfDoctors = () => {
  console.log("Call to List of doctors")
  const loginDetails = getUserDetails()
  let position = {
    lat : loginDetails.latitude,
    lng : loginDetails.longitude
  };
  let positionString = JSON.stringify(position)
  const posit = position ? `position=${positionString}` : '';
 
  return fetch(`${serverUrl}/api/doctorList?${posit}`, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText || response.message || response.status);
    } else {
      return response.json();
    }
  });
};

export const userBookAppointment = (item) => {

  const loginDetails = getUserDetails()
  console.log("In userBookAppointment API call ",loginDetails)
  item.userPhoneNumber = loginDetails.phoneNumber
  console.log("payload data", item)
  
  return fetch(`${serverUrl}/api/modifyNotify`, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  }).then((response) => {
    console.log("response of user book app ", JSON.stringify(response))
    if (!response.ok) {
      throw new Error(response.statusText || response.message || response.status);
    } else {   
      return response.json();
    }
  });
}

export const getNotify = () => {
  const loginDetails = getUserDetails()
  const phoneNumber = `phoneNumber=${loginDetails.phoneNumber}`;
  return fetch(`${serverUrl}/api/listUserNotify?${phoneNumber}`, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText || response.message || response.status);
    } else {
      console.log("response for notify user", response)
      return response.json();
    }
  });
} 

export const getAppointmentSchedule = (upcoming) => {
  //send doctor or user
  const loginDetails = getUserDetails()
  const type = `type=${loginDetails.role}`;
  const getAppointment = upcoming ? `getAppointment=${upcoming}` : ''
  return fetch(`${serverUrl}/api/appointments/${loginDetails.phoneNumber}?${type}&${getAppointment}`, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Item not found');
      } else {
        throw new Error('Please try again. If the problem persists contact an administrator.');
      }
    } else {
      console.log("return list of appointments", response)
      return response.json()
    }
  });
}  

export const getDoctorNotify =   () => {
  const loginDetails = getUserDetails()
  const phoneNumber = `phoneNumber=${loginDetails.phoneNumber}`;
  return fetch(`${serverUrl}/api/listDoctorNotify?${phoneNumber}`, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText || response.message || response.status);
    } else {
      console.log("response for notify user", response)
      return response.json();
    }
  });
};

export const createConfirmAppointment = (item) => {
    const loginDetails = getUserDetails()
    let requestType = item.msg === "accepted"? 'Accept' : 'Reject' //query
    let type = "doctor"
    item.doctorPhoneNumber= loginDetails.phoneNumber,
    console.log("payload data", item)
    requestType = `requestType=${requestType}`;
    type = `type=${type}`
    return fetch(`${serverUrl}/api/acceptRejectNotify?${requestType}&${type}`, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item)
    }).then((response) => {
      console.log("response of user book app ", JSON.stringify(response))
      if (!response.ok) {
        throw new Error(response.statusText || response.message || response.status);
      } else {
        return response.json();
      }
    });
}

export const getGroceryCustomerList = () => {
  const loginDetails = getUserDetails()
  console.log("In API call to getGroceryCustomerList : ")
  let storePhonenumber = `storePhonenumber=${loginDetails.phoneNumber}`;
  return fetch(`${serverUrl}/api/customerList?${storePhonenumber}`, {
    method: 'GET',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText || response.message || response.status);
    } else {
      return response.json();
    }
  });
};
  
export const getTokenNumberFromGStore = (item) => {
  const loginDetails = getUserDetails()
  console.log("In API call to getTokenNumberFromGStore : ",item)
  item.customerPhoneNumber = loginDetails.phoneNumber
  item.phoneNumber = loginDetails.phoneNumber
  return fetch(`${serverUrl}/api/queueButtonClicked`, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  }).then((response) => {
    console.log("response of user token number ", JSON.stringify(response))
    if (!response.ok) {
      throw new Error(response.statusText || response.message || response.status);
    } else {
      return response.json();
    }
  });
};
  
export const getCurrentQueueNumber = (item) => {
  console.log("In API call to getCurrentQueueNumber : ",item)
  return fetch(`${serverUrl}/api/getCurrentQueueNumber`, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  }).then((response) => {
    console.log("response of queue number ", JSON.stringify(response))
    if (!response.ok) {
      throw new Error(response.statusText || response.message || response.status);
    } else {
      return response.json();
    }
  });
};

export const updateCurrentQueueNumber = () => {
  console.log("In API call to getCurrentQueueNumber : ")
  const loginDetails = getUserDetails()
  const item = {
    phoneNumber : loginDetails.phoneNumber
  }
  return fetch(`${serverUrl}/api/whenArrivedStatusClicked`, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  }).then((response) => {
    console.log("response of updated queue number ", JSON.stringify(response))
    if (!response.ok) {
      throw new Error(response.statusText || response.message || response.status);
    } else {
      return response.json();
    }
  });
};

export const loginVerification = (type, item) => {
  console.log("In API call to loginVerification : ")
  let qtype = `type=${type}`;
  return fetch(`${serverUrl}/api/login?${qtype}`, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  }).then((response) => {
    console.log("response of login verification ", JSON.stringify(response))
    if (!response.ok) {
      return response.json()// new Error(response.json())
    } else {
      return response.json()// (undefined, response.json());
    }
  })
};

export const userRegistration = (type, item) => {
  console.log("In API call to userRegistration : ")
  let qtype = `type=${type}`;
  return fetch(`${serverUrl}/api/registration?${qtype}`, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  }).then((response) => {
    console.log("response of userRegistration ", JSON.stringify(response))
    if (!response.ok) {
      return response.json()
    } else {
      return response.json();
    }
  });
};