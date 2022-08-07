"""
"""
from logging import getLogger, DEBUG, basicConfig

from collections import defaultdict
import json
# import sqlite3
import os
import psycopg2
import hashlib
import time

import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
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

DATABASE_URL = os.environ.get('DATABASE_URL')
app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# basicConfig(level=DEBUG)   # add this line

origins = [
    "*",
    "http://localhost:8080",
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
    # token:    str     # to access API
    endtime:  int     # unixtime in minutes
    duration: int     # minutes
    category: int     # freely assignable
    action:     str     # label for the button

# class Token(BaseModel):
#     token:  str

class Login(BaseModel):
    username: str
    password: str


# def token_to_user_id(cur, token):
#     cur.execute('SELECT * FROM tokens WHERE token = %s LIMIT 1', ( token, ))
#     for row in cur:
#         user_id, token, expire = row
#         now = time.time()
#         if now < expire:
#             cur.execute('UPDATE tokens SET user_id=%s, token=%s, expire=%s WHERE token = %s', (
#                 user_id,
#                 token,
#                 now+86400,
#                 token
#             ))
#             return user_id


@app.post("/v0/query/{minutes}")
async def get_history(minutes: int, token: str = Depends(oauth2_scheme)):
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

    logger = getLogger('uvicorn')

    # DB

    with psycopg2.connect(DATABASE_URL) as con:
        with con.cursor() as cur:
            user = await get_current_user(token)
            # logger.error(user)
            # user_id = token_to_user_id(cur, token.token)
            if user is None:
                return json.dumps([])

            # old enough time to be ignored
            if minutes == 0:
                ancient = 0
            else:
                ancient = time.time() / 60 - minutes

            rows = []
            cur.execute('SELECT * FROM actions WHERE user_id = %s AND endtime > %s ORDER BY endtime DESC', 
                                    ( user.user_id, ancient ))
            for row in cur:
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


@app.put("/v0/")
async def store_action(record: Record, token: str = Depends(oauth2_scheme)):
    """
    It stores an action to the DB.
    """
    # logger = getLogger('uvicorn')

    # DB
    with psycopg2.connect(DATABASE_URL) as con:
        with con.cursor() as cur:
            user = await get_current_user(token)

            # token to uid
            # user_id = token_to_user_id(cur, record.token)
            if user is None:
                return "Missing token."

            cur.execute('INSERT INTO actions VALUES ( %s, %s, %s, %s, %s ) ', (
                        user.user_id,
                        record.endtime,
                        record.duration,
                        record.category,
                        record.action,
            ))
            return "OK"
            # /DB


# @app.post("/v0/auth/")
# async def isuue_token(login: Login):
#     """
#     It receives the username and password, compare them with the data in the user DB, and issue a new token.
#     The token is valid 24 hours after the last access.
#     All the other APIs are accessed via this token.

#     There is no method to add new user to the DB.
#     """
#     # logger = getLogger('uvicorn')

#     # DB
#     with psycopg2.connect(DATABASE_URL) as con:
#         with con.cursor() as cur:
#             # logger.info(login)
#             cur.execute('SELECT * FROM auth WHERE username = %s', ( login.username, ))
#             for row in cur:
#                 uname, pw, uid = row
#                 if pw == login.password:
#                     # match!
#                     # issue a token
#                     now = time.time()
#                     data = f"{uid} {now}".encode()
#                     h = hashlib.new('sha256')
#                     h.update(data)
#                     token = h.hexdigest()
#                     # 24 hours
#                     cur.execute('INSERT INTO tokens VALUES ( %s, %s, %s )', (uid, token, now+86400) )
#                     return token
#             return ""
#             # /DB



# taken and modified from https://fastapi.tiangolo.com/ja/tutorial/security/first-steps/
from datetime import datetime, timedelta
from typing import Union

from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "999fd16a2e33e86ec8452845ce17cd6f0da1139a96ad16f3a15ccc6927a1a5cf"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Union[str, None] = None


class User(BaseModel):
    user_id: int
    # email: Union[str, None] = None
    username: Union[str, None] = None
    # disabled: Union[bool, None] = None


class UserInDB(User):
    hashed_password: str


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# app = FastAPI()


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(username: str):
    """
    userが存在すれば、そのデータベースレコードの内容を返す。
    なければ何も返さない(None)
    """
    with psycopg2.connect(DATABASE_URL) as con:
        with con.cursor() as cur:
            # logger.info(login)
            cur.execute('SELECT * FROM auth WHERE username = %s', ( username, ))
            for row in cur:
                uname, pw, uid = row
                return UserInDB(**{
                    "user_id": uid,
                    "username": uname,
                    "hashed_password": pw,
                })
            #     if pw == login.password:
            #         # match!
            #         # issue a token
            #         now = time.time()
            #         data = f"{uid} {now}".encode()
            #         h = hashlib.new('sha256')
            #         h.update(data)
            #         token = h.hexdigest()
            #         # 24 hours
            #         cur.execute('INSERT INTO tokens VALUES ( %s, %s, %s )', (uid, token, now+86400) )
            #         return token
            # return ""

    # if username in db:
    #     user_dict = db[username]
    #     return UserInDB(**user_dict)


def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


# async def get_current_active_user(current_user: User = Depends(get_current_user)):
#     if current_user.disabled:
#         raise HTTPException(status_code=400, detail="Inactive user")
#     return current_user


@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# @app.get("/users/me/", response_model=User)
# async def read_users_me(current_user: User = Depends(get_current_active_user)):
#     return current_user


# @app.get("/users/me/items/")
# async def read_own_items(current_user: User = Depends(get_current_active_user)):
#     return [{"item_id": "Foo", "owner": current_user.username}]



@app.get('/')
def hello():
    return 'Hello World!'

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8088)) )
