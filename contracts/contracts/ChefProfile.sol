// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ChefProfile is Ownable {
    using Counters for Counters.Counter;

    struct Profile {
        string name;
        string bio;
        string profileImage;
        string[] specialties;
        uint256 reputation;
        uint256 totalRecipes;
        uint256 totalEvents;
        uint256 totalSales;
        uint256[] achievements;
        bool isVerified;
    }

    struct Achievement {
        string title;
        string description;
        uint256 requiredPoints;
        bool isActive;
    }

    // Mapping from chef address to Profile
    mapping(address => Profile) private _profiles;
    
    // Mapping from chef address to array of recipe IDs
    mapping(address => uint256[]) private _chefRecipes;
    
    // Mapping from chef address to array of event IDs
    mapping(address => uint256[]) private _chefEvents;
    
    // Array of achievements
    Achievement[] private _achievements;
    
    // Mapping from chef address to mapping of achievement ID to earned status
    mapping(address => mapping(uint256 => bool)) private _earnedAchievements;

    // Reference to RecipeNFT and EventManager contracts
    address public recipeNFTContract;
    address public eventManagerContract;

    // Reputation points for different actions
    uint256 public constant RECIPE_CREATION_POINTS = 10;
    uint256 public constant RECIPE_SALE_POINTS = 5;
    uint256 public constant EVENT_CREATION_POINTS = 15;
    uint256 public constant EVENT_COMPLETION_POINTS = 20;
    uint256 public constant REVIEW_POINTS = 2;

    event ProfileCreated(address indexed chef, string name);
    event ProfileUpdated(address indexed chef);
    event AchievementEarned(address indexed chef, uint256 achievementId);
    event AchievementAdded(uint256 indexed achievementId, string title);
    event ChefVerified(address indexed chef);

    constructor() Ownable(msg.sender) {
        // Initialize default achievements
        _achievements.push(Achievement({
            title: "Novice Chef",
            description: "Created first recipe",
            requiredPoints: 10,
            isActive: true
        }));
        _achievements.push(Achievement({
            title: "Rising Star",
            description: "Sold first recipe",
            requiredPoints: 20,
            isActive: true
        }));
        _achievements.push(Achievement({
            title: "Event Host",
            description: "Hosted first event",
            requiredPoints: 30,
            isActive: true
        }));
    }

    function setContractAddresses(address _recipeNFT, address _eventManager) public onlyOwner {
        recipeNFTContract = _recipeNFT;
        eventManagerContract = _eventManager;
    }

    function createProfile(
        string memory name,
        string memory bio,
        string memory profileImage,
        string[] memory specialties
    ) public {
        require(bytes(_profiles[msg.sender].name).length == 0, "Profile already exists");
        
        _profiles[msg.sender] = Profile({
            name: name,
            bio: bio,
            profileImage: profileImage,
            specialties: specialties,
            reputation: 0,
            totalRecipes: 0,
            totalEvents: 0,
            totalSales: 0,
            achievements: new uint256[](0),
            isVerified: false
        });

        emit ProfileCreated(msg.sender, name);
    }

    function updateProfile(
        string memory name,
        string memory bio,
        string memory profileImage,
        string[] memory specialties
    ) public {
        require(bytes(_profiles[msg.sender].name).length > 0, "Profile does not exist");
        
        Profile storage profile = _profiles[msg.sender];
        profile.name = name;
        profile.bio = bio;
        profile.profileImage = profileImage;
        profile.specialties = specialties;

        emit ProfileUpdated(msg.sender);
    }

    function addAchievement(string memory title, string memory description, uint256 requiredPoints) public onlyOwner {
        _achievements.push(Achievement({
            title: title,
            description: description,
            requiredPoints: requiredPoints,
            isActive: true
        }));

        emit AchievementAdded(_achievements.length - 1, title);
    }

    function verifyChef(address chef) public onlyOwner {
        require(bytes(_profiles[chef].name).length > 0, "Profile does not exist");
        _profiles[chef].isVerified = true;
        emit ChefVerified(chef);
    }

    function addRecipe(address chef, uint256 recipeId) public {
        require(msg.sender == recipeNFTContract, "Only RecipeNFT contract can call this");
        require(bytes(_profiles[chef].name).length > 0, "Profile does not exist");
        
        Profile storage profile = _profiles[chef];
        profile.totalRecipes++;
        profile.reputation += RECIPE_CREATION_POINTS;
        _chefRecipes[chef].push(recipeId);
        
        _checkAchievements(chef);
    }

    function addEvent(address chef, uint256 eventId) public {
        require(msg.sender == eventManagerContract, "Only EventManager contract can call this");
        require(bytes(_profiles[chef].name).length > 0, "Profile does not exist");
        
        Profile storage profile = _profiles[chef];
        profile.totalEvents++;
        profile.reputation += EVENT_CREATION_POINTS;
        _chefEvents[chef].push(eventId);
        
        _checkAchievements(chef);
    }

    function recordSale(address chef) public {
        require(msg.sender == recipeNFTContract, "Only RecipeNFT contract can call this");
        require(bytes(_profiles[chef].name).length > 0, "Profile does not exist");
        
        Profile storage profile = _profiles[chef];
        profile.totalSales++;
        profile.reputation += RECIPE_SALE_POINTS;
        
        _checkAchievements(chef);
    }

    function recordEventCompletion(address chef) public {
        require(msg.sender == eventManagerContract, "Only EventManager contract can call this");
        require(bytes(_profiles[chef].name).length > 0, "Profile does not exist");
        
        Profile storage profile = _profiles[chef];
        profile.reputation += EVENT_COMPLETION_POINTS;
        
        _checkAchievements(chef);
    }

    function addReviewPoints(address chef) public {
        require(msg.sender == recipeNFTContract, "Only RecipeNFT contract can call this");
        require(bytes(_profiles[chef].name).length > 0, "Profile does not exist");
        
        _profiles[chef].reputation += REVIEW_POINTS;
        _checkAchievements(chef);
    }

    function _checkAchievements(address chef) private {
        Profile storage profile = _profiles[chef];
        
        for (uint256 i = 0; i < _achievements.length; i++) {
            if (!_earnedAchievements[chef][i] && 
                _achievements[i].isActive && 
                profile.reputation >= _achievements[i].requiredPoints) {
                
                _earnedAchievements[chef][i] = true;
                profile.achievements.push(i);
                emit AchievementEarned(chef, i);
            }
        }
    }

    function getProfile(address chef) public view returns (
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
    ) {
        require(bytes(_profiles[chef].name).length > 0, "Profile does not exist");
        Profile storage profile = _profiles[chef];
        return (
            profile.name,
            profile.bio,
            profile.profileImage,
            profile.specialties,
            profile.reputation,
            profile.totalRecipes,
            profile.totalEvents,
            profile.totalSales,
            profile.achievements,
            profile.isVerified
        );
    }

    function getChefRecipes(address chef) public view returns (uint256[] memory) {
        return _chefRecipes[chef];
    }

    function getChefEvents(address chef) public view returns (uint256[] memory) {
        return _chefEvents[chef];
    }

    function getAchievement(uint256 achievementId) public view returns (
        string memory title,
        string memory description,
        uint256 requiredPoints,
        bool isActive
    ) {
        require(achievementId < _achievements.length, "Invalid achievement ID");
        Achievement storage achievement = _achievements[achievementId];
        return (
            achievement.title,
            achievement.description,
            achievement.requiredPoints,
            achievement.isActive
        );
    }

    function hasAchievement(address chef, uint256 achievementId) public view returns (bool) {
        return _earnedAchievements[chef][achievementId];
    }
} 