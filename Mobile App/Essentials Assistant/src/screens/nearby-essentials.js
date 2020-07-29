import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import PickerSelect from 'react-native-picker-select';
import Geolocation from '@react-native-community/geolocation';
import { search } from '../lib/resourcesData';
import Map from './map'
import {GetAuthenticationInfo} from '../../App'
import {getTokenNumberFromGStore, getCurrentQueueNumber, getUserDetails} from '../lib/fetch-data-from-API'


const styles = StyleSheet.create({
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
  mapbutton: {
    backgroundColor: '#1062FE',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 14,
    overflow: 'hidden',
    padding: 5,
    textAlign: 'center',
    marginTop: 5,
  },
  searchResultText: {
    fontFamily: 'IBMPlexSans-Bold',
    padding: 10,
    color: '#1062FE',
  },
  flatListView: {
    backgroundColor: '#FFF',
  },
  itemTouchable: {
    flexDirection: 'column',
    padding: 15,
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    borderBottomColor: '#dddddd',
    borderBottomWidth: 0.25,
  },
  itemView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight:10,
    marginLeft:150
  },
  mapButtonView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight:10
  },
  itemName: {
    fontSize: 22,
    fontFamily: 'IBMPlexSans-Medium',
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    color: 'gray',
  }
});

