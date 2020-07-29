import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import {getGroceryCustomerList, updateCurrentQueueNumber } from '../lib/fetch-data-from-API'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  appointmentButtonsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginRight: 200,
  },
  button: {
    fontFamily: 'Calibri',
    fontSize: 20,
    overflow: 'hidden',
    padding: 10,
    textAlign: 'center',
    width: 180,
  },
  acceptButton: {
    backgroundColor: '#008000',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 14,
    overflow: 'hidden',
    padding: 5,
    textAlign: 'center',
    marginTop: 5,
  },
  disableButton: {
    backgroundColor: 'gray',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 14,
    overflow: 'hidden',
    padding: 5,
    textAlign: 'center',
    marginTop: 5,
  },
  rejectButton: {
    backgroundColor: 'red',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 14,
    overflow: 'hidden',
    padding: 5,
    textAlign: 'center',
    marginTop: 5,
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
    marginRight:260
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'IBMPlexSans-Medium',
  },
  title: {
    fontSize: 22,
    fontFamily: 'IBMPlexSans-Medium',
    margin:20
  },
  button: {
    backgroundColor: '#008000',
    color: '#FFFFFF',
    fontFamily: 'IBMPlexSans-Medium',
    fontSize: 14,
    overflow: 'hidden',
    padding: 5,
    textAlign: 'center',
    marginTop: 5,
  },
});

class Customer extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      isArrieved : false
    }
  }

  handleArrivedButton = () =>{
    updateCurrentQueueNumber().then((data) => {
      console.log("Updated queue no ")
    })
    console.log('arrived button clicked');
    this.setState({isArrieved:true})
  }

  handleDoneButton = () => {
    console.log('done button clicked');
    this.props.parentClass() //call refresh of parent class
    this.setState({isArrieved:false})
  }

  render() {
    return (
      <View>
        <TouchableOpacity
          style={styles.itemTouchable}
          >
          <View style={styles.itemView}>
            <Text style={styles.itemName}>{this.props.tokenLength}.</Text>
            <Text style={styles.itemName}>  {this.props.customerName}</Text>  
          </View>

          <View style={styles.appointmentButtonsView}>
            <TouchableOpacity disabled={this.state.isArrieved} onPress={this.handleArrivedButton}>
              <Text style={[this.state.isArrieved ? styles.disableButton : styles.acceptButton]}> Arrived </Text>
            </TouchableOpacity>
            {
              this.state.isArrieved ? (
                <TouchableOpacity onPress={this.handleDoneButton}>
                  <Text style={styles.rejectButton}>Done</Text>
                </TouchableOpacity>
              ) : null
            }
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

class ListOfCustomers extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      refreshing : false,
      customerList: []
    }
  }

  getCustomerList = () => { 
    console.log("calling getCustomerList") 
    const appFunc = getGroceryCustomerList() 
      appFunc.then((customers) => {
        console.log("in customer list result", customers)
        this.setState({customerList:customers,refreshing:false})
        console.log("in state data ", this.state)
      }).catch(err => {
      console.log(err);
      this.setState({customerList:[],refreshing:false})
    });
  }

  componentDidMount () {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      console.log("in foucus listener New Request call")
      this.setState({refreshing:true})
      this.getCustomerList()
    });
  }

  refreshList = () => {
    this.setState({
      refreshing : true
    }, () => {
       this.getCustomerList()
    })
  }

  emptyList = () => {
    return(
      <View style={styles.MainContainer}>
        <Text style={{ textAlign: 'center' }}>No Customer in Queue</Text>
      </View>
    )
  }

  render() {
    return (
      <View>
        <Text style={styles.title}>List of Customers In Queue </Text>
        <FlatList
          style={styles.flatListView}
          data={this.state.customerList}
          renderItem={({item}) => <Customer parentClass={this.refreshList} {...item} />}
          keyExtractor={item => item.id || item.recordid}
          refreshing={this.state.refreshing}
          onRefresh={this.refreshList}
          ListEmptyComponent={this.emptyList}
        />
      </View>
    );
  }
}

export default ListOfCustomers;