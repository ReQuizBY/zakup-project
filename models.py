# models.py
import sqlite3

def get_db_connection():
    conn = sqlite3.connect('database.db')
    return conn

def create_database():
    with get_db_connection() as conn: # Использовать get_db_connection
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS applications (
                id TEXT PRIMARY KEY,
                reg_day INTEGER NOT NULL,
                reg_month INTEGER NOT NULL,
                reg_year INTEGER NOT NULL,
                outgoing_id TEXT NOT NULL,
                outgoing_day INTEGER NOT NULL,
                outgoing_month INTEGER NOT NULL,
                outgoing_year INTEGER NOT NULL,
                company_name TEXT NOT NULL,
                purchase_subject TEXT NOT NULL,
                amount REAL NOT NULL,
                economist_info TEXT DEFAULT '',
                purchase_info TEXT DEFAULT '',
                exec_docs_info TEXT DEFAULT '',
                lawyer_info TEXT DEFAULT '',
                accountant_info TEXT DEFAULT '',
                economist_status TEXT DEFAULT 'empty',
                purchase_status TEXT DEFAULT 'empty',
                exec_docs_status TEXT DEFAULT '',
                lawyer_status TEXT DEFAULT 'empty',
                accountant_status TEXT DEFAULT 'empty'
            )
        ''')
        conn.commit()
    conn.close()


def get_applications():
    try:
        with sqlite3.connect('database.db') as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM applications')
            applications = [dict(row) for row in cursor.fetchall()]
            return applications
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return []  # Или обработайте ошибку другим способом

def add_application_to_db(data):
    try:
        with sqlite3.connect('database.db') as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO applications 
                (id, reg_day, reg_month, reg_year, outgoing_id, outgoing_day, outgoing_month, outgoing_year,
                 company_name, purchase_subject, amount) 
                VALUES (?,?,?,?,?,?,?,?,?,?,?)
            ''', (
                data['id'], data['reg_day'], data['reg_month'], data['reg_year'],
                data['outgoing_id'],
                data['outgoing_day'], data['outgoing_month'], data['outgoing_year'],
                data['company_name'], data['purchase_subject'], data['amount']
            ))
            conn.commit()
            return True
    except sqlite3.Error as e:
        print(f"Ошибка при добавлении заявки: {e}")
        return False