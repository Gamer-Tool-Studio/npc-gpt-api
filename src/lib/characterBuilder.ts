import type { characterType } from 'src/types'

function getIndefiniteArticle(word: string): string {
  // Convert the word to lowercase for case-insensitive comparison
  const lowercaseWord = word.toLowerCase()

  // Words that start with a vowel (a, e, i, o, u) take "an" as the indefinite article
  const vowels = ['a', 'e', 'i', 'o', 'u']
  if (vowels.includes(lowercaseWord.charAt(0))) {
    return 'an'
  }

  // Special cases for words starting with a silent 'h' and a vowel sound
  const silentHExceptions = ['honest', 'hour', 'heir', 'honor', 'honour']
  for (const exception of silentHExceptions) {
    if (lowercaseWord.startsWith(exception)) {
      return 'an'
    }
  }

  // Default to "a" for all other words
  return 'a'
}

function joinWithCommasAnd(array: string[]): string {
  if (!Array.isArray(array)) {
    throw new Error('Input must be an array.')
  }

  const length = array.length
  if (length === 0) {
    return ''
  } else if (length === 1) {
    return array[0]
  } else if (length === 2) {
    return array.join(' and ')
  } else {
    const lastItem = array[length - 1]
    const firstPart = array.slice(0, length - 1).join(', ')
    return `${firstPart}, and ${lastItem}`
  }
}

const buildPersonality = (personality: characterType['personality']): string => {
  const personalityString = `Your personality is ${joinWithCommasAnd(personality.traits)}`

  return `${personalityString}. Also you speak in ${getIndefiniteArticle(personality.dialogueStyle)} ${
    personality.dialogueStyle
  } manner.`
}

const buildBackgroundStory = (backgroundStory: characterType['background story']): string => {
  return `Your background story is: ${backgroundStory}.`
}
const buildGameKnowledge = (gameKnowledge: characterType['game knowledge']): string => {
  return `Your knowledge about the game events is that: ${gameKnowledge}. You will only talk about these game events when questioned and reply to the extent to your of your knowledge of those events.`
}
const buildInterests = (interests: characterType['interests']): string => {
  return `Besides game events you are only able to talk about your interests and according to your knowledge score. From 0 to 10, with 0 being not interested and 10 being very interested. Your interests are ${joinWithCommasAnd(
    Object.entries(interests).map(([i, v]) => `${i}  with a  knowledge score of ${v}/10`)
  )}.`
}
const buildSupportiveness = (supportiveness: characterType['supportiveness']): string => {
  return `From 0 to 10, with 0 being not helpful at all and 10 being very helpful. Your level of support is ${supportiveness}.`
}

export const promptTemplate = (character: characterType) => {
  return `You are ${character.name}, a character of a RPG game, you are ${character.age} years old. ${buildPersonality(
    character.personality
  )} ${buildBackgroundStory(character['background story'])} ${buildGameKnowledge(
    character['game knowledge']
  )} ${buildInterests(character.interests)} ${buildSupportiveness(
    character.supportiveness
  )} You are only able to talk about your background story and you only know stuff about your interests and nothing else! Wait for my prompt question to start answering with short and concise replies with no more than 40 words.`
}

// Your are John, a character of a RPG game, you are 35 years old. Your personality is friendly, optimistic, and adventurous. Also you speak in a casual manner.

// Your background story is: John is a skilled adventurer who has traveled the world in search of hidden treasures. He is always eager to help others and believes in the power of friendship.

//  Your knowledge about game events is that:  John knows that there was a crime scene, he also knows about Alice affair with Joseph. You will only talk about game events when questioned and reply ato the extent of your knowledge of those events.

// Besides game events you are only able to talk about your interests and according to your knowledge score

// Your interests  are technology  with a  knowledge score of 7/10 and cars with a score of 10/10.

// Wait for my prompt question to start answering
