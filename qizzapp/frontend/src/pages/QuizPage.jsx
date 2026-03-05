import React, { useEffect, useState } from 'react';
import { Header, Button } from '../components/Common';
import { QuestionDisplay, VisualLeaderboard } from '../components/QuizComponents';
import { useQuiz } from '../context/QuizContext';
import { getDisplayTeamName } from '../utils/teamNames';

export const QuizPage = () => {
  const { allQuestions, undisplayedQuestions, fetchUndisplayedQuestions } = useQuiz();
  const [hiddenQuestions, setHiddenQuestions] = useState(new Set());

  useEffect(() => {
    fetchUndisplayedQuestions();
  }, []);

  // Group all questions by team, excluding hidden ones
  const questionsByTeam = allQuestions.reduce((acc, question) => {
    if (hiddenQuestions.has(question.id)) return acc;
    
    const team = question.owner || 'Unassigned';
    if (!acc[team]) {
      acc[team] = [];
    }
    acc[team].push(question);
    return acc;
  }, {});

  const handleHideQuestion = (questionId) => {
    setHiddenQuestions(prev => new Set([...prev, questionId]));
  };

  const handleShowAllQuestions = () => {
    setHiddenQuestions(new Set());
  };

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

            {/* Questions by Team */}
            <div className="questions-by-team-section">
              <div className="section-header">
                <h3>All Team Questions</h3>
                {hiddenQuestions.size > 0 && (
                  <Button onClick={handleShowAllQuestions} variant="secondary" className="btn-sm">
                    Show All Hidden ({hiddenQuestions.size})
                  </Button>
                )}
              </div>
              {Object.entries(questionsByTeam).map(([teamName, questions]) => (
                <div key={teamName} className="team-questions-display">
                  <h4>{getDisplayTeamName(teamName)} ({questions.length} questions)</h4>
                  <div className="questions-grid">
                    {questions.map((question) => (
                      <div key={question.id} className="question-card">
                        <div className="question-card-header">
                          <div className="question-info">
                            <strong>{question.cricketer}</strong>
                            <Button
                              onClick={() => handleHideQuestion(question.id)}
                              variant="danger"
                              className="btn-xs hide-btn"
                              title="Hide this question"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                        <div className="question-card-body">
                          <p>{question.question}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(questionsByTeam).length === 0 && (
                <div className="no-questions">
                  <p>All questions are hidden. <button onClick={handleShowAllQuestions} className="link-btn">Show all</button></p>
                </div>
              )}
            </div>
          </div>

          <div className="quiz-sidebar">
            <VisualLeaderboard />
          </div>
        </div>
      </div>
    </div>
  );
};
