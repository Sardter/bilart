from typing import Any
from fastapi import APIRouter, Depends

from db.insert import insert
from db.delete import delete
from db.retrieve import retrieve

from modules.art__collection.model import ArtCollectionModel
from modules.art.model import ArtModel
from modules.user.auth import get_current_user
from modules.collection.model import CollectionModel



router = APIRouter(prefix="/collect", tags=['collect'])


@router.post('/')
def collect(art_collection: ArtCollectionModel, user: dict[str, Any] = Depends(get_current_user)):    

    retrieve(
        tables=[ArtModel],
        single=True,
        art_id=art_collection.art_id
    )
    
    retrieve(
        tables=[CollectionModel],
        single=True,
        collector_id=user['collector_id'],
        collection_id=art_collection.collection_id
    )
    success, message, data = insert(art_collection, return_row=False)
    
    return {"message": message, "success": success, "data": True}


@router.delete('/')
def un_collect(art_collection: ArtCollectionModel, user: dict[str, Any] = Depends(get_current_user)):
    success, message = delete(
        table=ArtCollectionModel.get_table_name(),
        **art_collection.to_dict()
    )
    
    return {"message": message, "success": success}