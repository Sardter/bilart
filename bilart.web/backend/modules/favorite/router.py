from typing import Any
from fastapi import APIRouter, Depends
from modules.user.auth import get_current_user

from db.insert import insert
from db.delete import delete
from db.retrieve import retrieve

from modules.favorite.model import FavoriteModel, CreateFavorite
from modules.art.model import ArtModel
from modules.post.model import PostModel
from db.tables import JoinModel


router = APIRouter(prefix="/favorite", tags=['favorite'])

@router.post('/')
def favorite(request_data: CreateFavorite, user: dict[str, Any] = Depends(get_current_user)):
    success, message, data = insert(FavoriteModel(
        post_id=request_data.post_id,
        collector_id=user['collector_id']
    ), return_row=False)
    
    return {"message": message, "success": success, "data": data}


@router.delete('/')
def un_favorite(request_data: CreateFavorite, user: dict[str, Any] = Depends(get_current_user)):
    success, message = delete(
        table=FavoriteModel.get_table_name(),
        collector_id=user['collector_id'],
        post_id=request_data.post_id
    )
    return {"message": message, "success": success}

@router.get('/')
def get_favorite_post(user: dict[str, Any] = Depends(get_current_user)):
    
    filters = {
        "tables": [
            FavoriteModel,
            PostModel
        ],
        "single": False,
        f"table__{FavoriteModel.get_table_name()}__collector_id": user['user_id']
    }

    success, count, message, items = retrieve(**filters)
    return {"data": items, "success": success, "message": message, "count": count}


@router.get('/arts')
def get_favorite_arts(user: dict[str, Any] = Depends(get_current_user)):
    
    filters = {
        "join_tables": [
            JoinModel(PostModel, 'post_id'),
            JoinModel(ArtModel, 'post_id'),
            JoinModel(FavoriteModel, 'post_id')
        ],
        "tables": [
            PostModel,
            FavoriteModel,
            ArtModel
        ],
        "single": False,
        f"table__{FavoriteModel.get_table_name()}__collector_id": user['user_id'],
    }
    success, count, message, items = retrieve(**filters)
    return {"data": items, "success": success, "message": message, "count": count}
