import sqlite3
import sys

def adduser(argv):
    uname, pw = argv

    con = sqlite3.connect('timeaccount.db')

    cur = con.cursor()

    cur.execute(f'INSERT INTO auth( "username", "password" ) VALUES ("{uname}", "{pw}")')

    # Save (commit) the changes
    con.commit()

    # We can also close the connection if we are done with it.
    # Just be sure any changes have been committed or they will be lost.
    con.close()    


if __name__ == "__main__":
    adduser(sys.argv[1:])
