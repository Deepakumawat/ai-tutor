from ai_client import client as _fallback_client
"""
NLP Engine for ClassroomAI - Shared across all projects
Features:
  - Intent Detection (explain, debug, practice, concept, help)
  - Sentiment Analysis (frustration, confusion, confidence levels)
  - Topic Extraction (programming concepts)
  - Question Similarity (find related past questions)
"""

import json
from openai import OpenAI

class NLPEngine:
    def __init__(self):
        self.client = _fallback_client, base_url="https://api.groq.com/openai/v1")
        self.model = "llama-3.3-70b-versatile"

    def analyze_question(self, question: str, context: str = "") -> dict:
        """
        Comprehensive analysis of student question
        Returns: intent, sentiment, topics, difficulty, confidence
        """
        prompt = f"""Analyze this student programming question and return ONLY valid JSON (no markdown, no extra text):

Question: "{question}"
Context: {context or "General programming question"}

Return exactly this JSON structure:
{{
    "intent": "explain" | "debug" | "practice" | "concept" | "help",
    "sentiment": {{
        "frustration_level": 1-10,
        "confusion_level": 1-10,
        "confidence_level": 1-10
    }},
    "topics": ["topic1", "topic2"],
    "difficulty": "beginner" | "intermediate" | "advanced",
    "keywords": ["key1", "key2"],
    "summary": "one line summary",
    "needs_help": true | false
}}"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )

            response_text = response.choices[0].message.content.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```"):
                response_text = response_text.split("```")[1]
                if response_text.startswith("json"):
                    response_text = response_text[4:]

            result = json.loads(response_text)
            return result
        except Exception as e:
            print(f"NLP Analysis Error: {e}")
            return {
                "intent": "help",
                "sentiment": {"frustration_level": 5, "confusion_level": 5, "confidence_level": 5},
                "topics": [],
                "difficulty": "intermediate",
                "keywords": [],
                "summary": question,
                "needs_help": True
            }

    def detect_intent(self, text: str) -> dict:
        """Detect user intent from text"""
        analysis = self.analyze_question(text)
        return {
            "intent": analysis.get("intent", "help"),
            "confidence": 0.85
        }

    def analyze_sentiment(self, text: str) -> dict:
        """Analyze sentiment and emotional state"""
        analysis = self.analyze_question(text)
        sentiment = analysis.get("sentiment", {})

        return {
            "frustration": sentiment.get("frustration_level", 5),
            "confusion": sentiment.get("confusion_level", 5),
            "confidence": sentiment.get("confidence_level", 5),
            "needs_encouragement": sentiment.get("frustration_level", 5) >= 7,
            "needs_simpler_explanation": sentiment.get("confusion_level", 5) >= 7
        }

    def extract_topics(self, text: str) -> list:
        """Extract programming topics from text"""
        analysis = self.analyze_question(text)
        return analysis.get("topics", [])

    def classify_question_type(self, question: str) -> dict:
        """
        Classify question and return appropriate response strategy
        """
        analysis = self.analyze_question(question)

        intent = analysis.get("intent", "help")
        sentiment = analysis.get("sentiment", {})
        topics = analysis.get("topics", [])

        strategy = {
            "type": intent,
            "topics": topics,
            "approach": self._get_approach(intent, sentiment),
            "tone": self._get_tone(sentiment),
            "additional_help": self._get_additional_help(sentiment),
            "difficulty_adjustment": self._get_difficulty_level(sentiment, analysis.get("difficulty", "intermediate"))
        }

        return strategy

    def _get_approach(self, intent: str, sentiment: dict) -> str:
        """Get teaching approach based on intent"""
        approaches = {
            "explain": "Provide clear, step-by-step explanation with examples",
            "debug": "Help identify the error, explain the cause, suggest fixes",
            "practice": "Provide practice problems with increasing difficulty",
            "concept": "Explain the underlying concept with real-world analogies",
            "help": "Offer supportive guidance and encouragement"
        }
        return approaches.get(intent, "Provide helpful guidance")

    def _get_tone(self, sentiment: dict) -> str:
        """Determine appropriate tone based on sentiment"""
        frustration = sentiment.get("frustration_level", 5)
        confusion = sentiment.get("confusion_level", 5)

        if frustration >= 8:
            return "encouraging, supportive, reassuring"
        elif confusion >= 8:
            return "patient, slow-paced, detailed"
        else:
            return "friendly, professional, engaging"

    def _get_additional_help(self, sentiment: dict) -> list:
        """Suggest additional help based on sentiment"""
        help_suggestions = []

        if sentiment.get("frustration_level", 5) >= 7:
            help_suggestions.append("Take a break - programming is challenging!")
            help_suggestions.append("Try simpler examples first")
            help_suggestions.append("Break the problem into smaller parts")

        if sentiment.get("confusion_level", 5) >= 7:
            help_suggestions.append("Review prerequisite concepts")
            help_suggestions.append("Use interactive examples")
            help_suggestions.append("Ask for clarification on specific parts")

        return help_suggestions

    def _get_difficulty_level(self, sentiment: dict, current_difficulty: str) -> str:
        """Adjust difficulty based on confusion level"""
        confusion = sentiment.get("confusion_level", 5)

        if confusion >= 8 and current_difficulty in ["advanced", "intermediate"]:
            return "easier"
        elif confusion <= 3 and current_difficulty in ["beginner", "intermediate"]:
            return "harder"
        else:
            return "maintain"

    def generate_adaptive_response(self, question: str, base_response: str, grade_level: str = "6") -> dict:
        """
        Generate adaptive response based on NLP analysis
        Takes the base AI response and enhances it with NLP insights
        """
        strategy = self.classify_question_type(question)
        sentiment = self.analyze_sentiment(question)

        enhanced_response = {
            "original_response": base_response,
            "strategy": strategy,
            "sentiment_analysis": sentiment,
            "recommended_follow_up": self._get_follow_up(strategy, sentiment),
            "engagement_level": "high" if sentiment["confidence"] >= 7 else "medium" if sentiment["confidence"] >= 5 else "low"
        }

        return enhanced_response

    def _get_follow_up(self, strategy: dict, sentiment: dict) -> str:
        """Get recommended follow-up question"""
        intent = strategy.get("type")

        follow_ups = {
            "explain": "Do you want me to show you an example of this concept?",
            "debug": "Would you like me to explain why this error occurs?",
            "practice": "Ready to try a slightly harder problem?",
            "concept": "Would you like to see how this applies in real code?",
            "help": "Is there anything specific that's confusing?"
        }

        return follow_ups.get(intent, "Do you have any other questions?")


# Create global instance
nlp_engine = NLPEngine()
