"""Consistent, non-overwriting safety copy before the first schema-7 upgrade."""
import sqlite3
import uuid
from pathlib import Path


def backup_legacy(connection):
    table = connection.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='metadata'").fetchone()
    if not table:
        return None
    version = connection.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()
    if not version or version[0] not in ('1', '2', '3', '4', '5', '6'):
        return None
    filename = next((row[2] for row in connection.execute('PRAGMA database_list') if row[1] == 'main'), '')
    if not filename:
        return None  # in-memory test stores have no persistent file to protect
    source = Path(filename)
    target = source.with_name(source.name + '.pre-schema7-' + uuid.uuid4().hex + '.bak')
    # Never replace any existing database, backup, or machine configuration.
    target.touch(exist_ok=False)
    destination = sqlite3.connect(str(target))
    try:
        connection.backup(destination)
    finally:
        destination.close()
    return str(target)
