import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_db():
    try:
        # Connect to the default 'postgres' database
        con = psycopg2.connect(
            dbname='postgres',
            user='postgres',
            host='127.0.0.1',
            port='5432',
            password=''
        )
        con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = con.cursor()
        
        # Check if db exists
        cur.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = 'playto_pay'")
        exists = cur.fetchone()
        
        if not exists:
            cur.execute('CREATE DATABASE playto_pay')
            print("Database playto_pay created successfully.")
        else:
            print("Database playto_pay already exists.")
            
        cur.close()
        con.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == '__main__':
    create_db()
