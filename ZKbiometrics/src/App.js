import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {StatusBar} from 'react-native';
import Deposit from './screens/deposit/deposit';
import DepositZK from './screens/depositZK/deposit';
import Lock from './screens/lock/lock';
import Main from './screens/main/main';
import Send from './screens/send/send';
import SendZK from './screens/sendZK/send';
import Setup from './screens/setup/setup';
import SplashLoading from './screens/splashLoading/splashLoading';
import AppStateListener from './utils/appStateListener';
import {ContextProvider} from './utils/contextModule';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ContextProvider>
      <NavigationContainer>
        <AppStateListener />
        <StatusBar barStyle="light-content" />
        <Stack.Navigator
          initialRouteName="SplashLoading"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="SplashLoading" component={SplashLoading} />
          {
            // Setups
          }
          <Stack.Screen name="Setup" component={Setup} />
          {
            // Main
          }
          <Stack.Screen name="Lock" component={Lock} />
          <Stack.Screen name="Main" component={Main} />
          {
            // Wallet Actions
          }
          <Stack.Screen name="Deposit" component={Deposit} />
          <Stack.Screen name="Send" component={Send} />
          <Stack.Screen name="DepositZK" component={DepositZK} />
          <Stack.Screen name="SendZK" component={SendZK} />
        </Stack.Navigator>
      </NavigationContainer>
    </ContextProvider>
  );
}
