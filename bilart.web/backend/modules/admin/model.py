from fastapi import APIRouter

from db.model import Model
from modules.user.model import UserModel

class AdminModel(Model):
    user_id: int
    privileges: str

    @staticmethod
    def get_table_name() -> str:
        return "Admin"
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {AdminModel.get_table_name()} (
                {AdminModel.get_identifier()} SERIAL PRIMARY KEY,
                privileges VARCHAR(1) NOT NULL DEFAULT 'N' CHECK (privileges IN ('N', 'M', 'A')),
                {UserModel.get_identifier()} INT UNIQUE NOT NULL,
                FOREIGN KEY (user_id) REFERENCES {UserModel.get_table_name()}({UserModel.get_identifier()})
            );
            """
            
    @staticmethod
    def get_router() -> APIRouter:
        from modules.admin.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 3
    
    @staticmethod
    def get_identifier() -> str:
        return "admin_id"