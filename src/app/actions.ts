import { TurnContext } from "botbuilder";
import { ApplicationTurnState } from "./turnState";
import axios from 'axios';
import { CardFactory } from "botbuilder";
import { AI } from "@microsoft/teams-ai";

export async function getAvalancheForecast(
  context: TurnContext,
  state: ApplicationTurnState
): Promise<string> {
  try {
    const response = await axios.get('https://utahavalanchecenter.org/forecast/salt-lake/json');
    let forecast = response.data.advisories[0].advisory;

    // Remove unwanted characters from the forecast strings
    const cleanString = (str: string) => str.replace(/&nbsp;|\r/g, '').trim();
    forecast = {
      ...forecast,
      overall_danger_rating: cleanString(forecast.overall_danger_rating),
      current_conditions: cleanString(forecast.current_conditions),
      recent_activity: cleanString(forecast.recent_activity)
    };

    const avalancheCard = {
      type: "AdaptiveCard",
      body: [
      {
        type: "TextBlock",
        text: "Avalanche Forecast",
        weight: "Bolder",
        size: "Medium"
      },
      {
        type: "TextBlock",
        text: `Overall Danger Rating: ${forecast.overall_danger_rating}`,
        wrap: true
      },
      {
        type: "TextBlock",
        text: `Current Conditions: ${forecast.current_conditions}`,
        wrap: true
      },
      {
        type: "TextBlock",
        text: `Recent Activity: ${forecast.recent_activity}`,
        wrap: true
      },
      {
        type: "Image",
        url: `https://utahavalanchecenter.org/${forecast.overall_danger_rose_image}`,
        altText: "Overall Danger Rose Image"
      }
      ],
      actions: [],
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.2"
    };

    await context.sendActivity({
      attachments: [CardFactory.adaptiveCard(avalancheCard)]
    });

    return AI.StopCommandName;
  } catch (error) {
    console.error('Error fetching avalanche forecast:', error);
    await context.sendActivity('Unable to fetch avalanche forecast at this time.');
  }
}