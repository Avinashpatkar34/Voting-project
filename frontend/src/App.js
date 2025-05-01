import React, { useState, useEffect } from 'react';
import './App.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         PieChart, Pie, Cell, LineChart, Line } from 'recharts';

function App() {
  const [tweet, setTweet] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [activeTab, setActiveTab] = useState('singleAnalysis');
  const [mockTweets, setMockTweets] = useState([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [keywordInput, setKeywordInput] = useState('election, vote, candidate');
  const [tweetCount, setTweetCount] = useState(50);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const API_URL = 'http://127.0.0.1:5000/api';

  useEffect(() => {
    // Check if the API is running
    fetch(`${API_URL}/status`)
      .then(response => {
        if (!response.ok) {
          throw new Error('API is not available');
        }
        return response.json();
      })
      .then(data => {
        console.log('API status:', data);
      })
      .catch(err => {
        setError('The backend API is not available. Please make sure it is running.');
        console.error('API error:', err);
      });
  }, []);

  const analyzeTweet = async () => {
    if (!tweet.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: tweet }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze tweet');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const collectAndAnalyzeTweets = async () => {
    setIsCollecting(true);
    setError(null);
    
    try {
      // Generate mock tweets on the frontend for demo
      const keywords = keywordInput.split(',').map(k => k.trim());
      const generatedTweets = generateMockTweets(keywords, tweetCount);
      setMockTweets(generatedTweets);
      
      // Send tweets for analysis
      const response = await fetch(`${API_URL}/analyze-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          tweets: generatedTweets.map(tweet => ({ 
            id: tweet.id, 
            text: tweet.text 
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze tweets');
      }

      const data = await response.json();
      setBatchData(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
      console.error('Batch analysis error:', err);
    } finally {
      setIsCollecting(false);
    }
  };

  // Generate mock tweets for frontend demo
  const generateMockTweets = (keywords, count) => {
    const tweets = [];
    
    const candidateA = "CandidateA";
    const candidateB = "CandidateB";
    
    const templates = [
      "I support {candidate}! Their policies on {issue} are excellent.",
      "Just watched {candidate}'s speech. Incredible vision!",
      "{candidate} is terrible on {issue}. Can't support them.",
      "Why would anyone vote for {candidate}? Their {issue} stance is wrong.",
      "Not sure about {candidate}'s position on {issue}. Need more info.",
      "Both candidates have flaws, but {candidate} is better on {issue}.",
      "{candidate} has my vote! Best plan for {issue}.",
      "Latest poll shows {candidate} ahead on {issue} topics.",
      "Disappointed in {candidate}'s response to {issue} questions.",
      "Can {candidate} actually deliver on their {issue} promises?"
    ];
    
    const issues = ["economy", "healthcare", "education", "taxes", "climate", "jobs"];
    
    for (let i = 0; i < count; i++) {
      const candidate = i % 2 === 0 ? candidateA : candidateB;
      const template = templates[i % templates.length];
      const issue = issues[i % issues.length];
      
      const tweetText = template.replace('{candidate}', candidate).replace('{issue}', issue);
      
      tweets.push({
        id: `tweet_${i+1}`,
        text: tweetText,
        timestamp: new Date(Date.now() - i * 1000 * 60).toISOString()
      });
    }
    
    return tweets;
  };

  const getSentimentColorClass = (sentiment) => {
    if (!sentiment) return '';
    if (sentiment === 'Positive') return 'text-green-600';
    if (sentiment === 'Negative') return 'text-red-600';
    return 'text-gray-600';
  };

  const renderSentimentAnalysis = () => {
    if (!analysis) return null;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Analysis Results</h2>
        
        <div className="mb-4">
          <p><span className="font-semibold">Text:</span> {analysis.text}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Sentiment Analysis</h3>
            <p>
              <span className="font-medium">Sentiment:</span> 
              <span className={getSentimentColorClass(analysis.sentiment)}>
                {analysis.sentiment}
              </span>
            </p>
            <div className="mt-2 bg-gray-200 h-4 rounded-full overflow-hidden">
              <div 
                className={`h-full ${analysis.sentiment === 'Positive' ? 'bg-green-500' : 
                                     analysis.sentiment === 'Negative' ? 'bg-red-500' : 'bg-gray-500'}`}
                style={{ width: `${Math.abs(analysis.sentiment_score * 100)}%` }}
              ></div>
            </div>
            <p className="text-sm mt-1">Sentiment score: {analysis.sentiment_score.toFixed(2)}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Voting Prediction</h3>
            <p><span className="font-medium">Predicted vote:</span> Candidate {analysis.predicted_vote}</p>
            <p><span className="font-medium">Confidence:</span> {analysis.confidence.toFixed(1)}%</p>
            <div className="mt-2 bg-gray-200 h-4 rounded-full overflow-hidden">
              <div 
                className={`h-full ${analysis.predicted_vote === 'A' ? 'bg-blue-500' : 'bg-red-500'}`}
                style={{ width: `${analysis.confidence}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSingleAnalysis = () => {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Analyze Single Tweet</h2>
        
        <div className="mb-6">
          <label htmlFor="tweet-input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter a tweet or social media post
          </label>
          <textarea
            id="tweet-input"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows="4"
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
            placeholder="Enter text for analysis..."
          />
          <button
            className="mt-3 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={analyzeTweet}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {renderSentimentAnalysis()}
      </div>
    );
  };

  const renderBatchAnalysis = () => {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Batch Analysis</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-xl font-bold mb-4">Data Collection</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-2">
                Keywords (comma separated)
              </label>
              <input
                id="keywords"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="tweet-count" className="block text-sm font-medium text-gray-700 mb-2">
                Number of tweets to collect
              </label>
              <input
                id="tweet-count"
                type="number"
                min="10"
                max="1000"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={tweetCount}
                onChange={(e) => setTweetCount(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>
          
          <button
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={collectAndAnalyzeTweets}
            disabled={isCollecting}
          >
            {isCollecting ? 'Processing...' : 'Collect & Analyze Tweets'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {batchData && renderBatchResults()}
      </div>
    );
  };

  const renderBatchResults = () => {
    if (!batchData || !batchData.stats) return null;
    
    const { stats } = batchData;
    
    // Prepare data for charts
    const candidateData = [
      { name: 'Candidate A', value: stats.candidate_a_count },
      { name: 'Candidate B', value: stats.candidate_b_count },
    ];
    
    const sentimentData = [
      { name: 'Positive', value: stats.positive_count },
      { name: 'Neutral', value: stats.neutral_count },
      { name: 'Negative', value: stats.negative_count },
    ];
    
    // Prepare timeline data - group by candidate and calculate trends
    const timelineTweets = [...batchData.results].sort((a, b) => a.id.localeCompare(b.id));
    
    // Calculate moving averages for sentiment
    const movingAverageWindow = 5;
    const candidateATrend = [];
    const candidateBTrend = [];
    
    for (let i = 0; i < timelineTweets.length; i += movingAverageWindow) {
      const window = timelineTweets.slice(i, i + movingAverageWindow);
      const aTweets = window.filter(t => t.predicted_vote === 'A');
      const bTweets = window.filter(t => t.predicted_vote === 'B');
      
      const aAvgSentiment = aTweets.length ? 
        aTweets.reduce((sum, t) => sum + t.sentiment_score, 0) / aTweets.length : 0;
      
      const bAvgSentiment = bTweets.length ? 
        bTweets.reduce((sum, t) => sum + t.sentiment_score, 0) / bTweets.length : 0;
      
      const timePoint = `Point ${Math.floor(i/movingAverageWindow) + 1}`;
      
      candidateATrend.push({
        name: timePoint,
        sentiment: aAvgSentiment,
      });
      
      candidateBTrend.push({
        name: timePoint,
        sentiment: bAvgSentiment,
      });
    }
    
    // Combined data for line chart
    const trendData = candidateATrend.map((point, idx) => ({
      name: point.name,
      'Candidate A': point.sentiment,
      'Candidate B': candidateBTrend[idx] ? candidateBTrend[idx].sentiment : 0,
    }));
    
    // Recent analyzed tweets
    const recentTweets = batchData.results.slice(0, 5);
    
    return (
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Candidate Distribution Chart */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">Predicted Voting Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={candidateData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {candidateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#0088FE' : '#FF8042'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">
                Candidate A: {stats.candidate_a_count} votes ({((stats.candidate_a_count / (stats.candidate_a_count + stats.candidate_b_count)) * 100).toFixed(1)}%)
                <br />
                Candidate B: {stats.candidate_b_count} votes ({((stats.candidate_b_count / (stats.candidate_a_count + stats.candidate_b_count)) * 100).toFixed(1)}%)
              </p>
            </div>
          </div>
          
          {/* Sentiment Distribution Chart */}
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3">Sentiment Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sentimentData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Count">
                    {sentimentData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? '#00C49F' : index === 1 ? '#FFBB28' : '#FF8042'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">
                Total tweets analyzed: {batchData.results.length}
              </p>
            </div>
          </div>
        </div>
        
        {/* Sentiment Trend Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-3">Sentiment Trend by Candidate</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[-1, 1]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Candidate A" stroke="#0088FE" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Candidate B" stroke="#FF8042" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              Average sentiment - Candidate A: {stats.avg_sentiment_a.toFixed(2)}, 
              Candidate B: {stats.avg_sentiment_b.toFixed(2)}
            </p>
          </div>
        </div>
        
        {/* Recent Tweets List */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3">Sample Analyzed Tweets</h3>
          <div className="overflow-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vote</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTweets.map((tweet, idx) => (
                  <tr key={tweet.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tweet.text}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${getSentimentColorClass(tweet.sentiment)}`}>
                      {tweet.sentiment}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Candidate {tweet.predicted_vote}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tweet.confidence.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold">Election Sentiment Analyzer</h1>
          <p className="mt-2">Analyze sentiment and voting intentions from social media posts</p>
        </div>
      </header>
      
      <div className="container mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'singleAnalysis'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('singleAnalysis')}
              >
                Single Analysis
              </button>
              <button
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'batchAnalysis'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('batchAnalysis')}
              >
                Batch Analysis
              </button>
            </nav>
          </div>
        </div>
        
        {activeTab === 'singleAnalysis' ? renderSingleAnalysis() : renderBatchAnalysis()}
      </div>
      
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>Election Sentiment Analysis Dashboard © 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default App;