const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  // 配置devServer
  devServer: {
    host: '0.0.0.0', // 项目运行的ip
    port: 8888, // 项目运行的端口号

    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }

    }
  }
})
