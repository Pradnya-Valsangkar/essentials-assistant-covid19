import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {createStackNavigator} from '@react-navigation/stack';

const styles = StyleSheet.create({
  center: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF'
  },
  scroll: {
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 25,
    paddingTop: 20
  },
  image: {
    alignSelf: 'flex-start',
    height: '15%',
    width:'100%',
    resizeMode: 'contain'
  },
  title: {
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 34,
    color: '#323232',
     paddingBottom: 10
  },
  subtitle: {
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 22,
    color: '#323232',
    textDecorationColor: '#D0E2FF',
    textDecorationLine: 'underline',
    paddingBottom: 5,
  },
  content: {
    fontFamily: 'IBMPlexSans-Light',
    color: '#323232',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 18
  },
  buttonGroup: {
    flex: 1,
    flexDirection:'row',
    justifyContent:'space-between'
  },
  button: {
    backgroundColor: '#1062FE',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 16,
    overflow: 'hidden',
    padding: 8,
    textAlign:'center',
    width:130,
    borderRadius:50
  }
});

const Stack = createStackNavigator();

const Home = ({navigation}) => { 
  
  return(
    <View style={styles.center}>
      <ScrollView style={styles.scroll}>
          <View style={styles.buttonGroup}>
              <Text></Text>
              <TouchableOpacity style={{justifyContent:'flex-end'}} onPress={() => navigation.navigate('Chat',{type:"general"})}>
                <Text style={styles.button}>Chat with Us</Text>
              </TouchableOpacity>
          </View>
          <Image
            style={styles.image}
            source={require('../images/Heading1.png')}
          />
          <Text style={styles.subtitle}>Helping Mankind</Text>

          <Text style={styles.content}>
            Essentials Assistant provides DRIVER which drive the people towards better India.{"\n"}
            D : Donation platform {"\n"}
            R : Remote Medical Assistant {"\n"}
            I  : Interactive agent {"\n"}
            V : Virtual queue maintainer for stores {"\n"}
            E : Essentials locator {"\n"}
            R : Rapid discovery of help
          </Text>
          <Text style={styles.content}>
            It enables communities to cooperate among
            themselves to solve problems in times of crisis. 
          </Text>
    
          <Text style={styles.content}>
            It provides various features :{"\n"}
            • Donating needed things to society {"\r"}{"\r"}{"\r"}  as some poeple are not getting even {"\r"}{"\r"}  basic necessities to survive{"\n"}
            • Finding nearby essentials like {"\r"}{"\r"}{"\r"}  groceries,medicines,etc {"\n"}
            • Maintaining virtual queue for the {"\r"}{"\r"}{"\r"}  stores in order to maintain social {"\r"}{"\r"}{"\r"}  distance and avoid crowd {"\n"}
            • Getting remote medical assistance {"\r"}{"\r"}{"\r"}   from doctors {"\n"}
            • Getting Covid19 and above  {"\r"}{"\r"}{"\r"}   information through interactive agent {"\r"}  (Chat Bot). {"\n"}
            Thus it discovers the help needed rapidly. 
          </Text>
          <Text style={styles.content}>
          This application empowers communities to easily connect
            and provide this information to each other.
          </Text>
          
          <Text style={styles.content}></Text>
          <Text style={styles.content}>
            This solution starter kit provides a mobile application, along with
            server-side components, that serves as the basis for developers to build
            out a community cooperation application that addresses local needs for
            food, equipment, and resources.
            for developers to build
        </Text>
      </ScrollView>
    </View>
  ) 
}

export default Home;