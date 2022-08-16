import os

import psycopg2


def _modify():
    DATABASE_URL = os.environ.get('DATABASE_URL')

    with psycopg2.connect(DATABASE_URL) as con:
        with con.cursor() as cur:

            # drop table
            # cur.execute('''DROP TABLE tokens''')
            # Create table
            # cur.execute('''CREATE TABLE actions (user_id int8, endtime integer, duration integer, category integer, action text)''')
            # cur.execute('''CREATE TABLE auth (username text, password text, user_id int8 PRIMARY KEY, expires integer)''')
            # Add a field
            # cur.execute('''alter table auth add expires integer default 0''')
            # cur.execute('''ALTER TABLE auth ALTER COLUMN user_id TYPE int8''')
            # cur.execute('''ALTER TABLE actions ALTER COLUMN user_id TYPE int8''')
            cur.execute('''DELETE FROM actions WHERE category > 5''')

if __name__ == "__main__":
    # 迂闊に使わないように、stop codeを入れておく。
    assert False
    _modify()
    # from adduser import adduser
    # adduser(["matto", "papepo"])
