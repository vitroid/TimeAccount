# dump sqlite3 db and inject to the heroku db

import psycopg2
import os
import sys
import sqlite3


def dump(filename):
    with sqlite3.connect(filename) as con:
        cur = con.cursor()
        return [row for row in cur.execute("SELECT * FROM records")]
        

def dump_heroku():
    DATABASE_URL = os.environ.get('DATABASE_URL')

    with psycopg2.connect(DATABASE_URL) as con:
        with con.cursor() as cur:
            cur.execute('SELECT * FROM actions')
            return [row for row in cur]


def _reset():
    DATABASE_URL = os.environ.get('DATABASE_URL')

    with psycopg2.connect(DATABASE_URL) as con:
        with con.cursor() as cur:
            # drop table
            cur.execute('''DROP TABLE actions''')
            cur.execute('''CREATE TABLE actions (user_id integer, endtime integer, duration integer, category integer, action text)''')


def inject(history):
    DATABASE_URL = os.environ.get('DATABASE_URL')

    with psycopg2.connect(DATABASE_URL) as con:
        with con.cursor() as cur:
            for row in history:
                print(row)
                cur.execute('INSERT INTO actions VALUES ( %s, %s, %s, %s, %s ) ', row)
            con.commit()
            # /DB

if __name__ == "__main__":
    # 迂闊に使わないように、stop codeを入れておく。
    assert False
    history = dump("timeaccount.db")
    print(history)
    h2 = dump_heroku()
    print(h2)
    _reset()
    inject(history)
