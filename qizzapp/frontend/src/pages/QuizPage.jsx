import React, { useEffect } from 'react';
import { Header } from '../components/Common';
import { QuestionDisplay, VisualLeaderboard } from '../components/QuizComponents';
import { useQuiz } from '../context/QuizContext';

export const QuizPage = () => {
  const { fetchUndisplayedQuestions } = useQuiz();

  useEffect(() => {
    fetchUndisplayedQuestions();
  }, []);

  return (
    <div className="quiz-page">
      <Header
        title="Quiz Round"
        subtitle="Questions & Leaderboard"
      />

      <div className="container">
        <div className="quiz-layout">
          <div className="quiz-main">
            <QuestionDisplay />
          </div>

          <div className="quiz-sidebar">
            <VisualLeaderboard />
          </div>
        </div>
      </div>
    </div>
  );
};
