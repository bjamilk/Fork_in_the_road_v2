import React, { useState, useEffect, useRef } from 'react';
import { GameSession, TestQuestion, QuestionType, UserAnswerRecord, MatchingItem, DiagramLabel } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, AcademicCapIcon, UserIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface GameScreenProps {
  session: GameSession;
  onUpdateAnswer: (questionId: string, answerData: Partial<Omit<UserAnswerRecord, 'questionId'>>, timeTaken: number) => void; 
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const GameScreen: React.FC<GameScreenProps> = ({ 
  session,
  onUpdateAnswer,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = session.questions[currentQuestionIndex];
  const userAnswer = session.userAnswers[currentQuestion.id];
  const totalQuestions = session.questions.length;
  
  const [currentSelections, setCurrentSelections] = useState<string[]>([]);
  const [fillText, setFillText] = useState('');
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});
  const [shuffledAnswers, setShuffledAnswers] = useState<MatchingItem[] | DiagramLabel[]>([]);
  const [diagramSelections, setDiagramSelections] = useState<Record<string, string>>({});
  const [isAnswered, setIsAnswered] = useState(false);

  const questionViewStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    questionViewStartTimeRef.current = Date.now();
    const existingAnswer = session.userAnswers[currentQuestion.id];
    setIsAnswered(!!existingAnswer);
    setCurrentSelections(existingAnswer?.selectedOptionIds || []);
    setFillText(existingAnswer?.fillText || '');
    setMatchSelections(Object.fromEntries((existingAnswer?.matchingAnswers || []).map(m => [m.promptItemId, m.answerItemId])));
    setDiagramSelections(Object.fromEntries((existingAnswer?.diagramAnswers || []).map(d => [d.labelId, d.selectedLabelId])));
    
    if (currentQuestion.questionType === QuestionType.MATCHING && currentQuestion.matchingAnswerItems) {
        setShuffledAnswers(shuffleArray(currentQuestion.matchingAnswerItems));
    }
    if (currentQuestion.questionType === QuestionType.DIAGRAM_LABELING && currentQuestion.diagramLabels) {
        setShuffledAnswers(shuffleArray(currentQuestion.diagramLabels));
    }

  }, [currentQuestionIndex, currentQuestion.id, session.userAnswers]);

  const submitAnswer = (answerData: Partial<Omit<UserAnswerRecord, 'questionId'>>) => {
      if(isAnswered) return;
      const timeSpentSeconds = questionViewStartTimeRef.current 
        ? Math.round((Date.now() - questionViewStartTimeRef.current) / 1000) 
        : 0;
      onUpdateAnswer(currentQuestion.id, answerData, timeSpentSeconds);
      setIsAnswered(true);
  }

  const handleNextQuestion = () => {
      if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
      }
  }

  const renderOptions = (question: TestQuestion) => {
    if (!question.options) return null;
    return question.options.map((opt) => {
        const isSelected = currentSelections.includes(opt.id);
        const isCorrectOption = question.correctAnswerIds?.includes(opt.id);
        let optionClasses = `p-3 border rounded-lg transition-colors text-gray-800 dark:text-gray-200 ${isAnswered ? 'cursor-default' : 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70'}`;
        let icon = null;
        if(isAnswered) {
             if (isCorrectOption) {
                optionClasses += " bg-green-100 dark:bg-green-900/40 border-green-500 dark:border-green-600 text-green-700 dark:text-green-300";
                icon = <CheckCircleIcon className="w-5 h-5 ml-auto text-green-600 dark:text-green-400" />;
            } else if (isSelected && !isCorrectOption) {
                optionClasses += " bg-red-100 dark:bg-red-900/40 border-red-500 dark:border-red-600 text-red-700 dark:text-red-300";
                icon = <XCircleIcon className="w-5 h-5 ml-auto text-red-600 dark:text-red-400" />;
            } else {
                 optionClasses += " dark:border-gray-600 opacity-70";
            }
        } else {
            optionClasses += ` dark:border-gray-600 ${isSelected ? 'bg-blue-100 dark:bg-blue-900/60 border-blue-500 dark:border-blue-600 ring-2 ring-blue-400' : ''}`;
        }
        return (
            <li key={opt.id} onClick={() => !isAnswered && submitAnswer({ selectedOptionIds: [opt.id] })} className={`flex items-center ${optionClasses}`}>
                <span className="mr-2 text-sm font-medium flex-grow">{opt.text}</span> {icon}
            </li>
        );
    });
  };

  const userProgress = (Object.keys(session.userAnswers).length / totalQuestions) * 100;
  const opponentProgress = (Object.keys(session.opponentAnswers).length / totalQuestions) * 100;

  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {/* Game HUD */}
        <div className="mb-6 pb-4 border-b border-gray-300 dark:border-gray-700">
            <div className="flex justify-between items-center text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                <div className="flex items-center">
                    <img src={session.user.avatarUrl} alt={session.user.name} className="w-10 h-10 rounded-full border-2 border-blue-500"/>
                    <span className="ml-3">{session.user.name}</span>
                </div>
                <span className="text-red-500">VS</span>
                 <div className="flex items-center">
                    <span className="mr-3">{session.opponent.name}</span>
                    <img src={session.opponent.avatarUrl} alt={session.opponent.name} className="w-10 h-10 rounded-full border-2 border-gray-500"/>
                </div>
            </div>
            <div className="space-y-2">
                 <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>Score: {session.userScore}</span>
                        <span>Time: {session.userTime.toFixed(1)}s</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-4">
                        <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${userProgress}%` }}></div>
                    </div>
                 </div>
                 <div>
                     <div className="flex justify-between text-sm mb-1">
                        <span>Score: {session.opponentScore}</span>
                        <span>Time: {session.opponentTime.toFixed(1)}s</span>
                    </div>
                    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-4">
                        <div className="bg-gray-500 h-4 rounded-full" style={{ width: `${opponentProgress}%` }}></div>
                    </div>
                 </div>
            </div>
             <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
        </div>

        {/* Question Area */}
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                Question {currentQuestion.questionNumber}:
            </h2>
            <p className="text-md md:text-lg mb-4 whitespace-pre-wrap text-gray-800 dark:text-gray-200">{currentQuestion.questionStem}</p>
            {/* Render options based on type */}
             {[QuestionType.MULTIPLE_CHOICE_SINGLE, QuestionType.TRUE_FALSE].includes(currentQuestion.questionType!) && (
              <ul className="space-y-3">
                  {renderOptions(currentQuestion)}
              </ul>
            )}
             {isAnswered && (
              <div className="mt-4 p-3 rounded-md bg-gray-100 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">Explanation:</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-400 mt-1 whitespace-pre-wrap">{currentQuestion.explanation}</p>
              </div>
            )}
        </div>
        <div className="mt-auto pt-4 flex justify-center items-center flex-shrink-0">
            {isAnswered ? (
                <button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === totalQuestions - 1}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center font-semibold disabled:opacity-50"
                >
                    Next Question <ChevronRightIcon className="w-5 h-5 ml-2" />
                </button>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">Select an answer...</p>
            )}
        </div>
      </div>
    </div>
  );
};
