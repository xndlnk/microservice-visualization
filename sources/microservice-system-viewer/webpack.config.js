const ProgressBarPlugin = require('progress-bar-webpack-plugin')

module.exports = {
  entry: './src/viewer.ts',
  output: {
    filename: './bundle/viewer.js',
    path: [__dirname, '/build'].join('/')
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'awesome-typescript-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  plugins: [
    new ProgressBarPlugin()
  ]
}
