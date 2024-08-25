from modules.art.router import get_art
from modules.rating.model import RatingModel
from modules.collection.model import CollectionModel
from modules.auction.model import AuctionModel
from modules.art.model import ArtModel
from modules.user.router import get_user_id
from modules.rating.router import get_rating
from modules.collection.router import get_collection
from modules.auction.router import get_auction
from modules.user.model import UserModel

get_entity_mapper = {
    UserModel.get_table_name(): get_user_id,
    ArtModel.get_table_name(): get_art,
    AuctionModel.get_table_name(): get_auction,
    CollectionModel.get_table_name(): get_collection,
    RatingModel.get_table_name(): get_rating
}