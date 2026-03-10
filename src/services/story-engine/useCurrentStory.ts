import { storyEngine } from './StoryEngine';
import { useStoryStore } from './useStoryStore';

export function useCurrentStory() {
    const currentStoryId = useStoryStore(s => s.currentStoryId);
    return currentStoryId ? storyEngine.stories[currentStoryId]?.story || null : null;
}
