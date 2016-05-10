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
  'version'];

// check for anyone of the React Export, for instance: import { Component } from 'react-native';
const hasExport = (value, exportName) =>
  value.type === 'ImportSpecifier' && value.local.name === exportName;

module.exports = function(file, api) {
  var j = api.jscodeshift; // alias the jscodeshift API
  var root = j(file.source); // parse JS code into an AST

  // check for import React from 'react-native';
  const hasReact = (value) =>
    value.type === 'ImportDefaultSpecifier' && value.local.name === 'React';

  const updateImport = (path) => {
    const { specifiers } = path.value;
  const rnImports = path.value.specifiers.filter(value =>
      !(hasReact(value) ||
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
    if (specifiers.filter(hasReact).length > 0) {
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
        hasReact(value) ||
        reactExports.reduce((anyReactExport, exportName) => anyReactExport || hasExport(value, exportName), false)
      ).length > 0;
    })
    .forEach(updateImport);

  //if there is a comment, bring it back to the source
  if (comments) {
    body[0].comments = comments;
  }

  // print
  return root.toSource();
};
