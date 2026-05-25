import json
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel

from ....db.database import get_session
from ....db.models import Search

router = APIRouter()


class SearchCreate(BaseModel):
    name: str
    polygon: list[list[float]]
    sectors: list[str] = []
    result: dict | None = None


class SearchRead(BaseModel):
    id: str
    name: str
    polygon: list[list[float]]
    sectors: list[str]
    result: dict | None
    created_at: str

    @classmethod
    def from_orm(cls, s: Search) -> "SearchRead":
        return cls(
            id=s.id,
            name=s.name,
            polygon=s.polygon,
            sectors=s.sectors,
            result=s.result,
            created_at=s.created_at.isoformat(),
        )


@router.get("/", response_model=list[SearchRead])
def list_searches(session: Session = Depends(get_session)) -> list[SearchRead]:
    rows = session.exec(select(Search).order_by(Search.created_at.desc())).all()
    return [SearchRead.from_orm(r) for r in rows]


@router.post("/", response_model=SearchRead, status_code=201)
def create_search(payload: SearchCreate, session: Session = Depends(get_session)) -> SearchRead:
    row = Search(
        name=payload.name,
        polygon_json=json.dumps(payload.polygon),
        sectors_json=json.dumps(payload.sectors),
        result_json=json.dumps(payload.result) if payload.result else None,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return SearchRead.from_orm(row)


@router.get("/{search_id}", response_model=SearchRead)
def get_search(search_id: str, session: Session = Depends(get_session)) -> SearchRead:
    row = session.get(Search, search_id)
    if not row:
        raise HTTPException(status_code=404, detail="Search not found")
    return SearchRead.from_orm(row)


@router.delete("/{search_id}", status_code=204)
def delete_search(search_id: str, session: Session = Depends(get_session)) -> None:
    row = session.get(Search, search_id)
    if not row:
        raise HTTPException(status_code=404, detail="Search not found")
    session.delete(row)
    session.commit()
