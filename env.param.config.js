'use strict';
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path');

module.exports = {
    dev: {
        // Paths
        assetsPublicPath: '/',// 编译发布的根目录，可配置为资源服务器域名或 CDN 域名
        assetsSubDirectory: 'static',// 编译输出的二级目录
        proxyTable: {},
        contentBase: path.join(__dirname, '../dist'),       //"./dist/"
        host: 'localhost',
        port: 8080,
        inline: true,
        autoOpenBrowser: true,
        errorOverlay: true,
        hot: true,
        quiet: true,
        /**
         * Source Maps
         */
        devtool: 'cheap-module-eval-source-map',
        notifyOnErrors: true,
        poll: false,
        useEslint: true,
        showEslintErrorsInOverlay: false,
        usePostCSS: true,
        /** Source Maps */
        devCssSourceMap: false,
        devJsSourceMap: false,
        cacheBusting: true,
    },

    build: {
        // Template for index.html
        index: path.resolve(__dirname, './dist/index.html'),
        assetsPublicPath: '/', // 编译发布的根目录，可配置为资源服务器域名或 CDN 域名
        assetsRoot: path.resolve(__dirname, './dist'),// 编译输出的静态资源路径
        assetsSubDirectory: 'static',// 编译输出的二级目录
        devtool: '#source-map',
        productionGzip: true,
        productionGzipExtensions: ['js', 'css'],
        bundleAnalyzerReport: process.env.npm_config_report || false,

        extract: true,
        usePostCSS: true,
        useEslint: false,
        /** Source Maps */
        prodCssSourceMap: false,
        prodJsSourceMap: false,
    },
    base: {
        entry: {
            app: './src/main.js'
        },
        aliasPath: [],
        sassResources: []
    }
};
