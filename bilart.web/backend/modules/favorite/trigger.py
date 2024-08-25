from modules.artist.model import ArtistModel
from modules.collector.model import CollectorModel
from modules.favorite.model import FavoriteModel
from modules.notification.model import NotificationModel
from modules.post.model import PostModel
from modules.user.model import UserModel
from db.trigger import Trigger


class FavoriteTrigger(Trigger):
    @staticmethod
    def create_trigger() -> str:
        return f"""
        -- Step 1: Create the Trigger Function
        CREATE OR REPLACE FUNCTION notify_new_favorite()
        RETURNS TRIGGER AS $$
        DECLARE
            postTitle VARCHAR(128);
            userName VARCHAR(255);
        BEGIN
            -- Get the title of the post being favorited
            SELECT {PostModel.get_table_name()}.title INTO postTitle
            FROM {PostModel.get_table_name()}
            WHERE {PostModel.get_table_name()}.{PostModel.get_identifier()} = NEW.{PostModel.get_identifier()};

            -- Get the username of the user who favorited the post
            SELECT {UserModel.get_table_name()}.username INTO userName
            FROM {UserModel.get_table_name()}
            NATURAL JOIN {CollectorModel.get_table_name()}
            WHERE {CollectorModel.get_table_name()}.{CollectorModel.get_identifier()} = NEW.{CollectorModel.get_identifier()};

            -- Insert a new notification for the favorite action
            INSERT INTO {NotificationModel.get_table_name()}(content, {UserModel.get_identifier()})
            VALUES ('User ' || userName || ' favorited your post: "' || postTitle || '"', 
                    (SELECT {ArtistModel.get_identifier()} FROM 
                    {PostModel.get_table_name()} WHERE {PostModel.get_identifier()} = NEW.{PostModel.get_identifier()}));

            -- Return the new record
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Step 2: Create the Trigger
        CREATE TRIGGER favorite_after_insert
        AFTER INSERT ON {FavoriteModel.get_table_name()}
        FOR EACH ROW
        EXECUTE FUNCTION notify_new_favorite();

        """