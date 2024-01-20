import { Configuration, OpenAIApi } from 'openai';

import config from '~/config';

const { OPENAI_API_KEY } = config;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default openai;
