// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract RecipeNFT is ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Recipe {
        address chef;
        uint256 price;
        bool isForSale;
        uint256 creationDate;
        string[] categories;
        string[] ingredients;
        uint256 difficulty; // 1-5
        uint256 preparationTime; // in minutes
        uint256 cookingTime; // in minutes
        uint256 servings;
        bool isVerified; // Whether the chef is verified
    }

    // Mapping from token ID to Recipe
    mapping(uint256 => Recipe) private _recipes;
    
    // Mapping from chef address to array of recipe IDs
    mapping(address => uint256[]) private _chefRecipes;
    
    // Mapping from category to array of recipe IDs
    mapping(string => uint256[]) private _categoryRecipes;

    // Reference to RecipeReview and ChefProfile contracts
    address public recipeReviewContract;
    address public chefProfileContract;

    // Platform fee percentage (2%)
    uint256 public constant PLATFORM_FEE = 200;
    uint256 public constant BASIS_POINTS = 10000;

    // Rate limiting
    mapping(address => uint256) private _lastCreationTime;
    uint256 public constant CREATION_COOLDOWN = 1 hours;

    event RecipeCreated(uint256 indexed tokenId, address indexed chef, string tokenURI);
    event RecipeSold(uint256 indexed tokenId, address indexed seller, address indexed buyer, uint256 price);
    event PriceUpdated(uint256 indexed tokenId, uint256 newPrice);
    event SaleStatusChanged(uint256 indexed tokenId, bool isForSale);
    event RecipeUpdated(uint256 indexed tokenId);

    constructor() ERC721("Plate Palate Recipe", "PPR") Ownable(msg.sender) {}

    function setContractAddresses(address _recipeReview, address _chefProfile) public onlyOwner {
        recipeReviewContract = _recipeReview;
        chefProfileContract = _chefProfile;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function createRecipe(
        string memory tokenURI,
        uint256 price,
        string[] memory categories,
        string[] memory ingredients,
        uint256 difficulty,
        uint256 preparationTime,
        uint256 cookingTime,
        uint256 servings
    ) public nonReentrant whenNotPaused returns (uint256) {
        require(difficulty >= 1 && difficulty <= 5, "Difficulty must be between 1 and 5");
        require(preparationTime > 0, "Preparation time must be greater than 0");
        require(cookingTime > 0, "Cooking time must be greater than 0");
        require(servings > 0, "Servings must be greater than 0");
        require(block.timestamp >= _lastCreationTime[msg.sender] + CREATION_COOLDOWN, "Creation cooldown not elapsed");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        require(categories.length > 0, "At least one category required");
        require(ingredients.length > 0, "At least one ingredient required");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        bool isVerified = false;
        if (chefProfileContract != address(0)) {
            (,,,,,,,,,,isVerified) = IChefProfile(chefProfileContract).getProfile(msg.sender);
        }

        Recipe memory newRecipe = Recipe({
            chef: msg.sender,
            price: price,
            isForSale: true,
            creationDate: block.timestamp,
            categories: categories,
            ingredients: ingredients,
            difficulty: difficulty,
            preparationTime: preparationTime,
            cookingTime: cookingTime,
            servings: servings,
            isVerified: isVerified
        });

        _recipes[newTokenId] = newRecipe;
        _chefRecipes[msg.sender].push(newTokenId);
        _lastCreationTime[msg.sender] = block.timestamp;

        // Add recipe to category mappings
        for (uint256 i = 0; i < categories.length; i++) {
            _categoryRecipes[categories[i]].push(newTokenId);
        }

        // Update chef profile
        if (chefProfileContract != address(0)) {
            IChefProfile(chefProfileContract).addRecipe(msg.sender, newTokenId);
        }

        emit RecipeCreated(newTokenId, msg.sender, tokenURI);
        return newTokenId;
    }

    function buyRecipe(uint256 tokenId) public payable nonReentrant whenNotPaused {
        Recipe storage recipe = _recipes[tokenId];
        require(recipe.isForSale, "Recipe is not for sale");
        require(msg.value >= recipe.price, "Insufficient payment");

        address seller = ownerOf(tokenId);
        require(seller != msg.sender, "Cannot buy your own recipe");

        uint256 platformFeeAmount = (recipe.price * PLATFORM_FEE) / BASIS_POINTS;
        uint256 sellerAmount = recipe.price - platformFeeAmount;

        _transfer(seller, msg.sender, tokenId);
        recipe.isForSale = false;

        // Transfer funds
        (bool success1, ) = payable(seller).call{value: sellerAmount}("");
        require(success1, "Transfer to seller failed");
        
        (bool success2, ) = payable(owner()).call{value: platformFeeAmount}("");
        require(success2, "Transfer to platform failed");

        // Return excess payment
        if (msg.value > recipe.price) {
            (bool success3, ) = payable(msg.sender).call{value: msg.value - recipe.price}("");
            require(success3, "Return of excess payment failed");
        }

        // Update chef profile
        if (chefProfileContract != address(0)) {
            IChefProfile(chefProfileContract).recordSale(seller);
        }

        // Verify review if exists
        if (recipeReviewContract != address(0)) {
            (bool success, ) = recipeReviewContract.call(
                abi.encodeWithSignature("verifyReview(uint256,address)", tokenId, msg.sender)
            );
            require(success, "Failed to verify review");
        }

        emit RecipeSold(tokenId, seller, msg.sender, recipe.price);
    }

    function updateRecipe(
        uint256 tokenId,
        string[] memory categories,
        string[] memory ingredients,
        uint256 difficulty,
        uint256 preparationTime,
        uint256 cookingTime,
        uint256 servings
    ) public nonReentrant whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Not the recipe owner");
        require(difficulty >= 1 && difficulty <= 5, "Difficulty must be between 1 and 5");
        require(preparationTime > 0, "Preparation time must be greater than 0");
        require(cookingTime > 0, "Cooking time must be greater than 0");
        require(servings > 0, "Servings must be greater than 0");
        require(categories.length > 0, "At least one category required");
        require(ingredients.length > 0, "At least one ingredient required");

        Recipe storage recipe = _recipes[tokenId];

        // Remove old category mappings
        for (uint256 i = 0; i < recipe.categories.length; i++) {
            string memory category = recipe.categories[i];
            uint256[] storage categoryRecipes = _categoryRecipes[category];
            for (uint256 j = 0; j < categoryRecipes.length; j++) {
                if (categoryRecipes[j] == tokenId) {
                    categoryRecipes[j] = categoryRecipes[categoryRecipes.length - 1];
                    categoryRecipes.pop();
                    break;
                }
            }
        }

        // Update recipe details
        recipe.categories = categories;
        recipe.ingredients = ingredients;
        recipe.difficulty = difficulty;
        recipe.preparationTime = preparationTime;
        recipe.cookingTime = cookingTime;
        recipe.servings = servings;

        // Add new category mappings
        for (uint256 i = 0; i < categories.length; i++) {
            _categoryRecipes[categories[i]].push(tokenId);
        }

        emit RecipeUpdated(tokenId);
    }

    function updatePrice(uint256 tokenId, uint256 newPrice) public nonReentrant whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Not the recipe owner");
        _recipes[tokenId].price = newPrice;
        emit PriceUpdated(tokenId, newPrice);
    }

    function setSaleStatus(uint256 tokenId, bool isForSale) public nonReentrant whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Not the recipe owner");
        _recipes[tokenId].isForSale = isForSale;
        emit SaleStatusChanged(tokenId, isForSale);
    }

    function getRecipeDetails(uint256 tokenId) public view returns (
        address chef,
        uint256 price,
        bool isForSale,
        string memory tokenURI,
        uint256 creationDate,
        string[] memory categories,
        string[] memory ingredients,
        uint256 difficulty,
        uint256 preparationTime,
        uint256 cookingTime,
        uint256 servings,
        bool isVerified
    ) {
        require(_exists(tokenId), "Recipe does not exist");
        Recipe storage recipe = _recipes[tokenId];
        return (
            recipe.chef,
            recipe.price,
            recipe.isForSale,
            tokenURI(tokenId),
            recipe.creationDate,
            recipe.categories,
            recipe.ingredients,
            recipe.difficulty,
            recipe.preparationTime,
            recipe.cookingTime,
            recipe.servings,
            recipe.isVerified
        );
    }

    function getChefRecipes(address chef) public view returns (uint256[] memory) {
        return _chefRecipes[chef];
    }

    function getCategoryRecipes(string memory category) public view returns (uint256[] memory) {
        return _categoryRecipes[category];
    }

    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}

interface IChefProfile {
    function getProfile(address chef) external view returns (
        string memory name,
        string memory bio,
        string memory profileImage,
        string[] memory specialties,
        uint256 reputation,
        uint256 totalRecipes,
        uint256 totalEvents,
        uint256 totalSales,
        uint256[] memory achievements,
        bool isVerified
    );
    function addRecipe(address chef, uint256 recipeId) external;
    function recordSale(address chef) external;
} 