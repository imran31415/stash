module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/example/',
    '/dist/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-svg|expo|expo-av|expo-camera|date-fns)/)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.types.{ts,tsx}',
    '!src/**/*.utils.{ts,tsx}',
    '!src/**/index.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
