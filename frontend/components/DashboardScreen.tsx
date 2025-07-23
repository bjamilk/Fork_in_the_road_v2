

import React, { useState, useEffect, useMemo } from 'react';
import { TestResult, Group, User, Badge, UserStats, QuestionType, UserQuestionStats, Message } from '../types';
import { ChartBarIcon, CalendarDaysIcon, CheckCircleIcon, InformationCircleIcon, UsersIcon, ClockIcon, ArrowLeftIcon, PresentationChartLineIcon, ChevronUpIcon, ChevronDownIcon, FunnelIcon, SparklesIcon, TrophyIcon, RocketLaunchIcon, ClockIcon as ClockOutline, AcademicCapIcon as AcademicCapOutline, TagIcon, PresentationChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import GroupPerformanceChart, { ChartDataPoint } from './GroupPerformanceChart';
import { BADGE_DEFINITIONS } from '../gamification';

interface DashboardScreenProps {
  testResults: TestResult[];
  groups: Group[];
  currentUser: User;
  onNavigateToChat: () => void;
  theme: 'light' | 'dark';
  allMessages: Record<string, Message[]>;
  userQuestionStats: UserQuestionStats;
}

interface GroupPerformanceData {
  id: string;
  name: string;
  testCount: number;
  totalScore: number;
  averageScore: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  totalTimeSpentSeconds: number;
  questionsWithTimeData: number;
  averageTimePerQuestion: number;
  chartData: ChartDataPoint[];
  weeklyChartData: ChartDataPoint[];
}

type TimePeriodOptionValue = 'allTime' | 'last7Days' | 'last30Days' | 'last90Days' | 'custom';

const timePeriodOptions: { value: TimePeriodOptionValue, label: string }[] = [
  { value: 'allTime', label: 'All Time' },
  { value: 'last7Days', label: 'Last 7 Days' },
  { value: 'last30Days', label: 'Last 30 Days' },
  { value: 'last90Days', label: 'Last 90 Days' },
  { value: 'custom', label: 'Custom Range' },
];


const DashboardScreen: React.FC<DashboardScreenProps> = ({ testResults: initialTestResults, groups, currentUser, onNavigateToChat, theme, allMessages, userQuestionStats }) => {
  
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriodOptionValue>('allTime');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(true);
  const [chartDisplayMode, setChartDisplayMode] = useState<'bar' | 'line'>('bar');


  const filteredTestResults = useMemo(() => {
    if (selectedTimePeriod === 'allTime') {
      return initialTestResults;
    }

    if (selectedTimePeriod === 'custom') {
      if (customStartDate && customEndDate) {
        try {
          const startDateObj = new Date(customStartDate + "T00:00:00"); // Local time start of day
          const endDateObj = new Date(customEndDate + "T23:59:59.999");   // Local time end of day

          if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
            console.warn("Invalid custom dates provided.");
            return initialTestResults; // Fallback to all if dates are invalid
          }
          if (startDateObj > endDateObj) {
            console.warn("Custom start date is after end date.");
            return []; // No results possible
          }

          return initialTestResults.filter(result => {
            const resultDate = new Date(result.session.startTime);
            return resultDate >= startDateObj && resultDate <= endDateObj;
          });
        } catch (e) {
            console.error("Error parsing custom dates:", e);
            return initialTestResults; 
        }
      } else {
        // If custom is selected but dates aren't set, effectively show "All Time"
        // or a specific message, here we show all for now.
        return initialTestResults;
      }
    }
    
    // Logic for 'last7Days', 'last30Days', 'last90Days'
    const now = new Date();
    let daysToSubtract = 0;
    if (selectedTimePeriod === 'last7Days') daysToSubtract = 7;
    else if (selectedTimePeriod === 'last30Days') daysToSubtract = 30;
    else if (selectedTimePeriod === 'last90Days') daysToSubtract = 90;

    const cutoffDate = new Date(); 
    cutoffDate.setDate(now.getDate() - daysToSubtract);
    cutoffDate.setHours(0, 0, 0, 0); 

    return initialTestResults.filter(result => {
        const resultDate = new Date(result.session.startTime);
        return resultDate >= cutoffDate;
    });
  }, [initialTestResults, selectedTimePeriod, customStartDate, customEndDate]);
  
  const totalTestsTakenOverall = filteredTestResults.length;
  
  const getGroupName = (groupId: string): string => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown Group';
  };

  const [allGroupPerformanceData, setAllGroupPerformanceData] = useState<GroupPerformanceData[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [isRecentTestsExpanded, setIsRecentTestsExpanded] = useState(true);

  useEffect(() => {
    const groupPerformanceMap: Map<string, GroupPerformanceData> = new Map();
    if (totalTestsTakenOverall > 0) {
      filteredTestResults.forEach(result => {
        const groupId = result.session.config.groupId;
        const groupName = getGroupName(groupId);
        
        let data = groupPerformanceMap.get(groupId);
        if (!data) {
          data = { 
            id: groupId, 
            name: groupName, 
            testCount: 0, 
            totalScore: 0, 
            averageScore: 0,
            correctAnswers: 0,
            totalQuestions: 0,
            accuracy: 0,
            totalTimeSpentSeconds: 0,
            questionsWithTimeData: 0,
            averageTimePerQuestion: 0,
            chartData: [],
            weeklyChartData: [],
          };
        }

        data.testCount++;
        data.totalScore += result.score;
        data.correctAnswers += result.correctAnswersCount;
        data.totalQuestions += result.totalQuestions;
        
        Object.values(result.session.userAnswers).forEach(answer => {
          if (answer.timeSpentSeconds !== undefined) {
            data.totalTimeSpentSeconds += answer.timeSpentSeconds;
            data.questionsWithTimeData++;
          }
        });
        
        groupPerformanceMap.set(groupId, data);
      });

      groupPerformanceMap.forEach(data => {
        data.averageScore = data.testCount > 0 ? data.totalScore / data.testCount : 0;
        data.accuracy = data.totalQuestions > 0 ? (data.correctAnswers / data.totalQuestions) * 100 : 0;
        data.averageTimePerQuestion = data.questionsWithTimeData > 0 ? data.totalTimeSpentSeconds / data.questionsWithTimeData : 0;

        const groupSpecificResults = filteredTestResults
          .filter(tr => tr.session.config.groupId === data.id)
          .sort((a, b) => new Date(a.session.startTime).getTime() - new Date(b.session.startTime).getTime());
        
        data.chartData = groupSpecificResults.map((result, index) => {
          const date = new Date(result.session.startTime);
          const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
          const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            x: `Test ${index + 1} - ${formattedDate}`,
            y: result.score,
          };
        });
        
        // Calculate weekly data
        const weeklyScores: Map<string, { scores: number[]; count: number }> = new Map();
        const getWeek = (date: Date): string => {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
            return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
        };

        groupSpecificResults.forEach(result => {
            const weekKey = getWeek(new Date(result.session.startTime));
            const weekData = weeklyScores.get(weekKey) || { scores: [], count: 0 };
            weekData.scores.push(result.score);
            weekData.count++;
            weeklyScores.set(weekKey, weekData);
        });

        data.weeklyChartData = Array.from(weeklyScores.entries())
            .sort((a,b) => a[0].localeCompare(b[0]))
            .map(([weekKey, { scores, count }]) => ({
                x: weekKey,
                y: scores.reduce((a,b) => a + b, 0) / count,
            }));
      });
    }
    const performanceDataArray = Array.from(groupPerformanceMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    setAllGroupPerformanceData(performanceDataArray);

    const initialExpandedState: Record<string, boolean> = {};
    performanceDataArray.forEach(groupData => {
      initialExpandedState[groupData.id] = true; 
    });
    setExpandedGroups(initialExpandedState);

  }, [filteredTestResults, groups, totalTestsTakenOverall]);


  const analysisData = useMemo(() => {
    if (filteredTestResults.length === 0) {
        return { strongestTopics: [], weakestTopics: [], speedAnalysis: [] };
    }

    const tagStats: Map<string, { correct: number; total: number }> = new Map();
    const speedStats: Map<QuestionType, { totalTime: number; count: number }> = new Map();

    for (const result of filteredTestResults) {
        for (const question of result.session.questions) {
            const answer = result.session.userAnswers[question.id];
            if (!answer) continue;

            // Topic performance calculation
            if (question.tags) {
                for (const tag of question.tags) {
                    const stats = tagStats.get(tag) || { correct: 0, total: 0 };
                    stats.total++;
                    if (answer.isCorrect) {
                        stats.correct++;
                    }
                    tagStats.set(tag, stats);
                }
            }
            
            // Speed analysis calculation
            if (question.questionType && answer.timeSpentSeconds !== undefined) {
                const stats = speedStats.get(question.questionType) || { totalTime: 0, count: 0 };
                stats.totalTime += answer.timeSpentSeconds;
                stats.count++;
                speedStats.set(question.questionType, stats);
            }
        }
    }
    
    const topicPerformance = Array.from(tagStats.entries())
        .map(([tag, { correct, total }]) => ({
            tag,
            accuracy: total > 0 ? (correct / total) * 100 : 0,
            count: total,
        }))
        .filter(item => item.count >= 3)
        .sort((a, b) => b.accuracy - a.accuracy);

    const strongestTopics = [...topicPerformance].slice(0, 3);
    const weakestTopics = [...topicPerformance].reverse().slice(0, 3);

    const speedAnalysis = Array.from(speedStats.entries())
        .map(([type, { totalTime, count }]) => ({
            type,
            avgTime: count > 0 ? totalTime / count : 0,
        }))
        .sort((a,b) => a.avgTime - b.avgTime);

    return { strongestTopics, weakestTopics, speedAnalysis };

  }, [filteredTestResults]);
  
  const troublesomeQuestions = useMemo(() => {
    const allQuestionsList: Message[] = Object.values(allMessages).flat().filter(m => m.type === 'QUESTION');
    const questionMap = new Map<string, string>();
    allQuestionsList.forEach(q => {
        if (q.questionStem) {
            questionMap.set(q.id, q.questionStem);
        }
    });

    return Object.entries(userQuestionStats)
        .filter(([, stats]) => stats.incorrectAttempts > 0)
        .map(([questionId, stats]) => ({
            id: questionId,
            stem: questionMap.get(questionId) || 'Question not found.',
            incorrectAttempts: stats.incorrectAttempts,
            accuracy: (stats.correctAttempts / (stats.correctAttempts + stats.incorrectAttempts)) * 100,
        }))
        .sort((a, b) => b.incorrectAttempts - a.incorrectAttempts)
        .slice(0, 5); // Top 5
    }, [allMessages, userQuestionStats]);

  const heatmapData = useMemo(() => {
    const data = new Map<string, number>();
    filteredTestResults.forEach(result => {
        const dateStr = new Date(result.session.startTime).toISOString().split('T')[0];
        data.set(dateStr, (data.get(dateStr) || 0) + 1);
    });
    return data;
  }, [filteredTestResults]);

  const simulatedGroupAverages = useMemo(() => {
    const averages = new Map<string, number>();
    filteredTestResults.forEach(result => {
        const key = result.session.startTime.toISOString();
        if (!averages.has(key)) {
            // Generate a random offset between -7 and +10
            const offset = Math.random() * 17 - 7;
            const groupAvg = Math.max(40, Math.min(98, result.score - offset)); // Clamp to a realistic range
            averages.set(key, Math.round(groupAvg));
        }
    });
    return averages;
  }, [filteredTestResults]);

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleRecentTestsExpansion = () => {
    setIsRecentTestsExpanded(prev => !prev);
  };
  
  let overallTotalTimeSpent = 0;
  let overallQuestionsWithTime = 0;
  filteredTestResults.forEach(result => {
    Object.values(result.session.userAnswers).forEach(answer => {
      if (answer.timeSpentSeconds !== undefined) {
        overallTotalTimeSpent += answer.timeSpentSeconds;
        overallQuestionsWithTime++;
      }
    });
  });
  const overallAverageTimePerQuestion = overallQuestionsWithTime > 0 
    ? (overallTotalTimeSpent / overallQuestionsWithTime)
    : 0;

  const recentTests = [...filteredTestResults].sort((a,b) => new Date(b.session.startTime).getTime() - new Date(a.session.startTime).getTime()).slice(0, 5);

  const getTimePeriodLabel = () => {
    if (selectedTimePeriod === 'custom') {
      if (customStartDate && customEndDate) {
        try {
            const startDate = new Date(customStartDate + "T00:00:00");
            const endDate = new Date(customEndDate + "T00:00:00");
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 'Custom Range (Invalid Dates)';
            return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        } catch {
            return 'Custom Range (Invalid Dates)';
        }
      }
      return 'Custom Range (Select Dates)';
    }
    return timePeriodOptions.find(o => o.value === selectedTimePeriod)?.label || 'All Time';
  };
  const currentPeriodLabel = getTimePeriodLabel();

  const highestLevelBadges = useMemo(() => {
    const badgeMap = new Map<string, Badge>();
    (currentUser.badges || []).forEach(badge => {
        const existing = badgeMap.get(badge.id);
        if (!existing || badge.level > existing.level) {
            badgeMap.set(badge.id, badge);
        }
    });
    // Return all badge definitions, showing earned ones and progress for unearned ones
    return Object.values(BADGE_DEFINITIONS).map(def => {
        const userBadge = badgeMap.get(def.id);
        return {
            definition: def,
            userBadge: userBadge,
        };
    }).sort((a,b) => {
        const aEarned = !!a.userBadge;
        const bEarned = !!b.userBadge;
        if(aEarned && !bEarned) return -1;
        if(!aEarned && bEarned) return 1;
        return 0;
    });
  }, [currentUser.badges]);

  const getQuestionTypeLabel = (type: QuestionType) => {
    const labels: Record<QuestionType, string> = {
      [QuestionType.MULTIPLE_CHOICE_SINGLE]: "MCQ (Single)",
      [QuestionType.MULTIPLE_CHOICE_MULTIPLE]: "MCQ (Multiple)",
      [QuestionType.TRUE_FALSE]: "True/False",
      [QuestionType.FILL_IN_THE_BLANK]: "Fill-in-the-Blank",
      [QuestionType.MATCHING]: "Matching",
      [QuestionType.DIAGRAM_LABELING]: "Diagram Labeling",
      [QuestionType.OPEN_ENDED]: "Open Ended",
    };
    return labels[type] || "Unknown Type";
  };
  
  const StudyHeatmap = ({ data }: { data: Map<string, number> }) => {
    const today = new Date();
    // Go back enough days to fill 16 full weeks, ensuring we start on a Sunday
    const startDate = new Date();
    startDate.setDate(today.getDate() - (16 * 7) + 1);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const days = [];
    let currentDate = new Date(startDate);
    while (currentDate <= today) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const getColorForCount = (count: number): string => {
        if (count === 0) return 'bg-gray-200 dark:bg-gray-700/60';
        if (count === 1) return 'bg-green-200 dark:bg-green-900';
        if (count <= 3) return 'bg-green-400 dark:bg-green-700';
        return 'bg-green-600 dark:bg-green-500';
    };

    return (
        <div className="flex justify-center items-center">
            <div className="grid grid-rows-7 grid-flow-col gap-1">
                {days.map(day => {
                    const dateString = day.toISOString().split('T')[0];
                    const count = data.get(dateString) || 0;
                    return (
                        <div
                        key={dateString}
                        title={`${count} test${count !== 1 ? 's' : ''} on ${day.toLocaleDateString()}`}
                        className={`w-3.5 h-3.5 rounded-sm ${getColorForCount(count)}`}
                        />
                    );
                })}
            </div>
        </div>
    );
  };


  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-gray-100 dark:bg-slate-900 text-gray-800 dark:text-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-300 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex items-center text-2xl md:text-3xl font-semibold text-teal-600 dark:text-teal-400 mb-2 sm:mb-0">
            <ChartBarIcon className="w-8 h-8 mr-3" />
            Performance Dashboard
          </div>
          <button
            onClick={onNavigateToChat}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:ring-offset-2 flex items-center text-sm"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-1.5" /> Back to Chat
          </button>
        </div>
        <div className="mt-4">
            <label htmlFor="timePeriodSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                <FunnelIcon className="w-4 h-4 mr-1.5 text-gray-500 dark:text-gray-400"/>
                Filter by Time Period:
            </label>
            <select
                id="timePeriodSelect"
                value={selectedTimePeriod}
                onChange={(e) => setSelectedTimePeriod(e.target.value as TimePeriodOptionValue)}
                className="w-full sm:w-auto p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            >
                {timePeriodOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
        {selectedTimePeriod === 'custom' && (
            <div className="mt-4 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700/30">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Custom Date Range:</h4>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <div>
                        <label htmlFor="customStartDate" className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Start Date:</label>
                        <input
                            type="date"
                            id="customStartDate"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                            max={customEndDate || undefined}
                        />
                    </div>
                    <div>
                        <label htmlFor="customEndDate" className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">End Date:</label>
                        <input
                            type="date"
                            id="customEndDate"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500"
                            min={customStartDate || undefined}
                        />
                    </div>
                </div>
                {(!customStartDate || !customEndDate) && 
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Please select both a start and end date for custom filtering.</p>
                }
            </div>
        )}
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">My Achievements</h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                  <SparklesIcon className="w-8 h-8 mr-3 text-yellow-500 dark:text-yellow-400"/>
                  <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Points Earned</p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{currentUser.points.toLocaleString()}</p>
                  </div>
              </div>
              <div>
                  <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-3">Badges & Progress</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {highestLevelBadges.map(({ definition, userBadge }) => {
                        const currentLevel = userBadge?.level || 0;
                        const nextLevelInfo = definition.levels.find(l => l.level === currentLevel + 1);
                        const isRisingStar = definition.id === 'RISING_STAR';
                        
                        // Progress calculation for standard badges
                        let progress = 0;
                        let progressText = "0 / 0";
                        if (nextLevelInfo && !isRisingStar) {
                            const currentStatValue = currentUser.stats[definition.metric as keyof UserStats] || 0;
                            const startOfLevel = definition.levels.find(l=>l.level === currentLevel)?.threshold || 0;
                            progress = ((currentStatValue - startOfLevel) / (nextLevelInfo.threshold - startOfLevel)) * 100;
                            progressText = `${currentStatValue} / ${nextLevelInfo.threshold}`;
                        } else if (!nextLevelInfo) {
                            progress = 100;
                            progressText = "Max Level!";
                        }

                        return (
                            <div key={definition.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-start">
                                <span className="text-4xl mr-3">{definition.icon}</span>
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{userBadge ? userBadge.name : definition.baseName}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{nextLevelInfo ? definition.baseDescription(nextLevelInfo.threshold) : `You've mastered this!`}</p>
                                </div>
                                </div>
                                <div className="mt-2">
                                    {isRisingStar ? (
                                        nextLevelInfo ? (
                                            <div className="text-center text-xs text-gray-600 dark:text-gray-400 p-2 bg-gray-100 dark:bg-gray-600 rounded">
                                                Goal: Get <span className="font-bold">{nextLevelInfo.threshold} upvotes</span> on a single question.
                                            </div>
                                        ) : (
                                            <p className="text-center text-xs text-green-500 font-semibold p-2">Max Level!</p>
                                        )
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                <span>Progress to next level</span>
                                                <span>{progressText}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                  </div>
              </div>
          </div>
        </section>

        {totalTestsTakenOverall > 0 ? (
          <>
            <section>
              <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Overall Activity ({currentPeriodLabel})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Tests Taken</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalTestsTakenOverall}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center"><ClockIcon className="w-4 h-4 mr-1"/>Avg. Time / Question</p>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {overallAverageTimePerQuestion > 0 ? `${overallAverageTimePerQuestion.toFixed(0)}s` : 'N/A'}
                  </p>
                </div>
              </div>
            </section>
            
            <section>
                <button onClick={() => setIsAnalysisExpanded(p => !p)} className="w-full flex justify-between items-center text-left mb-3 focus:outline-none p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50" aria-expanded={isAnalysisExpanded}>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">In-Depth Analysis</h2>
                    {isAnalysisExpanded ? <ChevronUpIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /> : <ChevronDownIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />}
                </button>
                {isAnalysisExpanded && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Topic Performance */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                <h3 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center"><TagIcon className="w-5 h-5 mr-2 text-purple-500"/>Topic Performance</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Strongest Topics</h4>
                                        <ul className="space-y-1 text-xs">
                                            {analysisData.strongestTopics.length > 0 ? analysisData.strongestTopics.map(topic => (
                                                <li key={topic.tag} className="flex justify-between items-center p-1 bg-gray-50 dark:bg-gray-700/50 rounded">
                                                    <span className="text-gray-700 dark:text-gray-300 truncate pr-2">{topic.tag}</span>
                                                    <span className="font-semibold text-green-500">{topic.accuracy.toFixed(0)}%</span>
                                                </li>
                                            )) : <li className="text-gray-500 italic">Not enough data.</li>}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Weakest Topics</h4>
                                        <ul className="space-y-1 text-xs">
                                            {analysisData.weakestTopics.length > 0 ? analysisData.weakestTopics.map(topic => (
                                                <li key={topic.tag} className="flex justify-between items-center p-1 bg-gray-50 dark:bg-gray-700/50 rounded">
                                                    <span className="text-gray-700 dark:text-gray-300 truncate pr-2">{topic.tag}</span>
                                                    <span className="font-semibold text-red-500">{topic.accuracy.toFixed(0)}%</span>
                                                </li>
                                            )) : <li className="text-gray-500 italic">Not enough data.</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            {/* Speed Analysis */}
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                <h3 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center"><ClockOutline className="w-5 h-5 mr-2 text-indigo-500"/>Question Speed Analysis</h3>
                                <ul className="space-y-1 text-sm">
                                    {analysisData.speedAnalysis.length > 0 ? analysisData.speedAnalysis.map(item => (
                                        <li key={item.type} className="flex justify-between items-center p-1 bg-gray-50 dark:bg-gray-700/50 rounded">
                                            <span className="text-gray-700 dark:text-gray-300">{getQuestionTypeLabel(item.type)}</span>
                                            <span className="font-semibold text-indigo-500">{item.avgTime.toFixed(1)}s / question</span>
                                        </li>
                                    )) : <li className="text-gray-500 italic">Not enough timing data.</li>}
                                </ul>
                            </div>
                        </div>
                        {/* New Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                <h3 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center"><CalendarDaysIcon className="w-5 h-5 mr-2 text-blue-500"/>Study Consistency</h3>
                                <StudyHeatmap data={heatmapData}/>
                            </div>
                             <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                <h3 className="text-md font-semibold mb-3 text-gray-800 dark:text-gray-200 flex items-center"><ExclamationTriangleIcon className="w-5 h-5 mr-2 text-red-500"/>Most Troublesome Questions</h3>
                                <ul className="space-y-2 text-sm">
                                    {troublesomeQuestions.length > 0 ? troublesomeQuestions.map(q => (
                                        <li key={q.id} className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                                            <p className="truncate text-gray-800 dark:text-gray-200" title={q.stem}>{q.stem}</p>
                                            <p className="text-xs text-red-500 dark:text-red-400">Incorrect {q.incorrectAttempts} time(s) • {q.accuracy.toFixed(0)}% accuracy</p>
                                        </li>
                                    )) : <li className="text-gray-500 italic">No specific troublesome questions found yet!</li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {allGroupPerformanceData.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">Performance by Group ({currentPeriodLabel})</h2>
                <div className="space-y-6">
                  {allGroupPerformanceData.map(groupData => (
                    <div key={groupData.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                      <button onClick={() => toggleGroupExpansion(groupData.id)} className="w-full flex justify-between items-center text-left mb-3 focus:outline-none" aria-expanded={expandedGroups[groupData.id]}>
                        <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 flex items-center">
                          <UsersIcon className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400" />
                          {groupData.name}
                        </h3>
                        {expandedGroups[groupData.id] ? <ChevronUpIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /> : <ChevronDownIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />}
                      </button>
                      
                      {expandedGroups[groupData.id] && (
                        <div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-center mb-4">
                            <div><p className="text-xs text-gray-500 dark:text-gray-400">Tests Taken</p><p className="text-xl font-bold text-gray-700 dark:text-gray-300">{groupData.testCount}</p></div>
                            <div><p className="text-xs text-gray-500 dark:text-gray-400">Avg. Score</p><p className={`text-xl font-bold ${groupData.averageScore >= 70 ? 'text-green-600 dark:text-green-400' : groupData.averageScore >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{groupData.averageScore.toFixed(1)}%</p></div>
                            <div><p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p><p className={`text-xl font-bold ${groupData.accuracy >= 70 ? 'text-green-600 dark:text-green-400' : groupData.accuracy >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>{groupData.accuracy.toFixed(1)}%</p><p className="text-2xs text-gray-400 dark:text-gray-500">({groupData.correctAnswers}/{groupData.totalQuestions} correct)</p></div>
                            <div><p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center"><ClockIcon className="w-3 h-3 mr-0.5"/>Avg. Time/Q</p><p className="text-xl font-bold text-indigo-500 dark:text-indigo-400">{groupData.averageTimePerQuestion > 0 ? `${groupData.averageTimePerQuestion.toFixed(0)}s` : 'N/A'}</p></div>
                          </div>
                          {(chartDisplayMode === 'bar' ? groupData.chartData.length : groupData.weeklyChartData.length) > 1 ? (
                            <>
                              <div className="flex justify-end items-center mb-2">
                                  <span className="isolate inline-flex rounded-md shadow-sm">
                                      <button onClick={() => setChartDisplayMode('bar')} type="button" className={`relative inline-flex items-center rounded-l-md px-3 py-1 text-xs font-semibold ${chartDisplayMode === 'bar' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}><PresentationChartBarIcon className="w-4 h-4 mr-1.5"/>Test-by-Test</button>
                                      <button onClick={() => setChartDisplayMode('line')} type="button" className={`relative -ml-px inline-flex items-center rounded-r-md px-3 py-1 text-xs font-semibold ${chartDisplayMode === 'line' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}><PresentationChartLineIcon className="w-4 h-4 mr-1.5"/>Weekly Trend</button>
                                  </span>
                              </div>
                              <GroupPerformanceChart groupName={groupData.name} data={chartDisplayMode === 'bar' ? groupData.chartData : groupData.weeklyChartData} theme={theme} type={chartDisplayMode} />
                            </>
                          ) : (
                              <p className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">At least 2 data points are needed to show a progression graph.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <button onClick={toggleRecentTestsExpansion} className="w-full flex justify-between items-center text-left mb-3 focus:outline-none p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50" aria-expanded={isRecentTestsExpanded}>
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Recent Tests ({currentPeriodLabel})</h2>
                  {isRecentTestsExpanded ? <ChevronUpIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" /> : <ChevronDownIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />}
                </button>
              
              {isRecentTestsExpanded && (
                  <div>
                      {recentTests.length > 0 ? (
                      <div className="space-y-3">
                          {recentTests.map((result, index) => {
                          const testTimeSpentSeconds = Object.values(result.session.userAnswers).reduce((sum, ans) => sum + (ans.timeSpentSeconds || 0), 0);
                          const answeredQuestionsWithTime = Object.values(result.session.userAnswers).filter(ans => ans.timeSpentSeconds !== undefined).length;
                          const avgTimePerQThisTest = answeredQuestionsWithTime > 0 ? (testTimeSpentSeconds / answeredQuestionsWithTime).toFixed(0) + 's' : 'N/A';
                          const groupAverage = simulatedGroupAverages.get(result.session.startTime.toISOString());
                          return (
                              <div key={result.session.startTime.toISOString() + '-' + index} className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-center">
                                  <div className="mb-2 sm:mb-0"><p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mb-0.5"><CalendarDaysIcon className="w-3.5 h-3.5 mr-1 text-gray-400 dark:text-gray-500"/> {new Date(result.session.startTime).toLocaleDateString()} - {new Date(result.session.startTime).toLocaleTimeString()}</p><p className="font-medium text-gray-700 dark:text-gray-300 text-sm truncate" title={getGroupName(result.session.config.groupId)}>Group: {getGroupName(result.session.config.groupId)}</p></div>
                                  <div className="flex space-x-4 items-center sm:text-right">
                                    <div className="text-left sm:text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Avg. Time/Q</p>
                                        <p className="font-semibold text-indigo-500 dark:text-indigo-400">{avgTimePerQThisTest}</p>
                                    </div>
                                    <div className="text-left sm:text-right">
                                        <p className={`text-lg font-bold ${result.score >= 70 ? 'text-green-500 dark:text-green-400' : result.score >= 40 ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}>{result.score.toFixed(1)}%</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            ({result.correctAnswersCount}/{result.totalQuestions}) • <span title="Simulated anonymous group average">Group Avg: {groupAverage?.toFixed(0) || 'N/A'}%</span>
                                        </p>
                                    </div>
                                </div>
                              </div>
                          );})}
                      </div>
                      ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-3 bg-white dark:bg-gray-800 rounded-lg shadow">No recent test data available for the selected period.</p>
                      )}
                  </div>
              )}
            </section>
          </>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-lg shadow">
            <AcademicCapOutline className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Tests Taken Yet {selectedTimePeriod !== 'allTime' ? `in the period: ${currentPeriodLabel}` : ''}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Complete some tests in your study groups to see your performance here.</p>
            <button onClick={onNavigateToChat} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:ring-offset-2 text-base">Go to My Groups</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardScreen;
