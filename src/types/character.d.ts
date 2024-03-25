export type CharacterType = {
  name: string;
  age: number;
  personalityTraits: string;
  dialogueStyle: string;
  'background story': string;
  'game knowledge': string;
  interests: string;
  friendliness: 'enemy' | 'low' | 'neutral' | 'high';
  maxOutputWords: number;
  environment: string;
};
