'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // For single choice
import { Checkbox } from '@/components/ui/checkbox'; // For multiple choice
import { Label } from '@/components/ui/label';
import { StreamChat, Channel } from 'stream-chat'; // Import necessary types
import { useToast } from '@/hooks/use-toast';

// Define more specific types for poll data based on Stream's structure
// These might need refinement based on actual API response
interface PollOption {
    id: string;
    text: string;
    vote_count?: number; // Optional, might be present
}

interface PollVote {
    option_id: string;
    user_id?: string; // May not always be present depending on visibility
    // Add other vote properties if needed (id, created_at, etc.)
}

interface Poll {
    id: string;
    name: string; // The question
    options: PollOption[];
    enforce_unique_vote: boolean;
    vote_count?: number;
    own_votes?: PollVote[]; // Votes by the current user
    vote_counts_by_option?: Record<string, number>; // Vote counts per option
    is_closed?: boolean;
    voting_visibility?: 'public' | 'anonymous'; // Add visibility
    // Add other relevant fields like created_by_id etc. if needed
}

interface PollDisplayProps {
    pollData: Poll;
    messageId: string; // Needed to cast vote
    channel: Channel; // Needed for context, maybe future actions
    chatClient: StreamChat; // Needed to cast vote
    currentUserId: string | undefined; // ID of the logged-in user
    isCreator: boolean; // Is the current user the host?
}

