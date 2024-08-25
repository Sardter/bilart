from fastapi import UploadFile
import secrets
from PIL import Image

class FileManager:
    def __init__(self, file_path):
        self.file_path: str = file_path

    async def save(self, file: UploadFile, size: tuple = (200,200)) -> str | None:
        filename = file.filename
        if filename is None: 
            return None
        # test.png >> ["test", "png"] >> return "png"
        extension = filename.split(".")[-1]

        if extension not in ["png", "jpg", "jpeg"]:
            raise ValueError(f"Invalid file extension {extension}")
        
        try:
            token = secrets.token_hex(10) + "." + extension
            img_url = self.file_path + token
            file_content = await file.read()

            with open(img_url, "wb") as file:
                file.write(file_content)

            img = Image.open(img_url)
            img = img.resize(size=size)
            img.save(img_url)

            file.close()
            return img_url
        except Exception as e:
            raise e