from db.trigger import Trigger
from modules.user.model import UserModel
from modules.admin.model import AdminModel
from modules.collector.model import CollectorModel
from modules.artist.model import ArtistModel


class UserTrigger(Trigger):
    @staticmethod
    def create_trigger() -> str:
        admin = dict(AdminModel(
            user_id=-1,
            privileges="'N'"
        ).to_dict(), user_id="NEW.user_id")
        
        collector = dict(CollectorModel(
            user_id=-1,
            rank=1
        ).to_dict(), user_id="NEW.user_id", rank='1')
        
        artist = dict(ArtistModel(
            user_id=-1,
            bio="''",
            link="''"
        ).to_dict(), user_id="NEW.user_id")
        return f"""
            CREATE OR REPLACE FUNCTION create_user_related_rows()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO {AdminModel.get_table_name()} ({', '.join(admin.keys())}) VALUES ({', '.join([f"{value}" for value in admin.values()])});

                INSERT INTO {CollectorModel.get_table_name()} ({', '.join(collector.keys())}) VALUES ({', '.join([f"{value}" for value in collector.values()])});
                
                INSERT INTO {ArtistModel.get_table_name()} ({', '.join(artist.keys())}) VALUES ({', '.join([f"{value}" for value in artist.values()])});

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            
            CREATE TRIGGER trigger_user_creation
            AFTER INSERT ON {UserModel.get_table_name()}
            FOR EACH ROW
            EXECUTE FUNCTION create_user_related_rows();
            """