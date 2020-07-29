import React from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import { connect } from 'react-redux';

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF'
  },
  image: {
    height: '50%',
    width: '50%',
    resizeMode: 'center'
  },
  title: {
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 18,
    color: '#323232'
  }
});

class Loading extends React.Component {
  render()
  {
    console.log("In Loading ",this.props)
    setTimeout(
      function() {
        this.props.onCompleteLoading()
      }
      .bind(this),
      1000
    );
    return(
      <View style={styles.center}>
      <Image style={styles.image}
        source={require('../images/logo-512.png')}
      />
      <Text style={styles.title}>loading...</Text>
    </View>
    )
    
  }
}

Loading = connect(mapStateToProps, mapDispatchToProps)(Loading);

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

export default Loading;