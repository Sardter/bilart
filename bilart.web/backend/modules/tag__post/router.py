from db.insert import insert
from db.delete import delete
from db.retrieve import retrieve

from typing import Any
from fastapi import APIRouter, Depends, HTTPException

from modules.user.auth import get_current_user
from modules.post.model import PostModel
from modules.tag__post.model import TagPostModel

router = APIRouter(prefix="/categorise", tags=['categorise'])


@router.post('/')
def categorise(favortie: TagPostModel,
               user: dict[str, Any] = Depends(get_current_user)):
    filters = {
        'tables': [PostModel],
        'single': True,
        'artist_id': user['artist_id'],
        'post_id': favortie.post_id
    }
    
    retrieve(**filters)

    success, message, data = insert(favortie, return_row=False)

    return {"message": message, "success": success, "data": data}


@router.delete('/')
def un_categorise(favortie: TagPostModel,
                  user: dict[str, Any] = Depends(get_current_user)):
    
    filters = {
        'tables': [PostModel],
        'single': True,
        'artist_id': user['artist_id'],
        'post_id': favortie.post_id
    }
    
    retrieve(**filters)
    
    success, message = delete(
        table=TagPostModel.get_table_name(),
        **favortie.to_dict()
    )

    return {"message": message, "success": success}
