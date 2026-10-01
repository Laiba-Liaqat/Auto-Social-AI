"""
app.py
======
AutoSocial AI - Streamlit Web Application
Hackathon Challenge: Best Open-Source AI Project
A 100% open-weight AI copilot & agent for automated cross-platform social workflows.
"""

import datetime
import io
import json
import os
import pandas as pd
import streamlit as st
from PIL import Image

import ai_engine

st.set_page_config(
    page_title="AutoSocial AI - Open-Source Social Media Copilot",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ----------------- SESSION STATE SETUP -----------------
if "calendar_events" not in st.session_state:
    st.session_state.calendar_events = [
        {
            "id": 1,
            "date": (datetime.date.today() + datetime.timedelta(days=1)).isoformat(),
            "time": "09:00 AM",
            "platform": "LinkedIn",
            "title": "Open-Source AI Shift",
            "caption": "Why running local open-weight models is the biggest paradigm shift in developer productivity this decade.",
            "status": "Scheduled",
        },
        {
            "id": 2,
            "date": (datetime.date.today() + datetime.timedelta(days=2)).isoformat(),
            "time": "12:30 PM",
            "platform": "Instagram",
            "title": "Behind The Architecture",
            "caption": "A sneak peek behind our multimodal pipeline running on local Qwen2-VL and LLaMA 3.2. ✨ #OpenSource #AI",
            "status": "Draft",
        },
        {
            "id": 3,
            "date": (datetime.date.today() + datetime.timedelta(days=3)).isoformat(),
            "time": "03:15 PM",
            "platform": "X (Twitter)",
            "title": "Release Thread 1.0",
            "caption": "AutoSocial AI is now fully open-source! 100% local, zero vendor lock-in. Thread below 👇 (1/3)",
            "status": "Scheduled",
        },
    ]

# ----------------- SIDEBAR: MODEL & RUNTIME CONFIG -----------------
with st.sidebar:
    st.title("⚡ AutoSocial AI")
    st.caption("Best Open-Source AI Project Challenge")
    st.divider()

    st.subheader("🖥️ Local Open-Weight Runtime")
    ollama_url = st.text_input("Ollama Endpoint", value=ai_engine.OLLAMA_BASE_URL)
    status_info = ai_engine.check_ollama_status(ollama_url)

    if status_info["online"]:
        st.success(f"● Connected to Ollama ({len(status_info['models'])} models loaded)")
        with st.expander("Detected Local Models"):
            for m in status_info["models"]:
                st.code(m, language="bash")
    else:
        st.warning("● Ollama daemon offline (Using High-Fidelity Local Open Fallback)")
        st.caption("Run: `ollama run llama3.2` & `ollama run qwen2-vl`")

    st.divider()
    st.subheader("⚙️ Model Architecture")
    vision_model = st.selectbox(
        "Vision Model (Feature A)",
        options=["qwen2-vl:7b", "gemma-3:4b", "llava:latest"],
        index=0,
    )
    text_model = st.selectbox(
        "Text Model (Features A, B, C)",
        options=["llama3.2:3b", "qwen2.5:7b", "llama3.2:1b"],
        index=0,
    )

    st.divider()
    st.subheader("🎨 Tone & Brand Voice Selector")
    tone_choice = st.select_slider(
        "Brand Persona",
        options=["Professional", "Witty", "Casual", "Hype / Energetic", "Educational"],
        value="Professional",
    )

    st.divider()
    st.markdown("### 🏆 Challenge Compliance")
    st.markdown(
        "- ✅ **100% Open-Source Weights** (LLaMA 3.2, Qwen2-VL)\n"
        "- ✅ **Agent Skill Standard** (`.agents/skills/`)\n"
        "- ✅ **No Commercial Closed APIs**\n"
        "- ✅ **MIT License** + Public GitHub Ready"
    )

# ----------------- MAIN TABS -----------------
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📸 Multimodal Post Generator",
    "📝 Event-to-Blog & Newsletter",
    "💬 Comment Triage & Responder",
    "📅 Content Calendar & Scheduler",
    "📊 Offline Readability & Hashtag Predictor",
])

