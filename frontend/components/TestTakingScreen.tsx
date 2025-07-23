
import React, { useState, useEffect, useRef } from 'react';
import { TestSessionData, StudySessionData, TestQuestion, QuestionType, UserAnswerRecord, MatchingItem, DiagramLabel } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon as CheckCircleSolid, XCircleIcon as XCircleSolid, AcademicCapIcon, QuestionMarkCircleIcon, ClockIcon, BookmarkIcon as BookmarkOutlineIcon, ArrowsRightLeftIcon, ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import VoiceInputButton from './VoiceInputButton';

interface TestTakingScreenProps {
  mode: 'test' | 'study';
  session: TestSessionData | StudySessionData;
  onUpdateAnswer: (questionId: string, answerData: Partial<Omit<UserAnswerRecord, 'questionId'>>) => void; 
  onChangeQuestion: (newIndex: number) => void;
  onToggleBookmark: (questionId: string) => void;
  onSubmitTest?: () => void;
  onSubmitOfflineTest?: () => void;
  onEndSession?: () => void;
}

const formatTime = (totalSeconds: number): string => {
  if (totalSeconds < 0) totalSeconds = 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const TestTakingScreen: React.FC<TestTakingScreenProps> = ({ 
  mode,
  session,
  onUpdateAnswer,
  onChangeQuestion,
  onToggleBookmark,
  onSubmitTest,
  onSubmitOfflineTest,
  onEndSession,
}) => {
  const [isReviewMode, setIsReviewMode] = useState(false);
  const currentQuestion = session.questions[session.currentQuestionIndex];
  const userAnswer = session.userAnswers[currentQuestion.id];
  const totalQuestions = session.questions.length;
  
  const [currentSelections, setCurrentSelections] = useState<string[]>([]);
  const [fillText, setFillText] = useState('');
  const [timeLeftDisplay, setTimeLeftDisplay] = useState<string | null>(null);
  const [matchSelections, setMatchSelections] = useState<Record<string, string>>({});
  const [shuffledAnswers, setShuffledAnswers] = useState<MatchingItem[] | DiagramLabel[]>([]);
  const [diagramSelections, setDiagramSelections] = useState<Record<string, string>>({});

  const questionViewStartTimeRef = useRef<number | null>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    questionViewStartTimeRef.current = Date.now();
    setCurrentSelections(userAnswer?.selectedOptionIds || []);
    setFillText(userAnswer?.fillText || '');
    
    setMatchSelections(Object.fromEntries((userAnswer?.matchingAnswers || []).map(m => [m.promptItemId, m.answerItemId])));
    setDiagramSelections(Object.fromEntries((userAnswer?.diagramAnswers || []).map(d => [d.labelId, d.selectedLabelId])));
    
    if (currentQuestion.questionType === QuestionType.MATCHING && currentQuestion.matchingAnswerItems) {
        setShuffledAnswers(shuffleArray(currentQuestion.matchingAnswerItems));
    }
    if (currentQuestion.questionType === QuestionType.DIAGRAM_LABELING && currentQuestion.diagramLabels) {
        setShuffledAnswers(shuffleArray(currentQuestion.diagramLabels));
    }

  }, [session.currentQuestionIndex, currentQuestion.id, userAnswer]);


  useEffect(() => {
    if (mode === 'test' && session.endTime && (onSubmitTest || onSubmitOfflineTest)) {
      const calculateTimeLeft = () => {
        const now = new Date().getTime();
        const endTimeMs = session.endTime!.getTime(); 
        const diff = Math.round((endTimeMs - now) / 1000);
        
        if (diff <= 0) {
          setTimeLeftDisplay(formatTime(0));
          if (session.isOffline && onSubmitOfflineTest) onSubmitOfflineTest();
          else if (!session.isOffline && onSubmitTest) onSubmitTest();
          return 0; 
        }
        setTimeLeftDisplay(formatTime(diff));
        return diff;
      };

      if (calculateTimeLeft() <= 0) return; 

      const timerId = setInterval(() => {
        if (calculateTimeLeft() <= 0) {
          clearInterval(timerId);
        }
      }, 1000);

      return () => clearInterval(timerId);
    } else {
      setTimeLeftDisplay(null);
    }
  }, [mode, session.endTime, onSubmitTest, onSubmitOfflineTest, session.isOffline, session.currentQuestionIndex]);
  
  useEffect(() => {
    if (paletteRef.current) {
      const currentButton = paletteRef.current.querySelector(`[data-qindex="${session.currentQuestionIndex}"]`) as HTMLElement;
      if (currentButton) {
        currentButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [session.currentQuestionIndex]);

  const handleInitiateSubmit = () => {
    if (mode === 'test') {
      setIsReviewMode(true);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (mode === 'study' && userAnswer?.isCorrect !== undefined) {
      return;
    }

    const newSelections = [optionId];
    setCurrentSelections(newSelections);

    const timeSpentSeconds = questionViewStartTimeRef.current 
      ? Math.round((Date.now() - questionViewStartTimeRef.current) / 1000) 
      : undefined;
    onUpdateAnswer(currentQuestion.id, { selectedOptionIds: newSelections, timeSpentSeconds });
  };
  
  const handleMultiOptionSelect = (optionId: string) => {
    if (mode === 'study' && userAnswer?.isCorrect !== undefined) {
        return;
    }
    const newSelections = currentSelections.includes(optionId)
        ? currentSelections.filter(id => id !== optionId)
        : [...currentSelections, optionId];
    
    setCurrentSelections(newSelections);

    if(mode === 'test') {
        const timeSpentSeconds = questionViewStartTimeRef.current 
            ? Math.round((Date.now() - questionViewStartTimeRef.current) / 1000) 
            : undefined;
        onUpdateAnswer(currentQuestion.id, { selectedOptionIds: newSelections, timeSpentSeconds });
    }
  };

  const handleFillTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === 'study' && userAnswer?.isCorrect !== undefined) {
        return;
    }
    const newText = e.target.value;
    setFillText(newText);

    if (mode === 'test') {
        const timeSpentSeconds = questionViewStartTimeRef.current 
            ? Math.round((Date.now() - questionViewStartTimeRef.current) / 1000) 
            : undefined;
        onUpdateAnswer(currentQuestion.id, { fillText: newText, timeSpentSeconds });
    }
  };

  const submitFillTextAnswer = () => {
    if (mode !== 'study' || userAnswer?.isCorrect !== undefined) return;
    
    const timeSpentSeconds = questionViewStartTimeRef.current 
        ? Math.round((Date.now() - questionViewStartTimeRef.current) / 1000) 
        : undefined;
    onUpdateAnswer(currentQuestion.id, { fillText, timeSpentSeconds });
  };

  const submitMultiSelectAnswer = () => {
    if (mode === 'study' && userAnswer?.isCorrect === undefined) {
        const timeSpentSeconds = questionViewStartTimeRef.current 
            ? Math.round((Date.now() - questionViewStartTimeRef.current) / 1000) 
            : undefined;
        onUpdateAnswer(currentQuestion.id, { selectedOptionIds: currentSelections, timeSpentSeconds });
    }
  };

  const handleMatchSelect = (promptItemId: string, answerItemId: string) => {
      if (mode === 'study' && userAnswer?.isCorrect !== undefined) return;

      const newMatchSelections = {
          ...matchSelections,
          [promptItemId]: answerItemId,
      };
      setMatchSelections(newMatchSelections);

      if (mode === 'test') {
          const matchingAnswers = Object.entries(newMatchSelections)
            .filter(([, answerId]) => answerId) // only include answered ones
            .map(([promptId, answerId]) => ({ promptItemId: promptId, answerItemId: answerId }));
          
          const timeSpentSeconds = questionViewStartTimeRef.current 
              ? Math.round((Date.now() - questionViewStartTimeRef.current) / 1000) 
              : undefined;
          
          onUpdateAnswer(currentQuestion.id, { matchingAnswers, timeSpentSeconds });
      }
  };
  
  const submitMatchingAnswer = () => {
      if (mode !== 'study' || userAnswer?.isCorrect !== undefined) return;
      
      const matchingAnswers = Object.entries(matchSelections)
          .map(([promptItemId, answerItemId]) => ({ promptItemId, answerItemId }));
          
      const timeSpentSeconds = questionViewStartTimeRef.current 
          ? Math.round((Date.now() - questionViewStartTimeRef.current) / 1000) 
          : undefined;
          
      onUpdateAnswer(currentQuestion.id, { matchingAnswers, timeSpentSeconds });
  };

  const handleDiagramLabelSelect = (labelId: string, selectedLabelId: string) => {
    if (mode === 'study' && userAnswer?.isCorrect !== undefined) return;
    
    const newDiagramSelections = {...diagramSelections, [labelId]: selectedLabelId};
    setDiagramSelections(newDiagramSelections);

    if(mode === 'test') {
        const diagramAnswers = Object.entries(newDiagramSelections)
            .filter(([,selId]) => selId)
            .map(([lblId, selId]) => ({labelId: lblId, selectedLabelId: selId}));
        
        const timeSpentSeconds = questionViewStartTimeRef.current 
              ? Math.round((Date.now() - questionViewStartTimeRef.current) / 1000) 
              : undefined;
        onUpdateAnswer(currentQuestion.id, { diagramAnswers, timeSpentSeconds });
    }
  };

  const submitDiagramAnswer = () => {
    if (mode !== 'study' || userAnswer?.isCorrect !== undefined) return;
    const diagramAnswers = Object.entries(diagramSelections)
            .map(([labelId, selectedLabelId]) => ({labelId, selectedLabelId}));

    const timeSpentSeconds = questionViewStartTimeRef.current 
            ? Math.round((Date.now() - questionViewStartTimeRef.current) / 1000) 
            : undefined;
            
    onUpdateAnswer(currentQuestion.id, { diagramAnswers, timeSpentSeconds });
  };


  const renderOptions = (question: TestQuestion, currentAnswerRecord?: UserAnswerRecord) => {
    if (!question.options) return null;

    const isMultiChoice = question.questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE;
    const isStudyModeAnswered = mode === 'study' && currentAnswerRecord?.isCorrect !== undefined;
    
    return question.options.map((opt) => {
      let optionClasses = "p-3 border rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700/70 transition-colors text-gray-800 dark:text-gray-200";
      let icon = null;
      const isSelected = currentSelections.includes(opt.id);
      const isCorrectOption = question.correctAnswerIds?.includes(opt.id);

      if (!isStudyModeAnswered) {
          optionClasses += " cursor-pointer";
          if (isSelected) {
            optionClasses = `${optionClasses} bg-blue-100 dark:bg-blue-900/60 border-blue-500 dark:border-blue-600 ring-2 ring-blue-400 dark:ring-blue-500`; 
          }
      } else { 
          optionClasses += " cursor-default";
          if (isCorrectOption) {
              optionClasses = `${optionClasses} bg-green-100 dark:bg-green-900/40 border-green-500 dark:border-green-600 text-green-700 dark:text-green-300`;
              icon = <CheckCircleSolid className="w-5 h-5 ml-auto text-green-600 dark:text-green-400" />;
          } else if (isSelected && !isCorrectOption) {
              optionClasses = `${optionClasses} bg-red-100 dark:bg-red-900/40 border-red-500 dark:border-red-600 text-red-700 dark:text-red-300`;
              icon = <XCircleSolid className="w-5 h-5 ml-auto text-red-600 dark:text-red-400" />;
          } else {
              optionClasses = `${optionClasses} opacity-70 dark:opacity-60`;
          }
      }

      return (
        <li
          key={opt.id}
          onClick={() => isMultiChoice ? handleMultiOptionSelect(opt.id) : handleOptionSelect(opt.id)}
          className={`flex items-center ${optionClasses}`}
          aria-checked={isSelected}
          role={isMultiChoice ? "checkbox" : "radio"} 
          tabIndex={isStudyModeAnswered ? -1 : 0} 
          onKeyDown={isStudyModeAnswered ? undefined : (e) => (e.key === 'Enter' || e.key === ' ') && (isMultiChoice ? handleMultiOptionSelect(opt.id) : handleOptionSelect(opt.id))}
        >
          {isMultiChoice && <input type="checkbox" checked={isSelected} readOnly className="h-4 w-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 mr-3" />}
          <span className="mr-2 text-sm font-medium flex-grow">{opt.text}</span> 
          {icon}
        </li>
      );
    });
  };
  
  const headerText = mode === 'test' ? (session.isOffline ? 'Offline Test' : 'Test in Progress') : (session.isOffline ? 'Offline Study' : 'Study Session');
  const headerIcon = mode === 'test' ? 
    <QuestionMarkCircleIcon className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" /> : 
    <AcademicCapIcon className="w-8 h-8 mr-3 text-green-600 dark:text-green-400" />;

  const isCurrentBookmarked = userAnswer?.isBookmarked || false;
  const BookmarkToggleIcon = isCurrentBookmarked ? BookmarkSolidIcon : BookmarkOutlineIcon;

  if (isReviewMode && mode === 'test') {
    const answeredCount = Object.values(session.userAnswers).filter(ans => {
        return (ans.selectedOptionIds && ans.selectedOptionIds.length > 0) ||
               (ans.fillText && ans.fillText.trim() !== "") ||
               (ans.matchingAnswers && ans.matchingAnswers.length > 0) ||
               (ans.diagramAnswers && ans.diagramAnswers.length > 0);
    }).length;

    const skippedCount = totalQuestions - answeredCount;
    const bookmarkedCount = Object.values(session.userAnswers).filter(ans => ans.isBookmarked).length;

    const handleQuestionSelect = (index: number) => {
        onChangeQuestion(index);
        setIsReviewMode(false);
    };
    
    const finalSubmitAction = session.isOffline ? onSubmitOfflineTest : onSubmitTest;

    return (
        <div className="flex-1 flex flex-col bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100">Review Your Answers</h1>
                {timeLeftDisplay && (
                    <div className="flex items-center text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-3 py-1 rounded-full">
                        <ClockIcon className="w-5 h-5 mr-1.5" />
                        Time Remaining: {timeLeftDisplay}
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Answered</p>
                    <p className="text-2xl font-bold text-green-500">{answeredCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Skipped</p>
                    <p className="text-2xl font-bold text-yellow-500">{skippedCount}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bookmarked</p>
                    <p className="text-2xl font-bold text-blue-500">{bookmarkedCount}</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 flex-grow overflow-y-auto">
                <h2 className="text-lg font-semibold mb-3">Questions</h2>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                    {session.questions.map((q, index) => {
                        const answerRecord = session.userAnswers[q.id];
                        const isAnswered = answerRecord && ((answerRecord.selectedOptionIds && answerRecord.selectedOptionIds.length > 0) || (answerRecord.fillText && answerRecord.fillText.trim() !== "") || (answerRecord.matchingAnswers && answerRecord.matchingAnswers.length > 0) || (answerRecord.diagramAnswers && answerRecord.diagramAnswers.length > 0));
                        const isBookmarked = !!answerRecord?.isBookmarked;

                        let buttonClasses = "h-10 w-10 text-sm font-medium rounded-md flex items-center justify-center relative transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800";
                        if (isAnswered) {
                            buttonClasses += " bg-green-500 text-white hover:bg-green-600";
                        } else {
                            buttonClasses += " bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600";
                        }
                        if (isBookmarked) {
                            buttonClasses += " ring-2 ring-blue-500 dark:ring-blue-400";
                        }

                        return (
                            <button key={q.id} onClick={() => handleQuestionSelect(index)} className={buttonClasses} aria-label={`Go to question ${q.questionNumber}`}>
                                {isBookmarked && <BookmarkSolidIcon className="w-3 h-3 absolute top-1 right-1 text-blue-500 dark:text-blue-400"/>}
                                {q.questionNumber}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-r-lg mb-6 flex items-start" role="alert">
                <ExclamationTriangleIcon className="w-6 h-6 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-bold">Final Submission Warning</p>
                  <p className="text-sm">Once you submit, you will not be able to change your answers. Please review your questions carefully.</p>
                </div>
            </div>

            <div className="flex-shrink-0 flex justify-between items-center">
                <button onClick={() => setIsReviewMode(false)} className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-md flex items-center">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Return to Test
                </button>
                <button onClick={finalSubmitAction} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center font-semibold">
                    Confirm & Submit Test <CheckCircleSolid className="w-5 h-5 ml-2" />
                </button>
            </div>
        </div>
    );
  }


  if (!currentQuestion) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300">
        <p>Error: Question not found. This should not happen.</p>
        {onEndSession && <button onClick={onEndSession} className="mt-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-md">End Session</button>}
      </div>
    );
  }

  const finalSubmitAction = session.isOffline ? onSubmitOfflineTest : onSubmitTest;

  const isStudyModeAnswered = mode === 'study' && userAnswer?.isCorrect !== undefined;

  return (
    <div className="flex-1 flex flex-col bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200">
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="mb-6 pb-4 border-b border-gray-300 dark:border-gray-700">
          <div className="flex items-center justify-between">
              <div className="flex items-center text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100"> 
                  {headerIcon} {headerText}
              </div>
              {timeLeftDisplay && mode === 'test' && (
                  <div className="flex items-center text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-3 py-1 rounded-full">
                      <ClockIcon className="w-5 h-5 mr-1.5" />
                      Time Remaining: {timeLeftDisplay}
                  </div>
              )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Question {session.currentQuestionIndex + 1} of {totalQuestions}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 rounded-lg shadow-md mb-6">
            <div className="flex justify-between items-start mb-1">
                <h2 id={`question-stem-${currentQuestion.id}`} className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Question {currentQuestion.questionNumber}:
                </h2>
                <button
                    onClick={() => onToggleBookmark(currentQuestion.id)}
                    className={`p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isCurrentBookmarked ? 'text-yellow-500 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}
                    aria-label={isCurrentBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    title={isCurrentBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                    <BookmarkToggleIcon className="w-5 h-5 md:w-6 md:h-6" />
                </button>
            </div>
            <p className="text-md md:text-lg mb-4 whitespace-pre-wrap text-gray-800 dark:text-gray-200">{currentQuestion.questionStem}</p>
             {currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE && <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">(Select all that apply)</p>}
             {currentQuestion.questionType === QuestionType.MATCHING && <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">(Match each prompt to the correct answer)</p>}
             {currentQuestion.questionType === QuestionType.DIAGRAM_LABELING && <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">(Select the correct label for each pin from the dropdown menu)</p>}

            {currentQuestion.imageUrl && currentQuestion.questionType !== QuestionType.DIAGRAM_LABELING && (
                <div className="my-3 flex justify-center">
                    <img 
                        src={currentQuestion.imageUrl}
                        alt="Question visual" 
                        className="max-w-sm h-auto rounded-md border border-gray-300 dark:border-gray-600 shadow"
                        style={{ maxHeight: '250px' }}
                    />
                </div>
            )}

            {currentQuestion.questionType === QuestionType.FILL_IN_THE_BLANK && (
              <div className="mt-4 relative">
                <input
                  type="text"
                  value={fillText}
                  onChange={handleFillTextChange}
                  onBlur={handleFillTextChange} // Ensures answer is saved in test mode if user clicks away
                  placeholder="Type your answer here..."
                  className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:bg-gray-200 dark:disabled:bg-gray-700/50"
                  disabled={isStudyModeAnswered}
                  aria-label="Answer input for fill-in-the-blank question"
                />
                <VoiceInputButton
                    className="absolute top-1/2 right-2 -translate-y-1/2"
                    onTranscriptUpdate={(text) => setFillText(prev => prev + text)}
                    disabled={isStudyModeAnswered}
                />
                {mode === 'study' && !isStudyModeAnswered && (
                  <div className="mt-4 text-right">
                    <button 
                        onClick={submitFillTextAnswer}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-semibold disabled:opacity-50"
                        disabled={!fillText.trim()}
                    >
                        Submit Answer
                    </button>
                  </div>
                )}
              </div>
            )}

            {[QuestionType.MULTIPLE_CHOICE_SINGLE, QuestionType.TRUE_FALSE, QuestionType.MULTIPLE_CHOICE_MULTIPLE].includes(currentQuestion.questionType!) && (
              <ul className="space-y-3" role={currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE ? "group" : "radiogroup"} aria-labelledby={`question-stem-${currentQuestion.id}`}>
                  {renderOptions(currentQuestion, userAnswer)}
              </ul>
            )}
            
            {currentQuestion.questionType === QuestionType.MATCHING && (
                <div className="mt-4 space-y-3">
                    {currentQuestion.matchingPromptItems?.map(prompt => {
                        const correctMatch = isStudyModeAnswered ? currentQuestion.correctMatches?.find(m => m.promptItemId === prompt.id) : undefined;
                        const userSelectionId = matchSelections[prompt.id];
                        const isMatchCorrect = correctMatch?.answerItemId === userSelectionId;

                        let promptFeedbackClass = '';
                        if (isStudyModeAnswered) {
                            promptFeedbackClass = isMatchCorrect ? 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/30';
                        }

                        return (
                            <div key={prompt.id} className={`p-3 border rounded-lg ${promptFeedbackClass}`}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <p className="flex-1 font-medium text-gray-800 dark:text-gray-200">{prompt.text}</p>
                                    <div className="flex-shrink-0 w-full sm:w-1/2 md:w-5/12">
                                        <select
                                            value={matchSelections[prompt.id] || ""}
                                            onChange={e => handleMatchSelect(prompt.id, e.target.value)}
                                            disabled={isStudyModeAnswered}
                                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            <option value="" disabled>Select a match...</option>
                                            {(shuffledAnswers as MatchingItem[]).map(ans => (
                                                <option key={ans.id} value={ans.id}>{ans.text}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                {isStudyModeAnswered && !isMatchCorrect && (
                                    <div className="mt-2 text-xs flex items-center text-green-700 dark:text-green-300">
                                        <CheckCircleSolid className="w-4 h-4 mr-1"/>
                                        Correct answer: <span className="font-semibold ml-1">{(shuffledAnswers as MatchingItem[]).find(a => a.id === correctMatch?.answerItemId)?.text || 'N/A'}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {currentQuestion.questionType === QuestionType.DIAGRAM_LABELING && (
              <div className="mt-4">
                  <div className="relative w-full max-w-xl mx-auto border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                      <img src={currentQuestion.imageUrl} alt="Diagram to label" className="w-full h-auto" />
                      {currentQuestion.diagramLabels?.map((label, index) => (
                          <div 
                              key={label.id} 
                              className="absolute -translate-x-1/2 -translate-y-1/2" 
                              style={{ left: `${label.x}%`, top: `${label.y}%` }}
                          >
                              <div className="relative flex items-center justify-center w-7 h-7 bg-red-600 text-white font-bold text-sm rounded-full shadow-lg ring-2 ring-white">
                                  {index + 1}
                              </div>
                          </div>
                      ))}
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQuestion.diagramLabels?.map((label, index) => {
                          const userSelectionId = diagramSelections[label.id];
                          const isCorrect = userSelectionId === label.id;
                          let dropdownFeedbackClass = 'border-gray-300 dark:border-gray-600';
                          if (isStudyModeAnswered) {
                            dropdownFeedbackClass = isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-red-500 bg-red-50 dark:bg-red-900/30';
                          }
                          return (
                            <div key={label.id} className="flex items-center space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-600 text-white font-bold text-xs rounded-full">{index + 1}</div>
                                <select 
                                    value={userSelectionId || ''}
                                    onChange={(e) => handleDiagramLabelSelect(label.id, e.target.value)}
                                    disabled={isStudyModeAnswered}
                                    className={`w-full p-2 border rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70 ${dropdownFeedbackClass}`}
                                >
                                    <option value="" disabled>Select a label...</option>
                                    {(shuffledAnswers as DiagramLabel[]).map(opt => (
                                        <option key={opt.id} value={opt.id}>{opt.text}</option>
                                    ))}
                                </select>
                                {isStudyModeAnswered && (isCorrect ? <CheckCircleSolid className="w-5 h-5 text-green-500"/> : <XCircleSolid className="w-5 h-5 text-red-500"/>)}
                            </div>
                          );
                      })}
                  </div>
              </div>
            )}
            
            {mode === 'study' && (currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE || currentQuestion.questionType === QuestionType.MATCHING || currentQuestion.questionType === QuestionType.DIAGRAM_LABELING) && !isStudyModeAnswered && (
                <div className="mt-4 text-right">
                    <button 
                        onClick={currentQuestion.questionType === QuestionType.MATCHING ? submitMatchingAnswer : (currentQuestion.questionType === QuestionType.DIAGRAM_LABELING ? submitDiagramAnswer : submitMultiSelectAnswer)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-semibold disabled:opacity-50"
                        disabled={
                          (currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE_MULTIPLE && currentSelections.length === 0) ||
                          (currentQuestion.questionType === QuestionType.MATCHING && !currentQuestion.matchingPromptItems?.every(p => matchSelections[p.id])) ||
                          (currentQuestion.questionType === QuestionType.DIAGRAM_LABELING && !currentQuestion.diagramLabels?.every(l => diagramSelections[l.id]))
                        }
                    >
                        Submit Answer
                    </button>
                </div>
            )}

            {isStudyModeAnswered && (
              <div className={`mt-4 p-3 rounded-md ${userAnswer.isCorrect ? 'bg-green-50 dark:bg-green-900/40 border-green-400 dark:border-green-600' : 'bg-red-50 dark:bg-red-900/40 border-red-400 dark:border-red-600'} border`}>
                  <h3 className={`text-sm font-semibold ${userAnswer.isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {userAnswer.isCorrect ? 'Correct!' : 'Incorrect.'}
                  </h3>
                  {currentQuestion.questionType === QuestionType.FILL_IN_THE_BLANK && !userAnswer.isCorrect && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      Correct answer(s): <span className="font-semibold">{currentQuestion.acceptableAnswers?.join(', ')}</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-wrap">{currentQuestion.explanation}</p>
              </div>
            )}
        </div>

        <div className="mt-auto pt-4 flex justify-between items-center flex-shrink-0">
            <button
            onClick={() => onChangeQuestion(session.currentQuestionIndex - 1)}
            disabled={session.currentQuestionIndex === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
            <ChevronLeftIcon className="w-5 h-5 mr-1" /> Previous
            </button>

            {mode === 'test' && session.currentQuestionIndex === totalQuestions - 1 && (
            <button
                onClick={handleInitiateSubmit}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:ring-offset-2"
            >
                Review & Submit Test
            </button>
            )}
            
            {mode === 'study' && onEndSession && (
                session.currentQuestionIndex === totalQuestions - 1 ? (
                    <button
                        onClick={onEndSession}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-md focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500 focus:ring-offset-2"
                    >
                        End Study Session
                    </button>
                ) : (
                    <button
                        onClick={() => onChangeQuestion(session.currentQuestionIndex + 1)}
                        disabled={!isStudyModeAnswered}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        Next Question <ChevronRightIcon className="w-5 h-5 ml-1" />
                    </button>
                )
            )}
            
            {mode === 'test' && session.currentQuestionIndex < totalQuestions - 1 && (
                <button
                    onClick={() => onChangeQuestion(session.currentQuestionIndex + 1)}
                    disabled={session.currentQuestionIndex === totalQuestions - 1}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    Next Question <ChevronRightIcon className="w-5 h-5 ml-1" />
                </button>
            )}
        </div>
      </div>

      <div 
        ref={paletteRef}
        className="flex-shrink-0 bg-gray-200 dark:bg-gray-800 p-2 md:p-3 border-t border-gray-300 dark:border-gray-700 shadow-md overflow-x-auto"
        role="toolbar" 
        aria-label="Question navigation"
      >
        <div className="flex space-x-2">
          {session.questions.map((q, index) => {
            const answerRecord = session.userAnswers[q.id];
            const isCurrent = session.currentQuestionIndex === index;
            const isAnswered = answerRecord && (
                (answerRecord.selectedOptionIds && answerRecord.selectedOptionIds.length > 0) ||
                (answerRecord.fillText && answerRecord.fillText.trim() !== "") ||
                (answerRecord.matchingAnswers && answerRecord.matchingAnswers.length > 0) ||
                (answerRecord.diagramAnswers && answerRecord.diagramAnswers.length > 0)
            );
            const isBookmarked = !!answerRecord?.isBookmarked;

            let buttonClasses = "min-w-[40px] h-10 px-2.5 py-1 text-xs font-medium rounded-md flex items-center justify-center relative transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-gray-800";
            let title = `Go to Question ${q.questionNumber}`;
            if (isBookmarked) title += " (Bookmarked)";
            if (isAnswered) title += " (Answered)";
            else title += " (Unanswered)";


            if (isCurrent) {
              buttonClasses += " bg-blue-500 dark:bg-blue-400 text-white ring-2 ring-blue-600 dark:ring-blue-300 shadow-lg scale-105";
            } else if (isAnswered) {
              buttonClasses += " bg-green-200 dark:bg-green-700/80 text-green-800 dark:text-green-100 hover:bg-green-300 dark:hover:bg-green-600";
            } else {
              buttonClasses += " bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500";
            }
            if (isBookmarked && !isCurrent) { 
                 buttonClasses += " border-2 border-yellow-500 dark:border-yellow-400";
            }


            return (
              <button
                key={q.id}
                data-qindex={index}
                onClick={() => onChangeQuestion(index)}
                className={buttonClasses}
                aria-label={title}
                title={title}
              >
                {isBookmarked && (
                    <BookmarkSolidIcon className={`w-3 h-3 absolute top-0.5 right-0.5 ${isCurrent ? 'text-yellow-300' : 'text-yellow-600 dark:text-yellow-400'}`} />
                )}
                {q.questionNumber}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
