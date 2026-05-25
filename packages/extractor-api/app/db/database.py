import os
from sqlmodel import create_engine, SQLModel, Session

_db_path = os.getenv("DATABASE_URL", "sqlite:////app/data/searches.db")
engine = create_engine(_db_path, connect_args={"check_same_thread": False})


def create_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
