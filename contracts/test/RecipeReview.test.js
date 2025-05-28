const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RecipeReview", function () {
  let RecipeNFT;
  let RecipeReview;
  let recipeNFT;
  let recipeReview;
  let owner;
  let chef;
  let reviewer;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    RecipeNFT = await ethers.getContractFactory("RecipeNFT");
    RecipeReview = await ethers.getContractFactory("RecipeReview");
    [owner, chef, reviewer, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy contracts
    recipeNFT = await RecipeNFT.deploy();
    await recipeNFT.waitForDeployment();

    recipeReview = await RecipeReview.deploy(await recipeNFT.getAddress());
    await recipeReview.waitForDeployment();

    // Set RecipeReview contract in RecipeNFT
    await recipeNFT.setRecipeReviewContract(await recipeReview.getAddress());
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await recipeReview.owner()).to.equal(owner.address);
    });

    it("Should set the correct RecipeNFT contract address", async function () {
      expect(await recipeReview.recipeNFTContract()).to.equal(await recipeNFT.getAddress());
    });
  });

  describe("Review Management", function () {
    const tokenURI = "ipfs://QmTest";
    const price = ethers.parseEther("1.0");
    const categories = ["Italian", "Pasta"];
    const ingredients = ["Flour", "Eggs", "Salt"];
    const difficulty = 3;
    const preparationTime = 30;
    const cookingTime = 20;
    const servings = 4;
    let recipeId;

    beforeEach(async function () {
      // Create a recipe
      const tx = await recipeNFT.connect(chef).createRecipe(
        tokenURI,
        price,
        categories,
        ingredients,
        difficulty,
        preparationTime,
        cookingTime,
        servings
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'RecipeCreated');
      recipeId = event.args[0];
    });

    it("Should add a review", async function () {
      const rating = 5;
      const comment = "Excellent recipe!";

      const tx = await recipeReview.connect(reviewer).addReview(recipeId, rating, comment);
      await tx.wait();

      const reviewDetails = await recipeReview.getReview(recipeId, reviewer.address);
      expect(reviewDetails.rating).to.equal(rating);
      expect(reviewDetails.comment).to.equal(comment);
      expect(reviewDetails.isVerified).to.be.false;
    });

    it("Should fail to add review with invalid rating", async function () {
      await expect(
        recipeReview.connect(reviewer).addReview(recipeId, 6, "Invalid rating")
      ).to.be.revertedWith("Rating must be between 1 and 5");
    });

    it("Should fail to add duplicate review", async function () {
      await recipeReview.connect(reviewer).addReview(recipeId, 5, "First review");

      await expect(
        recipeReview.connect(reviewer).addReview(recipeId, 4, "Second review")
      ).to.be.revertedWith("Review already exists");
    });

    it("Should update review", async function () {
      // Add initial review
      await recipeReview.connect(reviewer).addReview(recipeId, 3, "Initial review");

      // Update review
      const newRating = 5;
      const newComment = "Updated review";
      await recipeReview.connect(reviewer).updateReview(recipeId, newRating, newComment);

      const reviewDetails = await recipeReview.getReview(recipeId, reviewer.address);
      expect(reviewDetails.rating).to.equal(newRating);
      expect(reviewDetails.comment).to.equal(newComment);
    });

    it("Should fail to update non-existent review", async function () {
      await expect(
        recipeReview.connect(reviewer).updateReview(recipeId, 5, "New review")
      ).to.be.revertedWith("Review does not exist");
    });

    it("Should remove review", async function () {
      // Add review
      await recipeReview.connect(reviewer).addReview(recipeId, 5, "To be removed");

      // Remove review
      await recipeReview.connect(reviewer).removeReview(recipeId);

      // Try to get removed review
      await expect(
        recipeReview.getReview(recipeId, reviewer.address)
      ).to.be.revertedWith("Review does not exist");
    });

    it("Should fail to remove non-existent review", async function () {
      await expect(
        recipeReview.connect(reviewer).removeReview(recipeId)
      ).to.be.revertedWith("Review does not exist");
    });

    it("Should verify review after recipe purchase", async function () {
      // Add review
      await recipeReview.connect(reviewer).addReview(recipeId, 5, "Great recipe");

      // Purchase recipe
      await recipeNFT.connect(reviewer).buyRecipe(recipeId, { value: price });

      const reviewDetails = await recipeReview.getReview(recipeId, reviewer.address);
      expect(reviewDetails.isVerified).to.be.true;
    });

    it("Should calculate average rating correctly", async function () {
      // Add multiple reviews
      await recipeReview.connect(reviewer).addReview(recipeId, 5, "Excellent");
      await recipeReview.connect(addr1).addReview(recipeId, 4, "Very good");
      await recipeReview.connect(addr2).addReview(recipeId, 3, "Good");

      const recipeReviews = await recipeReview.getRecipeReviews(recipeId);
      expect(recipeReviews.averageRating).to.equal(4); // (5 + 4 + 3) / 3 = 4
      expect(recipeReviews.reviewCount).to.equal(3);
    });

    it("Should update average rating when review is updated", async function () {
      // Add initial review
      await recipeReview.connect(reviewer).addReview(recipeId, 3, "Initial review");

      // Update review
      await recipeReview.connect(reviewer).updateReview(recipeId, 5, "Updated review");

      const recipeReviews = await recipeReview.getRecipeReviews(recipeId);
      expect(recipeReviews.averageRating).to.equal(5);
    });

    it("Should update average rating when review is removed", async function () {
      // Add multiple reviews
      await recipeReview.connect(reviewer).addReview(recipeId, 5, "First review");
      await recipeReview.connect(addr1).addReview(recipeId, 3, "Second review");

      // Remove first review
      await recipeReview.connect(reviewer).removeReview(recipeId);

      const recipeReviews = await recipeReview.getRecipeReviews(recipeId);
      expect(recipeReviews.averageRating).to.equal(3);
      expect(recipeReviews.reviewCount).to.equal(1);
    });
  });
}); 