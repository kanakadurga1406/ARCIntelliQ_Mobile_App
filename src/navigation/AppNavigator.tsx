import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../types/navigation';
import SplashScreen from '../screens/SplashScreen';
import PortalSelectScreen from '../screens/PortalSelectScreen';
import ClaimHandlerLoginScreen from '../screens/ClaimHandlerLoginScreen';
import ClaimHandlerHomeScreen from '../screens/ClaimHandlerHomeScreen';
import ClaimPortalsScreen from '../screens/ClaimPortalsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="PortalSelect" component={PortalSelectScreen} />
        <Stack.Screen
          name="ClaimHandlerLogin"
          component={ClaimHandlerLoginScreen}
        />
        <Stack.Screen
          name="ClaimHandlerHome"
          component={ClaimHandlerHomeScreen}
        />
        <Stack.Screen name="ClaimPortals" component={ClaimPortalsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
