from db.trigger import Trigger


class ReportTrigger(Trigger):
    @staticmethod
    def create_trigger() -> str:
        return f"""
        -- Step 1: Create the Function to Notify Admins
        CREATE OR REPLACE FUNCTION notify_admins_on_report()
        RETURNS TRIGGER AS $$
        BEGIN
            -- Insert a notification for each admin with privileges 'M' and 'A'
            INSERT INTO Notification(content, user_id, created_at)
            SELECT 'New report created with ID: ' || NEW.report_id, user_id, NOW()
            FROM Admin
            WHERE privileges IN ('M', 'A');

            -- Return the new record
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Step 2: Create the Trigger
        CREATE TRIGGER report_after_insert
        AFTER INSERT ON Report
        FOR EACH ROW
        EXECUTE FUNCTION notify_admins_on_report();


        """