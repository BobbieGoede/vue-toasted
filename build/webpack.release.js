const { VueLoaderPlugin } = require("vue-loader");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
	mode: "production",
	devtool: "source-map",
	devServer: {
		historyApiFallback: true,
		noInfo: true,
	},
	entry: {
		"vue-toasted": "./src/plugin.ts",
		"vue-toasted.min": "./src/plugin.ts",
	},
	resolve: {
		alias: { vue$: "vue/dist/vue.esm.js" },
		extensions: [".ts", ".js"],
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false,
				parallel: true,
				terserOptions: {
					mangle: true,
					format: { comments: false },
				},
			}),
		],
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
				},
			},
			{
				test: /\.scss$/,
				use: ["vue-style-loader", "css-loader", "sass-loader"],
			},
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "babel-loader",
					},
					{
						loader: "ts-loader",
						options: { appendTsSuffixTo: [/\.vue$/] },
					},
				],
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
};

if (process.env.ANALYTICS) {
	module.exports.plugins.push(new BundleAnalyzerPlugin());
}
