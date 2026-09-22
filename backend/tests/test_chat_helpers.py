import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))

from langchain_core.documents import Document
from agents.chat_agent import _source_label, _content_to_text


class TestChatHelpers(unittest.TestCase):

    def test_source_label_regular_doc(self):
        """Test _source_label extracts title or filename from standard uploaded doc."""
        doc = Document(page_content="text", metadata={"filename": "Project_SRS.pdf"})
        label = _source_label(doc)
        self.assertEqual(label, "Project_SRS.pdf")

    def test_source_label_generated_doc(self):
        """Test _source_label annotates generated document types."""
        doc = Document(
            page_content="text",
            metadata={
                "title": "User Stories",
                "source_kind": "generated_document",
                "doc_type": "user_stories",
            },
        )
        label = _source_label(doc)
        self.assertEqual(label, "User Stories (generated)")

    def test_source_label_analysis_report(self):
        """Test _source_label annotates analysis report summaries."""
        doc = Document(
            page_content="text",
            metadata={"source_kind": "analysis_report"},
        )
        label = _source_label(doc)
        self.assertEqual(label, "Analysis Report Summary")

    def test_content_to_text_string(self):
        """Test _content_to_text with raw string input."""
        res = _content_to_text("Simple answer")
        self.assertEqual(res, "Simple answer")

    def test_content_to_text_list_parts(self):
        """Test _content_to_text with list of text payload dictionaries."""
        parts = [{"text": "Part 1 "}, {"text": "Part 2"}]
        res = _content_to_text(parts)
        self.assertEqual(res, "Part 1 Part 2")


if __name__ == "__main__":
    unittest.main()
