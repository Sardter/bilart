from typing import Any, Tuple

from fastapi import HTTPException

from db.tables import params_to_where_clause, escape_sql_string
from db.db import PgDatabase


def update_data_in_table(table_name: str, data: dict, identifier: str, **kwargs) -> Tuple[bool, str, dict[str, Any]]:
    query = f"""UPDATE {table_name} SET {", ".join([f"{k} = '{escape_sql_string(v)}'" for k, v in data.items() if v is not None])} 
        WHERE {params_to_where_clause(**kwargs)};"""
    try:
        with open("./all_sql.txt", "w") as f:
            f.write(query)
    except Exception as e:
        print(e)
        pass
    print(query)
    with PgDatabase() as db:
        try:
            db.cursor.execute(query, [v for v in data.values(
            ) if v is not None] + [v for v in kwargs.values() if v is not None])
            updated_rows = db.cursor.rowcount
            if updated_rows == 0:
                raise HTTPException(status_code=404, detail="Not found")
            db.connection.commit()

            select_query = f"SELECT * FROM {table_name} WHERE {identifier} = {kwargs[identifier]}"
            db.cursor.execute(select_query)

            row = db.cursor.fetchone()
            columns: list[str] = [desc[0] for desc in db.cursor.description]
            return True, f"{updated_rows} row(s) updated successfully", dict(zip(columns, row))
        except HTTPException as e:
            raise e
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))


def update(table: str, model: dict, identifier: str, **kwargs):
    return update_data_in_table(table, model, identifier, **kwargs)
