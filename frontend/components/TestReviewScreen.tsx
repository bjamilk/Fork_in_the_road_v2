
import React from 'react';
import { TestResult, QuestionType, UserAnswerRecord, Message, TestQuestion, TestConfig } from '../types';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ArrowLeftOnRectangleIcon, ChartBarIcon, ArrowPathIcon, AcademicCapIcon } from '@heroicons/react/24/solid';

interface TestReviewScreenProps {
  results: TestResult; 
  onExit: () => void;
  onNavigateToDashboard: () => void;
  onRetakeTest: (config: TestConfig) => void;
  onPracticeFailedQuestions: (failedQuestions: TestQuestion[]) => void;
}

const TestReviewScreen: React.FC<TestReviewScreenProps> = ({ results, onExit, onNavigateToDashboard, onRetakeTest, onPracticeFailedQuestions }) => {
  const { session, score, totalQuestions, correctAnswersCount } = results;
  
  const scoreColor = score >= 70 ? 'text-green-600 dark:text-green-400' : score >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400';

  const failedQuestions = session.questions.filter(q => !session.userAnswers[q.id]?.isCorrect);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 overflow-y-auto">
      <div className="mb-6 pb-4 border-b border-gray-300 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-2xl md:text-3xl font-semibold text-blue-700 dark:text-blue-400 mb-2 sm:mb-0">Test Review</h1>
            <div className="flex space-x-2">
                <button
                    onClick={onNavigateToDashboard}
                    className="px-3 py-2 bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white rounded-md focus:ring-2 focus:ring-teal-400 dark:focus:ring-teal-500 focus:ring-offset-2 flex items-center text-sm"
                    aria-label="View Dashboard"
                >
                    <ChartBarIcon className="w-5 h-5 mr-1.5" /> Dashboard
                </button>
                <button
                    onClick={onExit}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:ring-offset-2 flex items-center text-sm"
                    aria-label="Return to Chat"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-1.5" /> Return to Chat
                </button>
            </div>
        </div>
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col md:flex-row justify-around items-center space-y-3 md:space-y-0 md:space-x-4">
            <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Your Score</p>
                <p className={`text-3xl font-bold ${scoreColor}`}>{score.toFixed(1)}%</p>
            </div>
             <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Correct Answers</p>
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">{correctAnswersCount} / {totalQuestions}</p>
            </div>
            {/* Display Group Name - Ensure dark mode text color for group name */}
            <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Group</p>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 truncate max-w-[150px] md:max-w-xs" title={session.config.groupId}>
                    {session.config.groupId} 
                </p>
            </div>
        </div>
      </div>
      
      {/* Next Steps Section */}
      <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Next Steps</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onRetakeTest(session.config)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center justify-center text-sm font-medium"
            aria-label="Retake this test with similar settings"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Retake Test
          </button>
          <button
            onClick={() => onPracticeFailedQuestions(failedQuestions)}
            disabled={failedQuestions.length === 0}
            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-md focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 flex items-center justify-center text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={`Practice the ${failedQuestions.length} questions you failed`}
          >
            <AcademicCapIcon className="w-5 h-5 mr-2" />
            Practice Failed Questions ({failedQuestions.length})
          </button>
        </div>
        {failedQuestions.length === 0 && (
            <p className="text-xs text-center mt-2 text-green-600 dark:text-green-400">Perfect score! No questions to practice.</p>
        )}
      </div>

      <div className="space-y-6">
        {session.questions.map((question, index) => {
          const userAnswerRecord = session.userAnswers[question.id];
          const isCorrect = userAnswerRecord?.isCorrect;
          
          const wasAnswered = userAnswerRecord && (
              (userAnswerRecord.selectedOptionIds && userAnswerRecord.selectedOptionIds.length > 0) || 
              (userAnswerRecord.fillText && userAnswerRecord.fillText.trim() !== '') ||
              (userAnswerRecord.matchingAnswers && userAnswerRecord.matchingAnswers.length > 0) ||
              (userAnswerRecord.diagramAnswers && userAnswerRecord.diagramAnswers.length > 0)
          );

          return (
            <div key={question.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <h2 className="text-md font-semibold mb-2 text-gray-900 dark:text-gray-100"> 
                Question {index + 1}: {isCorrect ? 
                <CheckCircleIcon className="w-5 h-5 inline-block ml-2 text-green-500 dark:text-green-400" /> : 
                (wasAnswered ? <XCircleIcon className="w-5 h-5 inline-block ml-2 text-red-500 dark:text-red-400" /> : <InformationCircleIcon className="w-5 h-5 inline-block ml-2 text-yellow-500 dark:text-yellow-400" />)
                }
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">{question.questionStem}</p>

              {question.imageUrl && question.questionType !== QuestionType.DIAGRAM_LABELING && (
                <div className="my-3 flex justify-center">
                    <img 
                        src={question.imageUrl} 
                        alt="Question visual" 
                        className="max-w-xs h-auto rounded-md border border-gray-300 dark:border-gray-600 shadow"
                        style={{ maxHeight: '200px' }}
                    />
                </div>
              )}

              {question.questionType === QuestionType.FILL_IN_THE_BLANK && (
                <div className="space-y-2 mb-3">
                  <div className="p-2 border dark:border-gray-600 rounded-md text-sm">
                    <span className="font-semibold text-gray-600 dark:text-gray-400">Your Answer: </span>
                    <span className={`italic ${!userAnswerRecord?.fillText?.trim() ? 'text-gray-500' : isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      {userAnswerRecord?.fillText?.trim() ? userAnswerRecord.fillText : 'Not Answered'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div className="p-2 border border-green-400 dark:border-green-600 rounded-md text-sm bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                      <span className="font-semibold">Acceptable Answer(s): </span>
                      <span>{question.acceptableAnswers?.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {[QuestionType.MULTIPLE_CHOICE_SINGLE, QuestionType.TRUE_FALSE, QuestionType.MULTIPLE_CHOICE_MULTIPLE].includes(question.questionType!) && question.options && (
                <div className="space-y-2 mb-3">
                    {question.options.map(opt => {
                        const userSelectedIds = userAnswerRecord?.selectedOptionIds || [];
                        const correctOptionIds = question.correctAnswerIds || [];
                        const isUserSelected = userSelectedIds.includes(opt.id);
                        const isCorrectOption = correctOptionIds.includes(opt.id);
                        let classes = "p-2 border dark:border-gray-600 rounded-md text-sm";
                        let annotation = null;
                        
                        if (isCorrectOption) {
                            classes += " bg-green-50 dark:bg-green-900/40 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 font-medium";
                            if (!isUserSelected) annotation = <span className="text-xs font-normal ml-2 text-green-700 dark:text-green-300">(Correct Answer - Missed)</span>;
                        }
                        if (isUserSelected) {
                            if (isCorrectOption) {
                                annotation = <span className="text-xs font-normal ml-2 text-green-700 dark:text-green-300">(Your Answer - Correct)</span>;
                            } else {
                                classes += " bg-red-50 dark:bg-red-900/40 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 line-through";
                                annotation = <span className="text-xs font-normal ml-2 text-red-700 dark:text-red-300">(Your Answer - Incorrect)</span>;
                            }
                        } else if (!isCorrectOption) {
                            classes += " text-gray-600 dark:text-gray-400";
                        }
                        
                        return (
                            <div key={opt.id} className={classes}>
                                {opt.text}
                                {annotation}
                            </div>
                        );
                    })}
                    {!wasAnswered && (
                        <p className="p-2 border dark:border-yellow-600 rounded-md text-sm bg-yellow-50 dark:bg-yellow-900/40 border-yellow-400 text-yellow-700 dark:text-yellow-300">
                            Not Answered.
                        </p>
                    )}
                </div>
              )}
              
              {question.questionType === QuestionType.MATCHING && (
                <div className="space-y-2 mb-3">
                    {question.matchingPromptItems?.map(prompt => {
                        const correctAnswer = question.correctMatches?.find(m => m.promptItemId === prompt.id);
                        const userAnswer = userAnswerRecord?.matchingAnswers?.find(m => m.promptItemId === prompt.id);
                        const isMatchCorrect = correctAnswer?.answerItemId === userAnswer?.answerItemId;
                        const correctAnswerText = question.matchingAnswerItems?.find(a => a.id === correctAnswer?.answerItemId)?.text || 'N/A';
                        const userAnswerText = question.matchingAnswerItems?.find(a => a.id === userAnswer?.answerItemId)?.text;

                        return (
                            <div key={prompt.id} className="p-2 border dark:border-gray-600 rounded-md text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{prompt.text}</span>
                                    {isMatchCorrect ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <XCircleIcon className="w-5 h-5 text-red-500" />}
                                </div>
                                <div className="pl-4 mt-1">
                                    <p>Your answer: <span className={`italic ${isMatchCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{userAnswerText || <span className="text-gray-500">Not answered</span>}</span></p>
                                    {!isMatchCorrect && <p>Correct answer: <span className="italic text-green-700 dark:text-green-300">{correctAnswerText}</span></p>}
                                </div>
                            </div>
                        );
                    })}
                     {!wasAnswered && (
                        <p className="p-2 border dark:border-yellow-600 rounded-md text-sm bg-yellow-50 dark:bg-yellow-900/40 border-yellow-400 text-yellow-700 dark:text-yellow-300">
                            Not Answered.
                        </p>
                    )}
                </div>
              )}

              {question.questionType === QuestionType.DIAGRAM_LABELING && (
                <div className="space-y-2 mb-3">
                   <div className="relative w-full max-w-md mx-auto border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <img src={question.imageUrl} alt="Diagram" className="w-full h-auto" />
                      {question.diagramLabels?.map((label, index) => (
                          <div 
                              key={label.id} 
                              className="absolute -translate-x-1/2 -translate-y-1/2" 
                              style={{ left: `${label.x}%`, top: `${label.y}%` }}
                          >
                              <div className="relative flex items-center justify-center w-6 h-6 bg-red-600 text-white font-bold text-xs rounded-full shadow-lg ring-2 ring-white">
                                  {index + 1}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                    {question.diagramLabels?.map((label, index) => {
                       const userAnswer = userAnswerRecord?.diagramAnswers?.find(a => a.labelId === label.id);
                       const selectedLabelText = question.diagramLabels?.find(l => l.id === userAnswer?.selectedLabelId)?.text;
                       const isLabelCorrect = label.id === userAnswer?.selectedLabelId;

                       return (
                         <div key={label.id} className="text-sm p-2 border-l-4 dark:bg-gray-700/50 rounded" style={{borderColor: isLabelCorrect ? '#22c55e' : '#ef4444'}}>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                              <span className="inline-flex items-center justify-center w-5 h-5 mr-2 bg-red-600 text-white font-bold text-xs rounded-full">{index+1}</span>
                              {label.text}
                            </p>
                            <p className="pl-7">
                                Your answer: 
                                <span className={`italic ml-1 ${isLabelCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                    {selectedLabelText || <span className="text-gray-500">Not Answered</span>}
                                </span>
                            </p>
                         </div>
                       )
                    })}
                  </div>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 flex items-center">
                    <InformationCircleIcon className="w-5 h-5 mr-1 text-blue-500 dark:text-blue-400" /> Explanation:
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">{question.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>
       <div className="mt-8 text-center">
         <button
            onClick={onExit}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:ring-offset-2 flex items-center text-base mx-auto"
            >
             <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" /> Return to Chat
            </button>
      </div>
    </div>
  );
};

export default TestReviewScreen;
