export interface Hands {
    id: number
    name: string;
    icon: string;
}

export const Hands: Hands[] = [
    { id: 0, name: "None", icon: "" },
    { id: 1, name: "ROCK", icon: "✊" },
    { id: 2, name: "PAPER", icon: "✋" },
    { id: 3, name: "SCISSORS", icon: "✌️" },
    { id: 4, name: "SPOCK", icon: "🤏" },
    { id: 5, name: "LIZARD", icon: "🦎" },
];


export const GAME_CONSTANTS = {
    TIMEOUT_DURATION: 300, // 5 minutes in seconds
    WARNING_TIME: 60, // 1 minute warning
    MAX_STAKE: 10,
    MIN_STAKE: 0
};

export const GAME_PHASES = {
    COMMIT: 'commit',
    REVEAL: 'reveal'
} as const;

export const IMAGEURL = "https://miro.medium.com/v2/resize:fit:1000/1*mqX7H2I9mubkpT9FumcNZA.png"