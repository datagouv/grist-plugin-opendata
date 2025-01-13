const fs = require("fs");
const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
});

module.exports = {
  css: {
    loaderOptions: {
      css: {
        sourceMap: true,
      },
    },
  },
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [],
        },
      ],
    },
  },
  devServer: {
    https: {
      key: fs.readFileSync("./localhost+1-key.pem"),
      cert: fs.readFileSync("./localhost+1.pem"),
    },
  },
};
