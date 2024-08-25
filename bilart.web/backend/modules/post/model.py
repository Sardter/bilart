from fastapi import APIRouter
from db.model import Model

from modules.artist.model import ArtistModel

class PostModel(Model):
    artist_id: int
    description: str
    title: str
    
    @staticmethod
    def get_table_name() -> str:
        return "Post"
    
    @staticmethod
    def create_table() -> str:
        return f"""
        CREATE TABLE {PostModel.get_table_name()} (
            {PostModel.get_identifier()} SERIAL PRIMARY KEY,
            {ArtistModel.get_identifier()} INT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
            title VARCHAR(128),
            description VARCHAR(256),
            CONSTRAINT fk_artist
                    FOREIGN KEY({ArtistModel.get_identifier()})
                        REFERENCES {ArtistModel.get_table_name()}({ArtistModel.get_identifier()})
                        ON DELETE CASCADE
        );
        """

    @staticmethod
    def get_router() -> APIRouter:
        from modules.post.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 5
    
        
    @staticmethod
    def get_identifier() -> str:
        return "post_id"