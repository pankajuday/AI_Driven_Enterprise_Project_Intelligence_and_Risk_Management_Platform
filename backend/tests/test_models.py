import unittest
import sys
import os
from pydantic import ValidationError

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))

from models.project_model import CreateProject, ProjectStatus
from models.document_model import FileType, DocumentStatus
from models.report_model import (
    RiskItem,
    RiskCategory,
    RiskSeverity,
    ScopeOutput,
    HealthBreakdown,
    GeneratedDocument,
    AnalysisStatus,
)
from models.chat_model import ChatMessage, MessageRole


class TestModels(unittest.TestCase):

    def test_create_project_validation(self):
        """Test CreateProject model with valid and invalid data."""
        proj = CreateProject(name="Test Project", description="Test Description")
        self.assertEqual(proj.name, "Test Project")
        self.assertEqual(proj.description, "Test Description")

        # Validation error when name is missing
        with self.assertRaises(ValidationError):
            CreateProject()

    def test_risk_item_valid_enums(self):
        """Test RiskItem creation with valid categories and severities."""
        risk = RiskItem(
            title="Database Latency",
            description="High latency on SQL queries",
            category=RiskCategory.TECHNICAL,
            severity=RiskSeverity.HIGH,
            probability="High",
            impact="Slow checkout experience",
            mitigation="Add Redis cache layer",
            source_context="SRS Section 3.1",
        )
        self.assertEqual(risk.category, RiskCategory.TECHNICAL)
        self.assertEqual(risk.severity, RiskSeverity.HIGH)
        self.assertEqual(risk.probability, "High")

    def test_risk_item_invalid_enum_raises(self):
        """Test RiskItem validation raises error on invalid category or severity."""
        with self.assertRaises(ValidationError):
            RiskItem(
                title="Invalid Risk",
                description="Invalid",
                category="invalid_category",  # not in RiskCategory enum
                severity=RiskSeverity.LOW,
                probability="Low",
                impact="None",
                mitigation="None",
            )

    def test_scope_output_defaults(self):
        """Test ScopeOutput default list factories and attributes."""
        scope = ScopeOutput(summary="Short summary")
        self.assertEqual(scope.objectives, [])
        self.assertEqual(scope.deliverables, [])
        self.assertEqual(scope.stakeholders, [])
        self.assertEqual(scope.out_of_scope, [])
        self.assertIsNone(scope.project_name)
        self.assertIsNone(scope.timeline)

    def test_generated_document_creation(self):
        """Test GeneratedDocument schema."""
        doc = GeneratedDocument(
            title="User Stories",
            doc_type="user_stories",
            content="### US-001\nAs a user...",
        )
        self.assertEqual(doc.title, "User Stories")
        self.assertEqual(doc.doc_type, "user_stories")
        self.assertIsNotNone(doc.created_at)

    def test_chat_message_role_enums(self):
        """Test ChatMessage roles and default sources."""
        msg = ChatMessage(role=MessageRole.USER, content="Hello")
        self.assertEqual(msg.role, MessageRole.USER)
        self.assertEqual(msg.sources, [])

        msg_ai = ChatMessage(
            role=MessageRole.ASSISTANT,
            content="Hi there",
            sources=["Requirements.pdf"],
        )
        self.assertEqual(msg_ai.role, MessageRole.ASSISTANT)
        self.assertEqual(msg_ai.sources, ["Requirements.pdf"])


if __name__ == "__main__":
    unittest.main()
