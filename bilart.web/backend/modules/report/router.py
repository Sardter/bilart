
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from modules.report.view import ReportView
from db.tables import JoinModel
from modules.user.view import UserView

from db.model import ModelProtocal
from modules.user.auth import get_current_user

from db.retrieve import retrieve
from db.insert import insert
from db.delete import delete

from modules.report.model import ReportModel, CreateReport
from modules.modules import models

router = APIRouter(prefix="/reports", tags=['reports'])


def entity_model(entiy_name: str) -> ModelProtocal:
    for model in models:
        if entiy_name == model.get_table_name():
            return model
    raise HTTPException(
        status_code=404, detail=f"Entity not found: {entiy_name}")


@router.get("/{report_id}")
def get_report(
    report_id: int,
    user: dict[str, Any] = Depends(get_current_user)
):
    if user['privileges'] == 'N':
        raise HTTPException(status_code=401, detail="Not authorized")
    success, _, message, reports = retrieve(
        join_tables=[
            JoinModel(ReportModel, 'user_id'),
            JoinModel(UserView, 'user_id'),
        ],
        single=True,
        report_id=report_id
    )

    from modules.report.mapper import get_entity_mapper

    entity = get_entity_mapper[reports[0]['entity_name']](
        reports[0]['entity_id'])

    data = reports[0]
    data.update({'entity': entity})

    return {"data": data, "success": success, "message": message}


@router.post("/{report_id}")
def accept_report(
    report_id: int,
    user: dict[str, Any] = Depends(get_current_user)
):
    if user['privileges'] == 'N':
        raise HTTPException(status_code=401, detail="Not authorized")
    success, _, message, items = retrieve(
        tables=[ReportModel],
        single=True,
        report_id=report_id
    )

    filters = {
        "table": items[0]['entity_name'],
        entity_model(items[0]['entity_name']).get_identifier(): items[0]['entity_id']
    }

    success, message = delete(**filters)
    success, message = delete(
        ReportModel.get_table_name(), report_id=report_id)

    return {"success": success, "message": message}


@router.delete("/{report_id}")
def reject_report(
    report_id: int,
    user: dict[str, Any] = Depends(get_current_user)
):
    if user['privileges'] == 'N':
        raise HTTPException(status_code=401, detail="Not authorized")

    success, message = delete(
        ReportModel.get_table_name(), report_id=report_id)

    return {"success": success, "message": message}


@router.get("/")
def get_reports(
    content: str | None = None,
    search__content: str | None = None,
    created_at: str | None = None,
    entity_name: str | None = None,
    entity_id: int | None = None,
    user_id: int | None = None,
    all: bool | None = None,
    user: dict[str, Any] = Depends(get_current_user)
):
    if user['privileges'] == 'N':
        raise HTTPException(status_code=401, detail="Not authorized")
    filters = {
        "join_tables": [
            JoinModel(ReportModel, 'user_id'),
            JoinModel(UserView, 'user_id'),
        ],
        "single": False,
        f"table__{ReportModel.get_table_name()}__content": content,
        f"table__{ReportModel.get_table_name()}__search__content": search__content,
        f"table__{ReportModel.get_table_name()}__created_at": created_at,
        f"table__{ReportModel.get_table_name()}__entity_name": entity_name,
        f"table__{ReportModel.get_table_name()}__entity_id": entity_id,
        "user_id": user_id,
        "view": ReportView if all else None
    }

    success, count, message, items = retrieve(**filters)

    from modules.report.mapper import get_entity_mapper

    for item in items:
        item['entity'] = get_entity_mapper[item['entity_name']](
            item['entity_id'])

    return {"data": items, "success": success, "message": message, "count": count}


@router.post("/")
def create_report(report: CreateReport,
                  user: dict[str, Any] = Depends(get_current_user)):
    model = entity_model(report.entity_name)

    filters = {
        'tables': [model],
        'single': True,
        model.get_identifier(): report.entity_id,
    }

    retrieve(**filters)

    success, message, data = insert(ReportModel(
        content=report.content,
        entity_name=report.entity_name,
        entity_id=report.entity_id,
        user_id=user['user_id']
    ))
    return {"message": message, "success": success, "data": data}
