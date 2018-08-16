module.exports = {
  entry: './src/frontend/index.ts',
  output: {
    filename: './bundle/frontend/bundle.js',
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
  }
}
