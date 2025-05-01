# Election Sentiment Analysis System

This project provides a complete system for analyzing sentiment and predicting voter preferences based on social media content. It includes a Python Flask backend for text analysis and a React frontend for visualization.
## project preview 
![preview png](https://github.com/user-attachments/assets/7dadfb66-387d-475e-93b8-38e1c6f4789c)

## Project Structure

```
election-sentiment-analysis/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── tweet_collector.py     # Utility for tweet collection
│   ├── requirements.txt       # Python dependencies
│   └── models/                # Directory for trained models
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML entry point
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── App.css            # Styles for the application
│   │   └── index.js           # React entry point
│   ├── package.json           # NPM dependencies
│   └── tailwind.config.js     # Tailwind CSS configuration
└── README.md                  # This file
```

## Features

### Backend
- Sentiment analysis of text using machine learning and TextBlob
- Voter preference prediction based on text content
- RESTful API for single and batch text analysis
- Tweet collection and preprocessing utilities

### Frontend
- Single tweet analysis with detailed sentiment breakdown
- Batch analysis with data visualization
- Interactive charts using Recharts
- Responsive design with Tailwind CSS

## Setup Instructions

### Backend Setup

1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install the required dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Run the Flask application:
   ```bash
   python app.py
   ```

   The backend server should start running on http://localhost:5000

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

   The frontend application should be available at http://localhost:3000

## API Endpoints

### Single Analysis
- **URL**: `/api/analyze`
- **Method**: POST
- **Body**: `{ "text": "Your tweet text here" }`
- **Response**: 
  ```json
  {
    "text": "Original text",
    "sentiment": "Positive/Negative/Neutral",
    "sentiment_score": 0.75,
    "predicted_vote": "A",
    "confidence": 85.5
  }
  ```

### Batch Analysis
- **URL**: `/api/analyze-batch`
- **Method**: POST
- **Body**: `{ "tweets": [{"id": "1", "text": "Tweet text"}] }`
- **Response**: Detailed analysis results including sentiment and voting predictions

## Data Collection

The system includes a `tweet_collector.py` utility for collecting Twitter/X data. In the current implementation, it generates mock data for development and testing. To use actual Twitter data:

1. Obtain Twitter API credentials
2. Update the `TweetCollector` class with proper API authentication
3. Remove the mock data generation and implement real API calls

## Customization

### Adding New Features
- **New ML Models**: Add new models in the backend and expose them via new API endpoints
- **Additional Visualizations**: Extend the frontend components with new chart types
- **Custom Analysis**: Modify the sentiment analysis logic in `app.py`

### Training Custom Models
The system uses basic logistic regression models for sentiment and prediction. To improve accuracy:

1. Collect more labeled training data
2. Replace the models with more sophisticated algorithms (BERT, RoBERTa, etc.)
3. Add feature engineering techniques

## License

This project is licensed under the MIT License - see the LICENSE file for details.
