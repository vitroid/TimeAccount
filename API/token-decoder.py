from jose import jwt

access_token= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImV4cCI6MTY1OTkzMTQzNn0.jTGbRocTOn2UrZ00XWMVMKAQ6FSlPnIdec66r4mUi7w"
SECRET_KEY = "999fd16a2e33e86ec8452845ce17cd6f0da1139a96ad16f3a15ccc6927a1a5cf"
ALGORITHM = "HS256"
payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
print(payload)