# ==============================================================================
# TAB 1: MULTIMODAL SOCIAL POST GENERATOR
# ==============================================================================
with tab1:
    st.header("📸 Multimodal Social Post Generator")
    st.write(
        "Upload an image, video frame, or enter visual description. "
        "Powered by **Qwen2-VL** for visual scene perception and **LLaMA 3.2** for cross-platform adaptation."
    )

    col_input, col_preview = st.columns([1, 1], gap="medium")

    with col_input:
        uploaded_image = st.file_uploader(
            "Upload Visual Asset (JPG, PNG)",
            type=["jpg", "jpeg", "png"],
            help="Your image remains 100% local and will be analyzed by open vision-language weights.",
        )

        sample_choice = st.selectbox(
            "Or test with sample creator scenario:",
            [
                "Custom Upload / Text Only",
                "New AI Developer Workspace & Dual Monitor Setup",
                "Community Hackathon Stage Keynote Presentation",
                "Artisan Pour-Over Coffee Roastery Product Launch",
            ],
        )

        user_context_text = st.text_area(
            "Creator Context / Key Message",
            value=(
                "Announcing our breakthrough open-weight pipeline that cuts cloud inference costs to zero."
                if sample_choice == "Custom Upload / Text Only"
                else sample_choice
            ),
            height=100,
        )

        generate_btn = st.button("🚀 Generate Multi-Platform Drafts", type="primary", use_container_width=True)

    with col_preview:
        st.subheader("Asset Preview")
        pil_image = None
        if uploaded_image:
            pil_image = Image.open(uploaded_image)
            st.image(pil_image, caption="Uploaded Image", use_container_width=True)
        else:
            st.info("💡 Upload an image or select a sample scenario to simulate vision perception.")

    if generate_btn:
        with st.spinner(f"Analyzing scene with {vision_model} and crafting copy with {text_model}..."):
            results = ai_engine.generate_social_posts(
                image_input=pil_image,
                description=user_context_text,
                tone=tone_choice,
                model_name=text_model,
                vision_model_name=vision_model,
                base_url=ollama_url,
            )

            st.success("✨ Generation Complete! Tailored for 3 distinct platforms:")

            # Visual analysis summary
            with st.expander("🔍 Open VLM Scene Perception Details", expanded=True):
                st.write(results.get("visual_summary", "Visual analysis completed."))

            ig_col, li_col, tw_col = st.columns(3)

            with ig_col:
                st.markdown("### 📷 Instagram")
                st.caption("Visual, engaging, emoji-rich, 10-15 hashtags")
                st.text_area("Instagram Caption", value=results.get("instagram", ""), height=320, key="ig_out")
                if st.button("➕ Add to Calendar", key="add_ig"):
                    st.session_state.calendar_events.append({
                        "id": len(st.session_state.calendar_events) + 1,
                        "date": datetime.date.today().isoformat(),
                        "time": "06:00 PM",
                        "platform": "Instagram",
                        "title": user_context_text[:30],
                        "caption": results.get("instagram", ""),
                        "status": "Draft",
                    })
                    st.toast("Added Instagram post to Content Calendar!")

            with li_col:
                st.markdown("### 💼 LinkedIn")
                st.caption("Professional, structured takeaways & insights")
                st.text_area("LinkedIn Post", value=results.get("linkedin", ""), height=320, key="li_out")
                if st.button("➕ Add to Calendar", key="add_li"):
                    st.session_state.calendar_events.append({
                        "id": len(st.session_state.calendar_events) + 1,
                        "date": (datetime.date.today() + datetime.timedelta(days=1)).isoformat(),
                        "time": "08:30 AM",
                        "platform": "LinkedIn",
                        "title": user_context_text[:30],
                        "caption": results.get("linkedin", ""),
                        "status": "Scheduled",
                    })
                    st.toast("Added LinkedIn post to Content Calendar!")

            with tw_col:
                st.markdown("### 🐦 X (Twitter)")
                st.caption("Concise, punchy hook under 280 chars, thread-ready")
                st.text_area("X / Twitter Post", value=results.get("twitter", ""), height=320, key="tw_out")
                char_c = len(results.get("twitter", ""))
                st.caption(f"Character Count: **{char_c}/280** {'✅' if char_c <= 280 else '⚠️ Over limit'}")
                if st.button("➕ Add to Calendar", key="add_tw"):
                    st.session_state.calendar_events.append({
                        "id": len(st.session_state.calendar_events) + 1,
                        "date": (datetime.date.today() + datetime.timedelta(days=1)).isoformat(),
                        "time": "02:00 PM",
                        "platform": "X (Twitter)",
                        "title": user_context_text[:30],
                        "caption": results.get("twitter", ""),
                        "status": "Scheduled",
                    })
                    st.toast("Added X post to Content Calendar!")


