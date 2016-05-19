/*
 * @flow
 * @providesModule module/myAwesomeProject
 */

import React, {Children, Component, PropTypes} from 'react';

import {View, Text, StyleSheet, TouchableHighlight, TextInput} from 'react-native';
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
