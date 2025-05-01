from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import re
from textblob import TextBlob
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
import joblib
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Model paths
SENTIMENT_MODEL_PATH = 'models/sentiment_model.pkl'
PREDICTION_MODEL_PATH = 'models/prediction_model.pkl'

# Ensure models directory exists
os.makedirs('models', exist_ok=True)

# Sample training data for sentiment model
# In a real application, you would load this from a database or file
def load_sample_data():
    data = {
        'text': [
            "I will definitely vote for Candidate A! They have the best policies.",
            "Candidate B is terrible, their economy plan is a disaster.",
            "Not sure who to vote for in this election, both candidates have flaws.",
            "The debate last night showed that Candidate A is clearly more prepared.",
            "Candidate B's healthcare proposals are excellent, I support them.",
            "This election is frustrating, neither candidate addresses my concerns.",
            "Candidate A's foreign policy is dangerous and short-sighted.",
            "Excited to cast my vote for Candidate B next month!",
            "The polls don't look good for Candidate A, but I'll still support them.",
            "Candidate B just doesn't understand what regular people need."
        ],
        'sentiment': [1, -1, 0, 1, 1, -1, -1, 1, 0, -1]  # 1: positive, 0: neutral, -1: negative
    }
    return pd.DataFrame(data)

# Sample training data for prediction model
def load_prediction_data():
    data = {
        'text': [
            "I will definitely vote for Candidate A! They have the best policies.",
            "Candidate B is terrible, I'm voting for Candidate A.",
            "Not sure who to vote for in this election, maybe Candidate B.",
            "After the debate, I've decided to vote for Candidate A.",
            "Candidate B's healthcare proposals won me over, they have my vote.",
            "This election is frustrating, but I'll probably vote for Candidate A.",
            "I can't stand Candidate A, definitely voting for Candidate B.",
            "Excited to cast my vote for Candidate B next month!",
            "Despite the polls, I'm still voting for Candidate A.",
            "Candidate A just doesn't understand what we need, voting B."
        ],
        'candidate_choice': ['A', 'A', 'B', 'A', 'B', 'A', 'B', 'B', 'A', 'B']
    }
    return pd.DataFrame(data)

# Preprocess text
def preprocess_text(text):
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\@\w+|\#', '', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = text.lower()
    return text

# Train sentiment model if not exists
def train_sentiment_model():
    if os.path.exists(SENTIMENT_MODEL_PATH):
        return joblib.load(SENTIMENT_MODEL_PATH)
    
    df = load_sample_data()
    df['processed_text'] = df['text'].apply(preprocess_text)
    
    X_train, X_test, y_train, y_test = train_test_split(
        df['processed_text'], df['sentiment'], test_size=0.2, random_state=42
    )
    
    # Create a pipeline with feature extraction and classifier
    pipeline = Pipeline([
        ('vect', CountVectorizer()),
        ('tfidf', TfidfTransformer()),
        ('clf', LogisticRegression(max_iter=1000))
    ])
    
    # Train the model
    pipeline.fit(X_train, y_train)
    
    # Save the model
    joblib.dump(pipeline, SENTIMENT_MODEL_PATH)
    
    return pipeline

# Train prediction model if not exists
def train_prediction_model():
    if os.path.exists(PREDICTION_MODEL_PATH):
        return joblib.load(PREDICTION_MODEL_PATH)
    
    df = load_prediction_data()
    df['processed_text'] = df['text'].apply(preprocess_text)
    
    X_train, X_test, y_train, y_test = train_test_split(
        df['processed_text'], df['candidate_choice'], test_size=0.2, random_state=42
    )
    
    # Create a pipeline with feature extraction and classifier
    pipeline = Pipeline([
        ('vect', CountVectorizer()),
        ('tfidf', TfidfTransformer()),
        ('clf', LogisticRegression(max_iter=1000))
    ])
    
    # Train the model
    pipeline.fit(X_train, y_train)
    
    # Save the model
    joblib.dump(pipeline, PREDICTION_MODEL_PATH)
    
    return pipeline

# Basic TextBlob sentiment analysis
def analyze_sentiment_textblob(text):
    analysis = TextBlob(text)
    polarity = analysis.sentiment.polarity
    
    if polarity > 0.1:
        return 1  # Positive
    elif polarity < -0.1:
        return -1  # Negative
    else:
        return 0  # Neutral

