import yaml from 'js-yaml';
import { Story, StoryData } from './types';

class StoryEngine {
    public stories: Record<string, StoryData> = {};
    private readonly storiesPath = '/assets/data/stories';

    async loadStory(storyId: string): Promise<StoryData> {
        if (this.stories[storyId]) {
            return this.stories[storyId];
        }

        try {
            const response = await fetch(`${this.storiesPath}/${storyId}.yaml`);
            if (!response.ok) {
                throw new Error(`Failed to fetch story: ${response.statusText}`);
            }
            const content = await response.text();
            const yamlDoc: any = yaml.load(content);

            // The YAML structure might be wrapped in a 'story' key
            const storyData: StoryData = yamlDoc.story ? yamlDoc : { story: yamlDoc };

            // Ensure it matches our interface (simple check)
            if (!storyData.story.id) storyData.story.id = storyId;

            this.stories[storyId] = storyData;
            return storyData;
        } catch (error) {
            console.error('StoryEngine: Failed to load YAML:', error);
            throw error;
        }
    }

    async getEvent(storyId: string, eventId: string) {
        const storyData = await this.loadStory(storyId);
        const event = storyData.story.events.find(e => e.id === eventId);
        if (!event) throw new Error(`Event not found: ${eventId} in story ${storyId}`);
        return event;
    }

    async getAllEvents(storyId: string) {
        const storyData = await this.loadStory(storyId);
        return storyData.story.events;
    }

    async getInitialState(storyId: string) {
        const storyData = await this.loadStory(storyId);
        return storyData.story.initialState || {};
    }

    clearCache() {
        this.stories = {};
    }
}

export const storyEngine = new StoryEngine();
