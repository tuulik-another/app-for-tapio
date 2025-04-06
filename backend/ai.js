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
        model: 'google/gemma-3-12b-it:free',
        messages: [
            {
                role: 'user',
                content: `Hauska fakta ${randomVehicle} merkeistä. Korkeintaan 2 virkettä. Älä aloita sanomalla esim.: Tässä hauska fakta, vaan mene suoraan asiaan.`,
            },
        ],
    });
    console.log('Completion:', completion);

    return completion.choices[0].message.content;
};

export default { generateFunTransportFact };
