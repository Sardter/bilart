from modules.auction.model import AuctionModel
from modules.bid.model import BidModel
from db.trigger import Trigger


class AuctionTrigger(Trigger):
    @staticmethod
    def create_trigger() -> str:
        return f"""
        -- Step 1: Create the Trigger Function
        CREATE OR REPLACE FUNCTION check_auction_activation()
        RETURNS TRIGGER AS $$
        DECLARE
            paidBidExists BOOLEAN;
        BEGIN
            -- Check if there is any bid with payment_done = true for this auction
            SELECT EXISTS (
                SELECT 1
                FROM {BidModel.get_table_name()}
                WHERE {AuctionModel.get_identifier()} = NEW.{AuctionModel.get_identifier()}
                AND payment_done = TRUE
            ) INTO paidBidExists;

            -- If such a bid exists, prevent setting the auction to active
            IF paidBidExists AND NEW.active THEN
                RAISE EXCEPTION 'Cannot set auction to active once a bid payment is done.';
            END IF;

            -- If the check passes, allow the update
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Step 2: Create the Trigger
        CREATE TRIGGER auction_active_update
        AFTER UPDATE OF active ON {AuctionModel.get_table_name()}
        FOR EACH ROW
        WHEN (NEW.active IS DISTINCT FROM OLD.active)
        EXECUTE FUNCTION check_auction_activation();

        """