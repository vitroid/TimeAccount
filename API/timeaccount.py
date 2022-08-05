"""
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


# basicConfig(level=DEBUG)   # add this line

# from createdb import _createdb
# import os
# if os.path.exists("timeaccount.db"):
#     os.remove("timeaccount.db")
#     # return "DB exists."
# _createdb()
# from adduser import adduser
# adduser(["matto", "papepo-master"])


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
    for row in cur.execute('SELECT * FROM tokens WHERE token = :token ORDER BY rowid DESC LIMIT 1', {"token": token}):
        user_id, token, expire = row
        now = time.time()
        if now < expire:
            cur.execute('UPDATE tokens SET user_id=:user_id, token=:token, expire=:expire WHERE token = :token', {
                "expire" : now+86400,
                "user_id": user_id,
                "token"  : token,
            })
            return user_id


@app.post("/v0/query/{minutes}")
async def get_history(token: Token, minutes: int):
    """
    It returns the action history of the user.

    [Parameters]
    Minutes: select all events if it is zero, otherwise select events within {minutes}.

    [Returns]
    Event list in JSON format.
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

    # old enough time to be ignored
    if minutes == 0:
        ancient = 0
    else:
        ancient = time.time() / 60 - minutes

    rows = []
    for row in cur.execute('SELECT * FROM records WHERE user_id = :user_id AND endtime > :ancient ORDER BY endtime DESC', 
                            { "user_id": user_id,
                              "ancient": ancient }):
        # 連続したレコードのactionが同じで、時区間が重なっていれば、マージする。
        if len(rows) > 0:
            category, action = row[3:5]
            if rows[-1][4] == action and rows[-1][3] == category:
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
    cur.execute('INSERT INTO records VALUES ( :user_id, :endtime, :duration, :category, :action ) ', {
        "user_id" : user_id,
        "endtime" : record.endtime,
        "duration": record.duration,
        "category": record.category,
        "action"  : record.action,
    })
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
    for row in cur.execute('SELECT * FROM auth WHERE username = :username ', { "username": login.un }):
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
            cur.execute('INSERT INTO tokens VALUES ( :uid, :token, :time )', { "uid": uid, "token":token, "time":now+86400 })
            con.commit()
            return token
    return ""
    # /DB



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8088, )
