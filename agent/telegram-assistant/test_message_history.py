#!/usr/bin/env python3
"""Test script for message history integration."""

import os
import sys
import logging
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from agent.telegram_assistant.services.message_history_service import get_message_history_service
from agent.telegram_assistant.config import Config

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_message_history_service():
    """Test the message history service functionality."""
    logger.info("🧪 Testing Message History Service")
    
    try:
        # Initialize config and service
        config = Config()
        logger.info(f"📊 Message history limit: {config.MESSAGE_HISTORY_LIMIT}")
        logger.info(f"🔗 Backend URL: {config.BACKEND_URL}")
        
        history_service = get_message_history_service()
        logger.info("✅ Message history service initialized")
        
        # Test with a sample chat ID
        test_chat_id = "123456789"
        logger.info(f"🔍 Testing with chat ID: {test_chat_id}")
        
        # Get recent messages
        result = history_service.get_recent_messages(test_chat_id, limit=5)
        
        logger.info(f"📋 Result status: {result['status']}")
        logger.info(f"📊 Message count: {result['message_count']}")
        
        if result['status'] == 'success' and result['context']:
            logger.info("📝 Context preview:")
            context_lines = result['context'].split('\n')[:10]  # First 10 lines
            for line in context_lines:
                logger.info(f"   {line}")
            if len(result['context'].split('\n')) > 10:
                logger.info("   ... (truncated)")
        
        # Test context injection
        logger.info("\n🔄 Testing context injection...")
        existing_context = "Existing context for the agent."
        injected_context = history_service.inject_history_into_context(
            test_chat_id, existing_context
        )
        
        logger.info(f"📏 Original context length: {len(existing_context)}")
        logger.info(f"📏 Injected context length: {len(injected_context)}")
        
        logger.info("\n🎉 Message history service test completed!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed: {str(e)}")
        logger.exception("Full error details:")
        return False

if __name__ == "__main__":
    success = test_message_history_service()
    sys.exit(0 if success else 1)
