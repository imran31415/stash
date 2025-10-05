module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-react',
    ['@babel/preset-typescript', { allowDeclareFields: true }],
    '@babel/preset-flow',
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    '@babel/plugin-transform-flow-strip-types',
  ],
};
