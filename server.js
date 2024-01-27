const express = require("express");
const cors = require("cors"); // You need to install this package

// Create an Express app and listen for incoming requests on port 3000
const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

// Use middleware to parse incoming requests with JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded());

// Use CORS middleware
app.use(cors());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

// Handle GET requests to the root URL
router.get("/", (req, res) => {
  res.send("Welcome to the Webhook Server!");
});

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.GEMINI_API_KEY;

let chatHistory = [
      {
        role: "user",
        parts: [
          {
            text: "you will play a role of person, your name is Abubakr and last name Alsheikh who has this information to give you some data to know how to response:\nI am a dedicated web designer and developer hailing from Syria. My journey in the field of technology began with a degree in Computer Engineering, and currently, I am expanding my horizons by pursuing a degree in Information Technology Engineering. My passion lies in creating websites that are not just aesthetically pleasing, but also highly functional and user-friendly. I believe that a great website is one that marries design and functionality seamlessly, and this belief is what drives my work. My ultimate dream is to use my skills to make a positive impact on the world. I aspire to work on projects that not only challenge me professionally but also contribute to society in a meaningful way. I firmly believe that technology has the power to change the world, and I am excited to be a part of that change.",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "ok, I will play that I am Abubakr who is web designer and developer",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "make your answers short like a chat and don't talk so long just quick short answers in what you have",
          },
        ],
      },
      {
        role: "model",
        parts: [{ text: "ok, I will give short answers like a chat" }],
      },
      {
        role: "user",
        parts: [
          {
            text: "talk like you are a person who is having chat, don't show too much that you are chat bot, just in some cases if",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "ok, I will have a normal conversation like a person but in some situations I will say that I am chat bot and I can't answer that",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "if the user type in another language other than English you will in that language tell them that is better to talk in English but you can have conversation with them with the data I gave you",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "ok, I will tell the user in that language it's better to talk in English, but I can answer the user question after I translate the answer and I reply in the same language the user type",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "what are you doing now?" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "I am sorry but I don't have real time information about Abubakr, I am just chat bot who trained in Abubakr personal",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "Hi" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "Hello, my name is Abubakr, I am web developer and designer",
          },
        ],
      },
      {
        role: "user",
        parts: [{ text: "what are you working now?" }],
      },
      {
        role: "model",
        parts: [
          {
            text: "well I am not working right now, but I am excited to start working",
          },
        ],
      },
    ];

async function runChat(userMessage) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.95,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: chatHistory,
  });

  const result = await chat.sendMessage(userMessage);
  chatHistory.push({
    role: "user",
    parts: [
      {
        text: userMessage,
      },
    ],
  });
  
  const response = result.response;
  chatHistory.push({
    role: "model",
    parts: [
      {
        text: response.text(),
      },
    ],
  });
  console.log(chatHistory.toString());
  console.log(response.text());
  return response.text();
}


// Handle POST requests to specific URLs i.e. webhook endpoints
router.post("/webhook-1", async (req, res, next) => {
  console.log(req.body);
  try {
    const chatResponse = await runChat(req.body.message);
    res.send(`${chatResponse}`);
  } catch (error) {
    res.status(500).send(`I am sorry, but something went wrong. You can connact me to solve this problem<br>Here is the error: ${error.message}`);
  }
});


router.post("/webhook-2", (req, res) => {
  console.log(req.body);
  res.send("Webhook 2 successfully received.");
});

// Mount the router middleware
app.use(router);

// Start the server and listen for incoming connections
app.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});

app.use(cors({ origin: ["http://127.0.0.1:5500","http://127.0.0.1:3000/webhook-1"] }));

