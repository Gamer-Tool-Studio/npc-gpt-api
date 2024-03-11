export interface IError {
  status: number;
  msg: string;
}

export const ErrorType = {
  INSUFFICIENT_BALANCE: 'InsufficientBalanceError',
  NO_RESPONSE_FROM_OPENAI: 'NoResponseFromOpenAIError',
  NO_HISTORY: 'NoHistoryError',
  CHARACTER_CONTEXT: 'CharacterContextError',
};

export const errors: { [key: string]: IError } = {
  InsufficientBalanceError: {
    status: 402,
    msg: 'Insufficient balance',
  },
  NoResponseFromOpenAIError: {
    status: 500,
    msg: 'No response from the OpenAI API',
  },
  NoHistoryError: {
    status: 500,
    msg: 'No History for this',
  },
  CharacterContextError: {
    status: 500,
    msg: 'A characterContext object is required',
  },

};
