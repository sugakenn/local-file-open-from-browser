### ブラウザからローカルファイル・フォルダをオープンするためのバックグラウンドサーバー

Windows専用です。

JavaScriptとElectron環境で構築してあります。

[ブログでも解説しています](https://nanbu.marune205.net/2022/07/open-local-folder-file-from-browser.html?m=1)

#### クイックスタート
- git clone https://github.com/sugakenn/local-file-open-from-browser.git

- npm install

- npm run make

#### 使い方

npm run makeで生成されるプロジェクトのoutフォルダの中にopenlocal-file-win32-x64フォルダがあります。

フォルダごろ別の場所に移動してください。中のopenlocal-file.exeからバックグランドサーバーを起動します。

起動したサーバーに対して次のようにAJAXすることでファイルやフォルダをオープンします。
GoogleChromeだと、AJAXを実行するページがhttpsでないと利用できないようです。

open folder
localhost:8080/folder?path=c:\

open file
localhost:8080/file?path=c:\sample.txt

stop server
localhost:8080/end
