module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [
        [
          "module-resolver",
          {
            root: ["./src"],
            alias: {
              "@": "./src",
            },
            extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
          },
        ],
        // Reanimated doit être le dernier plugin
        "react-native-reanimated/plugin",
      ],
    };
  };