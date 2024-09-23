import type { CharacterType } from 'src/types';

// function getIndefiniteArticle(word: string): string {
//   // Convert the word to lowercase for case-insensitive comparison
//   const lowercaseWord = word.toLowerCase();

//   // Words that start with a vowel (a, e, i, o, u) take "an" as the indefinite article
//   const vowels = ['a', 'e', 'i', 'o', 'u'];
//   if (vowels.includes(lowercaseWord.charAt(0))) {
//     return 'an';
//   }

//   // Special cases for words starting with a silent 'h' and a vowel sound
//   const silentHExceptions = ['honest', 'hour', 'heir', 'honor', 'honour'];
//   for (const exception of silentHExceptions) {
//     if (lowercaseWord.startsWith(exception)) {
//       return 'an';
//     }
//   }

//   // Default to "a" for all other words
//   return 'a';
// }

export function joinWithCommasAnd(array: string[]): string {
  if (!Array.isArray(array)) {
    throw new Error('Input must be an array.');
  }

  const { length } = array;
  if (length === 0) {
    return '';
  }
  if (length === 1) {
    return array[0];
  }
  if (length === 2) {
    return array.join(' and ');
  }
  const lastItem = array[length - 1];
  const firstPart = array.slice(0, length - 1).join(', ');
  return `${firstPart}, and ${lastItem}`;
}

const buildPersonality = (personalityTraits: CharacterType['personalityTraits'], dialogueStyle: CharacterType['dialogueStyle']): string => {
  const personalityString = `Your personality is ${personalityTraits}`;

  return `${personalityString}. You speak in ${dialogueStyle} manner.`;
};

const buildBackgroundStory = (backgroundStory: CharacterType['backgroundStory']): string => {
  return `Your background story is: ${backgroundStory}`;
};
const buildGameKnowledge = (eventsKnowledge: CharacterType['eventsKnowledge']): string => {
  return `Your knowledge about the events is limited to : ${eventsKnowledge} `;
};
const buildInterests = (interests: CharacterType['interests']): string => {
  return `Besides these events you are only able to talk about the following interests of yours ${interests}.`;
};
const buildFriendliness = (friendliness: CharacterType['friendliness']): string => {
  // use the values in the enum to build the string
  return `Your level of friendliness towards the player is ${friendliness}!`;
};

export const characterScriptBuilder = (character: CharacterType) => {
  return `Role play as ${character.name}, a character in a ${character.environment}. ${buildPersonality(character.personalityTraits, character.dialogueStyle)} ${buildBackgroundStory(
    character.backgroundStory,
  )} ${buildGameKnowledge(character.eventsKnowledge)} ${buildInterests(character.interests)} ${buildFriendliness(
    character.friendliness,
  )} Never give a away you are an AI or in a simulated reality. Answer the  user prompt in the same language the user texted in and according to the scope of their question and your character only. Answer in less than ${
    character.maxOutputWords
  } words.`;
};