export function PollDisplay({ pollData, messageId, channel, chatClient, currentUserId, isCreator }: PollDisplayProps) {
    const { toast } = useToast();
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // Store IDs of selected options
    const [hasVoted, setHasVoted] = useState(false);
    const [isClosing, setIsClosing] = useState(false); // State for closing action
    const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double clicks

    // Determine if the current user has already voted on this poll
    useEffect(() => {
        if (pollData.own_votes && pollData.own_votes.length > 0 && currentUserId) {
            setHasVoted(true);
            // Pre-select options if user has voted
            setSelectedOptions(pollData.own_votes.map(vote => vote.option_id));
        } else {
            setHasVoted(false);
            setSelectedOptions([]);
        }
        // Reset submitting state if poll data changes (e.g., due to external update)
        setIsSubmitting(false);
    }, [pollData.own_votes, currentUserId]);

    const handleVote = async () => {
        if (!currentUserId || selectedOptions.length === 0 || !pollData.id || !messageId || isSubmitting) {
            return; // Don't vote if no selection, not logged in, or already submitting
        }

        // Prevent voting if poll is closed
        if (pollData.is_closed) {
             toast({ title: 'Poll Closed', description: 'Voting is no longer allowed for this poll.' });
             return;
        }

        setIsSubmitting(true);

        try {
            // Stream's castPollVote handles one option ID at a time.
            // For multiple choice, we need to call it for each selected option *that wasn't previously selected*.
            // And potentially remove votes for options that were deselected (though Stream might handle this).
            // Let's refine this:

            const previousVotes = pollData.own_votes?.map(v => v.option_id) || [];
            const votesToAdd = selectedOptions.filter(id => !previousVotes.includes(id));
            // Votes to remove might be needed if Stream doesn't handle deselection automatically
            // const votesToRemove = previousVotes.filter(id => !selectedOptions.includes(id));

            // Cast new votes
            // Use Promise.all to send votes concurrently
            await Promise.all(
                votesToAdd.map(optionId =>
                    chatClient.castPollVote(messageId, pollData.id, { option_id: optionId })
                )
            );

            // Handle removing votes if necessary (check Stream docs/behavior)
            // await Promise.all(votesToRemove.map(... removePollVote ...));

            toast({ title: 'Vote Cast', description: 'Your vote has been recorded.' });
            // The component should re-render with updated pollData via WebSocket events,
            // which will update `hasVoted` state in the useEffect hook.

        } catch (error) {
            console.error('Error casting poll vote:', error);
            toast({
                variant: 'destructive',
                title: 'Voting Failed',
                description: error instanceof Error ? error.message : 'Could not cast your vote.',
            });
        } finally {
             // Ensure submitting state is reset even if there's an error
             // Add a small delay to prevent immediate re-click if UI update is slow
             setTimeout(() => setIsSubmitting(false), 300);
        }
    };

    // Handler for RadioGroup (single choice)
    const handleRadioChange = (optionId: string) => {
        if (!pollData.is_closed && !hasVoted) {
            setSelectedOptions([optionId]);
        }
    };

    // Handler for Checkbox (multiple choice)
    const handleCheckboxChange = (optionId: string, checked: boolean) => {
         if (!pollData.is_closed && !hasVoted) {
            setSelectedOptions(prev =>
                checked
                    ? [...prev, optionId] // Add option
                    : prev.filter(id => id !== optionId) // Remove option
            );
        }
    };

    const handleClosePoll = async () => {
        if (!isCreator || pollData.is_closed || isClosing) return;

        setIsClosing(true);
        try {
            await chatClient.closePoll(pollData.id);
            toast({ title: 'Poll Closed', description: 'Voting is now disabled for this poll.' });
            // UI should update via WebSocket event triggering re-render
        } catch (error) {
            console.error('Error closing poll:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not close the poll.',
            });
        } finally {
            setIsClosing(false);
        }
    };


    // Determine when to show results
    // Show if poll is closed OR if user has voted (regardless of visibility for simplicity here)
    // More complex logic could check pollData.voting_visibility
    const showResultsView = pollData.is_closed || hasVoted;
    const canVote = !pollData.is_closed && !hasVoted;

    const totalVotes = pollData.vote_count || 0;

    return (
        <div className="my-2 p-3 border rounded-md bg-muted/20 shadow-sm">
            <p className="font-semibold mb-2 text-sm">{pollData.name}</p>
            <div className="space-y-1 mb-3">
                {pollData.options.map(option => {
                    const votesForOption = pollData.vote_counts_by_option?.[option.id] || 0;
                    const percentage = totalVotes > 0 ? Math.round((votesForOption / totalVotes) * 100) : 0;
                    const isSelectedInForm = selectedOptions.includes(option.id); // Currently selected in UI
                    const isOwnPastVote = pollData.own_votes?.some(v => v.option_id === option.id) ?? false; // User's actual vote

                    return (
                        <div key={option.id} className="text-sm">
                            {showResultsView ? (
                                // Results View
                                <div className="flex-1 relative border rounded px-2 py-1 overflow-hidden my-1 bg-background">
                                    {/* Background bar for percentage */}
                                    <div
                                        className="absolute top-0 left-0 h-full bg-primary/20 z-0 transition-all duration-300 ease-in-out"
                                        style={{ width: `${percentage}%` }}
                                    />
                                    {/* Text content */}
                                    <div className="relative z-10 flex justify-between items-center">
                                        <span>{option.text} {isOwnPastVote ? ' (Your Vote)' : ''}</span>
                                        <span className="text-xs font-medium">{percentage}% ({votesForOption})</span>
                                    </div>
                                </div>
                            ) : (
                                // Voting View
                                <div className="flex items-center space-x-2 py-1">
                                    {pollData.enforce_unique_vote ? (
                                        <RadioGroup value={selectedOptions[0]} onValueChange={handleRadioChange} className="flex items-center w-full">
                                            <RadioGroupItem value={option.id} id={`poll-${pollData.id}-option-${option.id}`} disabled={!canVote || isSubmitting} />
                                            <Label htmlFor={`poll-${pollData.id}-option-${option.id}`} className="flex-1 cursor-pointer">{option.text}</Label>
                                        </RadioGroup>
                                    ) : (
                                        <>
                                            <Checkbox
                                                id={`poll-${pollData.id}-option-${option.id}`}
                                                checked={isSelectedInForm}
                                                onCheckedChange={(checked) => handleCheckboxChange(option.id, !!checked)}
                                                disabled={!canVote || isSubmitting}
                                            />
                                            <Label htmlFor={`poll-${pollData.id}-option-${option.id}`} className="flex-1 cursor-pointer">{option.text}</Label>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {canVote && ( // Show vote button only if user can vote
                <Button
                    size="sm"
                    onClick={handleVote}
                    disabled={selectedOptions.length === 0 || isSubmitting}
                    className="w-full sm:w-auto"
                >
                    {isSubmitting ? 'Voting...' : 'Vote'}
                </Button>
            )}
             {pollData.is_closed && (
                 <p className="text-xs text-muted-foreground mt-2 font-medium">Voting is closed.</p>
             )}
             {hasVoted && !pollData.is_closed && (
                 <p className="text-xs text-muted-foreground mt-2 font-medium">✅ You have voted.</p>
             )}
             <p className="text-xs text-muted-foreground mt-1">Total votes: {totalVotes}</p>

             {/* Add Close Poll button for creator if poll is open */}
             {isCreator && !pollData.is_closed && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClosePoll}
                    disabled={isClosing}
                    className="mt-2 w-full sm:w-auto"
                >
                    {isClosing ? 'Closing...' : 'Close Poll'}
                </Button>
             )}
        </div>
    );
}
