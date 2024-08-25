from typing import Any
from fastapi import APIRouter, Depends
from db.tables import JoinModel

from db.delete import delete
from db.update import update
from db.retrieve import retrieve, get_from_table
from db.insert import insert

from modules.rating.model import RatingModel, CreateRating, UpdateRating
from modules.user.auth import get_current_user
from modules.collector.model import CollectorModel
from modules.user.view import UserView


router = APIRouter(prefix="/ratings", tags=['ratings'])


@router.get("/{rating_id}")
def get_rating(
    rating_id: int
):
    success, _, message, items = retrieve(
        tables=[RatingModel],
        single=True,
        rating_id=rating_id
    )

    return {"data": items[0], "success": success, "message": message}


@router.get("/")
def get_ratings(
    score: int | None = None,
    gt__score: int | None = None,
    lt__score: int | None = None,
    search__comment: str | None = None,
    post_id: int | None = None,
    collector_id: int | None = None
):
    filters = {
        'tables': [RatingModel, UserView],
        'join_tables': [
            JoinModel(RatingModel, 'collector_id'),
            JoinModel(UserView, 'collector_id')
        ],
        'single': False,
        f'table__{RatingModel.get_table_name()}__score': score,
        f'table__{RatingModel.get_table_name()}__gt__score': gt__score,
        f'table__{RatingModel.get_table_name()}__lt__score': lt__score,
        f'table__{RatingModel.get_table_name()}__search__comment': search__comment,
        f'table__{RatingModel.get_table_name()}__post_id': post_id,
        'collector_id': collector_id
    }
    success, count, message, items = retrieve(
        **filters
    )

    return {"data": items, "success": success, "message": message, "count": count}


@router.post("/")
def create_new_rating(request_data: CreateRating, user: dict[str, Any] = Depends(get_current_user)):
    success, message, data = insert(RatingModel(
        score=request_data.score,
        comment=request_data.comment,
        post_id=request_data.post_id,
        collector_id=user['collector_id']
    ))
    return {"message": message, "success": success, "data": data}


@router.delete("/{rating_id}")
def delete_ratings(rating_id: int, user: dict[str, Any] = Depends(get_current_user)):
    success, message = delete(
        table=RatingModel.get_table_name(),
        rating_id=rating_id,
        collector_id=user['collector_id']
    )
    return {"message": message, "success": success}


@router.put("/{rating_id}")
def update_ratings(rating_id: int, request_data: UpdateRating, user: dict[str, Any] = Depends(get_current_user)):
    success, message, data = update(
        table=RatingModel.get_table_name(),
        model={
            'comment': request_data.comment,
            'score': request_data.score
        },
        identifier=RatingModel.get_identifier(),
        rating_id=rating_id,
        collector_id=user['collector_id']
    )
    return {"message": message, "success": success, "data": data}


@router.get("/art/{art_id}")
def art_average_rating(art_id: int):
    success, count, message, result = get_from_table(
        tables="""
        FROM Art A
        INNER JOIN Post P ON A.post_id = P.post_id
        INNER JOIN Rating R ON P.post_id = R.post_id""",
        where_clasue=f"""A.art_id = {art_id}""",
        order_by_clasue="",
        select_function="SELECT AVG(R.score) AS average_rating"
    )

    return {"message": message, "count": count, "success": success, "data": result}


@router.get("/artist/{artist_id}")
def artist_average_rating(artist_id: int):
    success, count, message, result = get_from_table(
        tables="""
        FROM Artist AR
        INNER JOIN Post P ON AR.artist_id = P.artist_id
        INNER JOIN Art A ON P.post_id = A.post_id
        LEFT JOIN Rating R ON P.post_id = R.post_id""",
        where_clasue=f"""WHERE AR.artist_id = {artist_id}""",
        order_by_clasue="",
        select_function="SELECT AVG(R.score) AS average_rating"
    )

    return {"message": message, "count": count, "success": success, "data": result}


from modules.report.router import create_report
from modules.report.model import CreateReport, ReportRequest


@router.post("/report/{rating_id}")
def report_rating(rating_id: int, request: ReportRequest, user: dict[str, Any] = Depends(get_current_user)):
    return create_report(CreateReport(
        entity_name=RatingModel.get_table_name(),
        entity_id=rating_id,
        content=request.content
    ), user)