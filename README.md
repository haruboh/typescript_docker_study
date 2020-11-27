# dockerでTypeScriptの勉強

## File Configuration

```
┣ docker
┃ ┗ nginx
┃    ┗ default.conf
┣ src
┃ ┣ html
┃ ┃  ┣ js
┃ ┃  ┃  ┣ dist          ← コンパイルされたファイル
┃ ┃  ┃  ┃  ┗ greeter.js
┃ ┃  ┃  ┗ ts            ← コンパイル対象ファイル
┃ ┃  ┃     ┗ greeter.ts
┃ ┃  ┗ index.html       ← greeter.jsを読み込んでいるページ
┃ ┃
┃ ┣ node_modules         ← nodeで入れたモジュールが入るgitに入れない
┃ ┣ package.json
┃ ┣ package-lock.json
┃ ┗ tsconfig.json
┃
┣ .editconfig
┣ .gitignore
┣ docker-compose.yml 
┗ README.md
```

### docker-compose

`gitリポジトリ`参照。
`node`サービスの`image`はdockerHUBの最新バージョンを持ってくる努力をする。

### docker/nginx/default.conf

よくわからないのでおまじないと思っておく。

[Qiitaの記事](https://qiita.com/reflet/items/538753d5dcf3560567a9)を参考にしている。

## How to USE

以下の手順でリポジトリ参照と記載しているファイルはすべて`initial commit`のソースを参照すること

別な端末で開発を共有する場合はnpmコマンドのインストールとソースコードの共有をする必要がある。

```
git clone https://github.com/haruboh/typescript_docker_study.git
# npmプロジェクトの作成をする（初期化）
# 作成されるsrc/package.jsonに少し手を加える。（リポジトリ参照）
docker-compose run --rm node npm init
# TypeScript開発に必要な各種npmコマンドをインストールしておく
docker-compose run --rm node npm i -D typescript @types/node
docker-compose run --rm node npm i -D ts-node ts-node-dev rimraf npm-run-all
# TypeScriptのコンパイラオプションファイルを作成。
# 作成されるsrc/tsconfig.jsonに少し手を加える。（リポジトリ参照）
docker-compose run --rm node npx tsc --init
```

以上の準備ができたら`src/html/index.html`,`src/html/js/ts/XXXX`などを作成し開発をすすめる。

作成したTSファイルをコンパイルしたいときは以下のコマンド

```
docker-compose run --rm node npm build
```

動作確認

以下のコマンドを叩いた後にブラウザで`http://localhost:8080`を閲覧する。

```
docker-compose up -d
```
