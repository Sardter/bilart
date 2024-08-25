from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from db.retrieve import retrieve

security = HTTPBasic()

from modules.user.model import UserModel
from modules.admin.model import AdminModel
from modules.collector.model import CollectorModel
from modules.artist.model import ArtistModel
from modules.user.hash import hash_password


def get_current_user(
    credentials: HTTPBasicCredentials = Depends(security)
) -> dict[str, Any]:
    username = credentials.username
    password = hash_password(credentials.password)
    
    try:
        _, _, _, users = retrieve(
            tables=[UserModel, CollectorModel, ArtistModel, AdminModel],
            single=True,
            username=username,
            password_hash=password
        )
        del users[0]['password_hash']
        return users[0]
    except HTTPException as e:
        try:
            _, _, _, users = retrieve(
                tables=[UserModel, CollectorModel, ArtistModel, AdminModel],
                single=True,
                email=username,
                password_hash=password
            )
            del users[0]['password_hash']
            return users[0]
        except Exception as e:
            print(e)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Basic"},
            )
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Basic"},
        )