# Routes
@app.route('/api/analyze', methods=['POST'])
def analyze_tweet():
    data = request.json
    
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400
    
    text = data['text']
    processed_text = preprocess_text(text)
    
    # Load or train models
    sentiment_model = train_sentiment_model()
    prediction_model = train_prediction_model()
    
    # Get sentiment using both methods
    model_sentiment = sentiment_model.predict([processed_text])[0]
    textblob_sentiment = analyze_sentiment_textblob(processed_text)
    
    # Combined sentiment (you could use more sophisticated methods)
    sentiment = (model_sentiment + textblob_sentiment) / 2
    
    # Get candidate prediction
    candidate_prediction = prediction_model.predict([processed_text])[0]
    candidate_proba = prediction_model.predict_proba([processed_text])[0]
    
    # Map sentiment to text representation
    sentiment_text = "Positive" if sentiment > 0 else "Negative" if sentiment < 0 else "Neutral"
    
    # Confidence scores
    confidence_candidate = max(candidate_proba) * 100
    
    return jsonify({
        "text": text,
        "sentiment": sentiment_text,
        "sentiment_score": float(sentiment),
        "predicted_vote": candidate_prediction,
        "confidence": float(confidence_candidate)
    })

@app.route('/api/analyze-batch', methods=['POST'])
def analyze_batch():
    data = request.json
    
    if not data or 'tweets' not in data:
        return jsonify({"error": "No tweets provided"}), 400
    
    tweets = data['tweets']
    results = []
    
    # Load or train models
    sentiment_model = train_sentiment_model()
    prediction_model = train_prediction_model()
    
    for tweet in tweets:
        text = tweet.get('text', '')
        processed_text = preprocess_text(text)
        
        # Get sentiment
        model_sentiment = sentiment_model.predict([processed_text])[0]
        textblob_sentiment = analyze_sentiment_textblob(processed_text)
        sentiment = (model_sentiment + textblob_sentiment) / 2
        
        # Get candidate prediction
        candidate_prediction = prediction_model.predict([processed_text])[0]
        candidate_proba = prediction_model.predict_proba([processed_text])[0]
        
        # Map sentiment to text representation
        sentiment_text = "Positive" if sentiment > 0 else "Negative" if sentiment < 0 else "Neutral"
        
        results.append({
            "id": tweet.get('id', ''),
            "text": text,
            "sentiment": sentiment_text,
            "sentiment_score": float(sentiment),
            "predicted_vote": candidate_prediction,
            "confidence": float(max(candidate_proba) * 100)
        })
    
    # Calculate aggregate statistics
    candidate_a_count = sum(1 for r in results if r['predicted_vote'] == 'A')
    candidate_b_count = sum(1 for r in results if r['predicted_vote'] == 'B')
    
    positive_count = sum(1 for r in results if r['sentiment'] == "Positive")
    negative_count = sum(1 for r in results if r['sentiment'] == "Negative")
    neutral_count = sum(1 for r in results if r['sentiment'] == "Neutral")
    
    # Calculate sentiment by candidate
    candidate_a_sentiment = [r['sentiment_score'] for r in results if r['predicted_vote'] == 'A']
    candidate_b_sentiment = [r['sentiment_score'] for r in results if r['predicted_vote'] == 'B']
    
    avg_sentiment_a = np.mean(candidate_a_sentiment) if candidate_a_sentiment else 0
    avg_sentiment_b = np.mean(candidate_b_sentiment) if candidate_b_sentiment else 0
    
    return jsonify({
        "results": results,
        "stats": {
            "candidate_a_count": candidate_a_count,
            "candidate_b_count": candidate_b_count,
            "positive_count": positive_count,
            "negative_count": negative_count,
            "neutral_count": neutral_count,
            "avg_sentiment_a": float(avg_sentiment_a),
            "avg_sentiment_b": float(avg_sentiment_b)
        }
    })

@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "ok"})

if __name__ == '__main__':
    # Train models at startup
    train_sentiment_model()
    train_prediction_model()
    app.run(debug=True, port=5000)