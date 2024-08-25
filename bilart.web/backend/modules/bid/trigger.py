from db.trigger import Trigger

from modules.notification.model import NotificationModel
from modules.post.model import PostModel
from modules.bid.model import BidModel
from modules.auction.model import AuctionModel
from modules.favorite.model import FavoriteModel
from modules.art.model import ArtModel
from modules.user.model import UserModel
from modules.artist.model import ArtistModel

from modules.collector.model import CollectorModel

class BidTrigger(Trigger):
    @staticmethod
    def create_trigger() -> str:
        return f"""
        -- Step 1: Create the Trigger Function
        CREATE OR REPLACE FUNCTION check_bid_before_auction_end()
        RETURNS TRIGGER AS $$
        DECLARE
            auctionEndTime TIMESTAMPTZ;
            auctionActive BOOLEAN;
        BEGIN
            -- Get the end_time of the auction
            SELECT end_time INTO auctionEndTime
            FROM Auction
            WHERE auction_id = NEW.auction_id;
            
            SELECT active INTO auctionActive
            FROM Auction
            WHERE auction_id = NEW.auction_id;


            IF NOT auctionActive THEN
                RAISE EXCEPTION 'Cannot create bid if the auction is not active.';
            END IF;

            -- Check if the current time is after the auction's end_time
            IF CURRENT_TIMESTAMP > auctionEndTime THEN
                RAISE EXCEPTION 'Cannot create bid after the auction end time.';
            END IF;

            -- If the check passes, allow the bid
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Step 2: Create the Trigger
        CREATE TRIGGER bid_before_insert
        BEFORE INSERT ON Bid
        FOR EACH ROW
        EXECUTE FUNCTION check_bid_before_auction_end();
    
    
        -- Step 1: Create the Trigger Function
        CREATE OR REPLACE FUNCTION check_bid_price()
        RETURNS TRIGGER AS $$
        DECLARE
            artPrice DECIMAL;
        BEGIN
            -- Get the price of the art associated with the bid
            SELECT {ArtModel.get_table_name()}.price INTO artPrice
            FROM {ArtModel.get_table_name()}
            INNER JOIN {AuctionModel.get_table_name()} ON {ArtModel.get_table_name()}.{ArtModel.get_identifier()} = {AuctionModel.get_table_name()}.{ArtModel.get_identifier()}
            WHERE {AuctionModel.get_table_name()}.{AuctionModel.get_identifier()} = NEW.{AuctionModel.get_identifier()};

            -- Check if the bid price is lower than the art's price
            IF NEW.price < artPrice THEN
                RAISE EXCEPTION 'Bid price cannot be lower than the art''s price.';
            END IF;

            -- If the check passes, allow the bid
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Step 2: Create the Trigger
        CREATE TRIGGER check_bid_before_insert
        BEFORE INSERT ON {BidModel.get_table_name()}
        FOR EACH ROW
        EXECUTE FUNCTION check_bid_price();
    
    
        -- Step 1: Create the Trigger Function
        CREATE OR REPLACE FUNCTION assign_art_and_close_auction()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Check if someone is trying to set payment_done back to false
            IF OLD.payment_done AND NOT NEW.payment_done THEN
                RAISE EXCEPTION 'Cannot revert payment_done to false once it has been set to true.';
            END IF;

            -- Check if the payment_done field is updated to true
            IF NEW.payment_done AND NOT OLD.payment_done THEN
                -- Update the Art table, setting the collector_id to the collector who made the winning bid
                UPDATE {ArtModel.get_table_name()}
                SET {CollectorModel.get_identifier()} = NEW.{CollectorModel.get_identifier()}
                FROM {AuctionModel.get_table_name()}
                WHERE {ArtModel.get_table_name()}.{ArtModel.get_identifier()} = {AuctionModel.get_table_name()}.{ArtModel.get_identifier()} 
                AND {AuctionModel.get_table_name()}.{AuctionModel.get_identifier()} = NEW.{AuctionModel.get_identifier()};

                -- Update the Auction table, setting the active field to false
                UPDATE {AuctionModel.get_table_name()}
                SET active = FALSE
                WHERE {AuctionModel.get_identifier()} = NEW.{AuctionModel.get_identifier()};
            END IF;

            -- Return the updated record
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Step 2: Create the Trigger
        CREATE TRIGGER bid_payment_update
        AFTER UPDATE OF payment_done ON {BidModel.get_table_name()}
        FOR EACH ROW
        WHEN (NEW.payment_done IS DISTINCT FROM OLD.payment_done)
        EXECUTE FUNCTION assign_art_and_close_auction();

    
    
        -- Step 1: Update the Trigger Function
        CREATE OR REPLACE FUNCTION bid_notifier()
        RETURNS TRIGGER AS $$
        DECLARE
            artTitle VARCHAR(128);
            bidderName VARCHAR(128);
            artistId INT;
        BEGIN
            -- Get the title of the art associated with the auction
            SELECT {PostModel.get_table_name()}.title INTO artTitle
            FROM {ArtModel.get_table_name()}
            NATURAL JOIN {PostModel.get_table_name()}
            NATURAL JOIN {AuctionModel.get_table_name()}
            WHERE {AuctionModel.get_table_name()}.{AuctionModel.get_identifier()} = NEW.{AuctionModel.get_identifier()};
            
            SELECT {UserModel.get_table_name()}.username INTO bidderName
            FROM {UserModel.get_table_name()}
            NATURAL JOIN {CollectorModel.get_table_name()}
            WHERE {CollectorModel.get_table_name()}.{CollectorModel.get_identifier()} = NEW.{CollectorModel.get_identifier()};
            
            SELECT {AuctionModel.get_table_name()}.artist_id INTO artistId
            FROM {AuctionModel.get_table_name()}
            NATURAL JOIN {BidModel.get_table_name()}
            WHERE {BidModel.get_table_name()}.{BidModel.get_identifier()} = NEW.{BidModel.get_identifier()};

            -- Notify the user who made the new bid
            INSERT INTO {NotificationModel.get_table_name()}(content, {UserModel.get_identifier()})
            SELECT 'You made a new bid on "' || artTitle || '"',
                (SELECT {UserModel.get_identifier()} FROM {CollectorModel.get_table_name()} 
                WHERE {CollectorModel.get_identifier()} = NEW.{CollectorModel.get_identifier()})
                WHERE NEW.{BidModel.get_identifier()} IS NOT NULL;
                
            -- Notify the auction's artist
            INSERT INTO {NotificationModel.get_table_name()}(content, {UserModel.get_identifier()})
            SELECT 'New bid made on "' || artTitle || '" by collector ' || bidderName, artistId
                WHERE NEW.{BidModel.get_identifier()} IS NOT NULL;

            -- Notify all other users who have made a bid in the same auction
            INSERT INTO {NotificationModel.get_table_name()}(content, {UserModel.get_identifier()})
            SELECT 'New bid made on "' || artTitle || '" by collector ' || bidderName,
                (SELECT {UserModel.get_identifier()} FROM {CollectorModel.get_table_name()} WHERE {CollectorModel.get_identifier()} = {BidModel.get_table_name()}.{CollectorModel.get_identifier()})
            FROM {BidModel.get_table_name()}
            WHERE {BidModel.get_table_name()}.{AuctionModel.get_identifier()} = NEW.{AuctionModel.get_identifier()} AND {BidModel.get_table_name()}.{CollectorModel.get_identifier()} != NEW.{CollectorModel.get_identifier()};

            -- Notify users who have favorited the art
            INSERT INTO {NotificationModel.get_table_name()}(content, {UserModel.get_identifier()})
            SELECT 'New bid made on "' || artTitle || '"',
                (SELECT {UserModel.get_identifier()} FROM {CollectorModel.get_table_name()} WHERE {CollectorModel.get_identifier()} = {FavoriteModel.get_table_name()}.{CollectorModel.get_identifier()})
            FROM {FavoriteModel.get_table_name()}
            NATURAL JOIN {ArtModel.get_table_name()}
            NATURAL JOIN {AuctionModel.get_table_name()}
            WHERE {AuctionModel.get_table_name()}.{AuctionModel.get_identifier()} = NEW.{AuctionModel.get_identifier()};

            -- Return the new record
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Step 2: (Re)Create the Trigger
        DROP TRIGGER IF EXISTS bid_after_insert ON {BidModel.get_table_name()};

        CREATE TRIGGER bid_after_insert
        AFTER INSERT ON {BidModel.get_table_name()}
        FOR EACH ROW
        EXECUTE FUNCTION bid_notifier();
        """