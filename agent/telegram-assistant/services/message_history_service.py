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

"""Message history service for loading recent chat messages into agent context."""

import logging
from typing import List, Dict, Optional
from ..config import Config
from .auth_service import get_auth_service

logger = logging.getLogger(__name__)


class MessageHistoryService:
    """Service for retrieving and formatting message history for agent context."""
    
    def __init__(self):
        self.config = Config()
        self.auth_service = get_auth_service()
    
    def get_recent_messages(self, chat_id: str, limit: Optional[int] = None) -> Dict:
        """
        Get recent messages for a chat formatted for agent context.
        
        Args:
            chat_id (str): The Telegram chat ID
            limit (int, optional): Number of messages to retrieve
            
        Returns:
            dict: Formatted message history with status and context text
        """
        try:
            if limit is None:
                limit = self.config.MESSAGE_HISTORY_LIMIT
                
            logger.info("Fetching %d recent messages for chat %s", limit, chat_id)
            
            # Make authenticated request to backend API
            response = self.auth_service.make_authenticated_request(
                method='GET',
                endpoint=f'/messages?chatId={chat_id}&limit={limit}&sortBy=messageDate&sortOrder=DESC'
            )
            
            if response.status_code == 200:
                messages_data = response.json()
                formatted_context = self._format_messages_for_context(messages_data)
                
                logger.info("Successfully loaded %d messages for context", len(messages_data))
                return {
                    "status": "success",
                    "context": formatted_context,
                    "message_count": len(messages_data)
                }
            elif response.status_code == 404:
                logger.info("No messages found for chat %s", chat_id)
                return {
                    "status": "no_messages",
                    "context": "",
                    "message_count": 0
                }
            else:
                logger.error("Backend API error: %d - %s", response.status_code, response.text)
                return {
                    "status": "error",
                    "context": "",
                    "message_count": 0,
                    "error": f"API error: {response.status_code}"
                }
                
        except Exception as e:
            logger.error("Failed to fetch message history: %s", str(e))
            return {
                "status": "error",
                "context": "",
                "message_count": 0,
                "error": str(e)
            }
    
    def _format_messages_for_context(self, messages: List[Dict]) -> str:
        """
        Format messages into context text for the agent.
        
        Args:
            messages (List[Dict]): List of message objects from backend
            
        Returns:
            str: Formatted context text
        """
        if not messages:
            return ""
        
        formatted_lines = []
        formatted_lines.append("=== ИСТОРИЯ СООБЩЕНИЙ ===")
        
        # Reverse to show chronological order (oldest first)
        for msg in reversed(messages):
            direction = "👤 Пользователь" if msg.get('direction') == 'incoming' else "🤖 Бот"
            timestamp = msg.get('messageDate', '')[:19].replace('T', ' ')
            text = msg.get('text', '')
            
            # Only include messages with text content
            if text and text.strip():
                formatted_lines.append(f"[{timestamp}] {direction}: {text}")
        
        formatted_lines.append("=== КОНЕЦ ИСТОРИИ ===")
        formatted_lines.append("")
        formatted_lines.append("Используй эту историю для понимания контекста разговора.")
        formatted_lines.append("Не повторяй уже сказанную информацию и учитывай предыдущие ответы.")
        
        return "\n".join(formatted_lines)
    
    def inject_history_into_context(self, chat_id: str, existing_context: str = "") -> str:
        """
        Inject message history into existing context.
        
        Args:
            chat_id (str): The Telegram chat ID
            existing_context (str): Existing context text
            
        Returns:
            str: Context with message history injected
        """
        history_result = self.get_recent_messages(chat_id)
        
        if history_result["status"] == "success" and history_result["context"]:
            return f"{history_result['context']}\n\n{existing_context}"
        
        return existing_context


# Global instance
_message_history_service = None

def get_message_history_service() -> MessageHistoryService:
    """Get global MessageHistoryService instance."""
    global _message_history_service
    if _message_history_service is None:
        _message_history_service = MessageHistoryService()
    return _message_history_service
