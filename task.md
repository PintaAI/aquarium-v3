# MatchKor Game Implementation

## Core Logic
- [ ] **Word Fetching Action (`app/game/matchkor/actions/get-match-words.ts`):**
    - [x] Create `getMatchWords(count, collectionId?)` action:
        - [x] Fetch potential words (Korean/Indonesian pairs) from user/public collections.
        - [x] Filter by `collectionId` if provided.
        - [x] Shuffle potential words.
        - [x] Select the required `count` of pairs.
        - [x] Format into `{ id, content, type, pairId }` structure.
        - [x] Shuffle the final items array.
    - [x] Create `getCollections()` action:
        - [x] Fetch user/public collections.
        - [x] Include `_count` of valid word pairs (Korean & Indonesian not empty).
        - [x] Filter collections to ensure a minimum number of pairs (e.g., 3).
- [ ] **Game Setup (`app/game/matchkor/components/GameSettings.tsx`):**
    - [ ] Fetch collections using `getCollections` from the dedicated action file.
    - [ ] Add state for collections, loading, error, selected collection ID/title.
    - [ ] Implement UI for selecting a collection or "Acak" (Random).
        - [ ] Use a Dialog similar to the Flashcard game.
        - [ ] Display loading/error states for collection fetching.
    - [ ] Keep existing UI for selecting difficulty (easy, medium, hard).
    - [ ] Update `onStart` prop function signature to accept `(difficulty, collectionId?)`.
    - [ ] Call `onStart` with selected difficulty and collection ID (`undefined` for random).
- [ ] **Main Page (`app/game/matchkor/page.tsx`):**
    - [ ] Update `beginGame` function to accept `(difficulty, collectionId?)`.
    - [ ] Store `selectedCollectionId` in state.
    - [ ] Determine `pairCount` based on `difficulty` (e.g., easy: 6, medium: 8, hard: 10).
    - [ ] Pass `pairCount` and `selectedCollectionId` to `MatchGame` component.
- [ ] **Game Component (`app/game/matchkor/components/MatchGame.tsx`):**
    - [ ] Accept `pairCount` and `collectionId` as props.
    - [ ] Fetch words using `getMatchWords(pairCount, collectionId)` from the dedicated action file.
    - [ ] Implement game logic:
        - Display fetched items in a grid.
        - Handle user clicks on items.
        - Track selected items.
        - Check for matches based on `pairId`.
        - Update score on correct matches.
        - Handle game timer (if applicable based on difficulty).
        - Determine game end condition (all pairs matched or time runs out).
    - [ ] Call `onGameEnd` prop with the final score.

## UI/UX
- [ ] Display loading state while fetching collections/words.
- [ ] Display error messages if fetching fails.
- [ ] Ensure smooth transitions between game states (start, settings, playing, finished).
- [ ] Provide clear visual feedback for matching pairs (correct/incorrect).
- [ ] Add visual styling for selected/matched items.

## Refinement
- [ ] Test with different collections (including "Acak") and difficulties.
- [ ] Test edge cases (e.g., collections with few words, fetching errors).
- [ ] Ensure proper cleanup/reset when restarting or returning to start.
