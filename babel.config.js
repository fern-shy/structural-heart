module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Use only the new Worklets plugin (Reanimated plugin is deprecated and causes duplicates)
      'react-native-worklets/plugin',
    ],
  };
};


