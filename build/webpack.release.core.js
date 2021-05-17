const path = require("path");
const webpack = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
	mode: "production",
	devtool: "source-map",
	plugins: [new VueLoaderPlugin()],
	entry: {
		toasted: "./src/index-core.ts",
		"toasted.min": "./src/index-core.ts",
	},
	devServer: {
		historyApiFallback: true,
		noInfo: true,
	},
	optimization: {
		minimizer: [new TerserPlugin({ extractComments: false })],
		// minimize: false,
	},
	resolve: {
		alias: {
			vue$: "vue/dist/vue.esm.js",
		},
		extensions: [".ts", ".js"],
	},
	output: {
		path: path.resolve(__dirname, "../dist"),
		publicPath: "/dist/",
		filename: "[name].js",
		libraryTarget: "umd",
	},
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
				},
			},
			{
				test: /\.scss$/,
				use: ["vue-style-loader", "css-loader", "sass-loader"],
			},
			{
				test: /\.js$/,
				loader: "babel-loader",
				exclude: /node_modules/,
			},
			{
				test: /\.ts$/,
				loader: "ts-loader",
				options: { appendTsSuffixTo: [/\.vue$/] },
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
};

if (process.env.NODE_ENV === "production") {
	module.exports.devtool = "source-map";
	// http://vue-loader.vuejs.org/en/workflow/production.html
	module.exports.plugins = [
		...(module.exports?.plugins ?? []),
		new webpack.DefinePlugin({ "process.env": { NODE_ENV: '"production"' } }),
		new TerserPlugin({ extractComments: false }),
		new webpack.ProvidePlugin({}),
		// new BundleAnalyzerPlugin(),
		new webpack.LoaderOptionsPlugin({
			minimize: true,
		}),
	];
}
