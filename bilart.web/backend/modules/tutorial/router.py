from typing import Any
from fastapi import APIRouter, Depends, HTTPException

from db.delete import delete
from db.update import update
from db.retrieve import retrieve
from db.insert import insert
from fastapi import File, Form, UploadFile
from modules.tutorial.model import TutorialModel, UpdateTutorial
from modules.post.model import PostModel
from modules.tag__post.model import TagPostModel
from modules.user.auth import get_current_user
import os
import dotenv
from pathlib import Path
from file_manager import FileManager


BASE_DIR = Path(__file__).resolve().parent.parent
dotenv.load_dotenv(BASE_DIR / ".env")

FILEPATH = os.getenv("FILEPATH")


router = APIRouter(prefix="/tutorials", tags=['tutorials'])


@router.get("/{tutorial_id}")
def get_art(
    tutorial_id: int
):
    success, _, message, items = retrieve(
        tables=[TutorialModel, PostModel],
        single=True,
        tutorial_id=tutorial_id
    )

    return {"data": items[0], "success": success, "message": message}


@router.get("/")
def get_arts(
    media: str | None = None,
    created_at: str | None = None,
    artist_id: int | None = None,
    title: str | None = None,
    description: str | None = None,
    search__title: str | None = None,
    search__description: str | None = None,
    tag_name: str | None = None
):
    filters = {
        "tables": [TutorialModel, PostModel, TagPostModel if tag_name else None],
        "single": False,
        f"table__{TutorialModel.get_table_name()}__media": media,
        f"table__{PostModel.get_table_name()}__created_at": created_at,
        f"table__{PostModel.get_table_name()}__artist_id": artist_id,
        f"table__{PostModel.get_table_name()}__title": title,
        f"table__{PostModel.get_table_name()}__search__title": search__title,
        f"table__{PostModel.get_table_name()}__description": description,
        f"table__{PostModel.get_table_name()}__search__description": search__description,
        f"table__{TagPostModel.get_table_name()}__tag_name": tag_name,
    }

    success, count, message, items = retrieve(**filters)

    return {"data": items, "success": success, "message": message, "count": count}


@router.post("/")
async def create_new_art( title: str = Form(...),
                    description: str = Form(...),
                    image: UploadFile = File(...),
                    user: dict[str, Any] = Depends(get_current_user)):
    
    success, message, post = insert(
        PostModel(
            artist_id=user['artist_id'], 
            description=description, 
            title=title
        )
    )

    file_mgr = FileManager(f"{FILEPATH}post_images/")
    content = await file_mgr.save(image)
    
    if content is None:
        raise HTTPException(status_code=500, detail="Image upload failed")

    success, message, art = insert(
        TutorialModel(
            media=content,
            post_id=post['post_id']
        )
    )
    
    return {"message": message, "success": success, "data": dict(post, **art)}


@router.delete("/{post_id}")
def delete_art(post_id: int):
    success, message = delete(
        table=PostModel.get_table_name(),
        post_id=post_id
    )
    return {"message": message, "success": success}


@router.put("/")
def update_art(request_data: UpdateTutorial):
    success, message, post = update(
        table=PostModel.get_table_name(),
        model={
            'title': request_data.title,
            'description': request_data.description
        },
        identifier=PostModel.get_identifier(),
        post_id=request_data.post_id
    )
    
    return {"message": message, "success": success, "data": dict(post)}


from modules.report.router import create_report
from modules.report.model import CreateReport, ReportRequest


@router.post("/report/{tutorial_id}")
def report_tutorial(tutorial_id: int, request: ReportRequest, user: dict[str, Any] = Depends(get_current_user)):
    return create_report(CreateReport(
        entity_name=TutorialModel.get_table_name(),
        entity_id=tutorial_id,
        content=request.content
    ), user)