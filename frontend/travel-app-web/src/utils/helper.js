import ADD_STORY_IMG from '../assets/write-7.svg';
import NO_SEARCH_DATA_IMG from '../assets/search-137.svg';
import NO_FILTER_DATA_IMG from '../assets/calendar-118.svg';

export const validateEmail = (email) => {
const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
return regex.test(email);

}


export const getInitials = (name) => {
  if (!name) return ""; // Si name est vide ou indéfini, retourne une chaîne vide

  const words = name.split(" ");
  let initials = "";

  for (let i = 0; i < Math.min(words.length, 2); i++) {
    initials += words[i][0]; // Récupère la première lettre de chaque mot
  }

  return initials.toUpperCase(); // Retourne les initiales en majuscules
};


export const getEmptyCardMessage = (filterType) => {
  switch (filterType) {
    case "search":
      return "Oops! No stories found matching your search";

    case "date":
      return "No stories found in the given date range";

    default:
      return `Start creating your first Travel Story! Click the add button to jot down your thoughts, ideas, and memories. Let's get started!`; // Utilisation des backticks pour une chaîne multilignes
  }
};

export const getEmptyCardImg = (filterType) => {
  switch (filterType) {
    case "search":
      return NO_SEARCH_DATA_IMG;

    case "date":
      return NO_FILTER_DATA_IMG;

    default:
      return ADD_STORY_IMG;
  }
};
