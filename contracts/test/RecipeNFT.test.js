const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RecipeNFT", function () {
  let RecipeNFT;
  let recipeNFT;
  let owner;
  let chef;
  let buyer;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    RecipeNFT = await ethers.getContractFactory("RecipeNFT");
    [owner, chef, buyer, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy a new RecipeNFT contract before each test
    recipeNFT = await RecipeNFT.deploy();
    await recipeNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await recipeNFT.owner()).to.equal(owner.address);
    });

    it("Should set the correct name and symbol", async function () {
      expect(await recipeNFT.name()).to.equal("Plate Palate Recipe");
      expect(await recipeNFT.symbol()).to.equal("PPR");
    });
  });

  describe("Recipe Creation", function () {
    const tokenURI = "ipfs://QmTest";
    const price = ethers.parseEther("1.0");
    const categories = ["Italian", "Pasta"];
    const ingredients = ["Flour", "Eggs", "Salt"];
    const difficulty = 3;
    const preparationTime = 30;
    const cookingTime = 20;
    const servings = 4;

    it("Should create a new recipe with correct details", async function () {
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
      const tokenId = event.args[0];

      const recipeDetails = await recipeNFT.getRecipeDetails(tokenId);
      expect(recipeDetails.chef).to.equal(chef.address);
      expect(recipeDetails.price).to.equal(price);
      expect(recipeDetails.isForSale).to.be.true;
      expect(recipeDetails.categories).to.deep.equal(categories);
      expect(recipeDetails.ingredients).to.deep.equal(ingredients);
      expect(recipeDetails.difficulty).to.equal(difficulty);
      expect(recipeDetails.preparationTime).to.equal(preparationTime);
      expect(recipeDetails.cookingTime).to.equal(cookingTime);
      expect(recipeDetails.servings).to.equal(servings);
    });

    it("Should fail to create recipe with invalid difficulty", async function () {
      await expect(
        recipeNFT.connect(chef).createRecipe(
          tokenURI,
          price,
          categories,
          ingredients,
          6, // Invalid difficulty
          preparationTime,
          cookingTime,
          servings
        )
      ).to.be.revertedWith("Difficulty must be between 1 and 5");
    });

    it("Should fail to create recipe with zero preparation time", async function () {
      await expect(
        recipeNFT.connect(chef).createRecipe(
          tokenURI,
          price,
          categories,
          ingredients,
          difficulty,
          0, // Invalid preparation time
          cookingTime,
          servings
        )
      ).to.be.revertedWith("Preparation time must be greater than 0");
    });
  });

  describe("Recipe Purchase", function () {
    const tokenURI = "ipfs://QmTest";
    const price = ethers.parseEther("1.0");
    const categories = ["Italian", "Pasta"];
    const ingredients = ["Flour", "Eggs", "Salt"];
    const difficulty = 3;
    const preparationTime = 30;
    const cookingTime = 20;
    const servings = 4;

    beforeEach(async function () {
      await recipeNFT.connect(chef).createRecipe(
        tokenURI,
        price,
        categories,
        ingredients,
        difficulty,
        preparationTime,
        cookingTime,
        servings
      );
    });

    it("Should allow purchase of recipe", async function () {
      const tx = await recipeNFT.connect(buyer).buyRecipe(1, { value: price });
      await tx.wait();

      expect(await recipeNFT.ownerOf(1)).to.equal(buyer.address);
      const recipeDetails = await recipeNFT.getRecipeDetails(1);
      expect(recipeDetails.isForSale).to.be.false;
    });

    it("Should fail to purchase own recipe", async function () {
      await expect(
        recipeNFT.connect(chef).buyRecipe(1, { value: price })
      ).to.be.revertedWith("Cannot buy your own recipe");
    });

    it("Should fail to purchase with insufficient payment", async function () {
      await expect(
        recipeNFT.connect(buyer).buyRecipe(1, { value: ethers.parseEther("0.5") })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should return excess payment", async function () {
      const excessAmount = ethers.parseEther("0.5");
      const initialBalance = await ethers.provider.getBalance(buyer.address);
      
      const tx = await recipeNFT.connect(buyer).buyRecipe(1, { value: price.add(excessAmount) });
      const receipt = await tx.wait();
      
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const finalBalance = await ethers.provider.getBalance(buyer.address);
      
      expect(finalBalance).to.equal(initialBalance.sub(price).sub(gasUsed));
    });
  });

  describe("Recipe Updates", function () {
    const tokenURI = "ipfs://QmTest";
    const price = ethers.parseEther("1.0");
    const categories = ["Italian", "Pasta"];
    const ingredients = ["Flour", "Eggs", "Salt"];
    const difficulty = 3;
    const preparationTime = 30;
    const cookingTime = 20;
    const servings = 4;

    beforeEach(async function () {
      await recipeNFT.connect(chef).createRecipe(
        tokenURI,
        price,
        categories,
        ingredients,
        difficulty,
        preparationTime,
        cookingTime,
        servings
      );
    });

    it("Should update recipe details", async function () {
      const newCategories = ["Italian", "Pizza"];
      const newIngredients = ["Flour", "Tomatoes", "Mozzarella"];
      const newDifficulty = 4;
      const newPreparationTime = 45;
      const newCookingTime = 25;
      const newServings = 6;

      await recipeNFT.connect(chef).updateRecipe(
        1,
        newCategories,
        newIngredients,
        newDifficulty,
        newPreparationTime,
        newCookingTime,
        newServings
      );

      const recipeDetails = await recipeNFT.getRecipeDetails(1);
      expect(recipeDetails.categories).to.deep.equal(newCategories);
      expect(recipeDetails.ingredients).to.deep.equal(newIngredients);
      expect(recipeDetails.difficulty).to.equal(newDifficulty);
      expect(recipeDetails.preparationTime).to.equal(newPreparationTime);
      expect(recipeDetails.cookingTime).to.equal(newCookingTime);
      expect(recipeDetails.servings).to.equal(newServings);
    });

    it("Should fail to update recipe if not owner", async function () {
      await expect(
        recipeNFT.connect(buyer).updateRecipe(
          1,
          categories,
          ingredients,
          difficulty,
          preparationTime,
          cookingTime,
          servings
        )
      ).to.be.revertedWith("Not the recipe owner");
    });
  });

  describe("Price and Sale Status", function () {
    const tokenURI = "ipfs://QmTest";
    const price = ethers.parseEther("1.0");
    const categories = ["Italian", "Pasta"];
    const ingredients = ["Flour", "Eggs", "Salt"];
    const difficulty = 3;
    const preparationTime = 30;
    const cookingTime = 20;
    const servings = 4;

    beforeEach(async function () {
      await recipeNFT.connect(chef).createRecipe(
        tokenURI,
        price,
        categories,
        ingredients,
        difficulty,
        preparationTime,
        cookingTime,
        servings
      );
    });

    it("Should update price", async function () {
      const newPrice = ethers.parseEther("2.0");
      await recipeNFT.connect(chef).updatePrice(1, newPrice);
      
      const recipeDetails = await recipeNFT.getRecipeDetails(1);
      expect(recipeDetails.price).to.equal(newPrice);
    });

    it("Should update sale status", async function () {
      await recipeNFT.connect(chef).setSaleStatus(1, false);
      
      const recipeDetails = await recipeNFT.getRecipeDetails(1);
      expect(recipeDetails.isForSale).to.be.false;

      await recipeNFT.connect(chef).setSaleStatus(1, true);
      
      const updatedDetails = await recipeNFT.getRecipeDetails(1);
      expect(updatedDetails.isForSale).to.be.true;
    });

    it("Should fail to update price if not owner", async function () {
      await expect(
        recipeNFT.connect(buyer).updatePrice(1, ethers.parseEther("2.0"))
      ).to.be.revertedWith("Not the recipe owner");
    });

    it("Should fail to update sale status if not owner", async function () {
      await expect(
        recipeNFT.connect(buyer).setSaleStatus(1, false)
      ).to.be.revertedWith("Not the recipe owner");
    });
  });
}); 