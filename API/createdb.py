import sqlite3

def _createdb():
    con = sqlite3.connect('timeaccount.db')

    cur = con.cursor()

    # Create table
    cur.execute('''CREATE TABLE records (user_id integer, endtime integer, duration integer, category integer, action text)''')
    cur.execute('''CREATE TABLE auth (username text, password text, user_id integer PRIMARY KEY)''')
    cur.execute('''CREATE TABLE tokens (user_id integer, token text PRIMARY KEY, expire float)''')

    # Save (commit) the changes
    con.commit()

    # We can also close the connection if we are done with it.
    # Just be sure any changes have been committed or they will be lost.
    con.close()    


if __name__ == "__main__":
    _createdb()
    from adduser import adduser
    adduser(["matto", "papepo"])
