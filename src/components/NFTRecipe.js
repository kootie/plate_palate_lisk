import React from 'react';
import './NFTRecipe.css';

const NFTRecipe = ({ recipe }) => {
  const {
    title,
    chef,
    image,
    price,
    description,
    owner,
    tokenId,
    isForSale
  } = recipe;

  return (
    <div className="nft-recipe-card">
      <div className="recipe-image">
        <img src={image} alt={title} />
      </div>
      <div className="recipe-content">
        <h3 className="recipe-title">{title}</h3>
        <p className="recipe-chef">by {chef}</p>
        <p className="recipe-description">{description}</p>
        <div className="recipe-meta">
          <span>Owner: {owner}</span>
          <span>Token ID: {tokenId}</span>
        </div>
        <div className="recipe-actions d-flex justify-content-between align-items-center">
          <span className="recipe-price">{price} ETH</span>
          {isForSale && (
            <button className="btn btn-outline-primary">Purchase</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTRecipe; 