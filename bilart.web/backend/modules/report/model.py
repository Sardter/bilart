from fastapi import APIRouter
from pydantic import BaseModel
from db.model import Model

from modules.user.model import UserModel

class ReportModel(Model):
    content: str
    entity_name: str
    entity_id: int
    user_id: int
    
    @staticmethod
    def get_table_name() -> str:
        return "Report"
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {ReportModel.get_table_name()} (
                {ReportModel.get_identifier()} SERIAL PRIMARY KEY,
                content VARCHAR(256) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                entity_name VARCHAR(16) NOT NULL,
                entity_id INT NOT NULL,
                {UserModel.get_identifier()} INT NOT NULL,
                CONSTRAINT fk_user
                    FOREIGN KEY({UserModel.get_identifier()})
                        REFERENCES {UserModel.get_table_name()}({UserModel.get_identifier()})
                        ON DELETE CASCADE
            );
        """
    
    @staticmethod
    def get_router() -> APIRouter:
        from modules.report.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 16
        
    @staticmethod
    def get_identifier() -> str:
        return "report_id"
    

class CreateReport(BaseModel):
    entity_name: str
    entity_id: int
    content: str
    
    
class ReportRequest(BaseModel):
    content: str