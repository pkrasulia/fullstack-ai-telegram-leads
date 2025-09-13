#!/usr/bin/env python3
"""Test script for JWT authentication service."""

import os
import sys
import logging

# Add the telegram-assistant directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'telegram-assistant'))

from services.auth_service import get_auth_service
from tools.tools import send_lead_to_backend, get_leads_by_status, find_lead_by_telegram_id

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def test_authentication():
    """Test JWT authentication."""
    logger.info("=== Testing JWT Authentication ===")
    
    try:
        auth_service = get_auth_service()
        headers = auth_service.get_auth_headers()
        logger.info("✅ Authentication successful!")
        logger.info("Headers: %s", {k: v[:50] + "..." if len(v) > 50 else v for k, v in headers.items()})
        return True
    except Exception as e:
        logger.error("❌ Authentication failed: %s", str(e))
        return False


def test_create_lead():
    """Test creating a lead."""
    logger.info("=== Testing Lead Creation ===")
    
    test_lead = {
        'name': 'Тест Пользователь',
        'phone': '+79901234567',
        'email': 'test@example.com',
        'telegramUsername': 'testuser',
        'telegramId': '123456789',
        'company': 'Test Company',
        'position': 'Test Position',
        'notes': 'Test lead created by auth test script'
    }
    
    result = send_lead_to_backend(test_lead)
    
    if result['status'] == 'success':
        logger.info("✅ Lead created successfully!")
        logger.info("Lead ID: %s", result.get('lead_id'))
        return result.get('lead_id')
    else:
        logger.error("❌ Failed to create lead: %s", result['message'])
        return None


def test_get_leads():
    """Test getting leads."""
    logger.info("=== Testing Get Leads ===")
    
    result = get_leads_by_status()
    
    if result['status'] == 'success':
        logger.info("✅ Retrieved leads successfully!")
        logger.info("Number of leads: %s", len(result.get('leads_data', [])))
        return True
    else:
        logger.error("❌ Failed to get leads: %s", result['message'])
        return False


def test_find_lead_by_telegram():
    """Test finding lead by Telegram ID."""
    logger.info("=== Testing Find Lead by Telegram ID ===")
    
    result = find_lead_by_telegram_id('123456789')
    
    if result['status'] == 'success':
        logger.info("✅ Found lead by Telegram ID!")
        logger.info("Lead name: %s", result.get('lead_data', {}).get('name'))
        return True
    elif result['status'] == 'not_found':
        logger.info("ℹ️ No lead found with Telegram ID (this is expected for new test)")
        return True
    else:
        logger.error("❌ Failed to search lead: %s", result['message'])
        return False


def main():
    """Run all tests."""
    logger.info("Starting JWT Authentication Tests...")
    
    # Check environment variables
    service_email = os.getenv('SERVICE_ACCOUNT_LOGIN')
    service_password = os.getenv('SERVICE_ACCOUNT_PASSWORD')
    
    if not service_email or not service_password:
        logger.error("❌ Missing environment variables:")
        logger.error("   SERVICE_ACCOUNT_LOGIN: %s", service_email or "NOT SET")
        logger.error("   SERVICE_ACCOUNT_PASSWORD: %s", "SET" if service_password else "NOT SET")
        logger.error("Please set these environment variables before running the test.")
        return False
    
    logger.info("Environment variables:")
    logger.info("   SERVICE_ACCOUNT_LOGIN: %s", service_email)
    logger.info("   SERVICE_ACCOUNT_PASSWORD: %s", "***" if service_password else "NOT SET")
    
    tests_passed = 0
    total_tests = 4
    
    # Test 1: Authentication
    if test_authentication():
        tests_passed += 1
    
    # Test 2: Create lead
    lead_id = test_create_lead()
    if lead_id:
        tests_passed += 1
    
    # Test 3: Get leads
    if test_get_leads():
        tests_passed += 1
    
    # Test 4: Find lead by Telegram ID
    if test_find_lead_by_telegram():
        tests_passed += 1
    
    logger.info("=== Test Results ===")
    logger.info("Tests passed: %d/%d", tests_passed, total_tests)
    
    if tests_passed == total_tests:
        logger.info("🎉 All tests passed!")
        return True
    else:
        logger.error("❌ Some tests failed.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
