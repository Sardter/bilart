from fastapi import APIRouter
from pydantic import BaseModel

from db.model import Model
from modules.post.model import PostModel
from modules.collector.model import CollectorModel

class RatingModel(Model):
    score: int
    comment: str
    post_id: int
    collector_id: int
    
    @staticmethod
    def get_table_name() -> str:
        return "Rating"
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {RatingModel.get_table_name()} (
                {RatingModel.get_identifier()} SERIAL PRIMARY KEY,
                score SMALLINT NOT NULL,
                comment VARCHAR(500),
                {PostModel.get_identifier()} int NOT NULL,
                {CollectorModel.get_identifier()} INT NOT NULL,
                CONSTRAINT fk_post
                    FOREIGN KEY({PostModel.get_identifier()})
                        REFERENCES {PostModel.get_table_name()}({PostModel.get_identifier()})
                        ON DELETE CASCADE,
                CONSTRAINT fk_collector
                    FOREIGN KEY({CollectorModel.get_identifier()})
                        REFERENCES {CollectorModel.get_table_name()}({CollectorModel.get_identifier()})
                        ON DELETE CASCADE
            );
            """
            
    @staticmethod
    def get_router() -> APIRouter:
        from modules.rating.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 9
        
    @staticmethod
    def get_identifier() -> str:
        return "rating_id"


class CreateRating(BaseModel):
    score: int
    comment: str
    post_id: int


class UpdateRating(BaseModel):
    score: int | None
    comment: str | None