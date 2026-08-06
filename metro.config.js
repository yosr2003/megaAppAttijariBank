// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  sourceExts: [...(config.resolver?.sourceExts ?? ['js', 'jsx', 'ts', 'tsx']), 'mjs', 'cjs'],
};

module.exports = config;
