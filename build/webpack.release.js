const { VueLoaderPlugin } = require("vue-loader");
const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const terserOptions = {
	extractComments: false,
	terserOptions: {
		mangle: true,
		format: { comments: false },
	},
};

module.exports = {
	mode: "production",
	devtool: "eval-cheap-source-map",
	devServer: {
		historyApiFallback: true,
		noInfo: true,
	},
	entry: {
		"vue-toasted": "./src/index.ts",
		"vue-toasted.min": "./src/index.ts",
	},
	resolve: {
		alias: {
			vue$: "vue/dist/vue.esm.js",
		},
		extensions: [".ts", ".js"],
	},
	optimization: {
		minimizer: [new TerserPlugin(terserOptions)],
		// minimize: false,
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
};

if (process.env.NODE_ENV === "production") {
	module.exports.devtool = "source-map";
	// http://vue-loader.vuejs.org/en/workflow/production.html
	module.exports.plugins = [
		...(module.exports?.plugins ?? []),
		new webpack.DefinePlugin({ "process.env": { NODE_ENV: '"production"' } }),
		new TerserPlugin(terserOptions),
		new webpack.ProvidePlugin({}),
		// new BundleAnalyzerPlugin(),
		new webpack.LoaderOptionsPlugin({
			minimize: true,
		}),
	];
}
