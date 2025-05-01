import os
import pandas as pd
import json
import time
import requests
from datetime import datetime, timedelta
import re

"""
Note: This script is a template for collecting tweets. 
You would need to replace the Twitter API logic with a proper
API client using your own credentials.

For actual Twitter/X API integration, you would need:
1. Twitter API credentials
2. Tweepy or similar library
"""

class TweetCollector:
    def __init__(self, api_key=None, api_secret=None, access_token=None, access_token_secret=None):
        self.api_key = api_key or os.environ.get('TWITTER_API_KEY')
        self.api_secret = api_secret or os.environ.get('TWITTER_API_SECRET')
        self.access_token = access_token or os.environ.get('TWITTER_ACCESS_TOKEN')
        self.access_token_secret = access_token_secret or os.environ.get('TWITTER_ACCESS_TOKEN_SECRET')
        
        # Create data directory if it doesn't exist
        os.makedirs('data', exist_ok=True)
        
    def clean_tweet(self, tweet):
        """
        Clean the tweet text for preprocessing
        """
        # Remove URLs
        tweet = re.sub(r'http\S+|www\S+|https\S+', '', tweet, flags=re.MULTILINE)
        # Remove user mentions
        tweet = re.sub(r'\@\w+|\#', '', tweet)
        # Remove special characters
        tweet = re.sub(r'[^\w\s]', '', tweet)
        # Convert to lowercase
        tweet = tweet.lower()
        return tweet

    def collect_election_tweets(self, keywords, count=100, save=True):
        """
        Collect tweets related to election based on keywords
        """
        print(f"Collecting {count} tweets for keywords: {keywords}")
        
        # In a real application, you would use the Twitter API here
        # For this example, we'll generate mock data
        
        # Generate sample tweet data
        tweets = self._generate_mock_tweets(keywords, count)
        
        if save:
            # Save to CSV
            filename = f"data/election_tweets_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            df = pd.DataFrame(tweets)
            df.to_csv(filename, index=False)
            print(f"Saved {len(tweets)} tweets to {filename}")
            
        return tweets
    
    def _generate_mock_tweets(self, keywords, count):
        """
        Generate mock tweets for development/testing
        """
        tweets = []
        candidate_a = "CandidateA"
        candidate_b = "CandidateB"
        
        # Sample text templates
        positive_templates = [
            "I really support {candidate}! Their policies on {issue} are excellent.",
            "Just watched {candidate}'s speech. Incredible vision for the country!",
            "{candidate} clearly won the debate. So impressed with their {issue} plan.",
            "Proud to be voting for {candidate} this November! We need their leadership.",
            "The latest poll showing {candidate} ahead makes me happy. They deserve it!"
        ]
        
        negative_templates = [
            "Can't believe anyone would vote for {candidate}. Their {issue} policy is terrible.",
            "{candidate} completely failed in the debate. Embarrassing performance.",
            "The corruption allegations against {candidate} are disturbing. We deserve better.",
            "{candidate}'s stance on {issue} is dangerous for our country.",
            "Polls showing {candidate} ahead must be rigged. No way they're winning."
        ]
        
        neutral_templates = [
            "Interested to hear more about {candidate}'s position on {issue}.",
            "Both candidates had good points in the debate, but {candidate} spoke more on {issue}.",
            "New poll shows {candidate} with a slight edge on {issue} topics.",
            "Will {candidate} address the {issue} crisis in their next speech?",
            "Fact checking {candidate}'s statements on {issue} - mixed results."
        ]
        
        issues = ["economy", "healthcare", "education", "foreign policy", "climate", "immigration", "taxes"]
        
        # Generate mock tweets
        for i in range(count):
            # Determine sentiment
            sentiment = i % 3  # 0: neutral, 1: positive, 2: negative
            
            # Alternate between candidates
            candidate = candidate_a if i % 2 == 0 else candidate_b
            
            # Select a random issue
            issue = issues[i % len(issues)]
            
            # Select a template based on sentiment
            if sentiment == 1:  # positive
                template = positive_templates[i % len(positive_templates)]
            elif sentiment == 2:  # negative
                template = negative_templates[i % len(negative_templates)]
            else:  # neutral
                template = neutral_templates[i % len(neutral_templates)]
            
            # Generate tweet text
            tweet_text = template.format(candidate=candidate, issue=issue)
            
            # Add some hashtags
            hashtags = [f"#{candidate}", f"#{issue}", "#Election2024"]
            tweet_text += " " + " ".join(hashtags[:2])
            
            # Create tweet object
            tweet = {
                "id": f"tweet_{i+1}",
                "text": tweet_text,
                "created_at": (datetime.now() - timedelta(hours=i % 24)).isoformat(),
                "user": {
                    "id": f"user_{i % 50 + 1}",
                    "screen_name": f"voter_{i % 50 + 1}",
                    "followers_count": (i * 13) % 10000
                },
                "retweet_count": i % 100,
                "favorite_count": (i * 2) % 200,
                "hashtags": hashtags,
                "mentions": []
            }
            
            tweets.append(tweet)
        
        return tweets
    
    def analyze_tweets(self, tweets, api_url="http://localhost:5000/api/analyze-batch"):
        """
        Send tweets to analysis API and get results
        """
        # Format tweets for API
        api_data = {
            "tweets": [{"id": tweet["id"], "text": tweet["text"]} for tweet in tweets]
        }
        
        try:
            # Make API request
            response = requests.post(api_url, json=api_data)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error from API: {response.status_code}")
                print(response.text)
                return None
        except Exception as e:
            print(f"Error connecting to API: {str(e)}")
            return None

if __name__ == "__main__":
    # Example usage
    collector = TweetCollector()
    
    # Collect tweets with election-related keywords
    keywords = ["election", "vote", "candidate", "CandidateA", "CandidateB", "policy", "debate"]
    tweets = collector.collect_election_tweets(keywords, count=100)
    
    # Analyze the tweets
    analysis_results = collector.analyze_tweets(tweets)
    
    if analysis_results:
        print("\nAnalysis Summary:")
        stats = analysis_results["stats"]
        print(f"Candidate A predicted votes: {stats['candidate_a_count']}")
        print(f"Candidate B predicted votes: {stats['candidate_b_count']}")
        print(f"Positive tweets: {stats['positive_count']}")
        print(f"Negative tweets: {stats['negative_count']}")
        print(f"Neutral tweets: {stats['neutral_count']}")