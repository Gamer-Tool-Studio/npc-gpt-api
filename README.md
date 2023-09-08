# DialogCraftGPT-API

Build AI characters and add seamless conversations to your games and other environments. 
Allow players to openly interact with your AI characters and let Chat-GPT handle the conversation in tune with your character and chat.

## Features 🎁

Send requests with user inputs to the GPT-3 API.
Define character contexts and traits to guide GPT-3's responses.
Send interaction history in the requests to keep GPT-3 in sycn with your conversation flow.
Receive AI-generated responses as your in-game characters.

## Installation 📦

Install GPTPromptKit using npm:

```
npm install dialogcraftgpt-lib
```




## Usage 🚀
Create a new `.js`file and add the following code:

```
const DialogCraftGPTApi = require('dialogcraftgpt-lib');

const dialogCrafGpt = new DialogCraftGPTApi({
  apiKey: process.env.DIALOGCRAFTGPT_API_KEY,
});

// 1st input example
const chat = await dialogCraftGPT.createChat({
  userInput: 'Hello John, how are you?',
  chatHistory: [],
  characterContext: {
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
    supportiveness: 5,
  },
});

// 2nd input example
const chat = await dialogCraftGPT.createChat({
  userInput: 'Can you help me find that mystical sword?',
  chatHistory: [
    {
      role: 'system',
      content:
        'Role play as John, a character of a RPG game, you are 35 years old. Your personality is friendly, optimistic, and adventurous.You speak in a casual manner. Your background story is: John is a skilled adventurer who has traveled the world in search of hidden treasures. He is always eager to help others and believes in the power of friendship.. Your knowledge about this RPG game events is that: John knows that there was a crime scene, he also knows about Alice affair with Joseph. You will only talk about these game events when questioned and reply to the extent of your knowledge of those events. Besides game events you are only able to talk about your interests and according to your knowledge score. From 0 to 10, with 0 being oblivious and 10 being an expert. Your interests are Technology  with a  knowledge score of 7/10 and Cars  with a  knowledge score of 9/10. Your level of support towards the player is 5 of 10. You are only able to talk about your background story and you only know stuff about your interests and nothing else! Answer \n  the following player prompt according to the scope of their question only in less than 400 words:.',
      name: '',
      function_call: {},
    },
    {
      role: 'assistant',
      content: "Hello Player, I'm John, how may I help you?",
      name: '',
      function_call: {},
    },
  ],
});

```
