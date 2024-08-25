from fastapi import APIRouter
from pydantic import BaseModel
from db.model import Model

from modules.post.model import PostModel

class TutorialModel(Model):
    media: str
    post_id: int

    @staticmethod
    def get_table_name() -> str:
        return "Tutorial"
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {TutorialModel.get_table_name()} (
                {TutorialModel.get_identifier()} SERIAL PRIMARY KEY,
                media VARCHAR(255),
                {PostModel.get_identifier()} INT NOT NULL UNIQUE,
                CONSTRAINT fk_post
                    FOREIGN KEY({PostModel.get_identifier()})
                        REFERENCES {PostModel.get_table_name()}({PostModel.get_identifier()})
                        ON DELETE CASCADE
            );
            """
    
    @staticmethod
    def get_router() -> APIRouter:
        from modules.tutorial.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 8
    
    @staticmethod
    def get_identifier() -> str:
        return "tutorial_id"
    
    
class UpdateTutorial(BaseModel):
    post_id: int | None
    title: str | None
    description: str | None