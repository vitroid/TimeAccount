import os

import psycopg2


def _createdb():
    DATABASE_URL = os.environ.get('DATABASE_URL')

    with psycopg2.connect(DATABASE_URL) as con:
        with con.cursor() as cur:

            # drop table
            # cur.execute('''DROP TABLE tokens''')
            # Create table
            # cur.execute('''CREATE TABLE records (user_id integer, endtime integer, duration integer, category integer, action text)''')
            # cur.execute('''CREATE TABLE auth (username text, password text, user_id SERIAL PRIMARY KEY, expires integer)''')
            # cur.execute('''CREATE TABLE tokens (user_id integer, token text PRIMARY KEY, expire float)''')
            # Add a field
            cur.execute('''alter table auth add expires integer default 0''')


if __name__ == "__main__":
    # 迂闊に使わないように、stop codeを入れておく。
    assert False
    _createdb()
    # from adduser import adduser
    # adduser(["matto", "papepo"])
