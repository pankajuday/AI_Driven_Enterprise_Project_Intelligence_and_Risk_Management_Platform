import unittest
import sys
import os

# Add backend/app to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))

from models.report_model import ScopeOutput, RiskItem, RiskCategory, RiskSeverity, HealthBreakdown
from agents.health_agent import compute_health_score


class TestHealthAgent(unittest.TestCase):

    def test_empty_scope_and_risks(self):
        """Test health calculation when no scope and no risks are provided."""
        score, breakdown = compute_health_score(None, [])
        self.assertIsInstance(score, float)
        self.assertIsInstance(breakdown, HealthBreakdown)
        self.assertEqual(breakdown.scope_clarity_percent, 0.0)
        self.assertEqual(breakdown.documentation_completeness_percent, 0.0)
        self.assertEqual(breakdown.risk_density_percent, 100.0)
        self.assertEqual(breakdown.schedule_risk_percent, 100.0)
        # 0*0.3 + 0*0.2 + 100*0.3 + 100*0.2 = 50.0
        self.assertEqual(score, 50.0)

    def test_complete_scope_no_risks(self):
        """Test health calculation with complete scope and no risks."""
        scope = ScopeOutput(
            project_name="AI Risk System",
            objectives=["Obj 1", "Obj 2", "Obj 3"],
            deliverables=["Del 1", "Del 2", "Del 3"],
            timeline="12 weeks",
            stakeholders=["PMO", "Dev Team"],
            out_of_scope=["Out 1"],
            summary="Complete project scope summary.",
        )
        score, breakdown = compute_health_score(scope, [])
        self.assertEqual(breakdown.scope_clarity_percent, 100.0)
        self.assertEqual(breakdown.documentation_completeness_percent, 100.0)
        self.assertEqual(breakdown.risk_density_percent, 100.0)
        self.assertEqual(breakdown.schedule_risk_percent, 100.0)
        self.assertEqual(score, 100.0)

    def test_health_score_with_high_and_critical_risks(self):
        """Test health score deduction when high and critical risks are present."""
        scope = ScopeOutput(
            project_name="AI Risk System",
            objectives=["Obj 1", "Obj 2", "Obj 3"],
            deliverables=["Del 1", "Del 2", "Del 3"],
            timeline="12 weeks",
            stakeholders=["PMO"],
            out_of_scope=["Out 1"],
            summary="Summary text",
        )
        risks = [
            RiskItem(
                title="Critical DB Lock",
                description="Database locking",
                category=RiskCategory.TECHNICAL,
                severity=RiskSeverity.CRITICAL,
                probability="High",
                impact="Downtime",
                mitigation="Expand and contract migration",
            ),
            RiskItem(
                title="High Security Risk",
                description="Token leak",
                category=RiskCategory.EXTERNAL,
                severity=RiskSeverity.HIGH,
                probability="Medium",
                impact="Data exposure",
                mitigation="Rotate secrets",
            ),
            RiskItem(
                title="Low UI Drift",
                description="CSS issue",
                category=RiskCategory.QUALITY,
                severity=RiskSeverity.LOW,
                probability="Low",
                impact="Visual inconsistency",
                mitigation="Update storybook",
            ),
        ]
        score, breakdown = compute_health_score(scope, risks)
        # High/critical: 2 out of 3 = 66.67% penalty -> risk_density = 33.33%
        self.assertAlmostEqual(breakdown.risk_density_percent, 33.3, places=1)
        # Schedule risks: 0 schedule risks -> schedule_risk_score = 100.0%
        self.assertEqual(breakdown.schedule_risk_percent, 100.0)
        self.assertTrue(0.0 <= score <= 100.0)

    def test_schedule_risk_penalty(self):
        """Test penalty applied specifically when schedule category risks exist."""
        risks = [
            RiskItem(
                title="Sprint 1 Milestone Slip",
                description="Backend API delayed",
                category=RiskCategory.SCHEDULE,
                severity=RiskSeverity.HIGH,
                probability="High",
                impact="Delivery postponed",
                mitigation="Add additional backend engineer",
            ),
        ]
        score, breakdown = compute_health_score(None, risks)
        self.assertEqual(breakdown.schedule_risk_percent, 0.0)
        self.assertEqual(breakdown.risk_density_percent, 0.0)
        self.assertEqual(score, 0.0)


if __name__ == "__main__":
    unittest.main()
