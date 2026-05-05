from ai_client import client as _fallback_client
#!/usr/bin/env python3
"""
AI Tutor MCP Server
- Handles both standard subjects and custom subjects
- Claude can call these tools directly via MCP
"""

import os
import json
import requests
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# Get API key and strip any whitespace/newlines
api_key = os.getenv("GROQ_API_KEY", "").strip()
client = _fallback_client

# ═══════════════════════════════════════════════════════════════════════════
# HARD-CODED LANGUAGE TOPICS
# ═══════════════════════════════════════════════════════════════════════════

LANGUAGE_TOPICS = {
    "spanish": ["Spanish Alphabet", "Spanish Vocabulary", "Spanish Grammar", "Spanish Verbs", "Spanish Sentences", "Spanish Listening", "Spanish Writing", "Spanish Speaking"],
    "german": ["German Alphabet", "German Vocabulary", "German Grammar", "German Verbs", "German Sentences", "German Listening", "German Writing", "German Speaking"],
    "france": ["French Alphabet", "French Vocabulary", "French Grammar", "French Verbs", "French Sentences", "French Listening", "French Writing", "French Speaking"],
    "french": ["French Alphabet", "French Vocabulary", "French Grammar", "French Verbs", "French Sentences", "French Listening", "French Writing", "French Speaking"],
    "russian": ["Russian Alphabet", "Russian Vocabulary", "Russian Grammar", "Russian Verbs", "Russian Sentences", "Russian Listening", "Russian Writing", "Russian Speaking"],
    "chinese": ["Chinese Characters", "Chinese Vocabulary", "Chinese Grammar", "Chinese Tones", "Chinese Sentences", "Chinese Listening", "Chinese Writing", "Chinese Speaking"],
    "japanese": ["Japanese Hiragana", "Japanese Vocabulary", "Japanese Grammar", "Japanese Kanji", "Japanese Sentences", "Japanese Listening", "Japanese Writing", "Japanese Speaking"],
    "korean": ["Korean Alphabet", "Korean Vocabulary", "Korean Grammar", "Korean Verbs", "Korean Sentences", "Korean Listening", "Korean Writing", "Korean Speaking"],
    "italian": ["Italian Alphabet", "Italian Vocabulary", "Italian Grammar", "Italian Verbs", "Italian Sentences", "Italian Listening", "Italian Writing", "Italian Speaking"],
    "portuguese": ["Portuguese Alphabet", "Portuguese Vocabulary", "Portuguese Grammar", "Portuguese Verbs", "Portuguese Sentences", "Portuguese Listening", "Portuguese Writing", "Portuguese Speaking"],
    "arabic": ["Arabic Alphabet", "Arabic Vocabulary", "Arabic Grammar", "Arabic Verbs", "Arabic Sentences", "Arabic Listening", "Arabic Writing", "Arabic Speaking"],
}

# ═══════════════════════════════════════════════════════════════════════════
# MCP TOOLS
# ═══════════════════════════════════════════════════════════════════════════

def get_topics(subject: str, grade: str) -> dict:
    """Get learning topics for any subject - custom or standard"""
    subject_lower = subject.lower().strip()

    # Check if it's a known language
    if subject_lower in LANGUAGE_TOPICS:
        return {
            "subject": subject,
            "grade": grade,
            "topics": LANGUAGE_TOPICS[subject_lower],
            "count": len(LANGUAGE_TOPICS[subject_lower]),
            "type": "language"
        }

    # For custom subjects, generate topics using AI
    print(f"🔄 Generating topics for custom subject: {subject}")

    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": f"""You are a curriculum designer creating topics for teaching {subject}.

IMPORTANT: Generate topics ONLY about {subject}. Do not generate topics about related concepts, culture, customs, or traditions unless {subject} is explicitly about those things.

For example:
- If subject is "Cooking": topics should be "Knife Skills", "Baking Basics", "Food Safety", NOT "Culinary Culture"
- If subject is "Guitar": topics should be "Guitar Parts", "Basic Chords", "Finger Technique", NOT "History of Music"
- If subject is "Spanish": topics should be "Spanish Alphabet", "Spanish Grammar", NOT "Spanish Customs"

Generate exactly 8 learning topics for {subject}."""},
                {"role": "user", "content": f"""Generate 8 specific learning topics for teaching "{subject}" at {grade} level.

The topics should be directly about {subject} itself - the skills, techniques, concepts, and knowledge students need to learn about {subject}.

Format EXACTLY as numbered list:
1. Topic Name
2. Topic Name
3. Topic Name
4. Topic Name
5. Topic Name
6. Topic Name
7. Topic Name
8. Topic Name

