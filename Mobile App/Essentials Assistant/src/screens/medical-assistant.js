import React from 'react';
import PatientPage from './patient-page'
import DoctorPage from './doctor-page'

class MedicalAssistant extends React.Component
{
  render(){
    console.log("In Medical Assistant ",this.props)
    if(this.props.auth.role === "Doctor"){ 
      return(
        <DoctorPage auth={this.props}/>
      )
    }else{
      return(
        <PatientPage auth={this.props}/>
      )
    }
  }  
}

export default MedicalAssistant;