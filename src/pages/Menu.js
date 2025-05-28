import React from 'react';
import NFTRecipe from '../components/NFTRecipe';
import './Menu.css';

const Menu = () => {
  const sampleRecipes = [
    {
      title: "Signature Truffle Pasta",
      chef: "Chef Maria",
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      price: "0.5",
      description: "A luxurious pasta dish featuring black truffle and aged parmesan",
      owner: "0x1234...5678",
      tokenId: "001",
      isForSale: true
    },
    {
      title: "Seafood Paella",
      chef: "Chef Carlos",
      image: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
      price: "0.8",
      description: "Traditional Spanish paella with fresh seafood and saffron",
      owner: "0x8765...4321",
      tokenId: "002",
      isForSale: true
    }
  ];

  return (
    <div className="menu-page">
      <div className="container py-6">
        <div className="text-center mb-5">
          <h1 className="menu-title">NFT Recipe Collection</h1>
          <p className="menu-subtitle">
            Discover and purchase unique recipes from our talented chefs
          </p>
        </div>
        <div className="row g-4">
          {sampleRecipes.map((recipe, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <NFTRecipe recipe={recipe} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Menu; 