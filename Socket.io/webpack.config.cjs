const path = require('path');

module.exports = {
  entry: './script.js', // Fișierul tău principal
  output: {
    filename: 'bundle.js', // Fișierul care va fi generat de Webpack
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Folosește Babel pentru transpile
        },
      },
    ],
  },
};
