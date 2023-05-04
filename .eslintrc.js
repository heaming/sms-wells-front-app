/* eslint-disable quote-props */
module.exports = {
  root: true,

  extends: [
    require.resolve('kw-lib/config/eslint'),
  ],

  rules: {
    'no-underscore-dangle': 'off',
    'import/no-extraneous-dependencies': ['error', {
      'packageDir': [__dirname],
      'devDependencies': false,
      'optionalDependencies': false,
      'peerDependencies': false,
      'bundledDependencies': true,
    }],
  },
};
