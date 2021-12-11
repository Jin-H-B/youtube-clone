//scripts에서 "dev:assets": "webpack --config webpack.config.js"를 "webpack"으로만 써도 default로 이 파일 찾게됨
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
  entry: {
    main: "./src/client/js/main.js",
    videoPlayer: "./src/client/js/videoPlayer.js",
    recorder: "./src/client/js/recorder.js",
    commentSection: "./src/client/js/commentSection.js",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css", //scss를 css로 바꾼 후 저장될 파일 명
    }),
  ],
  //mode: "development", //배포할때는 production 으로 바꿔야..package json에서 mode 설정 가능
  // watch: true, //development mode에서만 설정..자동으로 저장
  output: {
    filename: "js/[name].js",
    // path: "./assets/js", //webpack은 전체 주소를 다 써줘야 함
    path: path.resolve(__dirname, "assets"),
    clean: true, //output 폴더를 restart하기 전에 clean
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"], //webpack은 뒤에서부터 실행함..style-loader는 js통해 scss import해야
      },
    ],
  },
};
