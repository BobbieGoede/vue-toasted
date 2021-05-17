const path = require("path");
const webpack = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");

module.exports = {
	entry: {
		toasted: "./src/index-core.ts",
		"toasted.min": "./src/index-core.ts",
	},
	output: {
		path: path.resolve(__dirname, "../dist"),
		publicPath: "/dist/",
		filename: "[name].js",
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
	devtool: "source-map",
};

if (process.env.NODE_ENV === "production") {
	module.exports.devtool = "source-map";
	// http://vue-loader.vuejs.org/en/workflow/production.html
	module.exports.plugins = [
		...(module.exports?.plugins ?? []),
		new webpack.DefinePlugin({
			"process.env": { NODE_ENV: '"production"' },
		}),
		new webpack.ProvidePlugin({}),
		// new BundleAnalyzerPlugin(),
		new webpack.LoaderOptionsPlugin({
			minimize: true,
		}),
	];
}
