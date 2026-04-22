"""Smoke tests."""
from __future__ import annotations

from splat_studio import __version__


def test_version() -> None:
    assert __version__ == "0.1.0"
