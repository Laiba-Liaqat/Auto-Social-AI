---
name: "autosocial-skill"
description: "Autonomous social media workflow copilot and multichannel agent powered by open-weight models (LLaMA 3.2 and Qwen2-VL). Automates visual media analysis, multi-platform copy generation (Instagram, LinkedIn, X), event-to-blog drafting, sentiment-aware comment response triage, and content calendar scheduling."
---

# AutoSocial Agent Skill Specification

This Agent Skill equips autonomous agents with capabilities to manage cross-platform social media campaigns, inspect multimodal media assets, generate high-converting copy adapted for specific social network cultures, triage audience comments, and compile scheduled publication calendars using exclusively open-weight local inference.

---

## 1. Capabilities & Core Triggers

Activate this skill when an autonomous workflow requires:
1. **Multimodal Media Analysis & Social Adaptation**: The user provides an image, visual asset, or video description and requests publication-ready drafts for Instagram, LinkedIn, and X (Twitter).
2. **Event Coverage & Synthesis**: Transforming raw event photos, speaker talking points, or bullet notes into a structured Markdown blog post and an email newsletter edition.
3. **Audience Comment Triage & Auto-Response**: Ingesting incoming comment batches, categorizing intent/sentiment (Positive, Question/Inquiry, Negative/Constructive), and drafting contextual, on-brand replies.
4. **Editorial Scheduling & Analytics Prediction**: Structuring social assets into an interactive editorial calendar with CSV or iCalendar (.ics) exports, alongside offline readability and hashtag performance metrics.

---

## 2. Model Routing & Local Inference Protocol

This skill enforces strict adherence to open-source and open-weight models without relying on proprietary third-party commercial APIs:

| Task Domain | Primary Open-Weight Model | Fallback Open Model | Endpoint Standard |
| :--- | :--- | :--- | :--- |
| **Visual Understanding** | `qwen2-vl:7b` | `gemma-3:4b` or `llava:latest` | Ollama (`/api/generate`) |
| **Social Copy & Reasoning** | `llama3.2:3b` | `qwen2.5:7b` | Ollama (`/api/chat`) |
| **Audio Note Transcription** | `whisper:base` | `whisper:small` | Whisper CPP / PyTorch |
| **Offline Performance Scoring**| Rule-based Flesch-Kincaid & Hashtag Density Engine | Local Python `textstat` | In-memory execution |

---

## 3. Workflow Steps & Execution Instructions

### Workflow A: Multimodal Post Generation
1. **Asset Ingestion**: Load the input image or video frame. Convert to Base64 byte buffer or pass file URI.
2. **Visual Feature Extraction (`qwen2-vl`)**:
   - Extract core objects, subject actions, lighting/mood, color dominance, and implied context.
   - Output structured visual descriptor.
3. **Platform Adaptation (`llama3.2`)**:
   - **Instagram**: Craft an emotive hook, storytelling body with natural line breaks, clear call-to-action (CTA), and 10–15 curated niche hashtags.
   - **LinkedIn**: Structure as thought leadership: single-sentence thumb-stopping opener, 3–4 bulleted insights/learnings, professional conversation-starter question, and 3–5 industry tags.
   - **X (Twitter)**: Ensure strict brevity under 280 characters with punchy viral cadence, optional thread numbering (`1/3`, `2/3`, `3/3`), and high-impact keyword tags.
4. **Metric Validation**: Calculate readability grade level and hashtag density prior to final output.

### Workflow B: Event-to-Blog & Newsletter Drafter
1. Synthesize multi-asset visual highlights with provided event agendas or transcripts.
2. Generate a 600–1000 word Markdown blog post:
   - Catchy SEO headline (`# Headline`).
   - Executive summary blockquote.
   - Keynote highlights with subheadings (`## Highlights`).
   - Memorable quotes and future outlook.
3. Generate an email newsletter digest:
   - 3 Alternative subject lines for A/B testing.
   - 1-line preview preheader.
   - Bulleted summary of "What happened & Why it matters".
   - Primary call-to-action button anchor.

### Workflow C: Comment Triage & Contextual Auto-Responder
1. Parse incoming comments from JSON array or raw multiline input.
2. Classify each comment into:
   - `POSITIVE_ADVOCATE`: Grateful, community-building reply.
   - `INQUIRY_QUESTION`: Direct, helpful, informative response addressing the question.
   - `CRITIQUE_CONCERN`: Empathetic, de-escalating, constructive response with support contact.
   - `SPAM_PROMOTIONAL`: Flag for moderation or silent acknowledgment.
3. Enforce brand voice consistency (Professional, Witty, Casual, Hype, Educational).

### Workflow D: Content Calendar Scheduling
1. Map generated posts to optimal posting windows:
   - LinkedIn: Tuesday–Thursday 8:00 AM – 10:00 AM
   - Instagram: Wednesday–Friday 12:00 PM & 6:00 PM
   - X (Twitter): Weekdays 9:00 AM & 3:00 PM
2. Output clean tabular data (Date, Time, Network, Caption, MediaAsset, Status).
3. Export RFC 5545 compliant `.ics` calendar events or `.csv` spreadsheet.

---

## 4. Brand Tone Guidelines

Agents adhering to this skill should support 5 standard brand tones:
- **Professional**: Authoritative, concise, business-oriented, data-backed.
- **Witty**: Clever wordplay, conversational humor, relatable observations.
- **Casual**: Friendly, warm, authentic, community-centric.
- **Hype / Energetic**: High excitement, bold statements, exclamation marks, momentum-driven.
- **Educational**: Step-by-step breakdown, informative explanations, key definitions.

---

## 5. Security & Privacy Guardrails

- **Zero Data Leakage**: All inference runs against local endpoints (default `http://localhost:11434`). No user image or text payload is transmitted to third-party commercial cloud APIs.
- **Brand Safety**: Automated checks prune toxic, defamatory, or hallucinated claims prior to publishing drafts.
