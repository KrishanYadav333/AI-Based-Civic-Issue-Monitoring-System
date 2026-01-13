import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CaptureIssueScreen from './src/screens/CaptureIssueScreen';
import IssueHistoryScreen from './src/screens/IssueHistoryScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'VMC Field Surveyor' }}
          />
          <Stack.Screen 
            name="CaptureIssue" 
            component={CaptureIssueScreen}
            options={{ title: 'Capture Issue' }}
          />
          <Stack.Screen 
            name="IssueHistory" 
            component={IssueHistoryScreen}
            options={{ title: 'Issue History' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
