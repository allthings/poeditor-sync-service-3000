const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const HappyPack = require('happypack')
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
        loader: 'happypack/loader?id=ts',
        test: /\.tsx?$/,
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
    new HappyPack({
      id: 'ts',
      loaders: [
        {
          path: 'ts-loader',
          query: {
            happyPackMode: true,
            transpileOnly: true,
          },
        },
      ],
      threads: 4,
    }),
    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true,
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
