import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import App from './App';

// Register the root component so it works in both Expo Go and bare/native builds
registerRootComponent(App);
