const { VueLoaderPlugin } = require("vue-loader");
var path = require("path");
var webpack = require("webpack");
// var autoprefixer = require('autoprefixer')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
	entry: "./src/index.ts",
	output: {
		path: path.resolve(__dirname, "./dist"),
		publicPath: "/dist/",
		filename: "vue-toasted.min.js",
		libraryTarget: "umd",
	},
	plugins: [new VueLoaderPlugin()],
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: "vue-loader",
				options: {
					loaders: {
						scss: "vue-style-loader!css-loader!postcss-loader!sass-loader",
						sass: "vue-style-loader!css-loader!postcss-loader!sass-loader?indentedSyntax",
					},
					// other vue-loader options go here
				},
			},
			{
				test: /\.scss$/,
				use: ["vue-style-loader", "css-loader", "sass-loader"],
			},
			{
				test: /\.ts$/,
				loader: "ts-loader",
				options: { appendTsSuffixTo: [/\.vue$/] },
			},
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.(png|jpg|gif|svg)$/,
				loader: "file-loader",
				options: {
					name: "[name].[ext]?[hash]",
				},
			},
		],
	},
	resolve: {
		alias: {
			vue$: "vue/dist/vue.esm.js",
		},
		extensions: [".ts", ".js"],
	},
	devServer: {
		historyApiFallback: true,
		noInfo: true,
	},
	performance: {
		hints: false,
	},
	mode: "development",
	devtool: "eval-cheap-source-map",
	devServer: {
		disableHostCheck: true,
	},
};

if (process.env.NODE_ENV === "production") {
	module.exports.mode = "production";
	module.exports.devtool = "#source-map";
	// http://vue-loader.vuejs.org/en/workflow/production.html
	module.exports.plugins = (module.exports.plugins || []).concat([
		// new webpack.optimize.UglifyJsPlugin({
		// 	sourceMap: false,
		// 	compress: { warnings: false },
		// 	comments: false,
		// }),
		new webpack.ProvidePlugin({}),
		// new BundleAnalyzerPlugin(),
		new webpack.LoaderOptionsPlugin({
			minimize: true,
		}),
	]);
}
