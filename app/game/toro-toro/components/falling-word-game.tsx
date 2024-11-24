"use client";

import { useFallingWordGame } from '../hooks/use-falling-word-game';
import { FallingWordDisplay } from './falling-word-display';

export default function FallingWordsGame() {
  const { state, actions } = useFallingWordGame();

  return (
    <FallingWordDisplay
      fallingWords={state.fallingWords}
      userInput={state.userInput}
      timer={state.timer}
      gameOver={state.gameOver}
      score={state.score}
      gameStarted={state.gameStarted}
      customWords={state.customWords}
      isUsingCustomWords={state.isUsingCustomWords}
      dialogOpen={state.dialogOpen}
      dictionarySearch={state.dictionarySearch}
      searchResults={state.searchResults}
      isSearching={state.isSearching}
      difficulty={state.difficulty}
      selectedWordList={state.selectedWordList}
      onInputChange={actions.handleInputChange}
      onStart={actions.startGame}
      onDialogOpenChange={actions.setDialogOpen}
      onDictionarySearch={actions.searchDictionary}
      onDictionarySearchChange={actions.setDictionarySearch}
      onAddCustomWord={actions.addCustomWord}
      onAddFromDictionary={actions.addFromDictionary}
      onRemoveCustomWord={actions.removeCustomWord}
      onUseCustomWords={actions.setIsUsingCustomWords}
      onSetGameAreaHeight={actions.setGameAreaHeight}
      onDifficultyChange={actions.setDifficulty}
      onWordListChange={actions.setSelectedWordList}
    />
  );
}
