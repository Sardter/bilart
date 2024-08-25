from db.trigger import Trigger


class ArtCollectionTrigger(Trigger):
    @staticmethod
    def create_trigger() -> str:
        return """
        -- Step 1: Create the Trigger Function
        CREATE OR REPLACE FUNCTION check_art_collector_match()
        RETURNS TRIGGER AS $$
        DECLARE
            artCollector INT;
            collectionCollector INT;
        BEGIN
            -- Get the collector_id of the art
            SELECT collector_id INTO artCollector
            FROM Art
            WHERE art_id = NEW.art_id;

            -- Get the collector_id of the collection
            SELECT collector_id INTO collectionCollector
            FROM Collection
            WHERE collection_id = NEW.collection_id;

            -- Check if the collector_id matches
            IF artCollector IS NOT NULL AND artCollector != collectionCollector THEN
                RAISE EXCEPTION 'Art does not belong to the collector of the collection.';
            END IF;

            -- If the check passes, allow the insert
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Step 2: Create the Trigger
        CREATE TRIGGER art_collection_insert
        BEFORE INSERT ON Art_MM_Collection
        FOR EACH ROW
        EXECUTE FUNCTION check_art_collector_match();

        -- Step 1: Create the Trigger Function
        CREATE OR REPLACE FUNCTION check_art_collector_match_on_delete()
        RETURNS TRIGGER AS $$
        DECLARE
            artCollector INT;
            collectionCollector INT;
        BEGIN
            -- Get the collector_id of the art
            SELECT collector_id INTO artCollector
            FROM Art
            WHERE art_id = OLD.art_id;

            -- Get the collector_id of the collection
            SELECT collector_id INTO collectionCollector
            FROM Collection
            WHERE collection_id = OLD.collection_id;

            -- Check if the collector_id matches
            IF artCollector IS NOT NULL AND artCollector != collectionCollector THEN
                RAISE EXCEPTION 'Art does not belong to the collector of the collection.';
            END IF;

            -- If the check passes, allow the delete
            RETURN OLD;
        END;
        $$ LANGUAGE plpgsql;

        -- Step 2: Create the Trigger
        CREATE TRIGGER art_collection_delete
        BEFORE DELETE ON Art_MM_Collection
        FOR EACH ROW
        EXECUTE FUNCTION check_art_collector_match_on_delete();


        """