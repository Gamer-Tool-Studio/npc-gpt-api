import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageFunctionCall,
  // ChatCompletionRequestMessageFunctionCall,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai';

export class ChatCompletionRequestMessageClass implements ChatCompletionRequestMessage {
  constructor(
    public role: ChatCompletionRequestMessageRoleEnum,
    public content: string = '',
    public name?: string,
    public function_call?: ChatCompletionRequestMessageFunctionCall,
  ) {}
  // public function_call: ChatCompletionRequestMessageFunctionCall = {},
}
export const ChatCompletionRequestMessageObj = {
  role: 'user',
} as ChatCompletionRequestMessage;
