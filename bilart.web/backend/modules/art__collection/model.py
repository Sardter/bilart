from fastapi import APIRouter
from db.model import Model

from modules.art.model import ArtModel
from modules.collection.model import CollectionModel

class ArtCollectionModel(Model):
    art_id: int
    collection_id: int

    @staticmethod
    def get_table_name() -> str:
        return "Art_MM_Collection"
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {ArtCollectionModel.get_table_name()}(
                {ArtModel.get_identifier()} INT NOT NULL,
                {CollectionModel.get_identifier()} INT NOT NULL,
                CONSTRAINT fk_art
                    FOREIGN KEY({ArtModel.get_identifier()})
                        REFERENCES {ArtModel.get_table_name()}({ArtModel.get_identifier()})
                        ON DELETE CASCADE,
                CONSTRAINT fk_collection
                    FOREIGN KEY({CollectionModel.get_identifier()})
                        REFERENCES {CollectionModel.get_table_name()}({CollectionModel.get_identifier()})
                        ON DELETE CASCADE,
                CONSTRAINT collection_art_pk UNIQUE ({CollectionModel.get_identifier()}, {ArtModel.get_identifier()})
            );
            """
    
    @staticmethod
    def get_router() -> APIRouter:
        from modules.art__collection.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 7
        
    @staticmethod
    def get_identifier() -> str:
        return "collection_art_pk"