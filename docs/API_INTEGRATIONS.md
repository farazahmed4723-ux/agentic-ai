# External API & Service Integrations Guide
## AI by Faraz — Agentic Lead Engine

---

## 1. OpenRouter AI Gateway (Primary LLM Gateway)

The Master Orchestrator and specialized AI agents utilize OpenRouter to dynamically route tasks to the best-performing models with token usage accounting and automatic fallbacks.

- **Pre-Configured Key**: Configured in `.env.local`
- **Default Recommended Model**: `anthropic/claude-3.5-sonnet` (Excels at B2B qualification and nuanced personalized cold emails).
- **High-Speed Fallback**: `google/gemini-2.5-flash`
- **Cost-Optimized Model**: `deepseek/deepseek-chat`
- **Reasoning Model**: `anthropic/claude-3.7-sonnet`

### Model Selection per Agent:
| Agent | Recommended Model | Temperature | Max Tokens |
|---|---|---|---|
| Master Orchestrator | `anthropic/claude-3.5-sonnet` | 0.2 | 3,500 |
| Agent 02 (Lead Discovery) | `anthropic/claude-3.5-sonnet` | 0.3 | 3,500 |
| Agent 05 (Website & BI Audit) | `anthropic/claude-3.5-sonnet` | 0.2 | 2,000 |
| Agent 06 (Email Copywriter) | `anthropic/claude-3.5-sonnet` | 0.3 | 2,500 |
| Agent 08 (Reporting & Analytics)| `google/gemini-2.5-flash` | 0.2 | 1,500 |
| AI Command Center | `anthropic/claude-3.5-sonnet` | 0.2 | 1,500 |

---

## 2. Google Places API (Agent 02)
Used for verified geographic discovery, business address verification, operational status checks, and customer review metrics.
- API Endpoint: `https://places.googleapis.com/v1/places:searchText`
- Configuration: Set `GOOGLE_PLACES_API_KEY` in `.env.local` or Settings.

---

## 3. Discord Webhook Integration
Dispatches real-time structured embeds for:
- Workflow beginnings & schedule triggers
- Discovered leads count
- Verified high-confidence leads
- Hot Lead alerts (Opportunity Score 80+)
- Email draft approval notifications
- Dispatched emails & client replies
- Daily executive performance summary

### Discord Payload Structure:
Embeds are color-coded to match the Foundry design palette:
- **Mint (`#00F2A5`)**: Successful pipeline completions & emails sent.
- **Violet (`#8B5CF6`)**: Daily executive performance summaries.
- **Amber (`#F59E0B`)**: Approval queues & pending human review.
- **Coral (`#F97316`)**: Hot lead alerts & high-upside targets.

---

## 4. MCP Server & Tool Extensibility
The platform architecture supports Model Context Protocol (MCP) servers. Custom MCP tools can be exposed to Agent 02 and Agent 05 by registering tool handlers in `src/lib/agents/orchestrator.ts`.
