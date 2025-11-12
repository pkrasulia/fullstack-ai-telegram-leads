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
# limitations under the License.§

"""Agent module for the telegram customer service agent.

Простой и элегантный подход:
- Один агент для всех пользователей
- Данные пользователя передаются в промпт через before_agent callback
- Автоматическая персонализация без создания новых агентов

Использование:
```python
from telegram_assistant.agent import root_agent

# Просто используйте root_agent - данные пользователя добавятся автоматически
agent = root_agent
```
"""

import os
import logging
from google.adk import Agent
from google.adk.sessions import DatabaseSessionService  # ✅ Правильный импорт
from .config import Config
from .prompts import GLOBAL_INSTRUCTION, INSTRUCTION
from .tools.tools import send_lead_to_backend
from .shared_libraries.callbacks import (
    rate_limit_callback,
    before_agent,
    before_tool,
    after_tool,
)

logger = logging.getLogger(__name__)
configs = Config()

# 2. Агент
root_agent = Agent(
    model=configs.agent_settings.model,
    global_instruction=GLOBAL_INSTRUCTION,
    instruction=INSTRUCTION,
    name=configs.agent_settings.name,
    tools=[send_lead_to_backend],
    before_tool_callback=before_tool,
    after_tool_callback=after_tool,
    before_agent_callback=before_agent,
    before_model_callback=rate_limit_callback,
)