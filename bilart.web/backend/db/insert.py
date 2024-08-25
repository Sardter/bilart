from typing import Any, Tuple

from fastapi import HTTPException

from db.model import Model
from db.db import PgDatabase

from db.tables import escape_sql_string

# insert data into any table
def insert_data_into_table(table_name: str, data: dict, identifier: str, return_row: bool = True) -> Tuple[bool, str, dict[str, Any] | None]:
    try:
        query = f"""INSERT INTO {table_name} ({', '.join(data.keys())}) 
            VALUES ({', '.join([f"'{escape_sql_string(v)}'" for v in data.values()])}) {f"RETURNING {identifier}" if return_row else ""}"""
        try:
            with open("./all_sql.txt", "w") as f:
                f.write(query)
        except Exception as e:
            print(e)
            pass
        print(query)
        with PgDatabase() as db:
            # Execute the SQL query with the data values
            db.cursor.execute(query, list(data.values()))
            # Commit the transaction
            db.connection.commit()
            
            if not return_row:
                return True, "Data inserted successfully", None
            
            id = db.cursor.fetchone()[0]
            
            select_query = f"SELECT * FROM {table_name} WHERE {identifier} = '{id}'"
            db.cursor.execute(select_query)
            
            row = db.cursor.fetchone()
            columns: list[str] = [desc[0] for desc in db.cursor.description]
            
            return True, "Data inserted successfully", dict(zip(columns, row))
    except Exception as e:
        import traceback
        traceback.print_exc()
        
        raise HTTPException(status_code=500, detail=str(e))


def insert(model: Model, return_row: bool = True) -> Tuple[bool, str, dict[str, Any] | None]:
    return insert_data_into_table(model.get_table_name(), model.to_dict(), model.get_identifier(), return_row)
