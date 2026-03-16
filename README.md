<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/d5d85bce-2288-4183-afa6-7ead1d35e270

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Reproducible Testing

To test the application properly, please follow these steps:

1. **Environment Setup**: Ensure your `.env` is present and populated with the necessary keys (like `GEMINI_API_KEY`, and any other keys defined in `.env.example`).
2. **Start Development Server**: Run `npm run dev` to start the application.
3. **Manual Verification**: Open `http://localhost:3000` in your browser. Since this is an interactive UI simulation (a "cartoon OS"), functionally test the applications:
   - Click through the active icons to see simulated interactions.
   - Verify dynamic transitions and layout structures.
   - For backend integrations (like Gemini API), trigger corresponding interactions and monitor the terminal for any console logs or errors to ensure API calls are returning valid responses.

## Architecture Diagram

See [docs/architecture-diagram.md](docs/architecture-diagram.md) for the submission-ready system diagram.
