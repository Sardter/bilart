from db.view import ViewProtocal
from db.model import ModelProtocal


def params_to_where_clause(**kwargs):
    params = []
    search_params = []
    
    for k, v in kwargs.items():
        markNull : bool = False
        if v is None: continue
        elif isinstance(v, list) and v[0] is None:
            markNull = True
        
        v = escape_sql_string(v)
        
        if "table__" in k:
            splited = k.split("__")
            table_name = splited[1]
            k = f"{table_name}.{'__'.join(splited[2:])}"
            
        if "search__" in k:
            k = k.replace("search__", "")
            if markNull:
                continue
            search_params.append(f"{k} LIKE '%{v}%'")
        elif "gt__" in k:
            k = k.replace("gt__", "")
            if markNull:
              continue
            params.append(f"{k} > '{v}'")
        elif "lt__" in k:
            k = k.replace("lt__", "")
            if markNull:
              continue
            params.append(f"{k} < '{v}'")
        elif "ne__" in k:
            k = k.replace("ne__", "")
            if markNull:
                params.append(f"{k} IS NOT NULL")
            else:
              params.append(f"{k} <> '{v}'")
        else:
            if markNull:
                params.append(f"{k} IS NULL")
            else:
              params.append(f"{k} = '{v}'")

    if search_params:
        params.append(f'({" OR ".join(search_params)})')
    
    return " AND ".join(params)


def natural_join_models(models: list[ModelProtocal | ViewProtocal]) -> str:
    print(models)
    return " NATURAL JOIN ".join([model.get_table_name() for model in models if model is not None])


class JoinModel:
    def __init__(self, model: ModelProtocal | ViewProtocal, on: str, join_type: str = "INNER JOIN") -> None:
        self.model = model
        self.on = on
        self.join_type = join_type
    
    

def join_models(models: list[JoinModel]) -> str:
    if not models:
        return ""
    
    result = f"{models[0].model.get_table_name()}"
    
    for i in range(1, len(models)):
        prev = models[i-1]
        curr = models[i]
        result += f" {prev.join_type} {curr.model.get_table_name()} ON {prev.model.get_table_name()}.{prev.on} = {curr.model.get_table_name()}.{prev.on}"
    
    return result

def escape_sql_string(value):
    if type(value) != str:
        return value
    
    escape_characters = {
        "'": "''",  # Escapes single quotes
        "\"": "\\\"",  # Escapes double quotes
        "\\": "\\\\",  # Escapes backslashes
        "\0": "\\0",  # Escapes NULL characters
    }
    for char, escaped_char in escape_characters.items():
        value = value.replace(char, escaped_char)
    return value