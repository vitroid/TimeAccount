import psycopg2
import os
import sys

def adduser(argv):
    uname, pw = argv

    DATABASE_URL = os.environ.get('DATABASE_URL')

    with psycopg2.connect(DATABASE_URL) as con:
        with con.cursor() as cur:
            cur.execute('INSERT INTO auth( "username", "password" ) VALUES (%s, %s)', (uname, pw))


if __name__ == "__main__":
    adduser(sys.argv[1:])
