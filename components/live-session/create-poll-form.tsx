'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, PlusCircle, HelpCircle } from 'lucide-react'; // Import PlusCircle and HelpCircle
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
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-card rounded-lg shadow"> 
      <div className="relative">
        <Input
          id="poll-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="" 
          required
          className="block px-3 pb-2 pt-4 w-full text-sm text-foreground bg-transparent rounded-md border border-input appearance-none focus:outline-none focus:ring-0 focus:border-primary peer" /* Use theme colors */
        />
        <Label
          htmlFor="poll-question"
          className="absolute text-sm text-muted-foreground duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] start-3 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 bg-card px-1" /* Use theme colors */
        >
          Pertanyaan Polling
        </Label>
      </div>

      {/* Options Section */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-primary">Pilihan Jawaban</Label>
        {options.map((option, index) => (
          <div key={option.id} className="flex items-center gap-2 group">
            {/* Option Input - Outlined Style */}
            <div className="relative flex-grow">
              <Input
                id={`option-${option.id}`}
                type="text"
                value={option.text}
                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                placeholder=" " // Important for label animation
                required
                className="block px-3 pb-2 pt-4 w-full text-sm text-foreground bg-transparent rounded-md border border-input appearance-none focus:outline-none focus:ring-0 focus:border-primary peer" /* Use theme colors */
              />
               <Label
                 htmlFor={`option-${option.id}`}
                 className="absolute text-sm text-muted-foreground duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] start-3 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 bg-card px-1" /* Use theme colors */
               >
                  Pilihan {index + 1}
                </Label>
             </div>
            {options.length > 2 && (
              <Button
                type="button"
                variant="destructive"
                size="icon" // Make button square
                onClick={() => removeOption(option.id)}
                aria-label="Hapus pilihan"
                className="text-gray-400 hover:text-red-600 hover:bg-red-100  group-hover:opacity-100 transition-opacity flex-shrink-0 h-9 w-9" // Adjusted size and hover
              >
                <X className="h-4 w-4" />
              </Button>
            )}
           </div>
         ))}
        {options.length < 10 && (
           <Button
             type="button"
             variant="ghost" // Use ghost for less emphasis
             size="sm"
             onClick={addOption}
              className="text-primary hover:text-primary/90 hover:bg-accent flex items-center gap-1" /* Use theme colors, added flex styles */
             >
              <PlusCircle className="h-4 w-4" /> {/* Added icon */}
              Tambah Pilihan
            </Button>
        )}
      </div>

       {/* Switch Section */}
       <div className="flex items-center space-x-3 p-3 bg-muted/20 rounded-md border border-input"> {/* Use bg-muted */}
         <Switch
           id="unique-vote"
           checked={enforceUniqueVote}
           onCheckedChange={setEnforceUniqueVote}
            className="data-[state=checked]:bg-primary" /* Use theme color */
          />
          <Label htmlFor="unique-vote" className="text-sm text-accent flex items-center gap-1 cursor-pointer"> {/* Added flex, gap, cursor */}
          <HelpCircle className="h-4 w-4 text-muted-foreground" /> {/* Added icon */}
             hanya bisa memilih satu jawaban
            
          </Label>
        </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="ghost" // Text button style
          onClick={onCancel}
          className="text-primary hover:bg-accent" /* Use theme colors */
        >
          Batal
        </Button>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-4 py-2" /* Use theme colors */
        >
          Buat Polling
        </Button>
      </div>
    </form>
  );
}
