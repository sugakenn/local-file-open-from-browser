// Electron
const electron = require("electron");

// 他ライブラリ
const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");

// ローカルWebサーバーからOSコマンドを実行
const { execSync } = require("child_process");

// Electronのアプリ
const app = electron.app;

// アプリのredyイベント検知でサーバーを起動
// Windowを生成する場合もready以後で行います
app.whenReady().then(function () {
  http
    .createServer((req, res) => {
      res.setHeader("Access-Control-Allow-Origin", "*");

      //アクセスしてきたURLを取得
      var objUrl = url.parse(req.url, true);
      var strFilePath = null;
      var strCmd = null;

      // GETパラメータにファイルまたはフォルダのパスをセットする
      if (objUrl.query.path) {
        strFilePath = decodeURIComponent(objUrl.query["path"]);
      }

      switch (objUrl.pathname) {
        case "/file":
          //ファイルオープン(処理が煩雑なのでサブメソッドへ)
          if (strFilePath) {
            openFile(strFilePath);
          }
          break;
        case "/folder":
          //フォルダオープン
          if (strFilePath) {
            strCmd = 'start explorer.exe "' + strFilePath + '" ';
            console.log(strCmd);
            execSync(strCmd);
          }
          break;
        case "/end":
          //アプリ終了
          console.log("server end");
          app.quit();
          break;
        default:
      }
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end();
    })
    .listen(8080, () => console.log("server start"));
});

function openFile(strFilePath) {
  // ファイルオープン処理
  // strFilePathの文字コードはUTF-8ですがそのままexeSyncに渡すことができます
  // (console.logでは文字化けします)

  var strExt = path.extname(strFilePath); //拡張子取得
  var stdout;
  var lines;
  var strFound;
  var strFileType;
  var strAppPathBase;
  var strAppPathConv;
  var intFound;

  // コマンドプロンプトからファイルタイプを取得します
  // .txt=txtfile という形で結果が返ります

  stdout = execSync("cmd /c assoc " + strExt);

  lines = stdout.toString().split("\r\n");
  strFound = lines.find(function (value) {
    if (value.startsWith(strExt)) {
      return true;
    } else {
      return false;
    }
  });

  if (strFound) {
    //ファイルタイプを返す
    strFileType = strFound.substring(strExt.length + 1);
  } else {
    //オープンするアプリを見つけられないので親フォルダをオープンする
    openParentFolder(strFilePath);
    console.log("not found assoc");
    return;
  }

  // ファイルタイプから、関連付けられたアプリを取得します
  // txtfile=%SystemRoot%\system32\NOTEPAD.EXE %1 のような戻り値になります
  // パスに空白が含まれる場合は"が存在することもあるようです
  stdout = execSync("cmd /c ftype " + strFileType);
  lines = stdout.toString().split("\r\n");
  strFound = lines.find(function (value) {
    if (value.startsWith(strFileType)) {
      return true;
    } else {
      return false;
    }
  });
  if (strFound) {
    strAppPathBase = strFound.substring(strFileType.length + 1);
  } else {
    //オープンするアプリを見つけられないので親フォルダをオープンする
    openParentFolder(strFilePath);
    console.log("not found ftype");
    return;
  }

  // 結果が"で区切られている場合とそうでない場合がある
  // またパラメータ%1の記述があったりするので除去
  if (strAppPathBase.startsWith('"')) {
    // "がある場合は次の"まで
    intFound = strAppPathBase.indexOf('"', 1);
    if (3 < intFound) {
      strAppPathConv = strAppPathBase.substring(1, intFound);
    }
  } else {
    // "がない場合は次空白まで
    intFound = strAppPathBase.indexOf(" ");
    if (2 < intFound) {
      strAppPathConv = strAppPathBase.substring(0, intFound);
    } else {
      strAppPathConv = strAppPathBase.trim();
    }
  }

  if (strAppPathConv) {
    // 関連付けられたアプリでオープン
    if (fs.existsSync(strFilePath)) {
      // 関連付けられたアプリでオープン
      var strCmd = 'start "' + strAppPathConv + '" "' + strFilePath + '"';
      console.log(strCmd);
      execSync(strCmd);
    } else {
      // ファイルが見つからないので親フォルダをオープン
      openParentFolder(strFilePath);
      console.log("not found file");
    }
  } else {
    openParentFolder(strFilePath);
    console.log("not found app");
  }
}

function openParentFolder(str) {
  //親フォルダをオープン
  var strCmd = 'start explorer.exe "' + path.dirname(str) + '"';
  console.log(strCmd);
  execSync(strCmd);
}