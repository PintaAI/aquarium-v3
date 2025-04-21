'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Switch } from '@/components/ui/switch'; // For toggles like unique vote

// Define the structure for a poll option
interface PollOptionInput {
  id: number; // Temporary ID for mapping
  text: string;
}

// Define the structure for the poll data submitted by the form
export interface PollFormData {
  name: string; // The poll question
  options: { text: string }[]; // Array of option texts
  enforceUniqueVote: boolean; // Single vs Multiple choice
  // Add other settings later if needed (visibility, allow answers, etc.)
}

interface CreatePollFormProps {
  onSubmit: (pollData: PollFormData) => void;
  onCancel: () => void;
}

export function CreatePollForm({ onSubmit, onCancel }: CreatePollFormProps) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<PollOptionInput[]>([
    { id: 1, text: '' },
    { id: 2, text: '' },
  ]);
  const [nextOptionId, setNextOptionId] = useState(3);
  const [enforceUniqueVote, setEnforceUniqueVote] = useState(true); // Default to single choice

  const handleOptionChange = (id: number, text: string) => {
    setOptions(currentOptions =>
      currentOptions.map(option =>
        option.id === id ? { ...option, text } : option
      )
    );
  };

  const addOption = () => {
    if (options.length < 10) { // Limit options (Stream might have limits)
      setOptions([...options, { id: nextOptionId, text: '' }]);
      setNextOptionId(prev => prev + 1);
    }
  };

  const removeOption = (id: number) => {
    if (options.length > 2) { // Keep at least 2 options
      setOptions(options.filter(option => option.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options
      .map(opt => ({ text: opt.text.trim() }))
      .filter(opt => opt.text !== '');

    if (!question.trim() || validOptions.length < 2) {
      // Add user feedback (e.g., toast notification)
      console.error('Poll question and at least two options are required.');
      return;
    }

    onSubmit({
      name: question.trim(),
      options: validOptions,
      enforceUniqueVote: enforceUniqueVote,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="poll-question">Poll Question</Label>
        <Input
          id="poll-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What do you want to ask?"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Options</Label>
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2">
            <Input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(option.id, e.target.value)}
              placeholder={`Option ${index + 1}`}
              required
            />
            {options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeOption(option.id)}
                aria-label="Remove option"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {options.length < 10 && (
           <Button type="button" variant="outline" size="sm" onClick={addOption}>
             Add Option
           </Button>
        )}
      </div>

       <div className="flex items-center space-x-2">
         <Switch
           id="unique-vote"
           checked={enforceUniqueVote}
           onCheckedChange={setEnforceUniqueVote}
         />
         <Label htmlFor="unique-vote">Single Choice (Users can only vote once)</Label>
       </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Poll</Button>
      </div>
    </form>
  );
}