Include only the numbered list. No explanations or other text."""}
            ],
            temperature=0.7,
            max_tokens=350
        )

        content = response.choices[0].message.content or ""

        # Parse topics
        topics = []
        for line in content.split('\n'):
            line = line.strip()
            if line and any(char.isdigit() for char in line[:2]):
                # Remove numbering
                topic = line.split('.', 1)[-1].strip()
                if topic and len(topic) > 2:
                    topics.append(topic)

        if len(topics) < 8:
            # Fallback if parsing failed
            topics = [
                f"{subject} Basics",
                f"Introduction to {subject}",
                f"Core Skills in {subject}",
                f"{subject} Techniques",
                f"Practical {subject} Applications",
                f"Advanced {subject} Topics",
                f"Common {subject} Challenges",
                f"{subject} Mastery"
            ]

        return {
            "subject": subject,
            "grade": grade,
            "topics": topics[:8],
            "count": len(topics[:8]),
            "type": "custom"
        }

    except Exception as e:
        print(f"❌ Error generating topics: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        # Fallback topics
        return {
            "subject": subject,
            "grade": grade,
            "topics": [
                f"{subject} Basics",
                f"Introduction to {subject}",
                f"Core Skills",
                f"Techniques & Methods",
                f"Practical Applications",
                f"Advanced Topics",
                f"Practice & Exercises",
                f"Mastery & Excellence"
            ],
            "count": 8,
            "type": "fallback"
        }

def get_grade_language(grade: str) -> str:
    """Return language style based on grade"""
    grade_num = int(''.join(filter(str.isdigit, grade)) or 6)

    if grade_num <= 3:
        return "Use VERY SIMPLE words, SHORT sentences. Explain like talking to a 7-year-old. Use lots of emojis 🎉 and simple examples. Maximum 200 words."
    elif grade_num <= 6:
        return "Use clear, age-appropriate language with fun examples. Grades 4-6 level. Include some interesting facts. 300-400 words."
    elif grade_num <= 9:
        return "Use slightly technical language. Include more detailed examples and explanations. Grades 7-9 level. 400-500 words."
    else:
        return "Use academic and technical language. Include advanced concepts and detailed analysis. High school level (10-12). 500-700 words."

def explain_topic(topic: str, grade: str, subject: str, history: list = None) -> dict:
    """Explain a topic in detail with grade-appropriate formatting"""
    try:
        grade_num = int(''.join(filter(str.isdigit, grade)) or 6)
        lang_style = get_grade_language(grade)

        messages = [
            {"role": "system", "content": f"""You are an expert tutor explaining '{topic}' from {subject} to {grade} students.

{lang_style}

Format EXACTLY as:
DEFINITION:
[Clear definition]

KEY CONCEPTS:
• Concept 1
• Concept 2
• Concept 3

REAL-WORLD EXAMPLE:
[Practical example students can relate to]

SUMMARY:
[Brief recap in 1-2 sentences]"""}
        ]
        if history:
            messages.extend(history[-6:])
        messages.append({"role": "user", "content": f"Explain '{topic}' for {grade} students learning {subject}."})

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            max_tokens=600,
            temperature=0.7
        )

        content = response.choices[0].message.content

        # Parse into sections (handle both markdown and plain text headers)
        sections = {}
        current_section = None
        current_content = []

        lines = content.split('\n')
        for line in lines:
            line_stripped = line.strip()
            line_upper = line_stripped.upper()

            # Check for section headers (markdown "###" OR plain text with ":")
            is_header = any(
                (line_stripped.startswith('#') or line_stripped.endswith(':')) and keyword in line_upper
                for keyword in ['DEFINITION', 'KEY CONCEPTS', 'REAL-WORLD EXAMPLE', 'SUMMARY']
            ) or (
                line_stripped.endswith(':') and 'EXAMPLE' in line_upper and 'REAL-WORLD' not in line_upper
            )

            if is_header:
                # Save previous section
                if current_section and current_content:
                    # Remove empty lines from end
                    while current_content and not current_content[-1].strip():
                        current_content.pop()
                    sections[current_section] = '\n'.join(current_content).strip()
                current_content = []

                # Identify new section
                if 'DEFINITION' in line_upper:
                    current_section = 'definition'
                elif 'KEY CONCEPTS' in line_upper:
                    current_section = 'keyPoints'
                elif 'REAL-WORLD EXAMPLE' in line_upper:
                    current_section = 'example'
                elif 'SUMMARY' in line_upper:
                    current_section = 'summary'
                elif 'EXAMPLE' in line_upper:
                    current_section = 'example'
            elif current_section is not None:
                # Add line to current section (including blank lines)
                current_content.append(line)

        # Save last section
        if current_section and current_content:
            while current_content and not current_content[-1].strip():
                current_content.pop()
            sections[current_section] = '\n'.join(current_content).strip()

        return {
            "topic": topic,
            "grade": grade,
            "subject": subject,
            "explanation": content,
            "sections": sections,
            "gradeLevel": grade_num
        }

    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error explaining topic '{topic}': {type(e).__name__}: {error_msg}")
        import traceback
        traceback.print_exc()
        # Return error response with empty sections (prevents frontend hang)
        return {
            "topic": topic,
            "grade": grade,
            "subject": subject,
            "explanation": f"Sorry, I couldn't explain this topic. Please try again.",
            "sections": {
                "definition": "Unable to load definition",
                "keyPoints": "Unable to load key points",
                "example": "Unable to load example",
                "summary": "Unable to load summary"
            },
            "gradeLevel": grade_num,
            "error": error_msg
        }

def explain_topic_stream(topic: str, grade: str, subject: str, history: list = None):
    """Stream explanation token by token using OpenAI streaming"""
    grade_num = int(''.join(filter(str.isdigit, grade)) or 6)
    lang_style = get_grade_language(grade)

    messages = [
        {"role": "system", "content": f"""You are an expert tutor explaining '{topic}' from {subject} to {grade} students.

