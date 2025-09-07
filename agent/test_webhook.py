#!/usr/bin/env python3
"""Test script to verify webhook functionality"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'telegram-assistant'))

from tools.tools import send_lead_to_backend

def test_webhook():
    """Test the webhook with sample data"""
    test_data = {
        'name': 'Иван',
        'phone': '+79901234567',
        'city': 'Москва'
    }
    
    print("Testing webhook with data:", test_data)
    result = send_lead_to_backend(test_data)
    print("Result:", result)

if __name__ == "__main__":
    test_webhook()
