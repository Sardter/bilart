from fastapi import APIRouter

from db.model import Model
from modules.user.model import UserModel

class CollectorModel(Model):
    user_id: int
    rank: int

    @staticmethod
    def get_table_name() -> str:
        return "Collector"
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {CollectorModel.get_table_name()} (
                {CollectorModel.get_identifier()} SERIAL PRIMARY KEY,
                {UserModel.get_identifier()} INT UNIQUE NOT NULL,
                rank INT NOT NULL DEFAULT 0,
                FOREIGN KEY ({UserModel.get_identifier()}) REFERENCES {UserModel.get_table_name()}({UserModel.get_identifier()})
            );
            """
    
    @staticmethod
    def get_router() -> APIRouter:
        from modules.collector.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 1
        
    @staticmethod
    def get_identifier() -> str:
        return "collector_id"