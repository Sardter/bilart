from typing import Tuple

from fastapi import HTTPException
from db.view import ViewProtocal
from db.model import ModelProtocal

from db.tables import natural_join_models, params_to_where_clause, JoinModel, join_models
from db.db import PgDatabase


def get_from_table(
    tables: str,
    where_clasue: str,
    order_by_clasue: str,
    select_function: str = "SELECT * FROM",
    single: bool = False
) -> Tuple[bool, int, str, list[dict]]:

    where = "" if len(where_clasue) == 0 else f"WHERE {where_clasue}"
    order_by = "" if len(
        order_by_clasue) == 0 else f"ORDER BY {order_by_clasue}"
    query = f'{select_function} {tables} {where} {order_by};'
    try:
        with open("./all_sql.txt", "w") as f:
            f.write(query)
    except Exception as e:
        print(e)
        pass
    print(query)
    with PgDatabase() as db:
        try:
            db.cursor.execute(query)
            data: list[Tuple] = db.cursor.fetchall()
            count = len(data)
            if single:
                if count > 1:
                    raise HTTPException(
                        status_code=400, detail=f"More than one object returned:{count}")
                elif count == 0:
                    raise HTTPException(
                        status_code=404, detail=f"Object not found")
            columns: list[str] = [desc[0] for desc in db.cursor.description]
            return True, count, "Data retrieved successfully", [dict(zip(columns, row)) for row in data]
        except HTTPException as e:
            raise e
        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))


def retrieve(
    tables: list[ModelProtocal | ViewProtocal] = [],
    join_tables: list[JoinModel] = [],
    single: bool = False,
    order_by: list[str | None] = [],
    **kwargs
):
    return get_from_table(
        natural_join_models(tables) if not join_tables else join_models(join_tables),
        params_to_where_clause(**kwargs),
        ", ".join([order for order in order_by if order]),
        single=single
    )
