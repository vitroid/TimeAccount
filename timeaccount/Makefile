# 最初にgh-pagesライブラリが必要
prepare:
	npm install
	npm i gh-pages

# public/buildディレクトリの内容を再構成する。
# public以下のファイルだけで完全に動作する。
build:
	npm run build

inspect:
	open public/index.html

# それをgithub pagesのページとしてdeployする。
deploy-gh-pages:
	node ./gh-pages.js

# github側のpagesの設定で、ブランチ(ここではpages)を指定する(デフォルトだとgh-pagesになってるがそれは使ってしまった)
# 中から自前のAPIをhttpsではなくhttpでアクセスしているために、APIへのアクセスを拒否された。
# pagesで動かそうと思うとAPI側も同時に作業しないといけないのか・・・道は遠い。

# https://www.devsamples.com/javascript/svelte/deploy-svelte-app-gh-pages
# これでうまくいくはず。
# APIのほうは別に設けるしかない。いずれはそれも外部クラウド上に作るのだろう。

