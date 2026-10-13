"""Groq AI service for campaign brief generation."""
from __future__ import annotations
import json
import re
from typing import Any
from fastapi import HTTPException, status
from config import get_settings
from schemas import BriefGenerateRequest, AIBriefDraft

BRIEF_SYSTEM_PROMPT = """You are a creative director assistant for Atelier, an AI creator marketplace.
Generate a structured campaign brief from the brand's idea. Return ONLY valid JSON matching this schema exactly:
{
  "title": "string — concise working title",
  "client": "string — brand/client name",
  "objective": "string — one of: Brand Awareness | Product Launch | Social Teaser | Narrative Film | Brand Campaign",
  "content_type": "string — e.g. AI Commercial / Video Spot | Generative Stills & Motion Loops | Animated Visualizer | Short Film",
  "description": "string — 2-4 sentence creative description",
  "styles": ["array of visual style strings"],
  "aspect_ratios": ["array — e.g. 16:9 Widescreen | 9:16 Vertical | 2.39:1 Anamorphic"],
  "deliverables": ["array of specific deliverable strings"],
  "required_tools": ["array of AI tool names — e.g. Runway Gen-3 | Midjourney v6 | ComfyUI | Flux.1 Pro"],
  "budget_tier": "string or null if unknown",
  "deadline": "string YYYY-MM-DD or null if unknown",
  "commercial_rights": "string or null",
  "audio_notes": "string or null",
  "missing_info": ["list of fields the brand must fill in — never invent budget, deadline, or licensing"]
}
Rules:
- Never invent budget amounts, deadlines, or licensing terms if not provided. Mark them null and list in missing_info.
- Keep descriptions factual and editable.
- Suggest 2-4 styles, 2-3 aspect ratios, 2-5 deliverables, 2-4 tools.
- Output ONLY the JSON object, no explanation."""


def _parse_brief_json(text: str) -> dict:
    """Extract and parse JSON from model output with resilient fallback."""
    cleaned = text.strip()
    # 1. Direct parse attempt
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # 2. Extract from markdown code fence
    fence_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
    if fence_match:
        try:
            return json.loads(fence_match.group(1).strip())
        except Exception:
            pass

    # 3. Find outermost curly braces
    first_brace = text.find('{')
    last_brace = text.rfind('}')
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        candidate = text[first_brace:last_brace + 1].strip()
        try:
            return json.loads(candidate)
        except Exception:
            pass

    # 4. Strip leftover fence tokens and retry
    stripped = re.sub(r'```(?:json)?\s*', '', text).strip().rstrip('`').strip()
    return json.loads(stripped)


async def generate_brief_draft(req: BriefGenerateRequest) -> AIBriefDraft:
    settings = get_settings()
    if not settings.groq_api_key:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI brief generation is not configured (GROQ_API_KEY missing)"
        )

    try:
        from groq import Groq
    except ImportError:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="groq package not installed")

    client = Groq(api_key=settings.groq_api_key)

    user_prompt = f"Brand idea: {req.idea}"
    if req.brand_name:
        user_prompt += f"\nBrand name: {req.brand_name}"
    if req.budget_hint:
        user_prompt += f"\nBudget indication: {req.budget_hint}"
    if req.deadline_hint:
        user_prompt += f"\nDeadline indication: {req.deadline_hint}"

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": BRIEF_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.4,
            max_tokens=1200,
            timeout=20,
        )
    except Exception as e:
        error_msg = str(e)
        if "rate_limit" in error_msg.lower():
            raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, detail="AI rate limit reached, try again shortly")
        if "timeout" in error_msg.lower():
            raise HTTPException(status.HTTP_504_GATEWAY_TIMEOUT, detail="AI service timed out")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=f"AI service error: {error_msg}")

    raw = response.choices[0].message.content or ""
    try:
        data = _parse_brief_json(raw)
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            detail=f"AI returned malformed response. Please try again."
        )

    # Validate and build response
    try:
        if not data.get("client"):
            data["client"] = req.brand_name or "Confidential Client"
        draft = AIBriefDraft(**data)
    except Exception as e:
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            detail=f"AI response did not match expected schema: {e}"
        )

    return draft
