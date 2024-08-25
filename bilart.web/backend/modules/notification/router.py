from typing import Any
from fastapi import APIRouter, Depends

from db.retrieve import retrieve
from db.update import update

from modules.user.auth import get_current_user
from modules.user.model import UserModel
from modules.notification.model import NotificationModel

router = APIRouter(prefix="/notifications", tags=['notifications'])


@router.get('/')
def get_notifications(user: dict[str, Any] = Depends(get_current_user)):
    filters = {
        "tables": [NotificationModel],
        "single": False,
        UserModel.get_identifier(): user[UserModel.get_identifier()]
    }

    success, count, message, items = retrieve(**filters)

    return {"data": items, "success": success, "message": message, "count": count}


@router.post('/')
def read_notifications(user: dict[str, Any] = Depends(get_current_user)):
    filters = {
        "tables": [NotificationModel],
        "single": False,
        f"{UserModel.get_identifier()}": user[f'{UserModel.get_identifier()}']
    }

    success, count, message, items = retrieve(**filters)
    
    for item in items:
        update(
            table=NotificationModel.get_table_name(),
            model={
                'read': True
            },
            identifier=NotificationModel.get_identifier(),
            user_id=item['user_id'],
            notification_id=item['notification_id']
        )

    return {"data": items, "success": success, "message": message, "count": count}