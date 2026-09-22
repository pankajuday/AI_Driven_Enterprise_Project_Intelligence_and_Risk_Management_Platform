import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))

from models.report_model import GeneratedDocument
from agents.pipeline_state import _append_log, _merge_docs


class TestPipelineState(unittest.TestCase):

    def test_append_log_reducer(self):
        """Test _append_log reducer concatenates log lists properly."""
        existing_logs = ["Log 1", "Log 2"]
        new_logs = ["Log 3"]
        result = _append_log(existing_logs, new_logs)
        self.assertEqual(result, ["Log 1", "Log 2", "Log 3"])

    def test_merge_docs_reducer_upsert(self):
        """Test _merge_docs replaces document with identical doc_type and appends new types."""
        doc1 = GeneratedDocument(title="Old Summary", doc_type="executive_summary", content="Old content")
        doc2 = GeneratedDocument(title="User Stories", doc_type="user_stories", content="Stories content")
        existing_docs = [doc1, doc2]

        doc1_new = GeneratedDocument(title="New Summary", doc_type="executive_summary", content="New content")
        doc3 = GeneratedDocument(title="Risk Register", doc_type="risk_register", content="Risks content")
        new_docs = [doc1_new, doc3]

        merged = _merge_docs(existing_docs, new_docs)
        self.assertEqual(len(merged), 3)

        by_type = {d.doc_type: d for d in merged}
        self.assertEqual(by_type["executive_summary"].content, "New content")
        self.assertEqual(by_type["user_stories"].content, "Stories content")
        self.assertEqual(by_type["risk_register"].content, "Risks content")


if __name__ == "__main__":
    unittest.main()
