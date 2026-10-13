"""AI brief generation route."""
from fastapi import APIRouter, Depends
from schemas import BriefGenerateRequest, AIBriefDraft
from groq_service import generate_brief_draft
from auth import require_role

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/generate-brief", response_model=AIBriefDraft)
async def generate_brief(
    req: BriefGenerateRequest,
    user: dict = Depends(require_role("brand"))
):
    """
    Generate an AI-drafted campaign brief from a brand idea.
    Returns a structured, editable draft — never auto-publishes.
    """
    return await generate_brief_draft(req)
