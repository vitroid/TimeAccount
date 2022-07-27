"""
# TimeAccount API

設計方針

セッションIDを介して接続する。
当面はログイン後にAPI側がハッシュを発行する、seat-apiの方式にする。

記録は随時行う。

期間指定で過去のデータを一気に提供する機能。
* その時に、データ連結も行う。
* 一分に1回に制限する、か、キャッシュしておく。

暗号化しない。(当面)

さっさと使いはじめたいので、最低限のAPIを準備してしまおう。

"""


from logging import getLogger, DEBUG, basicConfig

from collections import defaultdict
import json
import sqlite3
import hashlib
import time

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


basicConfig(level=DEBUG)   # add this line

con = sqlite3.connect('timeaccount.db')

app = FastAPI()

# basicConfig(level=DEBUG)   # add this line

origins = [
    "*",
    "http://localhost",
    # "http://www.chem.okayama-u.ac.jp:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Record(BaseModel):
    token:    str     # to access API
    endtime:  int     # unixtime in minutes
    duration: int     # minutes
    category: int     # freely assignable
    action:     str     # label for the button

class Token(BaseModel):
    token:  str

class Login(BaseModel):
    un: str
    pw: str


def token_to_user_id(cur, token):
    for row in cur.execute(f'SELECT * FROM tokens WHERE token = "{token}" ORDER BY rowid DESC LIMIT 1'):
        user_id, token, expire = row
        now = time.time()
        if now < expire:
            cur.execute(f'UPDATE tokens SET user_id="{user_id}", token="{token}", expire={now+86400} WHERE token = "{token}"')
            return user_id


@app.post("/v0/query/{duration}")
async def get_history(token: Token, duration: int):
    """
    It returns the action history of the user. Duration is useless for now.
    """

    def merge(r1, r2):
        t1, d1 = r1
        t2, d2 = r2
        s1 = t1 - d1
        s2 = t2 - d2
        # s1..t1 と s2..t2が重なるかどうか。
        if t1 < s2 or t2 < s1:
            return None
        s, t =  min(s1, s2), max(t1, t2)
        return t, t-s

    # logger = getLogger('uvicorn')

    # DB
    cur = con.cursor()
    user_id = token_to_user_id(cur, token.token)
    if user_id is None:
        return json.dumps([])

    # とりあえず、durationは無視する。
    rows = []
    for row in cur.execute(f'SELECT * FROM records WHERE user_id = {user_id} ORDER BY endtime DESC'):
        # 連続したレコードのactionが同じで、時区間が重なっていれば、マージする。
        if len(rows) > 0 and rows[-1][4] == row[4] and rows[-1][3] == row[3]:
            newrange = merge(rows[-1][1:3], row[1:3])
            if newrange is not None:
                rows[-1][1], rows[-1][2] = newrange
                continue
        rows.append(list(row))

    return json.dumps(rows)
    # /DB



@app.put("/v0/")
async def store_record(record: Record):
    """
    It stores an action to the DB.
    """
    # logger = getLogger('uvicorn')

    # DB
    cur = con.cursor()

    # token to uid
    user_id = token_to_user_id(cur, record.token)
    if user_id is None:
        return "Missing token."

    # !!!文字列のチェックが必要。セキュリティホールになる
    cur.execute(f'INSERT INTO records VALUES ( {user_id}, {record.endtime}, {record.duration}, {record.category}, "{record.action}" ) ')
    con.commit()
    # /DB


@app.post("/v0/auth/")
async def isuue_token(login: Login):
    """
    It receives the username and password, compare them with the data in the user DB, and issue a new token.
    The token is valid 24 hours after the last access.
    All the other APIs are accessed via this token.

    There is no method to add new user to the DB.
    """
    logger = getLogger('uvicorn')

    # DB
    cur = con.cursor()
    logger.info(login)
    for row in cur.execute(f'SELECT * FROM auth WHERE username = "{login.un}"'):
        uname, pw, uid = row
        if pw == login.pw:
            # match!
            # issue a token
            now = time.time()
            data = f"{uid} {now}".encode()
            h = hashlib.new('sha256')
            h.update(data)
            token = h.hexdigest()
            # 24 hours
            cur.execute(f'INSERT INTO tokens VALUES ("{uid}", "{token}", {now+86400})')
            con.commit()
            return token
    return ""
    # /DB

# 必要なAPI
# 全テーブルの総覧。構造化したJSONを返すのがいい。座席占有状況と、ニックネームはまとめて返す。
# これで酒井さんの123に対応できる。
# get_hallかなんか。hall全体の情報を得るAPI
# @app.post("/hall/")
# async def get_hall(guest: Guest1):
#     """
#     すべてのテーブルの利用状況を返す。
#     """
#     # logger = getLogger('uvicorn')

#     # DB
#     cur = con.cursor()
#     user_id = token_to_user_id(cur, guest.token)
#     if user_id is None:
#         return json.dumps({})

#     hall = defaultdict(dict)
#     for row in cur.execute(f'SELECT * FROM guests WHERE table_id != 0'):
#         u, n, t, s = row
#         hall[t][s] = n
#     return json.dumps(hall)
#     # /DB


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, )
