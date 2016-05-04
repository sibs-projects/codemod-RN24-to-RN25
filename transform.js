module.exports = function(file, api) {
  var j = api.jscodeshift; // alias the jscodeshift API
  var root = j(file.source); // parse JS code into an AST

  // check for import React from 'react-native';
  const hasReact = (value) =>
    value.type === 'ImportDefaultSpecifier' && value.local.name === 'React';
    
  // check for import { Component } from 'react-native';
  const hasComponent = (value) =>
    value.type === 'ImportSpecifier' && value.local.name === 'Component';

  const updateImport = (path) => {
    const { specifiers } = path.value;
    
    const rnImports = path.value.specifiers.filter(value => 
      !(hasReact(value) || hasComponent(value))
    ).map(value => {
      const { name } = value.local;
      const id = j.identifier(name);
      if (value.type === 'ImportSpecifier') {
        return j.importSpecifier(id);
      } else {
        return j.importDefaultSpecifier(id);
      }
    })
    
    const reactImports = [];
    // Check and update import React from 'react-native';
    if (specifiers.filter(hasReact).length > 0) {
      reactImports.push(j.importDefaultSpecifier(j.identifier('React')));
    }
    // Check and update import { Component } from 'react-native';
    if (specifiers.filter(hasComponent).length > 0) {
      reactImports.push(j.importSpecifier(j.identifier('Component')));
    }
    
    const allImports = [];
    if (reactImports.length > 0) {
      allImports.push(j.importDeclaration(
        reactImports,
        j.literal('react')
      ));  
    }
    
    if (rnImports.length > 0) {
      allImports.push(j.importDeclaration(
        rnImports,
        j.literal('react-native')
      ))
    }
    
    j(path).replaceWith(
      allImports
    );
  }

  /*
  Find and update all import React, { Component } from 'react-native' to 
  import React, { Component } from 'react';
  */
  root
    .find(j.ImportDeclaration, {
      source: {
        value: 'react-native'
      }
    })
    .filter(({node}) => {
      // check React or { Component } from 'react-native'
      return node.specifiers.filter(value => 
        hasReact(value) || hasComponent(value)
      ).length > 0;
    })
    .forEach(updateImport);

  // print
  return root.toSource();
};