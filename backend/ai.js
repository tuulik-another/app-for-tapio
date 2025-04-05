import OpenAi from "openai";
import dotenv from "dotenv";

dotenv.config();
console.log('api key', process.env.API_KEY);

const openai = new OpenAi({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.API_KEY,
});

const vehicles = ["bussien", "raitiovaunujen", "metrojen", "lauttojen", "junien"];

const generateFunTransportFact = async () => {
    const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];

    const completion = await openai.chat.completions.create({
        model: 'google/gemini-2.5-pro-exp-03-25:free',
        messages: [
            {
                role: 'user',
                content: `Hauska fakta ${randomVehicle} merkeistä. Korkeintaan 2 virkettä.`,
            },
        ],
    });

    return completion.choices[0].message.content;
};

export default { generateFunTransportFact };
