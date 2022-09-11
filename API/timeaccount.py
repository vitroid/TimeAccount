import json
import os
import time
from logging import DEBUG, basicConfig, getLogger

# import psycopg2
import uvicorn
import yaml
from deta import Deta
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

config = yaml.safe_load(open("config.yaml"))
deta = Deta(config["deta_project_key"])

# basicConfig(level=DEBUG)   # add this line

# UI_URL = "http://timeaccount.herokuapp.com"
# API_URL = "http://timeaccount.herokuapp.com/v0"
API_URL = "http://localhost:8088/v0"
UI_URL = "http://localhost:8088"
# DATABASE_URL = os.environ.get('DATABASE_URL')
app = FastAPI()
api = FastAPI(openapi_prefix="/v0")
app.mount("/v0", api)
app.mount("/", StaticFiles(directory="./public", html=True), name="static")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# basicConfig(level=DEBUG)   # add this line

origins = [
    "*",
    # "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Action(BaseModel):
    # token:    str     # to access API
    endtime:  int     # unixtime in minutes
    duration: int     # minutes
    category: str     # freely assignable
    action:   str     # label for the button

class Login(BaseModel):
    username: str
    password: str



@api.get("/history/{minutes}")
async def history(minutes: int, token: str = Depends(oauth2_scheme)) -> str:
    """It returns the action history of the user.

    Args:
        minutes (int): select all events if it is zero, otherwise select events within {minutes}.
        token (str, optional): auth token. Defaults to Depends(oauth2_scheme).

    Returns:
        str: History data in JSON format.
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

    # with psycopg2.connect(DATABASE_URL) as con:
        # with con.cursor() as cur:
    user = await get_current_user(token)

    if user is None:
        return json.dumps([])

    # old enough time to be ignored
    if minutes == 0:
        ancient = 0
    else:
        ancient = time.time() / 60 - minutes

    actions = deta.Base("actions")
    fetch_res = actions.fetch({"user_id": user.user_id})

    return json.dumps([item for item in sorted(fetch_res.items, key=lambda x: -x["endtime"])])

    # with psycopg2.connect(DATABASE_URL) as con:
    #     with con.cursor() as cur:
    #         user = await get_current_user(token)
    #         # logger.error(user)

    #         if user is None:
    #             return json.dumps([])

    #         # old enough time to be ignored
    #         if minutes == 0:
    #             ancient = 0
    #         else:
    #             ancient = time.time() / 60 - minutes

    #         rows = []
    #         cur.execute('SELECT * FROM actions WHERE user_id = %s AND endtime > %s ORDER BY endtime DESC',
    #                                 ( user.user_id, ancient ))
    #         for row in cur:
    #             # 連続したレコードのactionが同じで、時区間が重なっていれば、マージする。
    #             if len(rows) > 0:
    #                 category, action = row[3:5]
    #                 if rows[-1][4] == action and rows[-1][3] == category:
    #                     newrange = merge(rows[-1][1:3], row[1:3])
    #                     if newrange is not None:
    #                         rows[-1][1], rows[-1][2] = newrange
    #                         continue
    #             rows.append(list(row))

    #         return json.dumps(rows)


@api.put("/")
async def store_action(action: Action, token: str = Depends(oauth2_scheme)):
    """
    It stores an action to the DB.
    """
    # logger = getLogger('uvicorn')

    actions = deta.Base("actions")
    user = await get_current_user(token)

    if user is None:
        return "Missing token."

    actions.insert({
        "user_id":  user.user_id,
        "endtime":  action.endtime,
        "duration": action.duration,
        "category": action.category,
        "action":   action.action
    })

    return "OK"

    # with psycopg2.connect(DATABASE_URL) as con:
    #     with con.cursor() as cur:
    #         user = await get_current_user(token)

    #         if user is None:
    #             return "Missing token."

    #         cur.execute('INSERT INTO actions VALUES ( %s, %s, %s, %s, %s ) ', (
    #                     user.user_id,
    #                     action.endtime,
    #                     action.duration,
    #                     action.category,
    #                     action.action,
    #         ))
    #         return "OK"


# taken and modified from https://fastapi.tiangolo.com/ja/tutorial/security/first-steps/
# この仕掛けでは、token自身が情報を蓄えているので、サーバ側はtokenの寿命等を保管しておく必要がない。
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
ACCESS_TOKEN_EXPIRE_MINUTES = 120


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Union[str, None] = None


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


def get_user(username: str = None, user_id: int = None, including_expired = False):
    """
    userが存在すれば、そのデータベースレコードの内容を返す。
    なければ何も返さない(None)
    """
    logger = getLogger('uvicorn')
    now = time.time()
    auth = deta.Base("auth")
    if username is not None:
        fetch_res = auth.fetch({"username": username})
        for item in fetch_res.items:
            expires = item["expires"]
            if expires == 0 or now < expires or including_expired:
                logger.info(item)
                return UserInDB(**{
                    "user_id": item["user_id"],
                    "username": item["username"],
                    "hashed_password": item["hashed_password"]
                })
    if user_id is not None:
        fetch_res = auth.fetch({"user_id": user_id})
        for item in fetch_res.items:
            expires = item["expires"]
            if expires == 0 or now < expires or including_expired:
                logger.info(item)
                return UserInDB(**{
                    "user_id": item["user_id"],
                    "username": item["username"],
                    "hashed_password": item["hashed_password"]
                })

    # with psycopg2.connect(DATABASE_URL) as con:
    #     with con.cursor() as cur:
    #         # logger.info(login)
    #         if username is not None:
    #             cur.execute('SELECT * FROM auth WHERE username = %s', ( username, ))
    #             for row in cur:
    #                 uname, pw, uid, expires = row
    #                 if expires == 0 or now < expires or including_expired:
    #                     return UserInDB(**{
    #                         "user_id": uid,
    #                         "username": uname,
    #                         "hashed_password": pw,
    #                     })
    #         if user_id is not None:
    #             cur.execute('SELECT * FROM auth WHERE user_id = %s', ( user_id, ))
    #             for row in cur:
    #                 uname, pw, uid, expires = row
    #                 if expires == 0 or now < expires or including_expired:
    #                     return UserInDB(**{
    #                         "user_id": uid,
    #                         "username": uname,
    #                         "hashed_password": pw,
    #                     })


def new_user(user_id:int, username: str, password: str, expires: int = 0 ):
    auth = deta.Base("auth")
    auth.insert({
        "username": username,
        "user_id":  user_id,
        "expires":  expires,
        "hashed_password": get_password_hash(password)
    })
    # with psycopg2.connect(DATABASE_URL) as con:
    #     with con.cursor() as cur:
    #         cur.execute('INSERT INTO auth VALUES ( %s, %s, %s, %s )', (
    #             username,
    #             get_password_hash(password),
    #             user_id,
    #             expires)
    #         )


def authenticate_user(username: str, password: str):
    user = get_user(username=username)
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
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=user_id)
    except JWTError:
        raise credentials_exception
    user = get_user(user_id=int(token_data.user_id))
    if user is None:
        raise credentials_exception
    return user


# async def get_current_active_user(current_user: User = Depends(get_current_user)):
#     if current_user.disabled:
#         raise HTTPException(status_code=400, detail="Inactive user")
#     return current_user


@api.post("/token", response_model=Token)
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
        data={"sub": f"{user.user_id}"},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


def authenticate_user(username: str, password: str):
    user = get_user(username=username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user



def mail(to, subject, body):
    pass

from validate_email import validate_email

from sendmail import mail

NEWUSER_ACCOUNT_EXPIRE_MINUTES = 10


@api.post("/signup", response_model=Token)
async def signup(form_data: OAuth2PasswordRequestForm = Depends()):
    """_summary_

    Args:
        form_data (OAuth2PasswordRequestForm, optional): _description_. Defaults to Depends().

    Raises:
        HTTPException: _description_

    Returns:
        _type_: _description_
    """
    # ユーザ名(メールアドレス)とパスワードを入力してもらう。
    # すでに存在するユーザの場合はエラーを返す。
    # 存在しない場合は
    # 1. user_idをユーザ名から合成する(hash、整数で)
    # 2. ユーザ名とパスワードとuser_idと寿命をユーザDBに追加する。
    # 3. ユーザ名に対し、承認メールを送る。
    # 4. (confirmation)メールへの返答を受けとり、アカウントを永続化する。
    logger = getLogger('uvicorn')

    now = int(time.time())

    logger.info("Validating the email address")
    valid_email = validate_email(email_address=form_data.username, check_blacklist=False, check_dns=False, check_smtp=False)
    logger.info(f"{form_data.username}: {valid_email}")
    if not valid_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Only a valid email address is accepted.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = get_user(form_data.username)
    if user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User already exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = hash(form_data.username)
    while get_user(user_id=user_id, including_expired=True):
        user_id += 2
    new_user(user_id=user_id,
        username=form_data.username,
        password=form_data.password,
        expires = now + NEWUSER_ACCOUNT_EXPIRE_MINUTES*60
    )
    # tokenの中に、uidと、expiresを入れてencodeしておく。
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": f"{user_id}"},
        expires_delta=access_token_expires
    )
    link = f"{API_URL}/verify?token={access_token}"
    body = f"Click the following URL to verify your siginig up to the TimeAccount.\n{link}"
    mail(to=form_data.
        username,
        subject="TimeAccount user verification",
        body=body,
        api_key=config["sendgrid_api_key"])
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": f"{user_id}"},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@api.get("/verify")
async def verify(token: str):
    logger = getLogger('uvicorn')
    user = await get_current_user(token)
    logger.info(user)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    logger.info(f"Access granted to {user.username}.")

    # make the account persistent
    auth = deta.Base("auth")
    fetch_res = auth.fetch({"user_id": user.user_id})
    for item in fetch_res.items:
        logger.info(item)
        auth.update({"expires": 0}, key=item["key"])

    return RedirectResponse(f"{UI_URL}")



# @app.get("/users/me/", response_model=User)
# async def read_users_me(current_user: User = Depends(get_current_active_user)):
#     return current_user


# @app.get("/users/me/items/")
# async def read_own_items(current_user: User = Depends(get_current_active_user)):
#     return [{"item_id": "Foo", "owner": current_user.username}]



# @app.get('/')
# def hello():
#     return 'Hello World!'

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8088)) )
