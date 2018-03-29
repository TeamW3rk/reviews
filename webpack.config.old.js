const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
  context: __dirname,
  entry: ['./components/App.js'],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public')
  },
  module: {
    rules: [
      {
        test: /\.scss|\.css$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader']
        })
      },
      { test: /\.jsx?$/, loader: 'babel-loader' },
      {
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader', options: { name: 'cache.worker.bundle.js' } }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('./css/main.css'),
    new HtmlWebpackPlugin({
      inject: false,
      template: require('html-webpack-template'),
      appMountId: "app",
      links: ['https://fonts.googleapis.com/css?family=Lato:300,400']
    })
  ],
  devtool: "source-map",
  target: "web"
};
