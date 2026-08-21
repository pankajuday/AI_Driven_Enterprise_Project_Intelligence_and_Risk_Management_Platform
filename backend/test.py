# test_db.py
import asyncio
from beanie import Document, init_beanie
from pymongo import AsyncMongoClient

class TestDoc(Document):
    name: str
    class Settings:
        name = "test"

async def main():
    client = AsyncMongoClient("mongodb://localhost:27017")
    # Get the Motor database instance and pass it to Beanie
    db = client["test_db"]
    await init_beanie(database=db, document_models=[TestDoc])
    doc = TestDoc(name="sample test doc")
    await doc.insert()
    print("✅ Beanie initialized successfully!")
    print(f"✅ Saved TestDoc with id: {doc.id}")

asyncio.run(main())