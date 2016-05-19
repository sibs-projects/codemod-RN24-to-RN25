# README

Why this transform is necessary?

Until React Native 24, you import React from 'react-native' package, but this will change on RN 25, you will need to import React from 'react', and also all the other React exports like Component, PropTypes, Children and so on.
You probably have many files that does this, so I've created a codemod to save you a bunch of time

# How to use this

1. Install jscodeshift
1. Download this transform
1. Navigate to the directory
1. Run the transform

```bash
# 1
npm install -g jscodeshift

# 2, 3
git clone git@github.com:sibeliusseraphini/codemod-RN24-to-RN25.git && cd codemod-RN24-to-RN25

# 4.
jscodeshift PATH_TO_FILES
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

### Recast Options

Options to [recast](https://github.com/benjamn/recast)'s printer can be provided
through the `printOptions` command line argument. See the full list of options [here](https://github.com/benjamn/recast/blob/master/lib/options.js).

```sh
jscodeshift PATH_TO_FILES --printOptions='{"quote":"double"}'
```
