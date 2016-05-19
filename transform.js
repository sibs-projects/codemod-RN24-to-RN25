const reactExports = [
  'Children',
  'Component',
  'createElement',
  'cloneElement',
  'isValidElement',
  'PropTypes',
  'createClass',
  'createFactory',
  'createMixin',
  'DOM',
  'version'
];

// check for anyone of the React Export, for instance: import { Component } from 'react-native';
const hasExport = (value, exportName) =>
  value.type === 'ImportSpecifier' && value.local.name === exportName;

// replaces required react-native in collection
// input:  var React = require('react-native');
// output: var React = require('react');
const replaceRequireCalls = (j, collection) => {
  return collection
    .find(j.CallExpression, {
      callee: { name: 'require' }
    })
    .filter(nodePath => {
      return nodePath.node.arguments[0].value === 'react-native';
    })
    .filter(nodePath => {
      // yes: require('react-native').Component
      // no: require('react-native').View
      const { parent: { node: parentNode } } = nodePath;
      const isPartOfMemberExpression = parentNode.type === 'MemberExpression';

      return !isPartOfMemberExpression
        || reactExports.indexOf(parentNode.property.name) > -1;
    })
    .find(j.Literal, {
      value: 'react-native'
    })
    .replaceWith(nodePath => {
      const { node } = nodePath;
      node.value = 'react';
      return node;
    });
};

module.exports = function(file, api, options) {
  var j = api.jscodeshift; // alias the jscodeshift API
  var root = j(file.source); // parse JS code into an AST

  const printOptions = options.printOptions || {
    quote: 'single',
    trailingComma: true,
  };

  // check for import React from 'react-native';
  const hasReactImport = (value) =>
    value.type === 'ImportDefaultSpecifier' && value.local.name === 'React';

  const updateImport = (path) => {
    const { specifiers } = path.value;
    const rnImports = path.value.specifiers.filter(value =>
      !(hasReactImport(value) ||
        reactExports.reduce((anyReactExport, exportName) => anyReactExport || hasExport(value, exportName), false))
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
    if (specifiers.filter(hasReactImport).length > 0) {
      reactImports.push(j.importDefaultSpecifier(j.identifier('React')));
    }
    // Check and update React Exports import { Component } from 'react-native';
    reactExports.map((exportName) => {
      if (specifiers.filter((value) => hasExport(value, exportName)).length > 0) {
        reactImports.push(j.importSpecifier(j.identifier(exportName)));
      }
    });

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

  //try to preserve comments at the top of file
  const body = root.get().value.program.body;
  const comments = (body && body.length && body[0].comments) ? body[0].comments : null;

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
        hasReactImport(value) ||
        reactExports.reduce((anyReactExport, exportName) => anyReactExport || hasExport(value, exportName), false)
      ).length > 0;
    })
    .forEach(updateImport);

  replaceRequireCalls(j, root);

  //if there is a comment, bring it back to the source
  if (comments) {
    body[0].comments = comments;
  }

  // print
  return root.toSource(printOptions);
};
