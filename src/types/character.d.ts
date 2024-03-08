export type CharacterType = {
  name: string;
  age: number;
  personalityTraits: string;
  dialogueStyle: string;
  'background story': string;
  'game knowledge': string;
  interests: Record<string, number>;
  friendliness: 'enemy' | 'low' | 'neutral' | 'high';
  maxOutputWords: number;
  environment: string;
};
