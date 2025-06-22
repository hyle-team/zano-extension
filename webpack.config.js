const path = require('path');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const common = require('./webpack.common.js');

const appConfig = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'static/js/app.bundle.js',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: 'body',
    }),
  ],
};

const backgroundConfig = {
  entry: './src/background/background.ts',
  output: {
    path: path.resolve(__dirname, 'build/static/js'),
    filename: 'background.bundle.js',
  },
};

const contentConfig = {
  entry: './src/content/content.ts',
  output: {
    path: path.resolve(__dirname, 'build/static/js'),
    filename: 'content.bundle.js',
  },
};

const injectConfig = {
  entry: './src/content/inject.ts',
  output: {
    path: path.resolve(__dirname, 'build/static/js'),
    filename: 'inject.bundle.js',
  },
};

const copyConfig = {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/images', to: 'images' },
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'public/robots.txt', to: 'robots.txt' },
      ],
    }),
  ],
};

module.exports = [merge(common, appConfig, copyConfig), merge(common, backgroundConfig), merge(common, contentConfig), merge(common, injectConfig)];
