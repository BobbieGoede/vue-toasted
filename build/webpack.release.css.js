const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	entry: {
		"vue-toasted.min": "./src/sass/toast.scss",
	},
	// output: {
	// 	path: path.resolve(__dirname, "../dist"),
	// 	publicPath: "/dist/",
	// 	filename: "[name].css",
	// 	libraryTarget: "umd",
	// },
	plugins: [
		new MiniCssExtractPlugin({
			filename: "[name].css",
			chunkFilename: "[id].css",
		}),
	],
	mode: "production",
	module: {
		rules: [
			{
				test: /\.(sa|sc|c)ss$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader", "sass-loader"],
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
	performance: {
		hints: false,
	},
};

if (process.env.NODE_ENV === "production") {
	// http://vue-loader.vuejs.org/en/workflow/production.html
	module.exports.plugins = [...(module.exports?.plugins ?? [])];
}
