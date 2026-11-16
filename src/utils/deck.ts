import { ClueCard } from '../types/game';
import { shuffleArray } from '../data/mansionData';

export interface DrawCluesResult {
  drawn: ClueCard[];
  nextDeck: ClueCard[];
  nextDiscard: ClueCard[];
  reshuffled: boolean;
}

/**
 * Draws `count` clue cards from `deck`. Whenever `deck` runs out and `discard`
 * has cards, `discard` is shuffled back into `deck` automatically.
 */
export function drawClueCards(
  deck: ClueCard[],
  discard: ClueCard[],
  count: number
): DrawCluesResult {
  let currentDeck = [...deck];
  let currentDiscard = [...discard];
  const drawn: ClueCard[] = [];
  let reshuffled = false;

  for (let i = 0; i < count; i++) {
    if (currentDeck.length === 0) {
      if (currentDiscard.length === 0) {
        break;
      }
      currentDeck = shuffleArray(currentDiscard);
      currentDiscard = [];
      reshuffled = true;
    }

    const nextCard = currentDeck.shift();
    if (nextCard) {
      drawn.push(nextCard);
    }
  }

  // Keep deck non-empty if discard has cards (prevents empty deck in Duo vision phase)
  if (currentDeck.length === 0 && currentDiscard.length > 0) {
    currentDeck = shuffleArray(currentDiscard);
    currentDiscard = [];
    reshuffled = true;
  }

  return {
    drawn,
    nextDeck: currentDeck,
    nextDiscard: currentDiscard,
    reshuffled,
  };
}
