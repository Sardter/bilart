from abc import ABC
from typing_extensions import Protocol


class ViewProtocal(Protocol):
    @staticmethod
    def get_table_name() -> str:
        ...
    
    @staticmethod
    def create_view() -> str:
        ...


class View(ABC):
    @staticmethod
    def get_table_name() -> str:
        ...
    
    @staticmethod
    def create_view() -> str:
        ...