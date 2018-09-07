const ProgressBarPlugin = require('progress-bar-webpack-plugin')

module.exports = {
  entry: './src/viewer.ts',
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    path: [__dirname, 'build', 'bundle'].join('/')
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: 'webpack.tsconfig.json'
        }
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
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      automaticNameDelimiter: '-'
    }
  }
}
