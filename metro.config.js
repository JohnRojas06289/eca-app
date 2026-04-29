const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const escapeForRegex = (value) => value.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
const windsurfPath = escapeForRegex(path.resolve(__dirname, '.windsurf'));

config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : [config.resolver.blockList]),
  new RegExp(`${windsurfPath}($|${escapeForRegex(path.sep)}.*)`),
];

module.exports = config;
