
import type { UserStats } from './types';

// --- GAMIFICATION DEFINITIONS ---
export type BadgeId = 'GROUP_FOUNDER' | 'QUESTION_ASKER' | 'RISING_STAR' | 'TEST_TAKER' | 'HIGH_SCORER' | 'PERFECTIONIST' | 'DUELIST';
export type BadgeMetric = keyof UserStats | 'question_upvotes';

interface BadgeLevel {
    level: number;
    threshold: number;
    points: number;
}

export interface BadgeDefinition {
    id: BadgeId;
    baseName: string;
    baseDescription: (threshold: number) => string;
    icon: string;
    metric: BadgeMetric;
    levels: BadgeLevel[];
}

export const BADGE_DEFINITIONS: Record<BadgeId, BadgeDefinition> = {
    GROUP_FOUNDER: {
        id: 'GROUP_FOUNDER',
        baseName: 'Group Founder',
        baseDescription: (threshold) => `Create ${threshold} study group(s).`,
        icon: '🚀',
        metric: 'groupsCreated',
        levels: [
            { level: 1, threshold: 1, points: 50 },
            { level: 2, threshold: 3, points: 100 },
            { level: 3, threshold: 5, points: 150 },
        ],
    },
    QUESTION_ASKER: {
        id: 'QUESTION_ASKER',
        baseName: 'Question Asker',
        baseDescription: (threshold) => `Submit ${threshold} question(s).`,
        icon: '❓',
        metric: 'questionsCreated',
        levels: [
            { level: 1, threshold: 1, points: 10 },
            { level: 2, threshold: 10, points: 50 },
            { level: 3, threshold: 25, points: 100 },
        ],
    },
    RISING_STAR: { // This is the special one handled differently
        id: 'RISING_STAR',
        baseName: 'Rising Star',
        baseDescription: (threshold) => `Receive ${threshold} upvotes on a single question.`,
        icon: '🌟',
        metric: 'question_upvotes',
        levels: [
            { level: 1, threshold: 10, points: 25 },
            { level: 2, threshold: 25, points: 75 },
            { level: 3, threshold: 50, points: 150 },
        ],
    },
    TEST_TAKER: {
        id: 'TEST_TAKER',
        baseName: 'Test Taker',
        baseDescription: (threshold) => `Complete ${threshold} test(s).`,
        icon: '📝',
        metric: 'testsCompleted',
        levels: [
            { level: 1, threshold: 1, points: 15 },
            { level: 2, threshold: 5, points: 50 },
            { level: 3, threshold: 10, points: 100 },
        ],
    },
    HIGH_SCORER: {
        id: 'HIGH_SCORER',
        baseName: 'High Scorer',
        baseDescription: (threshold) => `Score 80% or higher on ${threshold} test(s).`,
        icon: '🎯',
        metric: 'highScoreTests',
        levels: [
            { level: 1, threshold: 1, points: 30 },
            { level: 2, threshold: 5, points: 75 },
            { level: 3, threshold: 10, points: 150 },
        ],
    },
    PERFECTIONIST: {
        id: 'PERFECTIONIST',
        baseName: 'Perfectionist',
        baseDescription: (threshold) => `Achieve a perfect 100% score on ${threshold} test(s).`,
        icon: '🏆',
        metric: 'perfectScoreTests',
        levels: [
            { level: 1, threshold: 1, points: 75 },
            { level: 2, threshold: 3, points: 150 },
            { level: 3, threshold: 5, points: 300 },
        ],
    },
    DUELIST: {
        id: 'DUELIST',
        baseName: 'Duelist',
        baseDescription: (threshold) => `Win ${threshold} head-to-head game(s).`,
        icon: '⚔️',
        metric: 'gamesWon',
        levels: [
            { level: 1, threshold: 1, points: 20 },
            { level: 2, threshold: 5, points: 100 },
            { level: 3, threshold: 10, points: 200 },
        ],
    },
};
