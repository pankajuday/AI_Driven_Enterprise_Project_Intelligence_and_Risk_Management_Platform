import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app")))

from models.document_model import FileType
from controllers.document_controller import ALLOWED_MIME_TYPES, _project_upload_dir


class TestDocumentController(unittest.TestCase):

    def test_allowed_mime_types(self):
        """Test supported MIME types mapping to FileType enums."""
        self.assertEqual(ALLOWED_MIME_TYPES["application/pdf"], FileType.PDF)
        self.assertEqual(
            ALLOWED_MIME_TYPES["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
            FileType.DOCX,
        )
        self.assertEqual(
            ALLOWED_MIME_TYPES["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
            FileType.XLSX,
        )
        self.assertEqual(ALLOWED_MIME_TYPES["text/csv"], FileType.CSV)
        self.assertEqual(ALLOWED_MIME_TYPES["text/plain"], FileType.TXT)
        self.assertEqual(ALLOWED_MIME_TYPES["text/markdown"], FileType.MD)
        self.assertEqual(ALLOWED_MIME_TYPES["image/png"], FileType.IMAGE)

    def test_project_upload_dir_creation(self):
        """Test _project_upload_dir returns sanitized path under uploads."""
        path = _project_upload_dir("project_test_123")
        self.assertTrue("uploads" in path)
        self.assertTrue("project_test_123" in path)
        self.assertTrue(os.path.exists(path))
        # Cleanup directory
        if os.path.exists(path):
            try:
                os.rmdir(path)
            except OSError:
                pass


if __name__ == "__main__":
    unittest.main()
