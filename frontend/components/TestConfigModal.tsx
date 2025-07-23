import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Group, Message, MessageType, QuestionType, TestConfig, UserQuestionStats, TestPreset, User } from '../types';
import { QuestionMarkCircleIcon, AcademicCapIcon, XMarkIcon, ClockIcon, ListBulletIcon, TagIcon, CloudArrowDownIcon, ArrowPathIcon, UsersIcon, BookmarkIcon, TrashIcon } from '@heroicons/react/24/outline';

interface TestConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group;
  allGroups: Group[];
  mode: 'test' | 'study' | 'game';
  allMessages: Record<string, Message[]>;
  userQuestionStats: UserQuestionStats;
  testPresets: TestPreset[];
  challengeOpponent?: User | null;
  onSavePreset: (name: string, config: Omit<TestConfig, 'questionIds' | 'groupId'>) => void;
  onDeletePreset: (presetId: string) => void;
  onSubmit: (config: Omit<TestConfig, 'questionIds' | 'groupId'>, mode: 'test' | 'study' | 'game', useSpacedRepetition: boolean, selectedSubgroupIDs: string[]) => void;
  onDownloadForOffline: (config: Omit<TestConfig, 'questionIds' | 'groupId'>, useSpacedRepetition: boolean, selectedSubgroupIDs: string[]) => void;
  isDownloading?: boolean;
}

const timerOptions = [
  { label: 'No Timer', value: 0 },
  { label: '10 minutes', value: 10 * 60 },
  { label: '15 minutes', value: 15 * 60 },
  { label: '30 minutes', value: 30 * 60 },
  { label: '45 minutes', value: 45 * 60 },
  { label: '60 minutes', value: 60 * 60 },
];

const TESTABLE_QUESTION_TYPES: QuestionType[] = [
  QuestionType.MULTIPLE_CHOICE_SINGLE,
  QuestionType.MULTIPLE_CHOICE_MULTIPLE,
  QuestionType.TRUE_FALSE,
  QuestionType.FILL_IN_THE_BLANK,
  QuestionType.MATCHING,
  QuestionType.DIAGRAM_LABELING,
];

