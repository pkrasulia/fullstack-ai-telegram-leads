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

def _validate_email(email: str) -> bool:
    """Validate email format."""
    if not email:
        return True  # Email is optional
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email.strip()))

def _normalize_phone(phone: str) -> str:
    """Normalize phone to +7XXXXXXXXXX format."""
    digits = re.sub(r'\D', '', phone)
    if digits.startswith('8'):
        digits = '7' + digits[1:]
    return '+' + digits

def send_lead_to_backend(lead_data: dict) -> dict:
    """
    Sends a lead to the backend API with validation and retry logic.

    Args:
        lead_data (dict): The lead data to send to the backend.
                         Must contain: name, phone
                         Optional: email, telegramUsername, telegramId, company, position, notes

    Returns:
        dict: A dictionary with the status and message.

    Example:
        >>> send_lead_to_backend(lead_data={'name': 'Иван Петров', 'phone': '+79901234567', 'email': 'ivan@example.com'})
        {'status': 'success', 'message': 'Lead sent to backend successfully.'}
    """
    try:
        # Validate required fields
        if not isinstance(lead_data, dict):
            return {"status": "error", "message": "Invalid data format"}
        
        name = lead_data.get('name', '').strip()
        phone = lead_data.get('phone', '').strip()
        email = lead_data.get('email', '').strip() if lead_data.get('email') else None
        telegram_username = lead_data.get('telegramUsername', '').strip() if lead_data.get('telegramUsername') else None
        telegram_id = lead_data.get('telegramId', '').strip() if lead_data.get('telegramId') else None
        company = lead_data.get('company', '').strip() if lead_data.get('company') else None
        position = lead_data.get('position', '').strip() if lead_data.get('position') else None
        notes = lead_data.get('notes', '').strip() if lead_data.get('notes') else None
        
        # Validate required fields
        if not _validate_name(name):
            return {"status": "error", "message": "Invalid name format"}
        
        if not _validate_phone(phone):
            return {"status": "error", "message": "Invalid phone number format"}
        
        # Validate optional email
        if email and not _validate_email(email):
            return {"status": "error", "message": "Invalid email format"}
        
        # Prepare data for backend API
        api_data = {
            'name': name,
            'phone': _normalize_phone(phone),
            'status': 'new',
            'source': 'telegram'
        }
        
        # Add optional fields if provided
        if email:
            api_data['email'] = email
        if telegram_username:
            api_data['telegramUsername'] = telegram_username
        if telegram_id:
            api_data['telegramId'] = telegram_id
        if company:
            api_data['company'] = company
        if position:
            api_data['position'] = position
        if notes:
            api_data['notes'] = notes
        
        logger.info(">>> Sending validated lead to backend API: %s", api_data)
        
        # Send data to backend API with retry logic
        backend_url = "http://backend:4343/api/v1/leads"
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    backend_url,
                    json=api_data,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                if response.status_code in [200, 201]:
                    logger.info("Backend API call successful on attempt %d", attempt + 1)
                    response_data = response.json() if response.content else {}
                    return {
                        "status": "success", 
                        "message": "Lead sent to backend successfully.",
                        "lead_id": response_data.get('id', f"lead_{int(time.time())}"),
                        "lead_data": response_data
                    }
                else:
                    error_msg = f"HTTP {response.status_code}"
                    try:
                        error_details = response.json()
                        error_msg += f": {error_details}"
                    except:
                        error_msg += f": {response.text}"
                    raise Exception(error_msg)
                    
            except requests.exceptions.ConnectionError as e:
                logger.warning("Backend connection failed on attempt %d: %s", attempt + 1, str(e))
                if attempt == max_retries - 1:
                    return {
                        "status": "error", 
                        "message": f"Failed to connect to backend after {max_retries} attempts. Please check if backend is running on {backend_url}"
                    }
                time.sleep(2)  # Wait longer for connection issues
            except Exception as e:
                logger.warning("Backend API call failed on attempt %d: %s", attempt + 1, str(e))
                if attempt == max_retries - 1:
                    return {
                        "status": "error", 
                        "message": f"Failed to send lead to backend after {max_retries} attempts: {str(e)}"
                    }
                time.sleep(1)  # Wait before retry
                
    except Exception as e:
        logger.error("Unexpected error in send_lead_to_backend: %s", str(e))
        return {"status": "error", "message": f"Internal server error: {str(e)}"}