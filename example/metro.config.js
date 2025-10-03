const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Watch the parent directory (stash library source)
config.watchFolders = [workspaceRoot];

// Resolve modules from both directories
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Block react-native and react from being resolved from parent directory
config.resolver.blockList = [
  // Block react-native from parent node_modules
  new RegExp(`^${path.resolve(workspaceRoot, 'node_modules', 'react-native')}/.*$`),
  // Block react from parent node_modules
  new RegExp(`^${path.resolve(workspaceRoot, 'node_modules', 'react')}/.*$`),
];

// Ensure these packages are always resolved from example/node_modules
config.resolver.extraNodeModules = {
  'react': path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

module.exports = config;
