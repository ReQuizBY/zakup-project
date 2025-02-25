import sqlite3
from datetime import datetime


def validate_date(day, month, year):
    try:
        datetime(year=int(year), month=int(month), day=int(day))
        return True
    except ValueError:
        return False


def calculate_completion_status(data):
    """Calculates the completion status based on the number of filled fields."""
    valid_data = {k: v for k, v in data.items() if k not in ['id', 'appId']}  # исключение для id и appid
    total_fields = len(valid_data)
    filled_fields = sum(1 for value in valid_data.values() if value and str(value).strip())

    if filled_fields == 0:
        return 'empty'
    elif filled_fields == total_fields:
        return 'complete'
    else:
        return 'partial'


def get_db_connection():
    return sqlite3.connect('database.db')