from fastapi import APIRouter
from db.model import Model

from modules.user.model import UserModel

class NotificationModel(Model):
    @staticmethod
    def get_table_name() -> str:
        return "Notification"
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {NotificationModel.get_table_name()} (
                {NotificationModel.get_identifier()} SERIAL PRIMARY KEY,
                content VARCHAR(256) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                read BOOLEAN NOT NULL DEFAULT False,
                {UserModel.get_identifier()} INT NOT NULL,
                CONSTRAINT fk_user
                    FOREIGN KEY({UserModel.get_identifier()})
                        REFERENCES {UserModel.get_table_name()}({UserModel.get_identifier()})
                        ON DELETE CASCADE
            );
        """
        
    @staticmethod
    def get_router() -> APIRouter:
        from modules.notification.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 15
    
    @staticmethod
    def get_identifier() -> str:
        return "notification_id"