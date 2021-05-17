const { VueLoaderPlugin } = require("vue-loader");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./example/main.js",
	// output: {
	// 	path: path.resolve(__dirname, "./dist"),
	// 	publicPath: "/dist/",
	// 	filename: "vue-toasted.min.js",
	// 	libraryTarget: "umd",
	// },
	plugins: [new HtmlWebpackPlugin({ template: "./example/index.html" }), new VueLoaderPlugin()],
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
				test: /\.(sc|c)ss$/,
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
		port: 7777,
	},
	mode: "development",
	devtool: "eval-cheap-source-map",
	devServer: {
		disableHostCheck: true,
	},
};

if (process.env.NODE_ENV === "production") {
	module.exports.mode = "production";
	// module.exports.devtool = "hidden-source-map";
	// http://vue-loader.vuejs.org/en/workflow/production.html
	module.exports.plugins = (module.exports.plugins || []).concat([
		// new BundleAnalyzerPlugin(),
	]);
}
