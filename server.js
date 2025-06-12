const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/api/generate-strategy', async (req, res) => {
  try {
    const { selectedUnits, strategyData, userUnits } = req.body;

    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }

    console.log('Sending request to Anthropic API...');
    console.log('Selected Units:', selectedUnits);

    const prompt = `You are a professional Mechabellum player and mentor. You have a comprehensive understanding of the game mechanics and systems at play. I need a comprehensive strategy for this situation in the game Mechabellum:

OPPONENT'S UNITS: ${selectedUnits.join(', ')}
YOUR UNITS: ${userUnits.join(', ')}

Mechabellum is a round-based, large-scale auto-battler where you spend a fixed supply budget each wave to recruit and upgrade mechanized units, position them on a hex grid, and then watch the AI resolve combat in real time. Victory hinges on counter-picking enemy compositions, leveraging unit synergies (air, artillery, swarm, etc.), and adapting between waves with tactical redeployments and tech upgrades that snowball economic momentum.

Please keep in mind that the only units that are in the game are the following and that any other units should not be referenced in the generated strategy: Abyss, Arclight, Crawler, Fang, Farseer, Fire Badger, Fortress, Hacker, Hound, Marksman, Melting Point, Mustang, Overlord, Phantom Ray, Phoenix, Raiden, Rhino, Sabertooth, Sandworm, Scorpion, Sledgehammer, Steel Ball, Stormcaller, Tarantula, Typhoon, Vulcan, War Factory, Wasp, Wraith

Please provide your response in this format:

UNITS I SHOULD USE:
- A tier list of units that are good against the opponent's units, they can be units I have or units that I don't have.
- Give yellow star emojis for the relative effectiveness of each unit as a counter
- Provide a short explanation for why each unit is effective as a counter

OVERALL STRATEGY:
- Recommended unit positioning and formation
- Suggested tech progression order

WEAKNESSES TO WATCH:
- Potential vulnerabilities in your composition
- How to mitigate these weaknesses`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const responseText = await response.text();
    console.log('Anthropic API Response Status:', response.status);
    console.log('Anthropic API Response Headers:', response.headers);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      throw new Error('Invalid response from Anthropic API');
    }

    if (!response.ok) {
      console.error('Anthropic API Error:', data);
      throw new Error(`Anthropic API Error: ${response.status} - ${data.error?.message || 'Unknown error'}`);
    }

    res.json(data);
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment check:');
  console.log('- ANTHROPIC_API_KEY present:', !!process.env.ANTHROPIC_API_KEY);
}); 