{lang_style}

Format EXACTLY as:
DEFINITION:
[Clear definition]

KEY CONCEPTS:
• Concept 1
• Concept 2
• Concept 3

REAL-WORLD EXAMPLE:
[Practical example students can relate to]

SUMMARY:
[Brief recap in 1-2 sentences]"""}
    ]
    if history:
        messages.extend(history[-6:])
    messages.append({"role": "user", "content": f"Explain '{topic}' for {grade} students learning {subject}."})

    stream = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=messages,
        max_tokens=600,
        temperature=0.7,
        stream=True
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content
        if delta:
            yield delta


def practice_question(subject: str, grade: str) -> dict:
    """Generate a practice question"""
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": f"Generate a practice question for {grade} students learning {subject}."},
                {"role": "user", "content": f"Create a practice question for {subject} at {grade} level with answer."}
            ],
            max_tokens=500
        )

        return {
            "subject": subject,
            "grade": grade,
            "question": response.choices[0].message.content
        }

    except Exception as e:
        return {"error": str(e)}

def get_educational_videos(subject: str, grade: str, topic: str = None) -> dict:
    """Get educational YouTube videos for a subject, topic, and grade level"""
    try:
        youtube_api_key = os.getenv("YOUTUBE_API_KEY")

        if not youtube_api_key:
            return {
                "subject": subject,
                "grade": grade,
                "videos": [],
                "message": "YouTube API key not configured"
            }

        # Extract grade number
        grade_num = int(''.join(filter(str.isdigit, grade)) or 6)

        # Build search query with specific topic if provided
        search_term = topic if topic else subject

        # Build search query with grade-appropriate keywords
        if grade_num <= 3:
            query = f"{search_term} lesson for kids"
        elif grade_num <= 6:
            query = f"{search_term} tutorial for {grade}"
        else:
            query = f"{search_term} lesson {grade}"

        # YouTube API v3 search
        youtube_url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": query,
            "type": "video",
            "maxResults": 6,
            "relevanceLanguage": "en",
            "key": youtube_api_key,
            "order": "relevance"
        }

        response = requests.get(youtube_url, params=params, timeout=10)

        if response.status_code != 200:
            return {
                "subject": subject,
                "grade": grade,
                "videos": [],
                "error": f"YouTube API error: {response.status_code}"
            }

        data = response.json()
        videos = []

        for item in data.get("items", [])[:6]:
            video_id = item.get("id", {}).get("videoId")
            snippet = item.get("snippet", {})

            if video_id:
                videos.append({
                    "id": video_id,
                    "title": snippet.get("title", "Untitled"),
                    "description": snippet.get("description", ""),
                    "thumbnail": snippet.get("thumbnails", {}).get("default", {}).get("url", ""),
                    "channel": snippet.get("channelTitle", "Unknown"),
                    "url": f"https://www.youtube.com/watch?v={video_id}"
                })

        return {
            "subject": subject,
            "grade": grade,
            "videos": videos,
            "count": len(videos),
            "query": query
        }

    except requests.exceptions.Timeout:
        return {
            "subject": subject,
            "grade": grade,
            "videos": [],
            "error": "Request timeout"
        }
    except Exception as e:
        return {
            "subject": subject,
            "grade": grade,
            "videos": [],
            "error": str(e)
        }

def quick_answer(question: str, grade: str = "Grade 6") -> dict:
    """Answer a question in a few lines with current information"""
    try:
        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {"role": "system", "content": f"""You are a helpful tutor answering student questions.

