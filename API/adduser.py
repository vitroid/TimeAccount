import psycopg2
import os
import sys

from timeaccount import get_password_hash


def adduser(argv):
    uname, pw = argv

    DATABASE_URL = os.environ.get('DATABASE_URL')

    with psycopg2.connect(DATABASE_URL) as con:
        with con.cursor() as cur:
            cur.execute('INSERT INTO auth( "username", "password" ) VALUES (%s, %s)', (uname, get_password_hash(pw)))


if __name__ == "__main__":
    # 迂闊に使わないように、stop codeを入れておく。
    assert False
    adduser(sys.argv[1:])
