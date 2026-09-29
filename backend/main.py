"""
FastAPI Backend for the Todo Application.
Provides RESTful endpoints for CRUD and reordering operations using SQLite.
"""
from fastapi import FastAPI, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
import os
import sys

# Add backend directory to sys.path
sys.path.append(os.path.dirname(__file__))
import database

app = FastAPI(
    title="Todo List API",
    description="A simple, fast, SQLite-backed Todo List API built with FastAPI.",
    version="1.0.0"
)

# Enable CORS so the React frontend can communicate seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Initialize DB upon server startup
@app.on_event("startup")
def startup():
    database.init_db()


# Pydantic Schemas for Request Validation
class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: Optional[str] = "medium"
    due_date: Optional[str] = None


class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None


class ReorderRequest(BaseModel):
    ordered_ids: List[int]


# Create an APIRouter for all endpoints
api = APIRouter()


@api.get("/health")
def health():
    return {
        "status": "healthy",
        "backend": "FastAPI (Python)",
        "database": "SQLite 3",
        "version": "1.0.0"
    }


@api.get("/todos")
def list_todos():
    return database.get_all_todos()


@api.post("/todos", status_code=201)
def create_todo(todo: TodoCreate):
    if not todo.title or not todo.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    return database.create_todo(
        title=todo.title,
        description=todo.description or "",
        priority=todo.priority or "medium",
        due_date=todo.due_date
    )


@api.get("/todos/{todo_id}")
def get_todo(todo_id: int):
    item = database.get_todo(todo_id)
    if not item:
        raise HTTPException(status_code=404, detail="Todo not found")
    return item


@api.put("/todos/{todo_id}")
def update_todo(todo_id: int, todo: TodoUpdate):
    updated = database.update_todo(
        todo_id=todo_id,
        title=todo.title,
        description=todo.description,
        completed=todo.completed,
        priority=todo.priority,
        due_date=todo.due_date
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Todo not found")
    return updated


@api.patch("/todos/{todo_id}/toggle")
def toggle_todo(todo_id: int):
    updated = database.toggle_todo(todo_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Todo not found")
    return updated


@api.delete("/todos/{todo_id}")
def delete_todo(todo_id: int):
    success = database.delete_todo(todo_id)
    if not success:
        raise HTTPException(status_code=404, detail="Todo not found")
    return {"message": "Todo deleted successfully", "id": todo_id}


@api.post("/todos/reorder")
def reorder_todos(req: ReorderRequest):
    return database.reorder_todos(req.ordered_ids)


@api.delete("/todos/bulk/completed")
def clear_completed_todos():
    count = database.clear_completed()
    return {"message": f"Cleared {count} completed todos", "cleared_count": count}


# Include router both at root and with /api prefix so it handles both /todos and /api/todos
app.include_router(api)
app.include_router(api, prefix="/api")


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