# ==============================================================================
# TAB 2: EVENT-TO-BLOG & NEWSLETTER DRAFTER
# ==============================================================================
with tab2:
    st.header("📝 Event-to-Blog & Newsletter Drafter")
    st.write(
        "Synthesize event photos, speaker talking points, and raw voice notes into a publication-ready "
        "Markdown blog post and an executive email newsletter summary."
    )

    ev_col1, ev_col2 = st.columns([1, 1], gap="medium")

    with ev_col1:
        event_title = st.text_input("Event Name", value="Open-Source AI World Summit 2026")
        event_notes = st.text_area(
            "Event Highlights, Agenda & Speaker Notes",
            value=(
                "- Keynote: Open-weight LLMs achieving parity with cloud APIs\n"
                "- Live demo: Autonomous multi-agent coordination with local Ollama\n"
                "- Panel discussion on privacy-first enterprise AI infrastructure\n"
                "- Audience Q&A: Over 500 attendees, 45 community hackathon submissions announced"
            ),
            height=160,
        )
        event_photos = st.file_uploader(
            "Event Photos (Optional Gallery)",
            type=["jpg", "png"],
            accept_multiple_files=True,
            key="ev_photos",
        )
        draft_event_btn = st.button("⚡ Synthesize Blog & Newsletter", type="primary", use_container_width=True)

    with ev_col2:
        if draft_event_btn:
            with st.spinner("Drafting medium-form blog and newsletter with LLaMA 3.2..."):
                event_output = ai_engine.generate_event_blog_and_newsletter(
                    event_title=event_title,
                    bullet_points=event_notes,
                    images_count=len(event_photos) if event_photos else 2,
                    tone=tone_choice,
                    model_name=text_model,
                    base_url=ollama_url,
                )

                st.session_state.last_event_output = event_output
                st.success("Drafting finished!")

        if "last_event_output" in st.session_state:
            out = st.session_state.last_event_output

            sub_tabs = st.tabs(["📖 Markdown Blog Post", "📧 Email Newsletter Edition"])

            with sub_tabs[0]:
                st.markdown(out.get("blog_markdown", ""))
                st.download_button(
                    label="📥 Download Blog Post (.md)",
                    data=out.get("blog_markdown", ""),
                    file_name=f"{event_title.lower().replace(' ', '_')}_blog.md",
                    mime="text/markdown",
                )

            with sub_tabs[1]:
                st.subheader("A/B Subject Line Tests:")
                for sub in out.get("newsletter_subject_lines", []):
                    st.code(sub, language="markdown")

                st.caption(f"Preview Header: {out.get('newsletter_preview', '')}")
                st.text_area("Newsletter Body", value=out.get("newsletter_body", ""), height=280)
                st.download_button(
                    label="📥 Download Newsletter Text",
                    data=out.get("newsletter_body", ""),
                    file_name="newsletter_digest.txt",
                )
        else:
            st.info("Click 'Synthesize Blog & Newsletter' to view the formatted drafts.")


