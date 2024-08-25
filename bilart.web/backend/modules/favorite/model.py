from fastapi import APIRouter
from pydantic import BaseModel
from db.model import Model

from modules.collector.model import CollectorModel
from modules.post.model import PostModel

class FavoriteModel(Model):
    collector_id: int
    post_id: int

    @staticmethod
    def get_table_name() -> str:
        return "Favorite"
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {FavoriteModel.get_table_name()}(
                {CollectorModel.get_identifier()} INT NOT NULL,
                {PostModel.get_identifier()} INT NOT NULL,
                CONSTRAINT fk_collector
                    FOREIGN KEY({CollectorModel.get_identifier()})
                        REFERENCES {CollectorModel.get_table_name()}({CollectorModel.get_identifier()})
                        ON DELETE CASCADE,
                CONSTRAINT {PostModel.get_identifier()}
                    FOREIGN KEY({PostModel.get_identifier()})
                        REFERENCES {PostModel.get_table_name()}({PostModel.get_identifier()})
                        ON DELETE CASCADE,
                CONSTRAINT favorite_pk UNIQUE ({CollectorModel.get_identifier()}, {PostModel.get_identifier()})
            );
            """
    

    @staticmethod
    def get_router() -> APIRouter:
        from modules.favorite.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 14
    
        
    @staticmethod
    def get_identifier() -> str:
        return f"favorite_pk"
    

class CreateFavorite(BaseModel):
    post_id: int