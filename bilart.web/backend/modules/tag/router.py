from typing import Any
from fastapi import APIRouter, Depends, HTTPException

from modules.post.model import PostModel
from modules.user.auth import get_current_user
from modules.tag__post.model import TagPostModel

from db.delete import delete
from db.update import update
from db.retrieve import retrieve
from db.insert import insert

from modules.tag.model import TagModel


router = APIRouter(prefix="/tags", tags=['tags'])


@router.get("/{name}")
def get_tag(
    tag_name: str
):
    success, _, message, items = retrieve(
        tables=[TagModel],
        single=True,
        tag_name=tag_name
    )

    return {"data": items[0], "success": success, "message": message}


@router.get("/")
def get_tags(
    search__tag_name: str | None = None,
    post_id: int | None = None
):
    filters = {
        'tables': [TagModel, 
                   TagPostModel if post_id is not None else None, 
                   PostModel if post_id is not None else None
                   ],
        'single': False,
        f'table__{TagModel.get_table_name()}__search__tag_name': search__tag_name,
        f'table__{PostModel.get_table_name()}__post_id': post_id,
    }

    success, count, message, items = retrieve(
        **filters
    )

    return {"data": items, "success": success, "message": message, "count": count}


@router.post("/")
def create_new_tag(request_data: TagModel,
                   user: dict[str, Any] = Depends(get_current_user)):
    if user['privileges'] == 'N':
        raise HTTPException(status_code=401, detail="Not authorized")
    success, message, data = insert(request_data)
    return {"message": message, "success": success, "data": data}


@router.delete("/{name}")
def delete_tags(name: str,
                user: dict[str, Any] = Depends(get_current_user)):
    if user['privileges'] == 'N':
        raise HTTPException(status_code=401, detail="Not authorized")
    success, message = delete(
        table=TagModel.get_table_name(),
        tag_name=name
    )
    return {"message": message, "success": success}