const TestConfigModal: React.FC<TestConfigModalProps> = ({ 
    isOpen, 
    onClose, 
    group,
    allGroups,
    mode, 
    allMessages, 
    userQuestionStats,
    testPresets,
    challengeOpponent,
    onSavePreset,
    onDeletePreset,
    onSubmit,
    onDownloadForOffline,
    isDownloading 
}) => {
  const [numberOfQuestions, setNumberOfQuestions] = useState(0);
  const [selectedTimerSeconds, setSelectedTimerSeconds] = useState<number>(0);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>([]);
  const [selectedTagsInModal, setSelectedTagsInModal] = useState<string[]>([]);
  const [useSpacedRepetition, setUseSpacedRepetition] = useState(false);
  const [selectedSubgroupIDs, setSelectedSubgroupIDs] = useState<string[]>([]);
  const [presetName, setPresetName] = useState('');
  
  const getSubgroupsWithLevel = useCallback((parentId: string, allGroups: Group[], level = 0): { group: Group; level: number }[] => {
    const subgroups: { group: Group; level: number }[] = [];
    const directSubgroups = allGroups.filter(g => g.parentId === parentId && !g.isArchived);
    for (const subgroup of directSubgroups) {
        subgroups.push({ group: subgroup, level });
        subgroups.push(...getSubgroupsWithLevel(subgroup.id, allGroups, level + 1));
    }
    return subgroups;
  }, []);

  const availableSubgroups = useMemo(() => {
    return getSubgroupsWithLevel(group.id, allGroups);
  }, [group.id, allGroups, getSubgroupsWithLevel]);

  const uniqueTagsFromGroup = useMemo(() => {
    const tagsSet = new Set<string>();
    Object.values(allMessages).flat().forEach(msg => {
      if (
        msg.type === MessageType.QUESTION &&
        TESTABLE_QUESTION_TYPES.includes(msg.questionType!) &&
        (msg.upvotes || 0) > (msg.downvotes || 0) &&
        msg.tags && msg.tags.length > 0
      ) {
        msg.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }, [allMessages]);
  
  const { normalModeQuestions, spacedRepetitionQuestions } = useMemo(() => {
    const validateQuestion = (msg: Message) => {
        if (msg.type !== MessageType.QUESTION || !msg.questionType) return false;
        switch(msg.questionType) {
            case QuestionType.MULTIPLE_CHOICE_SINGLE:
            case QuestionType.MULTIPLE_CHOICE_MULTIPLE:
            case QuestionType.TRUE_FALSE:
                return !!(msg.questionStem && msg.options && msg.options.length > 0 && msg.correctAnswerIds && msg.correctAnswerIds.length > 0);
            case QuestionType.FILL_IN_THE_BLANK:
                return !!(msg.questionStem?.includes('___') && msg.acceptableAnswers && msg.acceptableAnswers.length > 0);
            case QuestionType.MATCHING:
                 return !!(msg.matchingPromptItems && msg.matchingPromptItems.length > 0 &&
                       msg.matchingAnswerItems && msg.matchingAnswerItems.length > 0 &&
                       msg.correctMatches && msg.correctMatches.length > 0 &&
                       msg.correctMatches.length === msg.matchingPromptItems.length);
            case QuestionType.DIAGRAM_LABELING:
                 return !!(msg.imageUrl && msg.diagramLabels && msg.diagramLabels.length > 0);
            default:
                return false;
        }
    };

    // Calculate normal questions pool
    const normalGroupIds = [group.id, ...selectedSubgroupIDs];
    const normalMessages = [...new Set(normalGroupIds)].flatMap(id => allMessages[id] || []);
    const validNormalQuestions = normalMessages.filter(validateQuestion);

    const normal = validNormalQuestions.filter(msg => {
      const isAllowedType = selectedQuestionTypes.length === 0 || selectedQuestionTypes.includes(msg.questionType!);
      const isUpvoted = (msg.upvotes || 0) > (msg.downvotes || 0);
      let matchesTags = true;
      if (selectedTagsInModal.length > 0) {
        matchesTags = msg.tags ? selectedTagsInModal.some(tag => msg.tags!.includes(tag)) : false;
      }
      return isAllowedType && isUpvoted && matchesTags;
    });

    // Spaced repetition uses all user stats, but we only show count from current group context for simplicity in UI
    const allUserQuestionsWithStats = Object.values(allMessages).flat().filter(q => userQuestionStats[q.id]);
    const spaced = allUserQuestionsWithStats.filter(q => {
        const stats = userQuestionStats[q.id];
        return validateQuestion(q) && stats && (stats.incorrectAttempts > stats.correctAttempts);
    });

    return { normalModeQuestions: normal, spacedRepetitionQuestions: spaced };
  }, [allMessages, group.id, selectedSubgroupIDs, selectedQuestionTypes, selectedTagsInModal, userQuestionStats]);

  const availableQuestions = useSpacedRepetition ? spacedRepetitionQuestions : normalModeQuestions;
  const maxQuestions = availableQuestions.length;


  useEffect(() => {
    if (isOpen) {
      setSelectedQuestionTypes([]);
      setSelectedTagsInModal([]);
      setSelectedTimerSeconds(0);
      setUseSpacedRepetition(false);
      setSelectedSubgroupIDs([]);
    }
  }, [isOpen]);
  
  useEffect(() => {
    setNumberOfQuestions(prevNumOfQs => {
      if (maxQuestions === 0) return 0;
      const defaultNum = Math.min(10, maxQuestions);
      if (prevNumOfQs === 0 && maxQuestions > 0) return defaultNum;
      if (prevNumOfQs > maxQuestions) return maxQuestions;
      if (prevNumOfQs < 1 && maxQuestions > 0) return 1;
      return prevNumOfQs;
    });
  }, [maxQuestions]);

  useEffect(() => {
    if (useSpacedRepetition || mode === 'game') {
        setSelectedSubgroupIDs([]);
    }
  }, [useSpacedRepetition, mode]);


  if (!isOpen) return null;

  const handleApplyPreset = (presetId: string) => {
    const preset = testPresets.find(p => p.id === presetId);
    if (preset) {
        setNumberOfQuestions(preset.config.numberOfQuestions);
        setSelectedTimerSeconds(preset.config.timerDuration || 0);
        setSelectedQuestionTypes(preset.config.allowedQuestionTypes);
        setSelectedTagsInModal(preset.config.selectedTags || []);
        setUseSpacedRepetition(false); // Presets do not save this state.
    }
  };

  const handleSaveCurrentAsPreset = () => {
      if (!presetName.trim()) {
          alert("Please enter a name for the preset.");
          return;
      }
      const currentConfig = {
          numberOfQuestions,
          allowedQuestionTypes: useSpacedRepetition ? TESTABLE_QUESTION_TYPES : selectedQuestionTypes,
          selectedTags: useSpacedRepetition ? [] : selectedTagsInModal,
          timerDuration: mode === 'test' && selectedTimerSeconds > 0 ? selectedTimerSeconds : undefined,
      };
      onSavePreset(presetName, currentConfig);
      setPresetName('');
  };

  const handleQuestionTypeChange = (type: QuestionType, checked: boolean) => {
    setSelectedQuestionTypes(prevTypes =>
      checked ? [...prevTypes, type] : prevTypes.filter(t => t !== type)
    );
  };

  const handleTagChange = (tag: string, checked: boolean) => {
    setSelectedTagsInModal(prevTags =>
      checked ? [...prevTags, tag] : prevTags.filter(t => t !== tag)
    );
  };

  const handleSubgroupToggle = (subgroupId: string) => {
    setSelectedSubgroupIDs(prev => 
        prev.includes(subgroupId)
            ? prev.filter(id => id !== subgroupId)
            : [...prev, subgroupId]
    );
  };

  const handleSelectAllSubgroups = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
        setSelectedSubgroupIDs(availableSubgroups.map(({ group }) => group.id));
    } else {
        setSelectedSubgroupIDs([]);
    }
  };

  const isSubmitDisabled = () => {
    if (useSpacedRepetition) {
      return maxQuestions === 0 || numberOfQuestions <= 0;
    }
    if (selectedQuestionTypes.length === 0) return true;
    if (maxQuestions === 0) return true;
    if (numberOfQuestions <= 0 || numberOfQuestions > maxQuestions) return true;
    if (isDownloading) return true;
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled()) {
        alert(`Please ensure you have selected question types, there are available questions for the selected criteria, and the number of questions is valid (1-${maxQuestions}).`);
        return;
    }
    const config: Omit<TestConfig, 'questionIds' | 'groupId'> = {
      numberOfQuestions,
      allowedQuestionTypes: useSpacedRepetition ? TESTABLE_QUESTION_TYPES : selectedQuestionTypes,
      selectedTags: useSpacedRepetition ? [] : selectedTagsInModal,
    };

    if (mode === 'test' && selectedTimerSeconds > 0) {
      config.timerDuration = selectedTimerSeconds;
    }
    onSubmit(config, mode, useSpacedRepetition, selectedSubgroupIDs);
  };

  const handleDownload = () => {
    if (isSubmitDisabled()) {
        alert(`Cannot download. Please ensure you have selected question types, there are available questions for the selected criteria, and the number of questions is valid (1-${maxQuestions}).`);
        return;
    }
     const config: Omit<TestConfig, 'questionIds' | 'groupId'> = {
      numberOfQuestions,
      allowedQuestionTypes: useSpacedRepetition ? TESTABLE_QUESTION_TYPES : selectedQuestionTypes,
      selectedTags: useSpacedRepetition ? [] : selectedTagsInModal,
      timerDuration: mode === 'test' && selectedTimerSeconds > 0 ? selectedTimerSeconds : undefined,
    };
    onDownloadForOffline(config, useSpacedRepetition, selectedSubgroupIDs);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = maxQuestions > 0 ? 1 : 0;

    if (maxQuestions === 0) {
      val = 0;
    } else {
      if (val < 1) val = 1;
      if (val > maxQuestions) val = maxQuestions;
    }
    setNumberOfQuestions(val);
  };

  const getModalTitle = () => {
    if(mode === 'game' && challengeOpponent) return `Challenge ${challengeOpponent.name}`;
    if(mode === 'test') return 'Configure Test';
    return 'Configure Study Session';
  }

  const modalIcon = mode === 'test' ?
    <QuestionMarkCircleIcon className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" /> :
    mode === 'study' ? <AcademicCapIcon className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" /> :
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-red-500"><path fillRule="evenodd" d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM21.625 5.375a.75.75 0 0 0-1.25-1.125L18 6.69l-1.92-1.92a.75.75 0 0 0-1.06 1.06l1.92 1.92-2.094 2.093a.75.75 0 0 0-1.06 1.06L15.75 10.5H13.5a.75.75 0 0 0 0 1.5h2.25l-2.094 2.093a.75.75 0 0 0-1.06 1.06L14.56 17.12l-1.92 1.92a.75.75 0 1 0 1.06 1.06l1.92-1.92 2.435 2.435a.75.75 0 0 0 1.25-1.125L6.94 5.375l14.686-.001Z" clipRule="evenodd" /></svg>;

  const getQuestionTypeLabel = (type: QuestionType): string => {
    switch(type) {
      case QuestionType.MULTIPLE_CHOICE_SINGLE: return "Multiple Choice (Single)";
      case QuestionType.MULTIPLE_CHOICE_MULTIPLE: return "Multiple Choice (Multiple)";
      case QuestionType.TRUE_FALSE: return "True/False";
      case QuestionType.FILL_IN_THE_BLANK: return "Fill-in-the-Blank";
      case QuestionType.MATCHING: return "Matching";
      case QuestionType.DIAGRAM_LABELING: return "Diagram Labeling";
      default: return type;
    }
  };
  
  const getSubmitButtonText = () => {
      if(mode === 'game') return 'Start Challenge';
      if(mode === 'test') return 'Start Test';
      return 'Start Study Session';
  }

  const submitButtonBaseClasses = "px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  let determinedSubmitButtonColorClasses: string;
  if(mode === 'game') {
      determinedSubmitButtonColorClasses = 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-400';
  } else if (mode === 'test') {
    determinedSubmitButtonColorClasses = 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400';
  } else { 
    determinedSubmitButtonColorClasses = 'bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-400';
  }
  const submitButtonColorClasses = determinedSubmitButtonColorClasses;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" role="dialog" aria-modal="true" aria-labelledby="test-config-modal-title">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 ease-in-out scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            {modalIcon}
            <h2 id="test-config-modal-title" className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {getModalTitle()} for <span className={`${mode === 'test' ? 'text-blue-600 dark:text-blue-400' : mode === 'study' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{group.name}</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" aria-label="Close modal" disabled={isDownloading}>
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
            {mode !== 'game' && (
                <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <BookmarkIcon className="w-5 h-5 mr-1.5 text-gray-500 dark:text-gray-400"/> Presets
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <select
                            onChange={(e) => e.target.value && handleApplyPreset(e.target.value)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                            defaultValue=""
                        >
                            <option value="" disabled>Load a preset...</option>
                            {testPresets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        {testPresets.map(p => (
                            <button key={`del-${p.id}`} type="button" onClick={() => onDeletePreset(p.id)} className="absolute right-8 text-gray-400 hover:text-red-500" style={{top: 'calc(50% - 0.5rem)'}}>
                                {/*This is tricky to position, let's rethink UI*/}
                            </button>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <input 
                            type="text"
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            placeholder="New preset name..."
                            className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm"
                        />
                        <button type="button" onClick={handleSaveCurrentAsPreset} disabled={!presetName.trim()} className="px-3 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md disabled:opacity-50">Save</button>
                    </div>
                    {testPresets.length > 0 && (
                        <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Manage presets:</p>
                            {testPresets.map(p => (
                                <div key={p.id} className="flex justify-between items-center text-xs p-1 bg-gray-100 dark:bg-gray-700 rounded">
                                    <span>{p.name}</span>
                                    <button type="button" onClick={() => onDeletePreset(p.id)} className="text-red-500 hover:text-red-700 p-0.5"><TrashIcon className="w-3.5 h-3.5"/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {mode !== 'game' && (
                <div className="my-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <ArrowPathIcon className="w-5 h-5 mr-1.5 text-gray-500 dark:text-gray-400"/> Special Learning Modes
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md border border-gray-200 dark:border-gray-700">
                    <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600/50">
                        <input
                            type="checkbox"
                            checked={useSpacedRepetition}
                            onChange={(e) => setUseSpacedRepetition(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500"
                            disabled={isDownloading}
                        />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Spaced Repetition</span>
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                        Focus on questions you've previously answered incorrectly. When selected, other filters are ignored.
                    </p>
                </div>
                </div>
            )}

            <div className={`transition-opacity duration-300 ${useSpacedRepetition ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {availableSubgroups.length > 0 && mode !== 'game' && (
                    <div className="my-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <UsersIcon className="w-5 h-5 mr-1.5 text-gray-500 dark:text-gray-400"/>
                            Include Questions From
                        </label>
                        <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                           <label className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600/50">
                                <input
                                    type="checkbox"
                                    onChange={handleSelectAllSubgroups}
                                    checked={availableSubgroups.length > 0 && selectedSubgroupIDs.length === availableSubgroups.length}
                                    className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500"
                                    disabled={isDownloading || useSpacedRepetition}
                                />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select All Sub-groups</span>
                            </label>
                            <hr className="my-2 border-gray-200 dark:border-gray-600"/>
                             <div className="space-y-1">
                                {availableSubgroups.map(({ group: sub, level }) => (
                                     <label key={sub.id} style={{ paddingLeft: `${level * 24}px` }} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600/50">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubgroupIDs.includes(sub.id)}
                                            onChange={() => handleSubgroupToggle(sub.id)}
                                            className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500"
                                            disabled={isDownloading || useSpacedRepetition}
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">{sub.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <ListBulletIcon className="w-5 h-5 mr-1.5 text-gray-500 dark:text-gray-400"/> Question Formats
                  </label>
                  <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md border border-gray-200 dark:border-gray-700">
                      {TESTABLE_QUESTION_TYPES.map(type => (
                          <label key={type} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600/50">
                              <input
                                  type="checkbox"
                                  checked={selectedQuestionTypes.includes(type)}
                                  onChange={(e) => handleQuestionTypeChange(type, e.target.checked)}
                                  className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-400 dark:bg-gray-700 dark:checked:bg-blue-500 dark:checked:border-blue-500"
                                  disabled={isDownloading || useSpacedRepetition}
                              />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{getQuestionTypeLabel(type)}</span>
                          </label>
                      ))}
                  </div>
                  {selectedQuestionTypes.length === 0 && !useSpacedRepetition && <p className="text-xs text-red-500 dark:text-red-400 mt-1">Please select at least one question format.</p>}
              </div>

              {uniqueTagsFromGroup.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <TagIcon className="w-5 h-5 mr-1.5 text-gray-500 dark:text-gray-400" /> Filter by Tags (Optional)
                  </label>
                  <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-md border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
                    {uniqueTagsFromGroup.map(tag => (
                      <label key={tag} className="flex items-center space-x-2 cursor-pointer p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600/50">
                        <input
                          type="checkbox"
                          checked={selectedTagsInModal.includes(tag)}
                          onChange={(e) => handleTagChange(tag, e.target.checked)}
                          className="h-4 w-4 text-purple-600 border-gray-300 dark:border-gray-500 rounded focus:ring-purple-500 dark:focus:ring-purple-400 dark:bg-gray-700 dark:checked:bg-purple-500 dark:checked:border-purple-500"
                          disabled={isDownloading || useSpacedRepetition}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{tag}</span>
                      </label>
                    ))}
                  </div>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If no tags are selected, questions will not be filtered by tags.</p>
                </div>
              )}
            </div>

            <div className="mb-4">
                <label htmlFor="numberOfQuestions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Questions
                </label>
                <input
                type="number"
                id="numberOfQuestions"
                value={numberOfQuestions}
                onChange={handleNumberChange}
                min={maxQuestions > 0 ? 1 : 0}
                max={maxQuestions > 0 ? maxQuestions : 0}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                required
                disabled={maxQuestions === 0 || isDownloading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  { useSpacedRepetition ? `Available questions for repetition: ${maxQuestions}` : `Available quality-approved questions matching filters: ${maxQuestions}.`}
                </p>
            </div>

            {mode === 'test' && (
              <div className="mb-6">
                <label htmlFor="timerDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400"/> Timer Duration (Optional)
                </label>
                <select
                  id="timerDuration"
                  value={selectedTimerSeconds}
                  onChange={(e) => setSelectedTimerSeconds(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
                  disabled={maxQuestions === 0 || isDownloading}
                >
                  {timerOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:focus:ring-gray-500 order-1 sm:order-none"
                disabled={isDownloading}
                >
                Cancel
                </button>
                {mode !== 'game' && (
                  <button
                      type="button"
                      onClick={handleDownload}
                      className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-purple-400 disabled:opacity-50 order-3 sm:order-none"
                      disabled={isSubmitDisabled() || isDownloading}
                  >
                      <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                      {isDownloading ? 'Downloading...' : 'Download for Offline'}
                  </button>
                )}
                <button
                type="submit"
                className={`${submitButtonBaseClasses} ${submitButtonColorClasses} order-2 sm:order-none`}
                disabled={isSubmitDisabled()}
                >
                 {getSubmitButtonText()}
                </button>
            </div>
            {isSubmitDisabled() && maxQuestions === 0 && (useSpacedRepetition || selectedQuestionTypes.length > 0) && !isDownloading && (
                 <p className="text-xs text-red-500 dark:text-red-400 mt-2 text-center">
                    {useSpacedRepetition 
                        ? "No frequently failed questions found in this group. Take some tests first!" 
                        : "No quality-approved questions match the selected criteria. Try other options or add/upvote questions."
                    }
                 </p>
            )}
            </form>
      </div>
    </div>
  );
};

export default TestConfigModal;
