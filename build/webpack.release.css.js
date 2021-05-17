const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
	mode: "production",
	entry: {
		"vue-toasted.min": "./src/sass/toast.scss",
	},
	optimization: {
		splitChunks: {
			cacheGroups: {
				styles: {
					name: "styles",
					type: "css/mini-extract",
					// For webpack@4
					// test: /\.css$/,
					chunks: "all",
					enforce: true,
				},
			},
		},
	},
	output: {
		path: path.resolve(__dirname, "../dist"),
		publicPath: "./dist/",
		filename: "[name].css",
		libraryTarget: "umd",
	},
	plugins: [new MiniCssExtractPlugin()],
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
};

if (process.env.NODE_ENV === "production") {
	// http://vue-loader.vuejs.org/en/workflow/production.html
	module.exports.plugins = [...(module.exports?.plugins ?? [])];
}
