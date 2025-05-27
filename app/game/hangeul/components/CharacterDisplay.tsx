import React from 'react';
import { HangulCharacter } from '../data/hangulData';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface CharacterDisplayProps {
  character: HangulCharacter;
  showInfo?: boolean; 
  onInfoClick?: () => void;
}

export function CharacterDisplay({ 
  character, 
  showInfo = true, 
  onInfoClick 
}: CharacterDisplayProps) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center relative w-full h-full"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex flex-col items-center justify-center mb-2">
        <motion.div 
          className="text-9xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text hangeul"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          {character.character}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl mt-2 text-slate-700 dark:text-slate-300"
        >
         
        </motion.div>
      </div>
      
      <div className="flex items-center justify-center gap-3 mt-2">
        {character.type && (
          <Badge variant="outline" className={`
            ${character.type === 'consonant' ? 'border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400' : 
              character.type === 'vowel' ? 'border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-400' : 
              'border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-400'}
          `}>
            {character.type === 'consonant' ? 'Konsonan' : 
             character.type === 'vowel' ? 'Vokal Tunggal' : 'Vokal Rangkap'}
          </Badge>
        )}
        
        <Badge variant={character.difficulty === 'easy' ? 'secondary' : 
                        character.difficulty === 'medium' ? 'default' : 'destructive'}>
          {character.difficulty === 'easy' ? 'Mudah' : 
           character.difficulty === 'medium' ? 'Sedang' : 'Sulit'}
        </Badge>
        
        {showInfo && (
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full p-0 w-8 h-8 border-blue-200 dark:border-blue-800"
            onClick={onInfoClick}
            aria-label="Character information"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
