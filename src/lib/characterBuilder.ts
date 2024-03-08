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

function joinWithCommasAnd(array: string[]): string {
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

const buildBackgroundStory = (backgroundStory: CharacterType['background story']): string => {
  return `Your background story is: ${backgroundStory}`;
};
const buildGameKnowledge = (gameKnowledge: CharacterType['game knowledge']): string => {
  return `Your knowledge about the events is: ${gameKnowledge}. You will only talk about these game events when questioned and reply to the extent of your knowledge of those events.`;
};
const buildInterests = (interests: CharacterType['interests']): string => {
  return `Besides game events you are only able to talk about the following interests of yours ${joinWithCommasAnd(
    Object.entries(interests).map(([i]) => `${i}`),
  )}.`;
};
const buildFriendliness = (friendliness: CharacterType['friendliness']): string => {
  // use the values in the enum to build the string
  return `Your level of friendliness towards the player is ${friendliness}!`;
};

export const characterScriptBuilder = (character: CharacterType) => {
  return `Role play as ${character.name}, a character in a ${character.environment}. ${buildPersonality(character.personalityTraits, character.dialogueStyle)} ${buildBackgroundStory(
    character['background story'],
  )} ${buildGameKnowledge(character['game knowledge'])} ${buildInterests(character.interests)} ${buildFriendliness(
    character.friendliness,
  )} Answer the following player prompt according to the scope of their question only in less than ${
    character.maxOutputWords
  } words.`;
};

export const todo = () => {};
