from db.trigger import Trigger
from modules.artist.model import ArtistModel
from modules.collector.model import CollectorModel
from modules.notification.model import NotificationModel
from modules.post.model import PostModel
from modules.rating.model import RatingModel
from modules.user.model import UserModel


class RatingTrigger(Trigger):
    @staticmethod
    def create_trigger() -> str:
        return f"""
                -- Step 1: Create the Trigger Function
            CREATE OR REPLACE FUNCTION notify_new_rating()
            RETURNS TRIGGER AS $$
            DECLARE
                postTitle VARCHAR(128);
                userName VARCHAR(255);
            BEGIN
                -- Get the title of the post being rated
                SELECT {PostModel.get_table_name()}.title INTO postTitle
                FROM {PostModel.get_table_name()}
                WHERE {PostModel.get_table_name()}.{PostModel.get_identifier()} = NEW.{PostModel.get_identifier()};

                -- Get the username of the user who made the rating
                SELECT {UserModel.get_table_name()}.username INTO userName
                FROM {UserModel.get_table_name()}
                NATURAL JOIN {CollectorModel.get_table_name()}
                WHERE {CollectorModel.get_table_name()}.{CollectorModel.get_identifier()} = NEW.{CollectorModel.get_identifier()};

                -- Insert a new notification for the rating action
                INSERT INTO {NotificationModel.get_table_name()}(content, {UserModel.get_identifier()})
                VALUES ('User ' || userName || ' rated your post: "' || postTitle || '"', 
                        (SELECT {ArtistModel.get_identifier()} FROM 
                        {PostModel.get_table_name()} WHERE {PostModel.get_identifier()} = NEW.{PostModel.get_identifier()}));

                -- Return the new record
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- Step 2: Create the Trigger
            CREATE TRIGGER rating_after_insert
            AFTER INSERT ON {RatingModel.get_table_name()}
            FOR EACH ROW
            EXECUTE FUNCTION notify_new_rating();

            """