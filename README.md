# README

Why this transform is necessary?

Until React Native 24, you import React from 'react-native' package, but this will change on RN 25, you will need to import React from 'react', and also all the other React exports like Component, PropTypes, Children and so on.
You probably have many files that does this, so I've created a codemod to save you a bunch of time

# How to use this

- Install jscodeshif
```bash
npm install -g jscodeshift
```

- Download this transform
- Run the transform
```bash
jscodeshift -t transform.js FILES
```

# Example
```js
import React, {
  Component,
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  TextInput,
  PropTypes,
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
```

Will be transformed to:
```js
import React, {Component, PropTypes} from "react";
import {View, Text, StyleSheet, TouchableHighlight, TextInput} from "react-native";
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
```