const NearByEssentials = ({ navigation }) => {

  let authInfo = GetAuthenticationInfo()
  console.log("In Nearby essentials ", authInfo)
  const [item, setItem] = React.useState({location : ''});
  const [items, setItems] = React.useState([]);
  const [position, setPosition] = React.useState({})
  const [info, setInfo] = React.useState('');
  const [isSearchClick, setSearchData] = React.useState(false);
  
  const [category, setcategory] = React.useState({
    type: 'CoVID-19 Testing Lab',
    name: ''
  });
  const [query, setQuery] = React.useState(category);
  const [otherItem, setOtherItem] = React.useState('');

  const getCurrentQueue = (phoneNumber) => {
  
    //API call
    let result = getCurrentQueueNumber({phoneNumber}).then(({queuenumber}) => {
        console.log("current queueu number from db", JSON.stringify(queuenumber))
        return queuenumber
    });
    return result
  };

 const  getTokenNumber= (props) =>  {
    let item = {
      storeName:props.nameOfStore,
      storePhonenumber:props.phoneNumber
    } 
    let result =  getTokenNumberFromGStore(item).then(({tokenLength, currentQueuenumber}) => {
      console.log("res data ", JSON.stringify(tokenLength))
      return {tokenLength, currentQueuenumber}
    });
    return result
  };
 
  const Item = (props) => {
   
    console.log("In Item  nearby essentials ", props)  
    // let latposition = props.position.lat
    // let lngposition = props.position.lng 
    // let postion = latposition.toString() + ',' + lngposition.toString()
    // props.position = postion
    const [token, setToken] = React.useState(-1);
    const [tokendb, setTokendb] = React.useState(-1);
    let isnotified = false

    async function getCurrentQueueAsync(phoneNumber, currentToken, cb){  
      console.log("token ",token)
      currentQueue = await getCurrentQueue(phoneNumber)//currentQueue + 1
      console.log("current queue number in set interval", currentQueue)
      setToken(currentQueue)
      console.log("current token",currentToken - currentQueue)
      let counter = currentToken - currentQueue
      if(counter <= 4 && counter > 0)
      {
        if(!isnotified) {
          alert("Please proceed towards the store")
          isnotified=true
        }
      } else if(counter === 0) {
        console.log("calling cb")
          cb()
      }  
    }

    async function onJoinQueue(props) {
      //fetch call
      let func =   await getTokenNumber(props)
      let currentToken = func.tokenLength
      let currentQueue = func.currentQueuenumber
      console.log("current token func", func)
      console.log("queue no ",currentToken)
      setTokendb(currentToken)
      setToken(currentQueue)
      let id = setInterval(() => getCurrentQueueAsync(props.phoneNumber, currentToken, clearIdInterval), 5000);

      const clearIdInterval = () => {
        console.log("calling clearIdInterval ",id)
        clearInterval(id)
        id = undefined
        console.log("end clearIdInterval ",id)
      } 
      alert("You have been added to the queue of "+props.nameOfStore+"\nYour token number : "+currentToken)
    }
  
    if(authInfo.auth.role !== "Service Provider" && category.type === "Groceries" && props.isRegistered){
      return (
        <TouchableOpacity style={styles.itemTouchable}>
          <View style={styles.itemView}>
          <Text style={styles.itemName}>{props.nameOfStore}</Text>
          </View>
          <Text style={styles.itemDescription}>{props.phoneNumber}</Text>
          
          <View style={styles.buttonView}>    
            <TouchableOpacity onPress= {() => onJoinQueue(props)}>
            <Text style={styles.mapbutton}>Join Queue</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress= {() => { navigation.navigate('Map', { item: props }); }}>
              <Text style={styles.mapbutton}>Show Map</Text>
            </TouchableOpacity>
          </View>
          {
            tokendb - token > 0 &&
              <Text style = {{fontSize:18, color:"blue"}}>Your token number : {tokendb - token}</Text>
          }
        </TouchableOpacity>
      );
    }
    else{
      return (
        <TouchableOpacity style={styles.itemTouchable}>
          <View style={styles.itemView}>
          <Text style={styles.itemName}>{props.nameoftheorganisation}</Text>
          </View>
          <Text style={styles.itemDescription}>{props.phonenumber}</Text>
          
          <View style={styles.mapButtonView}>
            <TouchableOpacity onPress= {() => { navigation.navigate('Map', { item: props }); }}>
              <Text style={styles.mapbutton}>Show Map</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const handleSearch = () => {
    setSearchData(true)
    const payload = {
      ...query
    }

    search(payload, position)
    .then((results) => {
      setInfo(`${results.length} result(s)`)
      console.log("In handle search")
      console.log(results);
      setItems(results);
      setSearchData(false)
    })
    .catch(err => {
      console.log(err);
      Alert.alert('ERROR', 'Please try again. If the problem persists contact an administrator.', [{text: 'OK'}]);
    });
  }

  const setData = (t, id) => {
    if (id === 'category') {
      setcategory({...category, type:t})
    } else if(id === 'otherItem') {
      setOtherItem(t)
    }
    setQuery({...query, type:t})
  }

  React.useEffect(() => {
    navigation.addListener('focus', () => {
      //Used user location stored in redux state
      let loginDetails = getUserDetails()
      let pos = {
        coords : {
          latitude : loginDetails.latitude,
          longitude : loginDetails.longitude
        }
      }
      setPosition(pos)
      setItem({
          ...item,
          location: `${pos.coords.latitude},${pos.coords.longitude}`
        })
    });
  }, []);

  return (
    <View style={styles.outerView}>
      <View style={styles.inputsView}>
        <Text style={styles.label}>Category</Text>
        <PickerSelect
          style={{inputIOS: styles.selector}}
          value={category.type}
          onValueChange={(t) => setData(t , 'category')}
          //TODO : Fetch the categories from API
          items={[
            {label: 'CoVID-19 Testing Lab', value: 'CoVID-19 Testing Lab', id: 8},
            {label: 'Medicines', value: 'Medicines', id:9},
            {label: 'Hospitals and Centers', value: 'Hospitals and Centers', id:4},
            
            {label: 'Free Food', value: 'Free Food', id:2},
            {label: 'Groceries', value: 'Groceries', id:5},

            {label: 'Police', value: 'Police', id:6},
            {label: 'Fundraisers', value: 'Fundraisers', id:3},

            {label: 'Government Helpline', value: 'Government Helpline', id:7},
            {label: 'Other', value: 'Other', id:1},
          ]}
        />
        {category.type === 'Other' ? (
          <>
            <Text style={styles.label}>Please specify</Text>
            <TextInput
              style={styles.textInput}
              value={otherItem}
              onChangeText={otherItem => setData(otherItem, 'otherItem') }
              returnKeyType="send"
              enablesReturnKeyAutomatically={true}
              blurOnSubmit={false}
            />
          </>
        ) : null}
        <Text style={styles.label}>Your location</Text>
        <TextInput
          style={styles.textInput}
          value={item.location}
          returnKeyType="send"
          enablesReturnKeyAutomatically={true}
          blurOnSubmit={false}
          editable={false}
          selectTextOnFocus={false}
        />
        <TouchableOpacity onPress={handleSearch}>
          <Text style={styles.button}>Search</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.searchResultText}>{info}</Text>
      {
        items.length > 0 ? (
      <FlatList style={styles.flatListView}
        data={items}
        renderItem={({ item }) => <Item {...item} />}
        keyExtractor={item => item.id || item.recordid}
      />
        ):isSearchClick ?(
          <ActivityIndicator size="large" color="#0000ff" />
        ):null  
      }
    </View>
  );
}

export default NearByEssentials;