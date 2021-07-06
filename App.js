import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';

import { createAppContainer } from 'react-navigation';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import HomeScreen from '../autoPopulate/screens/HomeScreen';
import YourBooks from '../autoPopulate/screens/YourBooks';
import SearchScreen from '../autoPopulate/screens/SeacrchScreen';

export default class App extends React.Component {
  render() {
    return( <AppContainer/> )
  }
}

const TabNavigator = createBottomTabNavigator({
  Home: {screen: HomeScreen},
  Checked_Out: {screen: YourBooks},
  Search: {screen: SearchScreen}
},
{
  defaultNavigationOptions: ({navigation}) => {
    tabBarIcon: () => {
      const routeName = navigation.state.routeName();
      if(routeName === 'Home'){
        return(
          <Image source={require('../autoPopulate/images/book.png')} style={{width: 50, height: 50}}/>
        )
      }
      else if(routeName === 'Checked_Out') {
        return(
          <Image source={require('../autoPopulate/images/booklogo.jpg')} style={{width: 50, height: 50}}/>
        )
      }
      else if(routeName === 'Search') {
        return(
          <Image source={require('../autoPopulate/images/searchingbook.png')} style={{width: 50, height: 50}}/>
        )
      }
    }
  }
}
  
  );

const AppContainer = createAppContainer(TabNavigator);