export type CharacterType = {
  name: string;
  age: number;
  personalityTraits: string;
  dialogueStyle: string;
  backgroundStory: string;
  eventsKnowledge: string,
  interests: string;
  friendliness: 'enemy' | 'low' | 'neutral' | 'high';
  environment: string;
  maxOutputWords: number;
};
