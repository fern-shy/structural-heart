// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Firebase still ships .cjs files. Package exports stay on for the rest of the
// app (SDK 58 resolves expo/dom/global through them) and are turned off only
// for Firebase, which mis-registers Auth when Metro follows its export map.
config.resolver.sourceExts.push("cjs");

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isFirebase =
    moduleName === "firebase" ||
    moduleName.startsWith("firebase/") ||
    moduleName.startsWith("@firebase/");

  if (isFirebase) {
    return context.resolveRequest(
      { ...context, unstable_enablePackageExports: false },
      moduleName,
      platform,
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
