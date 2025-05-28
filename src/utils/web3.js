import { ethers } from 'ethers';
import RecipeNFT from '../contracts/RecipeNFT.json';
import RecipeReview from '../contracts/RecipeReview.json';
import EventManager from '../contracts/EventManager.json';

// Load contract addresses
const contractAddresses = require('../../contract-addresses.json');

// Initialize provider and signer
let provider;
let signer;
let recipeNFTContract;
let recipeReviewContract;
let eventManagerContract;

export const initializeWeb3 = async () => {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      throw new Error('Please install MetaMask to use this application');
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    // Create provider and signer
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();

    // Initialize contracts
    recipeNFTContract = new ethers.Contract(
      contractAddresses.recipeNFT,
      RecipeNFT.abi,
      signer
    );

    recipeReviewContract = new ethers.Contract(
      contractAddresses.recipeReview,
      RecipeReview.abi,
      signer
    );

    eventManagerContract = new ethers.Contract(
      contractAddresses.eventManager,
      EventManager.abi,
      signer
    );

    return true;
  } catch (error) {
    console.error('Error initializing Web3:', error);
    return false;
  }
};

// Recipe NFT functions
export const createRecipe = async (
  tokenURI,
  price,
  categories,
  ingredients,
  difficulty,
  preparationTime,
  cookingTime,
  servings
) => {
  try {
    const tx = await recipeNFTContract.createRecipe(
      tokenURI,
      ethers.parseEther(price.toString()),
      categories,
      ingredients,
      difficulty,
      preparationTime,
      cookingTime,
      servings
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'RecipeCreated');
    return event.args[0]; // Return recipe ID
  } catch (error) {
    console.error('Error creating recipe:', error);
    throw error;
  }
};

export const buyRecipe = async (recipeId, price) => {
  try {
    const tx = await recipeNFTContract.buyRecipe(recipeId, {
      value: ethers.parseEther(price.toString())
    });
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error buying recipe:', error);
    throw error;
  }
};

export const getRecipeDetails = async (recipeId) => {
  try {
    const details = await recipeNFTContract.getRecipeDetails(recipeId);
    return {
      chef: details[0],
      price: ethers.formatEther(details[1]),
      isForSale: details[2],
      tokenURI: details[3],
      creationDate: new Date(details[4] * 1000),
      categories: details[5],
      ingredients: details[6],
      difficulty: details[7],
      preparationTime: details[8],
      cookingTime: details[9],
      servings: details[10]
    };
  } catch (error) {
    console.error('Error getting recipe details:', error);
    throw error;
  }
};

// Recipe Review functions
export const addReview = async (recipeId, rating, comment) => {
  try {
    const tx = await recipeReviewContract.addReview(recipeId, rating, comment);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error adding review:', error);
    throw error;
  }
};

export const getRecipeReviews = async (recipeId) => {
  try {
    const reviews = await recipeReviewContract.getRecipeReviews(recipeId);
    return {
      averageRating: reviews[0],
      reviewCount: reviews[1],
      reviews: reviews[2].map(review => ({
        reviewer: review.reviewer,
        rating: review.rating,
        comment: review.comment,
        timestamp: new Date(review.timestamp * 1000),
        isVerified: review.isVerified
      }))
    };
  } catch (error) {
    console.error('Error getting recipe reviews:', error);
    throw error;
  }
};

// Event Manager functions
export const createEvent = async (
  title,
  description,
  price,
  maxParticipants,
  eventDate,
  allergies
) => {
  try {
    const tx = await eventManagerContract.createEvent(
      title,
      description,
      ethers.parseEther(price.toString()),
      maxParticipants,
      Math.floor(eventDate.getTime() / 1000),
      allergies
    );
    const receipt = await tx.wait();
    const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'EventCreated');
    return event.args[0]; // Return event ID
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const bookEvent = async (eventId, allergies, price) => {
  try {
    const tx = await eventManagerContract.bookEvent(eventId, allergies, {
      value: ethers.parseEther(price.toString())
    });
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error booking event:', error);
    throw error;
  }
};

export const getEventDetails = async (eventId) => {
  try {
    const details = await eventManagerContract.getEventDetails(eventId);
    return {
      chef: details[0],
      title: details[1],
      description: details[2],
      price: ethers.formatEther(details[3]),
      maxParticipants: details[4],
      currentParticipants: details[5],
      eventDate: new Date(details[6] * 1000),
      isActive: details[7],
      allergies: details[8]
    };
  } catch (error) {
    console.error('Error getting event details:', error);
    throw error;
  }
};

export const getBookingDetails = async (eventId, participant) => {
  try {
    const details = await eventManagerContract.getBookingDetails(eventId, participant);
    return {
      bookingDate: new Date(details[0] * 1000),
      allergies: details[1],
      hasAttended: details[2]
    };
  } catch (error) {
    console.error('Error getting booking details:', error);
    throw error;
  }
};

// Event listeners
export const onRecipeCreated = (callback) => {
  recipeNFTContract.on('RecipeCreated', (tokenId, chef, tokenURI) => {
    callback({ tokenId, chef, tokenURI });
  });
};

export const onRecipeSold = (callback) => {
  recipeNFTContract.on('RecipeSold', (tokenId, seller, buyer, price) => {
    callback({ tokenId, seller, buyer, price: ethers.formatEther(price) });
  });
};

export const onEventCreated = (callback) => {
  eventManagerContract.on('EventCreated', (eventId, chef, title) => {
    callback({ eventId, chef, title });
  });
};

export const onEventBooked = (callback) => {
  eventManagerContract.on('EventBooked', (eventId, participant) => {
    callback({ eventId, participant });
  });
};

// Helper functions
export const getCurrentAccount = async () => {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0];
  } catch (error) {
    console.error('Error getting current account:', error);
    throw error;
  }
};

export const formatAddress = (address) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
}; 