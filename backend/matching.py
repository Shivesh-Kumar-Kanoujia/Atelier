"""Matching algorithm — mirrors frontend store.calculateMatch logic, server-side."""
from __future__ import annotations
from schemas import MatchBreakdown


WEIGHTS = {
    "skills": 0.35,
    "content_type": 0.25,
    "tools": 0.20,
    "format": 0.10,
    "availability": 0.10,
}


def calculate_match(creator: dict, campaign: dict | None) -> tuple[int, list[MatchBreakdown]]:
    """Returns (score_percent, breakdown_list)."""
    if not campaign:
        return 95, [
            MatchBreakdown(type="tools", text=f"Tools: {', '.join(creator.get('tools', [])[:2])}", icon="tune"),
            MatchBreakdown(type="availability", text=f"Availability: {creator.get('availability', '')}", icon="schedule"),
        ]

    creator_tools = [t.lower() for t in creator.get("tools", [])]
    creator_skills = [s.lower() for s in creator.get("skills", [])]
    creator_styles = [s.lower() for s in creator.get("styles", [])]
    creator_formats = [f.lower() for f in creator.get("formats", [])]
    creator_discipline = creator.get("discipline", "").lower()
    creator_title = creator.get("title", "").lower()
    creator_avail = creator.get("availability", "")

    brief_styles = [s.lower() for s in campaign.get("styles", [])]
    brief_tools = [t.lower() for t in campaign.get("required_tools", [])]
    brief_ratios = [r.lower() for r in campaign.get("aspect_ratios", [])]
    brief_content = campaign.get("content_type", "").lower()

    # 1. Skills match (35%)
    overlap = sum(
        1 for s in brief_styles
        if any(s in cs or cs in s for cs in creator_skills + creator_styles)
    )
    skill_score = (0.75 + (overlap / max(1, len(brief_styles))) * 0.25) if brief_styles else 0.90
    skill_score = min(1.0, skill_score)

    # 2. Content type (25%)
    is_filmmaker = "filmmaker" in creator_discipline or "director" in creator_title
    is_animator = "animator" in creator_discipline
    content_score = 0.80
    if "video" in brief_content or "commercial" in brief_content:
        content_score = 1.0 if is_filmmaker else (0.95 if is_animator else 0.80)
    elif "visualizer" in brief_content or "animated" in brief_content:
        content_score = 1.0 if is_animator else 0.90
    elif "still" in brief_content or "lookbook" in brief_content:
        content_score = 1.0 if "concept" in creator_discipline else 0.85

    # 3. Tools (20%)
    tool_matches = [t for t in brief_tools if any(t in ct or ct in t for ct in creator_tools)]
    tool_score = (0.75 + (len(tool_matches) / max(1, len(brief_tools))) * 0.25) if brief_tools else 0.90
    tool_score = min(1.0, tool_score)

    # 4. Format (10%)
    fmt_score = 0.85
    if brief_ratios and creator_formats:
        if any("16:9" in r for r in brief_ratios) and any("16:9" in cf for cf in creator_formats):
            fmt_score = 1.0
        else:
            fmt_score = 0.95

    # 5. Availability (10%)
    avail_score = {"Available Now": 1.0}.get(creator_avail, 0.75)
    if "2 weeks" in creator_avail.lower():
        avail_score = 0.90

    total = (
        skill_score * WEIGHTS["skills"]
        + content_score * WEIGHTS["content_type"]
        + tool_score * WEIGHTS["tools"]
        + fmt_score * WEIGHTS["format"]
        + avail_score * WEIGHTS["availability"]
    )
    score = max(78, min(99, round(total * 100)))

    # Build breakdown
    display_tools = tool_matches if tool_matches else creator.get("tools", [])[:2]
    matching_styles = [s for s in creator.get("skills", []) if any(s.lower() in bs or bs in s.lower() for bs in brief_styles)]
    display_styles = matching_styles if matching_styles else creator.get("skills", [])[:2]

    breakdown = [
        MatchBreakdown(type="tools", text=f"Matching Tools: {', '.join(display_tools)}", icon="check_circle"),
        MatchBreakdown(type="style", text=f"Matching Style: {', '.join(display_styles)}", icon="check_circle"),
        MatchBreakdown(type="format", text=f"Format Fit: {' & '.join(campaign.get('aspect_ratios', ['16:9 4K']))}", icon="check_circle"),
        MatchBreakdown(
            type="availability",
            text=f"Availability: {creator_avail}",
            icon="schedule",
            highlight=(creator_avail == "Available Now"),
        ),
    ]

    return score, breakdown