# ==============================================================================
# TAB 3: INTELLIGENT COMMENT & AUTO-RESPONDER
# ==============================================================================
with tab3:
    st.header("💬 Intelligent Comment Triage & Auto-Responder")
    st.write(
        "Paste incoming audience comments or simulated engagement batches. "
        "The open model categorizes each comment (Positive, Question/Inquiry, Negative/Critique, Spam) "
        "and drafts a polite, brand-safe, contextual reply."
    )

    preset_comments = (
        "Is this 100% open-source or do you need an OpenAI API key?\n"
        "This is hands down the cleanest social automation tool I've seen all year! Keep shipping.\n"
        "Your setup instructions failed on my Windows machine, threw an error on step 3.\n"
        "DM me on WhatsApp +123456789 for guaranteed crypto trading returns!\n"
        "Can we schedule directly to Instagram Reels or is it only single photo posts for now?"
    )

    raw_comments_input = st.text_area("Incoming Comments (One per line)", value=preset_comments, height=140)

    if st.button("🎯 Triage Comments & Generate Replies", type="primary"):
        comment_list = [c for c in raw_comments_input.split("\n") if c.strip()]
        with st.spinner("Classifying sentiments and drafting brand-safe responses..."):
            triage_results = ai_engine.triage_and_respond_comments(
                comment_list, tone=tone_choice, model_name=text_model, base_url=ollama_url
            )

            for i, item in enumerate(triage_results):
                with st.container():
                    c1, c2 = st.columns([1, 2])
                    with c1:
                        st.markdown(f"**Comment #{i+1}:**")
                        st.info(f'"{item["comment"]}"')
                        st.caption(f"Category: **{item['category']}** · Tone: *{item['tone']}*")
                    with c2:
                        st.markdown("**Suggested Brand-Safe Response:**")
                        st.text_area(f"Reply #{i+1}", value=item["response"], height=80, key=f"rep_{i}")
                    st.divider()


# ==============================================================================
# TAB 4: CONTENT CALENDAR & SCHEDULER
# ==============================================================================
with tab4:
    st.header("📅 Content Calendar & Scheduler Export")
    st.write("Organize, review, and export your scheduled multi-platform campaigns into standard CSV or iCal (.ics).")

    df = pd.DataFrame(st.session_state.calendar_events)
    st.dataframe(df, use_container_width=True)

    cal_col1, cal_col2 = st.columns(2)

    with cal_col1:
        # CSV Export
        csv_data = df.to_csv(index=False).encode("utf-8")
        st.download_button(
            label="📥 Download Calendar as CSV",
            data=csv_data,
            file_name="autosocial_content_calendar.csv",
            mime="text/csv",
            use_container_width=True,
        )

    with cal_col2:
        # iCal (.ics) Generator
        ics_content = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//AutoSocial AI//Content Calendar//EN",
        ]
        for evt in st.session_state.calendar_events:
            dt_clean = evt["date"].replace("-", "")
            ics_content.extend([
                "BEGIN:VEVENT",
                f"SUMMARY:[{evt['platform']}] {evt['title']}",
                f"DESCRIPTION:{evt['caption']}",
                f"DTSTART;VALUE=DATE:{dt_clean}",
                f"DTEND;VALUE=DATE:{dt_clean}",
                f"STATUS:{'CONFIRMED' if evt['status'] == 'Scheduled' else 'TENTATIVE'}",
                "END:VEVENT",
            ])
        ics_content.append("END:VCALENDAR")
        ics_file_str = "\r\n".join(ics_content)

        st.download_button(
            label="📅 Download Calendar as iCal (.ics)",
            data=ics_file_str,
            file_name="autosocial_schedule.ics",
            mime="text/calendar",
            use_container_width=True,
        )


# ==============================================================================
# TAB 5: OFFLINE READABILITY & HASHTAG PREDICTOR
# ==============================================================================
with tab5:
    st.header("📊 Offline Analytics & Readability Predictor")
    st.write(
        "Assess engagement potential, Flesch-Kincaid readability, and hashtag density "
        "completely in-memory without sending data to external APIs."
    )

    test_caption = st.text_area(
        "Paste Post Caption to Analyze",
        value=(
            "We are thrilled to announce the official release of AutoSocial AI! 🚀 "
            "Built with open-weight models, this copilot puts creators back in control of their content workflow. "
            "No hidden subscriptions, no cloud vendor lock-in. What feature are you most excited to try? "
            "#OpenSource #AI #TechInnovation #Creators #BuildInPublic"
        ),
        height=120,
    )

    metrics = ai_engine.predict_offline_metrics(test_caption)

    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Character Count", metrics["char_count"])
    m2.metric("Word Count", metrics["word_count"])
    m3.metric("Flesch Readability", f"{metrics['readability_score']}/100")
    m4.metric("Hashtags", metrics["hashtag_count"])

    st.write(f"**Readability Grade:** {metrics['readability_grade']}")
    st.write(f"**Hashtag Density Rating:** {metrics['density_rating']}")
    st.write(f"**Estimated Reach Potential:** {metrics['engagement_potential']}")
