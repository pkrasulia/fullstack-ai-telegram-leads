# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# add docstring to this module
"""Tools module for the customer service agent with validation and retry logic."""

import logging
import re
import time
import requests
from typing import Dict, Any
from google.adk.tools import ToolContext

logger = logging.getLogger(__name__)

def _validate_phone(phone: str) -> bool:
    """Validate Russian phone number format."""
    if not phone:
        return False
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    # Check if it's a valid Russian number
    if digits.startswith('7') and len(digits) == 11:
        return True
    if digits.startswith('8') and len(digits) == 11:
        return True
    return False

def _validate_name(name: str) -> bool:
    """Validate name format."""
    if not name or len(name.strip()) < 2:
        return False
    # Check for obviously fake names
    fake_names = ['тест', 'test', '123', 'фыв', 'qwe', 'asdf']
    if name.lower().strip() in fake_names:
        return False
    # Only allow letters, spaces, and hyphens
    return bool(re.match(r'^[a-zA-Zа-яА-ЯёЁ\s\-]+$', name.strip()))

def _validate_city(city: str) -> bool:
    """Validate city name."""
    if not city or len(city.strip()) < 2:
        return False
    # Basic validation - only letters, spaces, and hyphens
    return bool(re.match(r'^[a-zA-Zа-яА-ЯёЁ\s\-]+$', city.strip()))

def _normalize_phone(phone: str) -> str:
    """Normalize phone to +7XXXXXXXXXX format."""
    digits = re.sub(r'\D', '', phone)
    if digits.startswith('8'):
        digits = '7' + digits[1:]
    return '+' + digits

def send_lead_to_backend(lead_data: dict) -> dict:
    """
    Sends a lead to the backend with validation and retry logic.

    Args:
        lead_data (dict): The lead data to send to the backend.
                         Must contain: name, phone, city

    Returns:
        dict: A dictionary with the status and message.

    Example:
        >>> send_lead_to_backend(lead_data={'name': 'Иван', 'phone': '+79901234567', 'city': 'Москва'})
        {'status': 'success', 'message': 'Lead sent to backend successfully.'}
    """
    try:
        # Validate required fields
        if not isinstance(lead_data, dict):
            return {"status": "error", "message": "Invalid data format"}
        
        name = lead_data.get('name', '').strip()
        phone = lead_data.get('phone', '').strip()
        city = lead_data.get('city', '').strip()
        
        # Validate name
        if not _validate_name(name):
            return {"status": "error", "message": "Invalid name format"}
        
        # Validate phone
        if not _validate_phone(phone):
            return {"status": "error", "message": "Invalid phone number format"}
        
        # Validate city
        if not _validate_city(city):
            return {"status": "error", "message": "Invalid city format"}
        
        # Normalize data
        normalized_data = {
            'name': name,
            'phone': _normalize_phone(phone),
            'city': city,
            'timestamp': int(time.time()),
            'source': 'telegram_agent'
        }
        
        logger.info(">>> Sending validated lead to backend: %s", normalized_data)
        
        # Send data to webhook.site with retry logic
        webhook_url = "https://webhook.site/5f23d5f7-f496-46ae-8910-2945ce9134a8"
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    webhook_url,
                    json=normalized_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                if response.status_code == 200:
                    logger.info("Webhook call successful on attempt %d", attempt + 1)
                    return {
                        "status": "success", 
                        "message": "Lead sent to webhook successfully.",
                        "lead_id": f"lead_{int(time.time())}",
                        "webhook_response": response.text
                    }
                else:
                    raise Exception(f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                logger.warning("Webhook call failed on attempt %d: %s", attempt + 1, str(e))
                if attempt == max_retries - 1:
                    return {
                        "status": "error", 
                        "message": f"Failed to send lead to webhook after {max_retries} attempts: {str(e)}"
                    }
                time.sleep(1)  # Wait before retry
                
    except Exception as e:
        logger.error("Unexpected error in send_lead_to_backend: %s", str(e))
        return {"status": "error", "message": "Internal server error"}