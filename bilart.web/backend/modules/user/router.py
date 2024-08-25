from modules.user.view import UserView
from modules.report.model import CreateReport, ReportRequest
from modules.report.router import create_report
import os
from typing import Any
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException

from db.delete import delete
from db.update import update
from db.retrieve import retrieve
from db.insert import insert

from modules.user.model import UserModel, UpdateUser, UpdatePrivileges
from modules.user.auth import get_current_user
from modules.admin.model import AdminModel
from modules.collector.model import CollectorModel
from modules.artist.model import ArtistModel
from file_manager import FileManager

FILEPATH = os.getenv("FILEPATH")

router = APIRouter(prefix="/users", tags=['users'])


@router.get("/me")
def get_me(
    user: dict[str, Any] = Depends(get_current_user)
):
    return {"message": "your current profile", "success": True, "data": user}


@router.delete("/me")
def delete_user(user: dict[str, Any] = Depends(get_current_user)):
    success, message = delete(
        table=UserModel.get_table_name(),
        user_id=user['user_id']
    )
    return {"message": message, "success": success}


@router.put("/me")
def update_user(request_data: UpdateUser, user: dict[str, Any] = Depends(get_current_user)):
    if user['privileges'] != 'A' and (request_data.privileges in ['A', 'M']):
        raise HTTPException(status_code=401, detail="Not authorized")

    success, message, updated_user = update(
        table=UserModel.get_table_name(),
        model={
            'username': request_data.username,
            'first_name': request_data.first_name,
            'last_name': request_data.last_name,
            'email': request_data.email,
            'phone': request_data.phone,
            'password_hash': request_data.password
        },
        identifier=UserModel.get_identifier(),
        user_id=user['user_id']
    )

    success, message, artist = update(
        table=ArtistModel.get_table_name(),
        model={
            'bio': request_data.bio,
            'link': request_data.link
        },
        identifier=ArtistModel.get_identifier(),
        artist_id=user['artist_id']
    )

    success, message, admin = update(
        table=AdminModel.get_table_name(),
        model={
            'privileges': request_data.privileges
        },
        identifier=AdminModel.get_identifier(),
        admin_id=user['admin_id']
    )

    updated_user.update(artist)
    updated_user.update(admin)
    del updated_user['password_hash']

    return {"message": message, "success": success, "data": updated_user}


@router.get("/{user_id}")
def get_user_id(
    user_id: int,
):
    success, _, message, items = retrieve(
        tables=[UserView],
        single=True,
        user_id=user_id,
    )

    return {"data": items[0], "success": success, "message": message}


@router.get("/{username}")
def get_user_username(
    username: str,
):
    success, _, message, items = retrieve(
        tables=[UserView],
        single=True,
        username=username,
    )

    return {"data": items[0], "success": success, "message": message}


@router.get("/")
def get_users(
    username: str | None = None,
    first_name: str | None = None,
    last_name: str | None = None,
    email: str | None = None,
    bio: str | None = None,
    link: str | None = None,
    privledge: str | None = None,
    rank: int | None = None,
    search__username: str | None = None,
    search__first_name: str | None = None,
    search__last_name: str | None = None,
    search__email: str | None = None,
    search__bio: str | None = None,
    created_at: str | None = None
):
    filters = {
        "tables": [UserView],
        "single": False,
        f"table__{UserModel.get_table_name()}__username": username,
        f"table__{UserModel.get_table_name()}__first_name": first_name,
        f"table__{UserModel.get_table_name()}__last_name": last_name,
        f"table__{UserModel.get_table_name()}__email": email,
        f"table__{UserModel.get_table_name()}__created_at": created_at,
        f"table__{UserModel.get_table_name()}__search__first_name": search__first_name,
        f"table__{UserModel.get_table_name()}__search__email": search__email,
        f"table__{UserModel.get_table_name()}__search__last_name": search__last_name,
        f"table__{UserModel.get_table_name()}__search__username": search__username,
        f"table__{ArtistModel.get_table_name()}__bio": bio,
        f"table__{ArtistModel.get_table_name()}__link": link,
        f"table__{ArtistModel.get_table_name()}__search__bio": search__bio,
        f"table__{AdminModel.get_table_name()}__privledge": privledge,
        f"table__{CollectorModel.get_table_name()}__rank": rank,
    }

    success, count, message, items = retrieve(**filters)

    return {"data": items, "success": success, "message": message, "count": count}


@router.post("/register")
def create_new_user(request_data: UserModel):
    success, message, data = insert(request_data)
    del data['password_hash']
    return {"message": message, "success": success, "data": data}


@router.post("/profile-image")
async def upload_profile_picture(image: UploadFile = File(...),
                                 user: dict[str, Any] = Depends(
                                     get_current_user)
                                 ):
    file_mgr = FileManager(f"{FILEPATH}profile_images/")
    content = await file_mgr.save(image)
    if content is None:
        raise HTTPException(status_code=500, detail="Image upload failed")

    success, message, user = update(
        table=UserModel.get_table_name(),
        model={
            'profile_image': content
        },
        identifier=UserModel.get_identifier(),
        user_id=user['user_id']
    )

    return {"message": message, "success": success, "data": dict(user)}


@router.post("/report/{user_id}")
def report_user(user_id: int, request: ReportRequest, user: dict[str, Any] = Depends(get_current_user)):
    return create_report(CreateReport(
        entity_name=UserModel.get_table_name(),
        entity_id=user_id,
        content=request.content
    ), user)


@router.post("/{user_id}/change_privileges")
def change_privileges(user_id: int, request: UpdatePrivileges, user: dict[str, Any] = Depends(get_current_user)):
    condition_a = user['privileges'] not in ['A'] and request.privileges in ['A']
    condition_b = user['privileges'] not in ['A', 'M'] and request.privileges in ['A', 'M', 'N']
    
    if condition_a or condition_b:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    success, message, admin = update(
        table=AdminModel.get_table_name(),
        model={
            'privileges': request.privileges
        },
        identifier=AdminModel.get_identifier(),
        admin_id=user_id
    )

    return {"data": admin, "success": success, "message": message}