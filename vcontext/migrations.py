"""Consistent, non-overwriting safety copies before additive storage upgrades."""
import sqlite3
import uuid
from pathlib import Path


def backup_legacy(connection):
    table = connection.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='metadata'").fetchone()
    if not table:
        return None
    version = connection.execute("SELECT value FROM metadata WHERE key='schema'").fetchone()
    if not version:
        return None
    if version[0] in ('1', '2', '3', '4', '5', '6', '7', '8'):
        upgrade = 'schema9'
    elif version[0] == '9' and not connection.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='vfx_schema'").fetchone():
        upgrade = 'effects1'
    elif version[0] == '9' and not connection.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='vcd_schema'").fetchone():
        upgrade = 'catalog1'
    elif version[0] == '9' and not connection.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='vcc_schema'").fetchone():
        upgrade = 'control1'
    elif version[0] == '9' and not connection.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='vsm_schema'").fetchone():
        upgrade = 'stages1'
    elif version[0] == '9' and not connection.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='vsp_schema'").fetchone():
        upgrade = 'stage-proofs1'
    else:
        return None
    filename = next((row[2] for row in connection.execute('PRAGMA database_list') if row[1] == 'main'), '')
    if not filename:
        return None  # in-memory test stores have no persistent file to protect
    source = Path(filename)
    target = source.with_name(source.name + '.pre-' + upgrade + '-' + uuid.uuid4().hex + '.bak')
    # Never replace any existing database, backup, or machine configuration.
    target.touch(exist_ok=False)
    destination = sqlite3.connect(str(target))
    try:
        connection.backup(destination)
    finally:
        destination.close()
    return str(target)
