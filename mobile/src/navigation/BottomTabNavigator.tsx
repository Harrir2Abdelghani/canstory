import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View, Text } from 'react-native';
import HomeScreen from '../screens/app/HomeScreen';
import DirectoryScreen from '../screens/app/DirectoryScreen';
import CommunityScreen from '../screens/app/CommunityScreen';
import NotificationsScreen from '../screens/app/NotificationsScreen';
import ProfileScreen from '../screens/app/ProfileScreen';
import AboutScreen from '../screens/app/AboutScreen';

const Tab = createBottomTabNavigator();

const TabIcon: React.FC<{ icon: string; focused: boolean }> = ({
  icon,
  focused,
}) => (
  <View style={[styles.tabIconContainer, focused && styles.tabIconContainerFocused]}>
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
  </View>
);

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#7b1fa2',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="DirectoryTab"
        component={DirectoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💬" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="AboutTab"
        component={AboutScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="ℹ️" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🔔" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'white',
    borderTopWidth: 0,
    height: 65,
    paddingBottom: 10,
    paddingTop: 10,
    elevation: 20,
    shadowColor: '#7b1fa2',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  tabIconContainerFocused: {
    backgroundColor: '#f3e5f5',
  },
  tabIcon: {
    fontSize: 26,
  },
  tabIconFocused: {
    transform: [{ scale: 1.15 }],
  },
});
