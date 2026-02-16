#!/usr/bin/env python3
"""
Unit tests for mixed_module.py
"""

import unittest
import sys
import os

# Add the current directory to the path so we can import mixed_module
sys.path.insert(0, os.path.dirname(__file__))

import mixed_module

class TestMixedModule(unittest.TestCase):
    """Test cases for the mixed module functions"""

    def test_action_one_exists(self):
        """Test that action_one function exists"""
        self.assertTrue(hasattr(mixed_module, 'action_one'))
        self.assertTrue(callable(mixed_module.action_one))

    def test_action_two_exists(self):
        """Test that action_two function exists"""
        self.assertTrue(hasattr(mixed_module, 'action_two'))
        self.assertTrue(callable(mixed_module.action_two))

    def test_action_one_returns_string(self):
        """Test that action_one returns a string"""
        result = mixed_module.action_one()
        self.assertIsInstance(result, str)
        self.assertEqual(result, "action_one_completed")

    def test_action_two_returns_string(self):
        """Test that action_two returns a string"""
        result = mixed_module.action_two()
        self.assertIsInstance(result, str)
        self.assertEqual(result, "action_two_completed")

if __name__ == "__main__":
    unittest.main()
