import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from infrastructure.database.connection import get_test_db
from main import app

client = TestClient(app)

def test_user_registration():
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 200
    assert "message" in response.json()

def test_user_login():
    # First register
    client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    
    # Then login
    response = client.post("/auth/login", data={
        "username": "test@example.com",
        "password": "testpassword"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_protected_route():
    # Register and login
    client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "testpassword"
    })
    response = client.post("/auth/login", data={
        "username": "test@example.com",
        "password": "testpassword"
    })
    access_token = response.json()["access_token"]
    
    # Access protected route
    headers = {"Authorization": f"Bearer {access_token}"}
    protected_response = client.get("/protected", headers=headers)
    assert protected_response.status_code == 200
