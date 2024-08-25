from modules.report.router import create_report
from modules.report.model import CreateReport, ReportRequest
from typing import Any
from fastapi import APIRouter, Depends
from modules.user.auth import get_current_user

from db.delete import delete
from db.update import update
from db.retrieve import retrieve

from db.insert import insert

from modules.collection.model import CollectionModel, CreateCollection


router = APIRouter(prefix="/collections", tags=['collections'])


@router.get("/{collection_id}")
def get_collection(
    collection_id: int
):
    success, _, message, items = retrieve(
        tables=[CollectionModel],
        single=True,
        collection_id=collection_id
    )

    return {"data": items[0], "success": success, "message": message}


@router.get("/")
def get_collections(
    name: str | None = None,
    search__name: str | None = None,
    collector_id: int | None = None,
):
    success, count, message, items = retrieve(
        tables=[CollectionModel],
        single=False,
        search__name=search__name,
        name=name,
        collector_id=collector_id,
    )

    return {"data": items, "success": success, "message": message, "count": count}


@router.post("/")
def create_new_collection(request_data: CreateCollection, user: dict[str, Any] = Depends(get_current_user)):
    success, message, data = insert(CollectionModel(
        collector_id=user['collector_id'],
        name=request_data.name
    ))
    return {"message": message, "success": success, "data": data}


@router.delete("/{collection_id}")
def delete_collections(collection_id: int, user: dict[str, Any] = Depends(get_current_user)):
    retrieve(
        tables=[CollectionModel],
        single=True,
        collection_id=collection_id,
        collector_id=user['collector_id']
    )

    success, message = delete(
        table=CollectionModel.get_table_name(),
        collection_id=collection_id
    )
    return {"message": message, "success": success}


@router.put("/{collection_id}")
def update_collections(collection_id: int, request_data: CreateCollection, user: dict[str, Any] = Depends(get_current_user)):
    retrieve(
        tables=[CollectionModel],
        single=True,
        collection_id=collection_id,
        collector_id=user['collector_id']
    )

    success, message, data = update(
        table=CollectionModel.get_table_name(),
        model={
            'name': request_data.name
        },
        identifier=CollectionModel.get_identifier(),
        collection_id=collection_id
    )
    return {"message": message, "success": success, "data": data}


@router.post("/report/{collection_id}")
def report_collection(collection_id: int, request: ReportRequest, user: dict[str, Any] = Depends(get_current_user)):
    return create_report(CreateReport(
        entity_name=CollectionModel.get_table_name(),
        entity_id=collection_id,
        content=request.content
    ), user)
