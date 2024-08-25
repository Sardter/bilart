from typing import Tuple

from fastapi import HTTPException
from db.db import PgDatabase
from modules.modules import create_functions
from modules.modules import create_functions, trigger_functions, view_functions


def create_tables() -> Tuple[bool, str]:
    models = "\n".join(create_functions)
    triggers = "\n".join(trigger_functions)
    views = "\n".join(view_functions)
    
    models = """
    DROP SCHEMA PUBLIC CASCADE;
    CREATE SCHEMA PUBLIC;
    """ + models
    
    with PgDatabase() as db:
        try:
            print(models)
            db.cursor.execute(models)  
            print(triggers)
            db.cursor.execute(triggers)
            print(views)
            db.cursor.execute(views)
            
            db.connection.commit()
            return True, "Tables have been created successfully..."
        except Exception as e:
            print(e)
            raise HTTPException(status_code=500, detail=str(e))
