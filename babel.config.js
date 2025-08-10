module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [
        // Reanimated doit être le dernier plugin
        "react-native-reanimated/plugin",
      ],
    };
  };