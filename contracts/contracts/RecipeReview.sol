// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RecipeReview is Ownable {
    struct Review {
        address reviewer;
        uint256 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
        bool isVerified; // Whether the reviewer has actually purchased the recipe
    }

    // Mapping from recipe ID to array of reviews
    mapping(uint256 => Review[]) private _reviews;
    
    // Mapping from recipe ID to average rating
    mapping(uint256 => uint256) private _averageRatings;
    
    // Mapping from recipe ID to total number of reviews
    mapping(uint256 => uint256) private _reviewCounts;
    
    // Mapping from recipe ID to mapping of reviewer address to review index
    mapping(uint256 => mapping(address => uint256)) private _reviewerIndex;

    // Reference to RecipeNFT contract
    address public recipeNFTContract;

    event ReviewAdded(uint256 indexed recipeId, address indexed reviewer, uint256 rating);
    event ReviewUpdated(uint256 indexed recipeId, address indexed reviewer, uint256 newRating);
    event ReviewRemoved(uint256 indexed recipeId, address indexed reviewer);

    constructor(address _recipeNFTContract) Ownable(msg.sender) {
        recipeNFTContract = _recipeNFTContract;
    }

    function addReview(
        uint256 recipeId,
        uint256 rating,
        string memory comment
    ) public {
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5");
        require(_reviewerIndex[recipeId][msg.sender] == 0, "Review already exists");

        // Create new review
        Review memory newReview = Review({
            reviewer: msg.sender,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp,
            isVerified: false // Will be verified by the RecipeNFT contract
        });

        _reviews[recipeId].push(newReview);
        _reviewerIndex[recipeId][msg.sender] = _reviews[recipeId].length;

        // Update average rating
        uint256 totalRating = _averageRatings[recipeId] * _reviewCounts[recipeId] + rating;
        _reviewCounts[recipeId]++;
        _averageRatings[recipeId] = totalRating / _reviewCounts[recipeId];

        emit ReviewAdded(recipeId, msg.sender, rating);
    }

    function updateReview(
        uint256 recipeId,
        uint256 newRating,
        string memory newComment
    ) public {
        require(newRating >= 1 && newRating <= 5, "Rating must be between 1 and 5");
        uint256 reviewIndex = _reviewerIndex[recipeId][msg.sender];
        require(reviewIndex > 0, "Review does not exist");

        Review storage review = _reviews[recipeId][reviewIndex - 1];
        uint256 oldRating = review.rating;

        // Update review
        review.rating = newRating;
        review.comment = newComment;
        review.timestamp = block.timestamp;

        // Update average rating
        uint256 totalRating = _averageRatings[recipeId] * _reviewCounts[recipeId] - oldRating + newRating;
        _averageRatings[recipeId] = totalRating / _reviewCounts[recipeId];

        emit ReviewUpdated(recipeId, msg.sender, newRating);
    }

    function removeReview(uint256 recipeId) public {
        uint256 reviewIndex = _reviewerIndex[recipeId][msg.sender];
        require(reviewIndex > 0, "Review does not exist");

        // Get the review to be removed
        Review storage reviewToRemove = _reviews[recipeId][reviewIndex - 1];
        uint256 ratingToRemove = reviewToRemove.rating;

        // Update average rating
        uint256 totalRating = _averageRatings[recipeId] * _reviewCounts[recipeId] - ratingToRemove;
        _reviewCounts[recipeId]--;
        if (_reviewCounts[recipeId] > 0) {
            _averageRatings[recipeId] = totalRating / _reviewCounts[recipeId];
        } else {
            _averageRatings[recipeId] = 0;
        }

        // Remove the review
        delete _reviews[recipeId][reviewIndex - 1];
        delete _reviewerIndex[recipeId][msg.sender];

        emit ReviewRemoved(recipeId, msg.sender);
    }

    function verifyReview(uint256 recipeId, address reviewer) public {
        require(msg.sender == recipeNFTContract, "Only RecipeNFT contract can verify reviews");
        uint256 reviewIndex = _reviewerIndex[recipeId][reviewer];
        require(reviewIndex > 0, "Review does not exist");

        _reviews[recipeId][reviewIndex - 1].isVerified = true;
    }

    function getReview(uint256 recipeId, address reviewer) public view returns (
        uint256 rating,
        string memory comment,
        uint256 timestamp,
        bool isVerified
    ) {
        uint256 reviewIndex = _reviewerIndex[recipeId][reviewer];
        require(reviewIndex > 0, "Review does not exist");

        Review storage review = _reviews[recipeId][reviewIndex - 1];
        return (
            review.rating,
            review.comment,
            review.timestamp,
            review.isVerified
        );
    }

    function getRecipeReviews(uint256 recipeId) public view returns (
        uint256 averageRating,
        uint256 reviewCount,
        Review[] memory reviews
    ) {
        return (
            _averageRatings[recipeId],
            _reviewCounts[recipeId],
            _reviews[recipeId]
        );
    }
} 