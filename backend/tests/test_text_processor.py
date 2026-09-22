import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))

from langchain_core.documents import Document
from rag.text_processor import TextProcessor


class TestTextProcessor(unittest.TestCase):

    def test_chunk_documents_normal(self):
        """Test chunking of standard document objects."""
        sample_text = "Section 1: Overview\n\n" + "This is a detailed sentence about the project. " * 30
        docs = [Document(page_content=sample_text, metadata={"source": "test.md"})]
        chunks = TextProcessor.chunk_documents(docs, chunk_size=500, chunk_overlap=100)
        
        self.assertGreater(len(chunks), 1)
        for chunk in chunks:
            self.assertIsInstance(chunk, Document)
            self.assertEqual(chunk.metadata.get("source"), "test.md")
            self.assertLessEqual(len(chunk.page_content), 600)  # within margin

    def test_chunk_documents_empty(self):
        """Test chunking with empty document list returns empty list."""
        chunks = TextProcessor.chunk_documents([])
        self.assertEqual(chunks, [])

    def test_chunk_text_raw(self):
        """Test raw string chunking."""
        raw_text = "Paragraph 1 content.\n\nParagraph 2 content with more details.\n\nParagraph 3 final remarks."
        chunks = TextProcessor.chunk_text(raw_text, chunk_size=50, chunk_overlap=10)
        self.assertIsInstance(chunks, list)
        self.assertGreater(len(chunks), 1)
        for c in chunks:
            self.assertIsInstance(c, str)


if __name__ == "__main__":
    unittest.main()
