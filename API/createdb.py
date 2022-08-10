import psycopg2
import os

def _createdb():
    DATABASE_URL = os.environ.get('DATABASE_URL')

    with psycopg2.connect(DATABASE_URL) as con:
        with con.cursor() as cur:

            # drop table
            cur.execute('''DROP TABLE tokens''')
            # Create table
            # cur.execute('''CREATE TABLE records (user_id integer, endtime integer, duration integer, category integer, action text)''')
            # cur.execute('''CREATE TABLE auth (username text, password text, user_id SERIAL PRIMARY KEY)''')



if __name__ == "__main__":
    # 迂闊に使わないように、stop codeを入れておく。
    assert False
    _createdb()
    # from adduser import adduser
    # adduser(["matto", "papepo"])
