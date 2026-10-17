// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// The Firebase JS SDK ships some modules as .cjs and relies on conditional
// "exports" maps that Metro's package-exports resolution mishandles, producing
// errors like "Component auth has not been registered yet". Allowing .cjs and
// disabling unstable package exports is the documented workaround.
config.resolver.sourceExts.push("cjs");
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
