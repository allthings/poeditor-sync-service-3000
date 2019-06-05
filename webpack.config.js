const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const slsw = require('serverless-webpack')
const webpack = require('webpack')

module.exports = {
  devtool: 'source-map',
  entry: slsw.lib.entries,
  externals: ['aws-sdk'],
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },
  node: {
    __dirname: true,
  },
  optimization: {
    minimize: false,
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs',
    path: `${__dirname}/.webpack`,
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      memoryLimit: 4096,
      workers: 1,
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1,
    }),
    // https://github.com/sindresorhus/got/issues/345#issuecomment-329939488
    new webpack.IgnorePlugin(/^electron$/),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    symlinks: true,
  },
  target: 'node',
}
