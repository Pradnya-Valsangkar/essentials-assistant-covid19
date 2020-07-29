
export const AppointmentReducer = (state= { bookAppointment:false }, action) =>{
  switch(action.type){
    case 'setBookAppointmentVisibility': 
      return{bookAppointment:true}
    case 'resetBookAppointmentVisibility': 
      return{bookAppointment:false}
  }
  return state;
}

export const VideoCallReducer = (state = { startVideoCall:false }, action) =>{
  switch(action.type){
    case 'setVideoCallData':
      return{startVideoCall:true}
    case 'resetVideoCallData':
      return{startVideoCall:false}
  }
  return state;
}