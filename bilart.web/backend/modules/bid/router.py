from enum import Enum
from typing import Any
from fastapi import APIRouter, Depends
from db.tables import JoinModel

from db.delete import delete
from db.update import update
from db.retrieve import retrieve, get_from_table
from db.insert import insert

from modules.bid.model import BidModel, CreateBid
from modules.collector.model import CollectorModel
from modules.user.auth import get_current_user
from modules.user.model import UserModel



router = APIRouter(prefix="/bids", tags=['bids'])


@router.get("/{bid_id}")
def get_bid(
    bid_id: int
):
    success, _, message, items = retrieve(
        tables=[BidModel],
        single=True,
        bid_id=bid_id
    )

    return {"data": items[0], "success": success, "message": message}

class PriceOrder(Enum):
    asc = "asc"
    desc = f"desc"
    
    @staticmethod
    def get_asc():
        return f"{BidModel.get_table_name()}.price ASC"
    
    @staticmethod
    def get_desc():
        return f"{BidModel.get_table_name()}.price DESC"
    
    @staticmethod
    def get_val(val: str):
        return PriceOrder.get_desc() if val == "desc" else PriceOrder.get_asc()


@router.get("/")
def get_bids(
    bid_id: int | None = None,
    price: str | None = None,
    gt__price: str | None = None,
    lt__price: str | None = None,
    auction_id: int | None = None,
    collector_id: int | None = None,
    payment_done: bool | None = None,
    created_at: str | None = None,
    price_order: PriceOrder | None = None
):
    success, count, message, items = retrieve(
        tables=[BidModel],
        single=False,
        bid_id=bid_id,
        price=price,
        gt__price=gt__price,
        lt__price=lt__price,
        auction_id=auction_id,
        collector_id=collector_id,
        payment_done=payment_done,
        created_at=created_at,
        order_by=[
            price_order.get_val(price_order.value) if price_order else None
        ]
    )

    return {"data": items, "success": success, "message": message, "count": count}


@router.post("/")
def create_new_bid(request_data: CreateBid, user: dict[str, Any] = Depends(get_current_user)):
    success, message, data = insert(
        BidModel(
            collector_id=user['collector_id'],
            auction_id=request_data.auction_id,
            price=request_data.price
        )
    )
    return {"message": message, "success": success, "data": data}


@router.delete("/{bid_id}")
def delete_bid(bid_id: int, user: dict[str, Any] = Depends(get_current_user)):
    retrieve(
        tables=[BidModel],
        single=True,
        collector_id=user['collector_id']
    )

    success, message = delete(
        table=BidModel.get_table_name(),
        bid_id=bid_id
    )
    return {"message": message, "success": success}


@router.post("/accept_payment/{bid_id}")
def accept_payment(bid_id: int, user: dict[str, Any] = Depends(get_current_user)):
    _, _, _, data = get_from_table("""
        Bid B
        INNER JOIN Auction AU ON B.auction_id = AU.auction_id
        INNER JOIN Art A ON AU.art_id = A.art_id
        INNER JOIN Post P ON A.post_id = P.post_id
        """, f"B.bid_id = {bid_id} AND P.artist_id = {user['artist_id']}", order_by_clasue="", single=True)

    success, message, data = update(
        table=BidModel.get_table_name(),
        model={
            'payment_done': True
        },
        identifier=BidModel.get_identifier(),
        bid_id=bid_id
    )
    return {"message": message, "success": success, "data": data}
