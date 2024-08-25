from fastapi import APIRouter

from db.model import Model
from modules.user.model import UserModel

class ArtistModel(Model):
    user_id: int
    bio: str | None = None
    link: str | None = None

    @staticmethod
    def get_table_name() -> str:
        return "Artist"
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {ArtistModel.get_table_name()} (
                artist_id SERIAL PRIMARY KEY,
                bio VARCHAR(500),
                link VARCHAR(255),
                price INT,
                {UserModel.get_identifier()} INT UNIQUE NOT NULL,
                FOREIGN KEY ({UserModel.get_identifier()}) 
                    REFERENCES {UserModel.get_table_name()} ({UserModel.get_identifier()})
            );
            """
    
    @staticmethod
    def get_router() -> APIRouter:
        from modules.artist.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 2
        
    @staticmethod
    def get_identifier() -> str:
        return "artist_id"