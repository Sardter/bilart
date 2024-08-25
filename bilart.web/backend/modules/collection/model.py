from fastapi import APIRouter
from pydantic import BaseModel

from db.model import Model
from modules.collector.model import CollectorModel

class CollectionModel(Model):
    collector_id: int
    name: str
    
    @staticmethod
    def get_table_name() -> str:
        return "Collection"
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {CollectionModel.get_table_name()} (
                collection_id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                {CollectorModel.get_identifier()} INT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                CONSTRAINT fk_collector
                    FOREIGN KEY({CollectorModel.get_identifier()})
                        REFERENCES {CollectorModel.get_table_name()}({CollectorModel.get_identifier()})
                        ON DELETE CASCADE
            );
            """
            
    @staticmethod
    def get_router() -> APIRouter:
        from modules.collection.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 4
        
    @staticmethod
    def get_identifier() -> str:
        return "collection_id"
    

class CreateCollection(BaseModel):
    name: str