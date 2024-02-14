import { ChatCompletionRequestMessage } from 'openai';
import { getLogger } from 'src/core-services/logFunctionFactory';
import { CharacterType } from 'src/types';
// import type { StringMap } from 'src/types';

const { logDebug } = getLogger('database-service');

type GetCharacterJson = ({
  characterId,
  playerId,
}: {
  characterId: string;
  playerId: string;
}) => Promise<Record<string, CharacterType>>;

const getCharacterJson: GetCharacterJson = async (a) => {
  logDebug(a);
  return {
    characterJson: {
      name: 'John',
      age: 35,
      personality: {
        traits: ['friendly', 'optimistic', 'adventurous'],
        dialogueStyle: 'casual',
      },
      'background story':
        'John is a skilled adventurer who has traveled the world in search of hidden treasures. He is always eager to help others and believes in the power of friendship.',
      'game knowledge': 'John knows that there was a crime scene, he also knows about Alice affair with Joseph',
      interests: {
        Technology: 7,
        Cars: 9,
      },
      friendliness: 'enemy',
      maxOutputWords: 400,
      environment: 'RPG game',
    },
  };
};

type GetHistoryReq = ({
  characterId,
  playerId,
}: {
  characterId: string;
  playerId: string;
}) => Promise<Array<ChatCompletionRequestMessage>>;
const getHistory: GetHistoryReq = async ({ characterId, playerId }) => {
  logDebug(characterId, playerId);
  return [
    // {
    //   role: 'system',
    //   content:
    //     'You are John, a character of a RPG game, you are 35 years old. Your personality is friendly, optimistic, and adventurous. Also you speak in a casual manner. Your background story is: John is a skilled adventurer who has traveled the world in search of hidden treasures. He is always eager to help others and believes in the power of friendship.. Your knowledge about the game events is that: John knows that there was a crime scene, he also knows about Alice affair with Joseph. You will only talk about these game events when questioned and reply to the extent to your of your knowledge of those events. Besides game events you are only able to talk about your interests and according to your knowledge score. From 0 to 10, with 0 being not interested and 10 being very interested. Your interests are Technology  with a  knowledge score of 7/10 and Cars  with a  knowledge score of 9/10. From 0 to 10, with 0 being not helpful at all and 10 being very helpful. Your level of support is 5. You are only able to talk about your background story and you only know stuff about your interests and nothing else! Wait for my prompt question to start answering with short and concise replies with no more than 40 words.',
    // },
  ];
  //   return [];
};

type SetHistoryReq = ({ characterId, playerId }: { characterId: string; playerId: string }) => Promise<void>;
const setHistory: SetHistoryReq = async ({ characterId, playerId }) => {
  logDebug(characterId, playerId);
};
export { getHistory, setHistory, getCharacterJson };
