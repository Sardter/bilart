from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from db.model import Model
from modules.user.hash import hash_password


class UserModel(Model):
    username: str
    first_name: str | None = None
    last_name: str | None = None
    email: str
    password: str
    profile_image: str | None = None
    phone: str | None = None

    @staticmethod
    def get_table_name() -> str:
        return '"User"'
    
    def to_dict(self) -> dict[str, Any]:
        data = super().to_dict()
        data['password_hash'] =  hash_password(data.pop('password'))
        return data
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {UserModel.get_table_name()} (
                {UserModel.get_identifier()} SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                first_name VARCHAR(255),
                last_name VARCHAR(255),
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                profile_image VARCHAR(255),
                created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                phone VARCHAR(16)
            );
            """
    
    @staticmethod
    def get_router() -> APIRouter:
        from modules.user.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 0
    
    @staticmethod
    def get_identifier() -> str:
        return "user_id"
    

class UpdateUser(BaseModel):
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    email: str | None = None
    password: str | None = None
    phone: str | None = None
    bio: str | None = None
    link: str | None = None
    privileges: str | None = None


class UpdatePrivileges(BaseModel):
    privileges: str