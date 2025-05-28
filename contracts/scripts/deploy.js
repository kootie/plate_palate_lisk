const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");

  // Deploy RecipeNFT
  const RecipeNFT = await hre.ethers.getContractFactory("RecipeNFT");
  const recipeNFT = await RecipeNFT.deploy();
  await recipeNFT.waitForDeployment();
  console.log("RecipeNFT deployed to:", await recipeNFT.getAddress());

  // Deploy RecipeReview
  const RecipeReview = await hre.ethers.getContractFactory("RecipeReview");
  const recipeReview = await RecipeReview.deploy(await recipeNFT.getAddress());
  await recipeReview.waitForDeployment();
  console.log("RecipeReview deployed to:", await recipeReview.getAddress());

  // Set RecipeReview contract in RecipeNFT
  const tx = await recipeNFT.setRecipeReviewContract(await recipeReview.getAddress());
  await tx.wait();
  console.log("RecipeReview contract set in RecipeNFT");

  // Deploy EventManager
  const EventManager = await hre.ethers.getContractFactory("EventManager");
  const eventManager = await EventManager.deploy();
  await eventManager.waitForDeployment();
  console.log("EventManager deployed to:", await eventManager.getAddress());

  // Save contract addresses to a file
  const fs = require("fs");
  const contracts = {
    recipeNFT: await recipeNFT.getAddress(),
    recipeReview: await recipeReview.getAddress(),
    eventManager: await eventManager.getAddress()
  };
  fs.writeFileSync(
    "contract-addresses.json",
    JSON.stringify(contracts, null, 2)
  );
  console.log("Contract addresses saved to contract-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 