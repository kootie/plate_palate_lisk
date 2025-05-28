import React from 'react';
import './item.css'
import creator from '../../assets/seller2.png'
import item from '../../assets/item1.png'

const Item = () => {



  return( 
      <div className='item section__padding'>
        <div className="item-image">
          <img src={item} alt="item" />
        </div>
          <div className="item-content">
            <div className="item-content-title">
              <h1>Stewed Lamb</h1>
              <p>From <span>0.00456 eth</span> ‧ 20 of 25 available</p>
            </div>
            <div className="item-content-creator">
              <div><p>Creater</p></div>
              <div>
                <img src={creator} alt="creator" />
                <p>Chef Rian Leon </p>
              </div>
            </div>
            <div className="item-content-detail">
              <p>This Beef and Bean Stew is a hearty, rich, and comforting dish with deep flavors that develop as it simmers. The tender beef chunks soak up the aromatic blend of cumin, paprika, and black pepper, creating a warm, slightly smoky essence. The beans add a creamy, earthy texture that balances the meatiness, while the slow-cooked tomatoes and broth form a thick, flavorful gravy.

Each spoonful is packed with layers of flavor, from the sweetness of the carrots and bell peppers to the savory richness of the beef. The fresh cilantro garnish adds a refreshing contrast, making it an irresistible, soul-warming dish—perfect for a cozy meal.</p>
            </div>
            <div className="item-content-buy">
              <button className="primary-btn">Buy For 0.00456 eth</button>
              <button className="secondary-btn">Make Offer</button>
            </div>
          </div>
      </div>
  )
};

export default Item;
