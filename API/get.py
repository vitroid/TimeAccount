import os

import psycopg2


def user_list():
    DATABASE_URL = os.environ.get('DATABASE_URL')

    with psycopg2.connect(DATABASE_URL) as con:
        with con.cursor() as cur:
            cur.execute('SELECT * FROM auth')
            for row in cur:
                uname, pw, uid, expires = row
                print(f"{uname}:{pw}:{uid}:{expires}")


if __name__ == "__main__":
    # 迂闊に使わないように、stop codeを入れておく。
    # assert False
    user_list()
