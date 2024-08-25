from fastapi import APIRouter
from pydantic import BaseModel

from db.model import Model
from modules.auction.model import AuctionModel
from modules.collector.model import CollectorModel

class BidModel(Model):
    price: str
    auction_id: int
    collector_id: int
    payment_done: bool = False
    
    @staticmethod
    def get_table_name() -> str:
        return "Bid"
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {BidModel.get_table_name()} (
                {BidModel.get_identifier()} SERIAL PRIMARY KEY,
                price DECIMAL NOT NULL CHECK (price > 0),
                {AuctionModel.get_identifier()} INT NOT NULL,
                {CollectorModel.get_identifier()} INT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
                payment_done BOOLEAN NOT NULL DEFAULT False,
                CONSTRAINT fk_auction
                    FOREIGN KEY({AuctionModel.get_identifier()})
                        REFERENCES {AuctionModel.get_table_name()}({AuctionModel.get_identifier()})
                        ON DELETE CASCADE,
                CONSTRAINT fk_collector
                    FOREIGN KEY({CollectorModel.get_identifier()})
                        REFERENCES {CollectorModel.get_table_name()}({CollectorModel.get_identifier()})
                        ON DELETE CASCADE
            );
            """
    
    @staticmethod
    def get_router() -> APIRouter:
        from modules.bid.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 13
        
    @staticmethod
    def get_identifier() -> str:
        return "bid_id"
    

class CreateBid(BaseModel):
    price: str
    auction_id: int
    
    
class Updatebid(BaseModel):
    payment_done: bool