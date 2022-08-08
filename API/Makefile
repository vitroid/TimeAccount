test-auth:
	curl -X POST http://localhost:8000/v0/auth/ -H "Content-Type: application/json" -d '{"un":"matto","pw":"papepo"}' -v 


test-record:
	curl -X PUT http://localhost:8000/v0/ -H "Content-Type: application/json" -d '{"token":"c66582a46ae2cf85be4db138319672c1108aa2149ad63e8befeab5d5d48af6bf","endtime":999999,"duration":20,"category":1,"action":"nap"}' -v

test-query:
	curl -X POST http://localhost:8000/v0/query/999 -H "Content-Type: application/json" -d '{"token":"c66582a46ae2cf85be4db138319672c1108aa2149ad63e8befeab5d5d48af6bf"}' -v


routine:
	git add timeaccount.py
	git commit -m.
	git push heroku master

# added .vscode/settings.json to enable pipenv on vscode.

# 過去データが巨大になった時に処理が重くならないように、何か対策が必要。