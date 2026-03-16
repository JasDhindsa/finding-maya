<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Finding Maya

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

## Features

- **Interactive "Cartoon OS" UI**: A fully functional simulated operating system inside the browser.
- **Story-driven Gameplay**: Experience a dynamic narrative (e.g., investigating a mystery) through simulated apps like Messages, Signals, Email, and more.
- **AI-Powered Interactions**: Integrates with Gemini AI for intelligent and responsive components.
- **Dynamic State Management**: Seamless navigation and real-time updates across multiple simulated applications.

## Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [Motion](https://motion.dev/) (for animations), [Lucide React](https://lucide.dev/) (icons)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Backend/AI Services**: [Firebase](https://firebase.google.com/), [Google Generative AI](https://ai.google.dev/) (Gemini), [OpenRouter](https://openrouter.ai/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Project Structure

- `src/` - Core application code.
  - `components/` - Reusable UI components.
  - `apps/` - Individual simulated applications (Messages, Email, etc.).
  - `store/` - Zustand state management.
  - `lib/` - Utility functions and API clients.
- `public/` - Static assets including story data (YAML files) and images.
- `docs/` - Project documentation and architecture diagrams.


## License

Distributed under the MIT License. See `LICENSE` for more information.
