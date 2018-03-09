let path = require('path');
let LiveReloadPlugin = require('webpack-livereload-plugin');

module.exports = {
entry: {
		index:'./client/home/index.js',
		admin:'./client/admin/index.js',
    terms:'./client/terms/index.js'
	},
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'client/dist')
  },
  context: __dirname,
  resolve: {
    extensions: ['.js', '.jsx', '.json', '*']
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
      options: {
        presets: ['react', 'es2015']
      }
    },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
	  { 
		test: /\.(png|woff|woff2|eot|ttf|svg)$/, 
		loader: 'url-loader?limit=100000' 
		}
	]
  },
  plugins: [
    new LiveReloadPlugin({appendScriptTag: true})
  ]
};