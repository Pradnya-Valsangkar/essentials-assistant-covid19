import React from 'react';
import {
  StyleSheet,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Button,
} from 'react-native';
import {search, userID} from '../lib/utils';


const styles = StyleSheet.create({
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
  resultView:{
    flexDirection: 'row', 
    height: 50, 
    justifyContent: 'space-between',
    marginRight:10
  },
  addButton:{
    paddingTop:10,
    paddingBottom:10,
    width:80
  },
  title:{
    fontSize:20, 
    marginTop:10,
    marginLeft:20,
    
  },
  itemView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 24,
    fontFamily: 'IBMPlexSans-Medium',
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    color: 'gray',
  },
  itemQuantity: {
    fontSize: 14,
    fontFamily: 'IBMPlexSans-Medium',
    color: 'gray',
  },
  emptyListView: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    fontFamily: 'IBMPlexSans-Bold',
    color: '#999999',
    fontSize: 16,
  },
});

const MyResources = function({navigation}) {
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    navigation.addListener('focus', () => {
      search({userID: userID()})
        .then(setItems)
        .catch(err => {
          console.log(err);
          Alert.alert(
            'ERROR',
            'Please try again. If the problem persists contact an administrator.',
            [{text: 'OK'}],
          );
        });
    });
  }, []);

  const Item = props => {
    return (
      <TouchableOpacity
        style={styles.itemTouchable}
        onPress={() => {
          navigation.navigate('Edit Donation', {item: props});
        }}>
        <View style={styles.itemView}>
          <Text style={styles.itemName}>{props.name}</Text>
          <Text style={styles.itemQuantity}> ( {props.quantity} ) </Text>
        </View>
        <Text style={styles.itemDescription}>{props.description}</Text>
      </TouchableOpacity>
    );
  };

  if (items.length > 0) {
    return (
      <>
        <View style={styles.resultView}>
          <Text style={styles.title}>Donations</Text>
          <View style={styles.addButton}>
            <Button
              onPress={() => navigation.navigate('Add Donation')}
              title="Add"
              //style={{position: 'absolute', right: 0}}
            />
          </View>
          
        </View>
        <FlatList
          style={styles.flatListView}
          data={items}
          renderItem={({item}) => <Item {...item} />}
          keyExtractor={item => item.id || item['_id']}
        />
        
      </>
    );
  } else {
    return (
      <>
        <View style={styles.resultView}>
          <Text style = {styles.title}>Donations</Text>
          <View style={styles.addButton}>
            <Button
              onPress={() => navigation.navigate('Add Donation')}
              title="Add"
              // style={styles.addButton}
            />
          </View>
          
        </View>
        <View style={styles.emptyListView}>
          <Text style={styles.emptyListText}>
            You currently have no donations listed
          </Text>
        </View>
      </>
    );
  }
};

export default MyResources;
