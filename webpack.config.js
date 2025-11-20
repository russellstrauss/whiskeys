const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  // Detect production mode
  const isProduction = (argv && argv.mode === 'production') || process.env.NODE_ENV === 'production';
  
  return {
  entry: [
    path.resolve(__dirname, 'assets/js/preload.js'),
    path.resolve(__dirname, 'assets/js/main.js'),
  ],
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true, // Clean the output directory before emit
    publicPath: '', // Use relative paths for subdirectory deployment
    environment: {
      arrowFunction: true,
      const: true,
      destructuring: true,
      forOf: true,
    },
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  stats: 'minimal',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, 'assets/js'),
          path.resolve(__dirname, 'node_modules/three/examples/jsm'),
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['> 1%', 'last 2 versions']
                }
              }]
            ],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [
          isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    // Copy static assets first (before other plugins)
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'index.html'),
          to: path.resolve(__dirname, 'dist', 'index.html'),
          transform(content) {
            // Update paths in HTML for production
            let html = content.toString();
            // Always update paths when copying to dist
            // Replace CSS path
            html = html.replace(
              /href="assets\/sass\/main\.css"/g,
              'href="css/main.css"'
            );
            // Replace bundle path
            html = html.replace(
              /src="dist\/js\/bundle\.js"/g,
              'src="js/bundle.js"'
            );
            // Replace vendor script path - use CDN as fallback for better reliability
            html = html.replace(
              /src="assets\/vendors\/js\/d3\.v5\.min\.js"/g,
              'src="https://cdn.jsdelivr.net/npm/d3@5/dist/d3.min.js"'
            );
            return html;
          },
        },
        {
          from: path.resolve(__dirname, 'assets', 'img'),
          to: 'img',
        },
        {
          from: path.resolve(__dirname, 'assets', 'data'),
          to: 'data',
        },
        {
          from: path.resolve(__dirname, 'assets', 'obj'),
          to: 'obj',
        },
        {
          from: path.resolve(__dirname, 'assets', 'vendors', 'js', 'd3.v5.min.js'),
          to: 'js/d3.v5.min.js',
        },
        {
          from: path.resolve(__dirname, 'assets', 'vendors', 'js', 'three.js', 'examples', 'fonts', 'helvetiker_regular.typeface.json'),
          to: 'fonts/helvetiker_regular.typeface.json',
        },
      ],
    }),
    // Extract CSS to a separate file in production
    ...(isProduction ? [
      new MiniCssExtractPlugin({
        filename: 'css/main.css',
      }),
    ] : []),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    compress: true,
    port: 3000,
    open: true,
    hot: true,
    watchFiles: ['assets/**/*', 'index.html'],
    client: {
      logging: 'none',
    },
  },
  mode: isProduction ? 'production' : 'development',
  };
};
