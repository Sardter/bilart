from fastapi import APIRouter
from pydantic import BaseModel

from db.model import Model
from modules.art.model import ArtModel
from modules.artist.model import ArtistModel

class AuctionModel(Model):
    start_time: str
    end_time: str
    active: bool = False
    art_id: int
    artist_id: int
    
    @staticmethod
    def get_table_name() -> str:
        return "Auction"
    
    @staticmethod
    def create_table() -> str:
        return f"""
            CREATE TABLE {AuctionModel.get_table_name()} (
                {AuctionModel.get_identifier()} SERIAL PRIMARY KEY,
                start_time TIMESTAMPTZ NOT NULL,
                end_time TIMESTAMPTZ NOT NULL,
                active BOOLEAN NOT NULL DEFAULT True,
                {ArtModel.get_identifier()} INT NOT NULL,
                {ArtistModel.get_identifier()} INT NOT NULL,
                CONSTRAINT end_time_after_start_time CHECK (end_time > start_time),
                CONSTRAINT fk_art
                    FOREIGN KEY({ArtModel.get_identifier()})
                        REFERENCES {ArtModel.get_table_name()}({ArtModel.get_identifier()})
                        ON DELETE CASCADE,
                CONSTRAINT fk_artist
                    FOREIGN KEY({ArtistModel.get_identifier()})
                        REFERENCES {ArtistModel.get_table_name()}({ArtistModel.get_identifier()})
                        ON DELETE CASCADE);
                
                CREATE UNIQUE INDEX idx_unique_active_auction
                ON {AuctionModel.get_table_name()} ({ArtModel.get_identifier()}, {ArtistModel.get_identifier()})
                WHERE active;


                CREATE OR REPLACE FUNCTION check_collector_id_not_null()
                RETURNS TRIGGER AS $$
                BEGIN
                    IF (SELECT collector_id FROM {ArtModel.get_table_name()} WHERE {ArtModel.get_identifier()} = NEW.{ArtModel.get_identifier()}) IS NOT NULL THEN
                        RAISE EXCEPTION 'Collector ID must not be NULL for the referenced post.';
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;

                CREATE TRIGGER before_insert_check_collector_id_not_null
                BEFORE INSERT ON {AuctionModel.get_table_name()}
                FOR EACH ROW
                EXECUTE FUNCTION check_collector_id_not_null();
            """
    
    @staticmethod
    def get_router() -> APIRouter:
        from modules.auction.router import router
        return router
        
    @staticmethod
    def get_create_order() -> int:
        return 12
    
    @staticmethod
    def get_identifier() -> str:
        return "auction_id"
    

class UpdateAuction(BaseModel):
    start_time: str | None
    end_time: str | None
    active: bool | None