IMPORTANT: Answer in 2-4 sentences maximum. Be concise and clear.
Grade level: {grade}
For younger grades (K-3): Use very simple words, short sentences.
For older grades (7-12): You can use more technical language.

Today's date: {__import__('datetime').date.today().strftime('%B %d, %Y')}. Use current and recent information."""},
                {"role": "user", "content": question}
            ],
            max_tokens=200,
            temperature=0.7
        )

        answer = response.choices[0].message.content

        return {
            "question": question,
            "answer": answer,
            "grade": grade,
            "source": "real-time knowledge"
        }
    except Exception as e:
        return {
            "question": question,
            "answer": f"Sorry, I couldn't find an answer to that question. Error: {str(e)}",
            "error": str(e)
        }

# ═══════════════════════════════════════════════════════════════════════════
# MCP TOOL DEFINITIONS
# ═══════════════════════════════════════════════════════════════════════════

TOOLS = {
    "get-topics": {
        "description": "Get learning topics for any subject (standard languages or custom subjects)",
        "inputSchema": {
            "type": "object",
            "properties": {
                "subject": {"type": "string", "description": "Subject name (Spanish, Cooking, Economics, etc.)"},
                "grade": {"type": "string", "description": "Grade level (Grade 6, Grade 12, etc.)"}
            },
            "required": ["subject", "grade"]
        }
    },
    "explain-topic": {
        "description": "Explain a specific topic in detail",
        "inputSchema": {
            "type": "object",
            "properties": {
                "topic": {"type": "string", "description": "Topic to explain"},
                "grade": {"type": "string", "description": "Grade level"},
                "subject": {"type": "string", "description": "Subject"}
            },
            "required": ["topic", "grade", "subject"]
        }
    },
    "practice-question": {
        "description": "Generate a practice question",
        "inputSchema": {
            "type": "object",
            "properties": {
                "subject": {"type": "string", "description": "Subject"},
                "grade": {"type": "string", "description": "Grade level"}
            },
            "required": ["subject", "grade"]
        }
    },
    "get-videos": {
        "description": "Get educational YouTube videos for a subject and grade level",
        "inputSchema": {
            "type": "object",
            "properties": {
                "subject": {"type": "string", "description": "Subject name (Spanish, Math, Science, etc.)"},
                "grade": {"type": "string", "description": "Grade level (Grade 6, Grade 12, etc.)"}
            },
            "required": ["subject", "grade"]
        }
    },
    "quick-answer": {
        "description": "Answer any question in a few lines (2-4 sentences) with current/recent information",
        "inputSchema": {
            "type": "object",
            "properties": {
                "question": {"type": "string", "description": "Any question to answer (e.g., 'Who is the recent PM of Pakistan?')"},
                "grade": {"type": "string", "description": "Grade level for language adjustment (default: Grade 6)"}
            },
            "required": ["question"]
        }
    }
}

# ═══════════════════════════════════════════════════════════════════════════
# TOOL EXECUTOR
# ═══════════════════════════════════════════════════════════════════════════

def execute_tool(tool_name: str, params: dict) -> dict:
    """Execute an MCP tool"""
    if tool_name == "get-topics":
        return get_topics(params["subject"], params["grade"])
    elif tool_name == "explain-topic":
        return explain_topic(params["topic"], params["grade"], params["subject"])
    elif tool_name == "practice-question":
        return practice_question(params["subject"], params["grade"])
    elif tool_name == "get-videos":
        return get_educational_videos(params["subject"], params["grade"])
    elif tool_name == "quick-answer":
        grade = params.get("grade", "Grade 6")
        return quick_answer(params["question"], grade)
    else:
        return {"error": f"Unknown tool: {tool_name}"}

# ═══════════════════════════════════════════════════════════════════════════
# TEST
# ═══════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print("Testing MCP Tools...\n")

    # Test standard language
    print("1️⃣ Spanish (standard language):")
    result = get_topics("spanish", "Grade 6")
    print(f"   Topics: {result['topics']}\n")

    # Test custom subject
    print("2️⃣ Cooking (custom subject):")
    result = get_topics("cooking", "Grade 6")
    print(f"   Topics: {result['topics']}\n")

    print("✅ MCP Server ready!")
    print("\nTools available:")
    for tool_name in TOOLS:
        print(f"  - {tool_name}")
