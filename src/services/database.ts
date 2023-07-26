import { ChatCompletionRequestMessage } from 'openai';
import { getLogger } from 'src/core-services/logFunctionFactory';
// import type { StringMap } from 'src/types';

const { logDebug } = getLogger('database-service');

type GetHistoryReq = ({
  characterId,
  playerId,
}: {
  characterId: string;
  playerId: string;
}) => Promise<Array<ChatCompletionRequestMessage>>;
type SetHistoryReq = ({ characterId, playerId }: { characterId: string; playerId: string }) => Promise<void>;

const getHistory: GetHistoryReq = async ({ characterId, playerId }) => {
  logDebug(characterId, playerId);
  //   return { role: 'system', content: 'You are a helpful assistant.' };
  return [];
};

const setHistory: SetHistoryReq = async ({ characterId, playerId }) => {
  logDebug(characterId, playerId);
};
export { getHistory, setHistory };
