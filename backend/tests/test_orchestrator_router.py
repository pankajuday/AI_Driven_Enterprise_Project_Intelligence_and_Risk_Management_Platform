import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))

from agents.pipeline_state import PipelineState
from agents.orchestrator import conditional_doc_router


class TestOrchestratorRouter(unittest.TestCase):

    def test_router_generate_docs_when_missing(self):
        """Test conditional_doc_router branches to 'generate_docs' when missing_doc_types is non-empty."""
        state: PipelineState = {
            "project_id": "test-project-123",
            "scope": None,
            "risks": [],
            "health_score": None,
            "health_breakdown": None,
            "existing_doc_types": ["executive_summary"],
            "missing_doc_types": ["user_stories", "risk_register", "sprint_plan"],
            "generated_documents": [],
            "error": None,
            "step_log": [],
            "raw_outputs": {},
        }
        route = conditional_doc_router(state)
        self.assertEqual(route, "generate_docs")

    def test_router_skip_gen_when_all_present(self):
        """Test conditional_doc_router branches to 'skip_gen' when no document types are missing."""
        state: PipelineState = {
            "project_id": "test-project-123",
            "scope": None,
            "risks": [],
            "health_score": None,
            "health_breakdown": None,
            "existing_doc_types": ["executive_summary", "user_stories", "risk_register", "sprint_plan"],
            "missing_doc_types": [],
            "generated_documents": [],
            "error": None,
            "step_log": [],
            "raw_outputs": {},
        }
        route = conditional_doc_router(state)
        self.assertEqual(route, "skip_gen")


if __name__ == "__main__":
    unittest.main()
