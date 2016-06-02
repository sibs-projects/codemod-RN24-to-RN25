/*
* top of file
*/
'use strict';
// after use strict
var a = 'a';
/*
* after var a
*/

// before foo
// const foo = 123;
// after foo

// before other imports
// import Funk from 'funky-town';
// after other imports

// All comments between an expression and import React should remain.

// before blah
// const blah = 111;
// after blah

// before react import
import React, {
  Platform,
  NativeModules,
} from 'react-native';
// after imports

// before Spaghetti
import Spaghetti from 'food';
// after Spaghetti

/**
* comment above class
*/
export default class Foo extends React.Component {
  static get propTypes() {
    return {};
    // bottom of propTypes
  }

  // above componentWillMount
  componentWillMount() {}

  /**
  * multi-line comment above foo
  * @param {String} blah
  * @return {undefined}
  */
  foo(blah) {}

  render() {
    // top of render
    return;
  }
}

// EOF
