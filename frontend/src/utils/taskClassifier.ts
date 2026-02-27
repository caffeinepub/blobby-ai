export type TaskType =
    | 'Chat'
    | 'Reasoning'
    | 'Code'
    | 'AppBuild'
    | 'GameBuild'
    | 'ImageGen'
    | 'Vision'
    | 'Creative'
    | 'Research';

export interface TaskClassification {
    taskType: TaskType;
    model: string;
    badgeColor: string;
}

const TASK_PATTERNS: Array<{ patterns: RegExp[]; taskType: TaskType }> = [
    {
        patterns: [
            /\b(build|create|make|generate|develop)\s+(a\s+)?(3d\s+)?game\b/i,
            /\b(three\.js|babylon\.js|threejs|babylonjs)\b/i,
            /\b(2d|3d)\s+game\b/i,
            /\bgame\s+(with|using|in)\b/i,
        ],
        taskType: 'GameBuild',
    },
    {
        patterns: [
            /\b(build|create|make|generate|develop)\s+(a\s+)?(web\s+)?(app|application|website|webpage|site|tool|dashboard|calculator|todo|form)\b/i,
            /\b(html|css|javascript)\s+(app|page|website|template)\b/i,
            /\bcreate\s+an?\s+app\b/i,
            /\bmake\s+a\s+website\b/i,
            /\bbuild\s+me\s+a\b/i,
        ],
        taskType: 'AppBuild',
    },
    {
        patterns: [
            /\b(generate|create|draw|make|produce|render)\s+(an?\s+)?(image|picture|photo|illustration|artwork|painting|drawing|portrait|landscape)\b/i,
            /\bimage\s+of\b/i,
            /\bpicture\s+of\b/i,
            /\bdraw\s+(me\s+)?(a|an)\b/i,
            /\bvisual(ize|ization)?\b/i,
        ],
        taskType: 'ImageGen',
    },
    {
        patterns: [
            /\b(write|fix|debug|explain|optimize|refactor|review|analyze)\s+(this\s+)?(code|function|script|program|algorithm|class|method|bug|error)\b/i,
            /\b(python|javascript|typescript|java|c\+\+|rust|go|ruby|php|swift|kotlin|sql|bash|shell)\s+(code|script|function|program)\b/i,
            /\bcode\s+(for|to|that|which)\b/i,
            /\bscript\s+(to|for|that)\b/i,
            /\bfunction\s+(to|for|that)\b/i,
            /\bapi\s+(endpoint|route|call)\b/i,
            /\b(implement|program)\s+(a|an|the)\b/i,
        ],
        taskType: 'Code',
    },
    {
        patterns: [
            /\b(analyze|analyse|research|investigate|compare|evaluate|assess|examine)\b/i,
            /\b(what\s+is\s+the\s+difference|pros\s+and\s+cons|advantages\s+and\s+disadvantages)\b/i,
            /\b(summarize|summarise|summary\s+of)\b/i,
            /\b(explain\s+in\s+detail|deep\s+dive|comprehensive)\b/i,
            /\b(latest|recent|current)\s+(news|research|developments|trends)\b/i,
            /\bsearch\s+for\b/i,
        ],
        taskType: 'Research',
    },
    {
        patterns: [
            /\b(solve|calculate|compute|prove|derive|reason|logic|math|equation|formula)\b/i,
            /\b(step\s+by\s+step|step-by-step|think\s+through|work\s+out)\b/i,
            /\b(complex|difficult|hard|challenging)\s+(problem|question|task)\b/i,
            /\b(why|how)\s+(does|do|is|are|can|could|would|should)\b/i,
        ],
        taskType: 'Reasoning',
    },
    {
        patterns: [
            /\b(write|create|compose|draft|generate)\s+(a\s+)?(story|poem|essay|article|blog|email|letter|script|song|lyrics|novel|fiction|narrative|creative)\b/i,
            /\b(creative\s+writing|storytelling|copywriting)\b/i,
            /\b(social\s+media\s+post|tweet|caption|ad\s+copy|marketing)\b/i,
            /\b(rhyme|haiku|sonnet|limerick)\b/i,
        ],
        taskType: 'Creative',
    },
];

const MODEL_MAP: Record<TaskType, string> = {
    Chat: 'gpt-4o',
    Reasoning: 'claude-opus-4-5',
    Code: 'deepseek-chat',
    AppBuild: 'gpt-4o',
    GameBuild: 'gpt-4o',
    ImageGen: 'dall-e-3',
    Vision: 'gpt-4o',
    Creative: 'claude-sonnet-4-5',
    Research: 'gpt-4o',
};

const BADGE_COLORS: Record<TaskType, string> = {
    Chat: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Reasoning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Code: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    AppBuild: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    GameBuild: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    ImageGen: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Vision: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Creative: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    Research: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
};

export function classifyTask(message: string, hasImage: boolean = false): TaskClassification {
    if (hasImage) {
        return {
            taskType: 'Vision',
            model: MODEL_MAP['Vision'],
            badgeColor: BADGE_COLORS['Vision'],
        };
    }

    for (const { patterns, taskType } of TASK_PATTERNS) {
        for (const pattern of patterns) {
            if (pattern.test(message)) {
                return {
                    taskType,
                    model: MODEL_MAP[taskType],
                    badgeColor: BADGE_COLORS[taskType],
                };
            }
        }
    }

    return {
        taskType: 'Chat',
        model: MODEL_MAP['Chat'],
        badgeColor: BADGE_COLORS['Chat'],
    };
}

export function getBadgeColor(taskType: TaskType): string {
    return BADGE_COLORS[taskType] || BADGE_COLORS['Chat'];
}
