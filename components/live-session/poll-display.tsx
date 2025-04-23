'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // For single choice
import { Checkbox } from '@/components/ui/checkbox'; // For multiple choice
import { Label } from '@/components/ui/label';
import { StreamChat } from 'stream-chat'; // Import necessary types
import { useToast } from '@/hooks/use-toast';

interface PollOption {
    id: string;
    text: string;
    vote_count?: number; // Optional, might be present
}

interface PollVote {
    option_id: string;
    user_id?: string; // May not always be present depending on visibility

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

}

interface PollDisplayProps {
    pollData: Poll;
    messageId: string; // Needed to cast vote
    chatClient: StreamChat; // Needed to cast vote
    currentUserId: string | undefined; // ID of the logged-in user
    isCreator: boolean; // Is the current user the host?
}

export function PollDisplay({ pollData, messageId, chatClient, currentUserId, isCreator }: PollDisplayProps) {
    const { toast } = useToast();
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]); // Store IDs of selected options
    const [displayPollData, setDisplayPollData] = useState<Poll>(pollData); // Local state for rendering
    const [hasVoted, setHasVoted] = useState(false);
    const [isClosing, setIsClosing] = useState(false); // State for closing action
    const [isDeleting, setIsDeleting] = useState(false); // State for deleting action
    const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double clicks


    useEffect(() => {
        setDisplayPollData(pollData);
    }, [pollData]);

 
    useEffect(() => {
        if (pollData.own_votes && pollData.own_votes.length > 0 && currentUserId) {
            setHasVoted(true);
            // Pre-select options if user has voted (using prop data for initial load)
            setSelectedOptions(pollData.own_votes.map(vote => vote.option_id));
        } else {

            if (!pollData.own_votes || pollData.own_votes.length === 0) {
                 setHasVoted(false);
                 setSelectedOptions([]);
            }
        }

        setIsSubmitting(false);
    }, [pollData.own_votes, currentUserId]); // Depend on prop data

    const handleVote = async () => {
        if (!currentUserId || selectedOptions.length === 0 || !pollData.id || !messageId || isSubmitting) {
            return; // Don't vote if no selection, not logged in, or already submitting
        }


        if (pollData.is_closed) {
             toast({ title: 'Poll Closed', description: 'Voting is no longer allowed for this poll.' });
             return;
        }

        setIsSubmitting(true);

        try {


            const previousVotes = pollData.own_votes?.map(v => v.option_id) || [];
            const votesToAdd = selectedOptions.filter(id => !previousVotes.includes(id));
  
            await Promise.all(
                votesToAdd.map(optionId =>
                    chatClient.castPollVote(messageId, pollData.id, { option_id: optionId })
                 )
             );

             setHasVoted(true);
             setDisplayPollData(currentPollData => {
                if (!currentPollData) return currentPollData; // Should not happen here

                const newVoteCounts = { ...(currentPollData.vote_counts_by_option || {}) };
                let newTotalVotes = currentPollData.vote_count || 0;
                const newOwnVotes = [...(currentPollData.own_votes || [])];

                votesToAdd.forEach(optionId => {
                    newVoteCounts[optionId] = (newVoteCounts[optionId] || 0) + 1;
                    newTotalVotes++;
                    // Add to own_votes optimistically
                    if (!newOwnVotes.some(v => v.option_id === optionId) && currentUserId) {
                         newOwnVotes.push({ option_id: optionId, user_id: currentUserId });
                    }
                });



                return {
                    ...currentPollData,
                    vote_count: newTotalVotes,
                    vote_counts_by_option: newVoteCounts,
                    own_votes: newOwnVotes,
                };
             });


             toast({ title: 'Vote Cast', description: 'Your vote has been recorded.' });


        } catch (error) {
            console.error('Error casting poll vote:', error);
            toast({
                variant: 'destructive',
                title: 'Voting Failed',
                description: error instanceof Error ? error.message : 'Could not cast your vote.',
            });
        } finally {

             setTimeout(() => setIsSubmitting(false), 300);
         }
     };

    const handleDeletePoll = async () => {
        if (!isCreator || isDeleting) return;

        setIsDeleting(true);
        try {
            // We use the messageId associated with this poll display
            await chatClient.deleteMessage(messageId);
            toast({ title: 'Poll Deleted', description: 'The poll message has been removed.' });
            // The message.deleted event should handle removing it from the ChatComponent state
        } catch (error) {
            console.error('Error deleting poll message:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete the poll message.',
            });
        } finally {
            setIsDeleting(false);
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


    // Determine when to show results using local state for optimistic updates
    // Show results ONLY if poll is closed OR if the current user is the host.
    // Regular users see results only after the poll is closed.
    const showResultsView = displayPollData.is_closed || isCreator;
    // Voting is allowed if the poll is not closed AND the user hasn't voted yet.
    const canVote = !displayPollData.is_closed && !hasVoted;

    // Use local state for displaying counts
    const totalVotes = displayPollData.vote_count || 0;


    if (!displayPollData) return null;

    return (
        <div className="my-2 p-3 border rounded-md bg-muted/20 shadow-sm">
            <p className="font-semibold mb-2 text-sm">{displayPollData.name}</p>
            <div className="space-y-1 mb-3">
                {displayPollData.options.map(option => {
                    // Use local state for counts and percentages
                    const votesForOption = displayPollData.vote_counts_by_option?.[option.id] || 0;
                    const percentage = totalVotes > 0 ? Math.round((votesForOption / totalVotes) * 100) : 0;
                    const isSelectedInForm = selectedOptions.includes(option.id); // Currently selected in UI form
                    // Use local state to check for own vote optimistically
                    const isOwnPastVote = displayPollData.own_votes?.some(v => v.option_id === option.id && v.user_id === currentUserId) ?? false;

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
                                    {/* Use displayPollData for rendering properties */}
                                    {displayPollData.enforce_unique_vote ? (
                                        <RadioGroup value={selectedOptions[0]} onValueChange={handleRadioChange} className="flex items-center w-full">
                                            {/* Use displayPollData.id for unique IDs */}
                                            <RadioGroupItem value={option.id} id={`poll-${displayPollData.id}-option-${option.id}`} disabled={!canVote || isSubmitting} />
                                            <Label htmlFor={`poll-${displayPollData.id}-option-${option.id}`} className="flex-1 cursor-pointer transition-colors duration-150 ease-in-out">{option.text}</Label> {/* Added transition */}
                                        </RadioGroup>
                                    ) : (
                                        <>
                                            <Checkbox
                                                id={`poll-${displayPollData.id}-option-${option.id}`}
                                                checked={isSelectedInForm}
                                                onCheckedChange={(checked) => handleCheckboxChange(option.id, !!checked)}
                                                disabled={!canVote || isSubmitting}
                                            />
                                            <Label htmlFor={`poll-${displayPollData.id}-option-${option.id}`} className="flex-1 cursor-pointer transition-colors duration-150 ease-in-out">{option.text}</Label> {/* Added transition */}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {canVote && !isCreator && ( // Show vote button only if user can vote AND is not the creator
                <Button
                    size="sm"
                    onClick={handleVote}
                    disabled={selectedOptions.length === 0 || isSubmitting}
                    className="w-full sm:w-auto"
                >
                    {isSubmitting ? 'Voting...' : 'Vote'}
                </Button>
            )}
             {/* Use displayPollData for conditional rendering based on status */}
             {displayPollData.is_closed && (
                 <p className="text-xs text-muted-foreground mt-2 font-medium">Quiz berakhir 🎉</p>
             )}
             {hasVoted && !displayPollData.is_closed && (
                 <p className="text-xs text-muted-foreground mt-2 font-medium">✅ Sudah menjawab</p>
             )}
             {/* Display total votes from local state */}
             <p className="text-xs text-muted-foreground mt-1">Partisipan: {totalVotes}</p>

             {/* Add Close Poll button for creator if poll is open (using local state) */}
             {isCreator && !displayPollData.is_closed && (
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
              {/* Add Delete Poll button for creator */}
              {isCreator && (
                 <Button
                     variant="destructive"
                     size="sm"
                     onClick={handleDeletePoll}
                     disabled={isDeleting}
                     className="mt-2 ml-2 w-full sm:w-auto" // Added ml-2 for spacing
                 >
                     {isDeleting ? 'Deleting...' : 'Delete Poll'}
                 </Button>
              )}
         </div>
     );
}
