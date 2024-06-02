const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})


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
          use: [
          ],
        },
      ],
    },
  },
};
