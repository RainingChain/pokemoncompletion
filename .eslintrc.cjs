
module.exports = {
  // npx eslint --fix src/game/**/*.ts
  "rules": {
    // recommended overwrite
    "@typescript-eslint/no-explicit-any":0,
    "@typescript-eslint/no-unused-vars":0,
    "@typescript-eslint/ban-ts-comment":0,
    "no-empty":0,
    "no-debugger":0,
    "@typescript-eslint/no-namespace":0,
    "no-extra-semi":"warning",
    "prefer-const":["warning", {
      "destructuring": "all",
      "ignoreReadBeforeAssign": false,
    }],
    "no-async-promise-executor":0,
    "no-var":"warning",
    "@typescript-eslint/prefer-as-const":"warning",
    "no-mixed-spaces-and-tabs":"warning",
    "@typescript-eslint/ban-types":["warning", {
      "types":{
        "Function":false,
      },
    }],
    "no-constant-condition": ["warning", {"checkLoops": false}],

    //style
    'indent': [
      'warning', 2, {
        'CallExpression': {
          'arguments': 2,
        },
        'FunctionDeclaration': {
          'body': 1,
          'parameters': 2,
        },
        'FunctionExpression': {
          'body': 1,
          'parameters': 2,
        },
        'MemberExpression': 2,
        'ObjectExpression': 1,
        'SwitchCase': 1,
        'ignoredNodes': [
          'ConditionalExpression',
        ],
      },
    ],
    'no-caller': 'warning',
    'no-extend-native': 'warning',
    'no-extra-bind': 'warning',
    'no-multi-str': 'warning',
    'no-new-wrappers': 'warning',
    'no-throw-literal': 'warning',
    'no-with': 'warning',
    'no-multiple-empty-lines': ['warning', {max: 2}],
    'no-new-object': 'warning',
    'no-trailing-spaces': 'warning',
    'quote-props': ['warning', 'consistent'],
    'semi-spacing': 'warning',
  },
  "extends": ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint",
  ],
};
