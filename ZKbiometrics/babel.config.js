module.exports = {
  presets: ['module:@react-native/babel-preset'],
  env: {
    production: {
      plugins: ['transform-remove-console'],
    },
  },
  plugins: [
    [
      'module:react-native-dotenv',
      {
        envName: 'APP_ENV',
        moduleName: '@env',
        path: '.env.production',
        safe: true,
        allowUndefined: false,
        verbose: false,
      },
    ],
    ['@babel/plugin-transform-flow-strip-types', {loose: true}],
    ['@babel/plugin-proposal-class-properties', {loose: true}],
    ['@babel/plugin-transform-private-methods', {loose: true}],
  ],
};
