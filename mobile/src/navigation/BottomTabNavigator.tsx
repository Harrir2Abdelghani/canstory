import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from '../screens/app/HomeScreen';
import DirectoryScreen from '../screens/app/DirectoryScreen';
import I3lamScreen from '../screens/app/I3lamScreen';
import Ghida2akScreen from '../screens/app/Ghida2akScreen';
import Nassa2ihScreen from '../screens/app/Nassa2ihScreen';
import MainHeader from '../components/MainHeader';

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => <MainHeader />,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        headerTransparent: false,
        tabBarIcon: ({ focused }) => {
          let iconName: string = '';

          if (route.name === 'HomeTab') iconName = 'home';
          if (route.name === 'I3lamTab') iconName = 'megaphone';
          if (route.name === 'Ghida2akTab') iconName = 'nutrition';
          if (route.name === 'Nassa2ihTab') iconName = 'bulb';
          if (route.name === 'DirectoryTab') iconName = 'list';

          return (
            <View
              style={[
                styles.iconContainer,
                focused && styles.activeIconContainer,
              ]}
            >
              <Ionicons
                name={iconName}
                size={focused ? 22 : 22}
                color={focused ? '#7b1fa2' : 'white'}
              />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="I3lamTab" component={I3lamScreen} />
      <Tab.Screen name="Ghida2akTab" component={Ghida2akScreen} />
      <Tab.Screen name="Nassa2ihTab" component={Nassa2ihScreen} />
      <Tab.Screen name="DirectoryTab" component={DirectoryScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#7b1fa2',
    borderTopWidth: 0,
    height: 55,
    elevation: 0,
    shadowOpacity: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  iconContainer: {
    width: 35,
    height: 35,
    borderRadius: 22.5,
    marginTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeIconContainer: {
    backgroundColor: 'white',
  },
});
