import React, {
  Component,
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TextInput,
} from 'react-native';
import NavigationBar from 'react-native-navbar';

class LoginScreen extends Component {
  render() {
    return (
      <View>
        <NavigationBar
          tintColor="#ADF8D1"
        />
      </View>
    );
  }
}