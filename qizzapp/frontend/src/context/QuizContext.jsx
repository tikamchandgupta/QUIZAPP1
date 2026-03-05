import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSocket } from './SocketContext';

const QuizContext = createContext();

export const QuizProvider = ({ children }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [allQuestions, setAllQuestions] = useState([]);
  const [undisplayedQuestions, setUndisplayedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('https://quizapp-imt6.onrender.com/api/quiz/leaderboard');
      if (response.data && Array.isArray(response.data.data)) {
        setLeaderboard(response.data.data);
      } else {
        console.error('Invalid leaderboard data format:', response.data);
        setLeaderboard([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching leaderboard:', err);
      setLeaderboard([]); // Set empty array on error
    }
  };

  const fetchAllQuestions = async () => {
    try {
      const response = await axios.get('https://quizapp-imt6.onrender.com/api/quiz/questions');
      setAllQuestions(response.data.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching all questions:', err);
    }
  };

  const fetchUndisplayedQuestions = async () => {
    try {
      const response = await axios.get('https://quizapp-imt6.onrender.com/api/quiz/questions/undisplayed');
      setUndisplayedQuestions(response.data.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching undisplayed questions:', err);
    }
  };

  const fetchCurrentQuestion = async () => {
    try {
      const response = await axios.get('https://quizapp-imt6.onrender.com/api/quiz/current-question');
      const { question, showAnswer: shouldShowAnswer } = response.data.data;
      setCurrentQuestion(question);
      setShowAnswer(shouldShowAnswer);
      if (question) {
        setCurrentAnswer(question.answer);
      }
    } catch (err) {
      console.error('Error fetching current question:', err);
    }
  };

  const getQuestion = async (playerId) => {
    try {
      const response = await axios.get(`https://quizapp-imt6.onrender.com/api/quiz/questions/${playerId}`);
      setCurrentQuestion(response.data.data);
      setShowAnswer(false);
      setCurrentAnswer(response.data.data.answer);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching question:', err);
    }
  };

  const sendCurrentQuestion = async (playerId) => {
    try {
      setLoading(true);
      const response = await axios.post('https://quizapp-imt6.onrender.com/api/quiz/send-question', {
        playerId
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error sending question:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async () => {
    try {
      setLoading(true);
      const response = await axios.post('https://quizapp-imt6.onrender.com/api/quiz/send-answer');
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error sending answer:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = async () => {
    try {
      setLoading(true);
      const response = await axios.post('https://quizapp-imt6.onrender.com/api/quiz/reset');
      setCurrentQuestion(null);
      setShowAnswer(false);
      setCurrentAnswer(null);
      await fetchUndisplayedQuestions();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error resetting quiz:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTeamScore = async (teamId, score) => {
    try {
      setLoading(true);
      const response = await axios.post('https://quizapp-imt6.onrender.com/api/quiz/score', {
        teamId,
        score
      });
      await fetchLeaderboard();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error updating score:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const incrementTeamScore = async (teamId, points = 1) => {
    try {
      setLoading(true);
      const response = await axios.post('https://quizapp-imt6.onrender.com/api/quiz/score/increment', {
        teamId,
        points
      });
      await fetchLeaderboard();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error incrementing score:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeQuestion = async (playerId) => {
    try {
      setLoading(true);
      const response = await axios.delete(`https://quizapp-imt6.onrender.com/api/quiz/questions/${playerId}`);
      await fetchAllQuestions();
      await fetchUndisplayedQuestions();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      console.error('Error removing question:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // WebSocket event listeners
  useEffect(() => {
    if (socket) {
      const handleCurrentQuestionUpdate = (data) => {
        setCurrentQuestion(data.question);
        setShowAnswer(data.showAnswer);
        if (data.question) {
          setCurrentAnswer(data.question.answer);
        }
      };

      const handleShowAnswerUpdate = (shouldShow) => {
        setShowAnswer(shouldShow);
      };

      const handleLeaderboardUpdate = (updatedLeaderboard) => {
        try {
          // Validate leaderboard data
          if (Array.isArray(updatedLeaderboard)) {
            setLeaderboard(updatedLeaderboard);
          } else {
            console.error('Invalid leaderboard data received:', updatedLeaderboard);
          }
        } catch (error) {
          console.error('Error handling leaderboard update:', error);
        }
      };

      const handleQuestionDisplayed = (playerId) => {
        setUndisplayedQuestions(prev => prev.filter(q => q.id !== playerId));
      };

      const handleQuizReset = () => {
        setCurrentQuestion(null);
        setShowAnswer(false);
        setCurrentAnswer(null);
        fetchUndisplayedQuestions();
      };

      socket.on('currentQuestionUpdate', handleCurrentQuestionUpdate);
      socket.on('showAnswerUpdate', handleShowAnswerUpdate);
      socket.on('leaderboardUpdate', handleLeaderboardUpdate);
      socket.on('questionDisplayed', handleQuestionDisplayed);
      socket.on('quizReset', handleQuizReset);

      return () => {
        socket.off('currentQuestionUpdate', handleCurrentQuestionUpdate);
        socket.off('showAnswerUpdate', handleShowAnswerUpdate);
        socket.off('leaderboardUpdate', handleLeaderboardUpdate);
        socket.off('questionDisplayed', handleQuestionDisplayed);
        socket.off('quizReset', handleQuizReset);
      };
    }
  }, [socket]);

  useEffect(() => {
    fetchLeaderboard();
    fetchAllQuestions();
    fetchUndisplayedQuestions();
    fetchCurrentQuestion();
  }, []);

  return (
    <QuizContext.Provider
      value={{
        leaderboard,
        currentQuestion,
        currentAnswer,
        showAnswer,
        allQuestions,
        undisplayedQuestions,
        loading,
        error,
        setShowAnswer,
        fetchLeaderboard,
        fetchAllQuestions,
        fetchUndisplayedQuestions,
        getQuestion,
        sendCurrentQuestion,
        sendAnswer,
        resetQuiz,
        updateTeamScore,
        incrementTeamScore,
        removeQuestion
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within QuizProvider');
  }
  return context;
};

