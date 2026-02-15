import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/contexts/AuthContext';
import IntroductionAnimationScreen from './src/IntroductionAnimationScreen';
import {
  SignInScreen,
  SignUpScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  WelcomeBackScreen,
  MainHomeScreen,
} from './src/screens';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import EditProfileScreen from './src/screens/app/EditProfileScreen';
import LanguageSelectionScreen from './src/screens/app/LanguageSelectionScreen';
import NotificationSettingsScreen from './src/screens/app/NotificationSettingsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Onboarding" component={IntroductionAnimationScreen} />
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
              <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
              <Stack.Screen name="Home" component={WelcomeBackScreen} />
              <Stack.Screen name="MainHome" component={BottomTabNavigator} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
              <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
