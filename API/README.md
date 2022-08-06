* FastAPI+pgsql+heroku(そのまんま) でも記事未完。 https://miseruit.com/2022/07/28/post-2905/
* Heroku上にDBを作る方法 https://amateur-engineer-blog.com/heroku-postgres-connecting-by-python/
* Python appをherokuに上げる方法 https://qiita.com/ahpjop/items/e333eaf304dcdd72d886
* herokuへのPythonアプリのdeploy。うまくいった。 http://kakedashi-xx.com:25214/index.php/2021/11/21/post-3678/


あらかじめheroku上にtimeaccountアプリの準備はできており、DBも作ってある。
```
$ git init
$ git add Procfile requirements.txt runtime.txt timeaccount.py # 必要なものは4つだけ。
$ git commit -m.
$ heroku git:remote -a timeaccount
$ git push heroku master
$ curl https://timeaccount.herokuapp.com/
```

初回はこれでいいんだが、このフォルダーに書かれた.gitの情報は、下のフォルダーのgit updateで消えてしまいそうな気がする。
その場合、再接続は面倒そう。herokuからpull/cloneできるのかもね。それなら、もはやTimeAccount/の中で開発しないほうがいいかも。

そういや、appの中ではDBのアクセス方法について何も書かず、ENVVARを参照するだけなのだが、問題なく動いたということは、この書き方でよかったのか。

次は、github pages上にあるsvelteを改変するか。