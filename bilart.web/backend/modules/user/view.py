from db.view import View


class UserView(View):
    @staticmethod
    def get_table_name() -> str:
        return "AllUsersView"

    @staticmethod
    def create_view() -> str:
        return f"""
        CREATE VIEW {UserView.get_table_name()} AS
        SELECT "User".user_id, "User".username, "User".first_name, "User".last_name, 
        "User".email, "User".profile_image, "User".created_at, "User".phone,
        Collector.collector_id, Collector.rank,
        Artist.artist_id, Artist.bio, Artist.link, Artist.price,
        Admin.admin_id, Admin.privileges FROM "User"
        NATURAL JOIN Admin
        NATURAL JOIN Collector
        NATURAL JOIN Artist;
        """
