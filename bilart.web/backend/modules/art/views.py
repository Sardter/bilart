from db.view import View


class ArtView(View):
    @staticmethod
    def get_table_name() -> str:
        return "HomeView"
    
    @staticmethod
    def create_view() -> str:
        return f"""
        CREATE VIEW {ArtView.get_table_name()} AS
        SELECT Art.art_id, Art.content, Art.price, 
        Art.collector_id, Post.post_id, Post.artist_id, 
        Post.created_at, Post.title, Post.description, 
        COUNT(Rating.rating_id) as rating_count
        FROM Post
        NATURAL JOIN Art
        LEFT JOIN Rating ON Post.post_id = Rating.post_id
        WHERE Art.collector_id IS NULL
        GROUP BY art_id, Post.post_id, rating_id
        ORDER BY rating_count DESC;
        """
