# Task: Implement Time-Based Leaderboard Ranking

This task involves modifying the tryout system to rank participants based on score and the time taken to complete the tryout, rather than just the submission timestamp.

## To-Do List

-   [ ] **Database Schema Modification (`prisma/schema.prisma`):**
    -   [ ] Add `startedAt` field (DateTime, nullable) to `TryoutParticipant` model.
    -   [ ] Add `timeTakenSeconds` field (Int, nullable) to `TryoutParticipant` model.
    -   [ ] Run `prisma migrate dev` to apply schema changes.

-   [ ] **Record Tryout Start Time:**
    -   [ ] Create a new server action `recordTryoutStartTime(tryoutId, userId)` in `app/actions/tryout-actions.ts`.
        -   This action should update the `startedAt` field for the specific participant, ensuring it only happens once.
    -   [ ] Modify the `TryoutQuiz` component (`components/tryout/TryoutQuiz.tsx`).
        -   Call `recordTryoutStartTime` when the component mounts for the first time for a given attempt.

-   [ ] **Calculate and Store Time Taken:**
    -   [ ] Modify the `submitTryoutAnswers` server action (`app/actions/tryout-actions.ts`).
        -   Retrieve the participant's `startedAt` timestamp.
        -   Calculate `timeTakenSeconds = (submittedAt - startedAt) / 1000`.
        -   Store the calculated `timeTakenSeconds` in the database along with `score` and `submittedAt`.
        -   Handle potential null `startedAt` cases gracefully (e.g., if submission happens before start time is recorded, though this shouldn't occur with proper implementation).

-   [ ] **Update Leaderboard Ranking Logic:**
    -   [ ] Modify the `getTryoutLeaderboard` server action (`app/actions/tryout-actions.ts`).
        -   Change the `orderBy` clause in the `db.tryoutParticipant.findMany` query.
        -   New order: `[{ score: 'desc' }, { timeTakenSeconds: 'asc' }]`.
        -   Consider how to handle null `timeTakenSeconds` for older data if necessary (e.g., rank them last in time-based ties).

-   [ ] **Frontend Display (Optional but Recommended):**
    -   [ ] Update the leaderboard page (`app/tryout/[id]/leaderboard/page.tsx`) to display the `timeTakenSeconds` (formatted appropriately, e.g., MM:SS) for each participant.

-   [ ] **Testing:**
    -   [ ] Thoroughly test the entire flow: joining, starting, submitting, and viewing the leaderboard.
    -   [ ] Test edge cases (e.g., submitting exactly at the duration limit, ties in score and time).
    -   [ ] Verify ranking logic with various scores and completion times.
