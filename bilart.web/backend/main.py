from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from db.create_table import create_tables as util_create_tables
from modules.modules import routers


app = FastAPI()

app.mount("/static", StaticFiles(directory="./static"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in routers:
    app.include_router(router)

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/create_tables")
def create_tables():
    result, message = util_create_tables()
    return {"result": result, "message": message}

