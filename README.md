<div align="center">
      <h1> <img src="https://www.thewindowsclub.com/wp-content/uploads/2021/03/Etherium.png" width="500px"><br/>NFT Marketplace</h1>
     </div>

# Description
NFT Marketplace template for creation, sale, and purchase of digital art as NFTs.


# Tech Used
 ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
      
## Live Preview
[Demo](https://nft-marketplace-ui.netlify.app/)

## Build Setup

``` bash
# clone project
$ git clone https://github.com/kasim393/NFT-Marketplace.git

# install dependencies
$ npm install

# serve with host at localhost:8000
$ npm start
```

# Screenshot
!["React Movie App"](https://raw.githubusercontent.com/kasim393/NFT-Marketplace/main/src/assets/ss1.png)

!["React Movie App"](https://raw.githubusercontent.com/kasim393/NFT-Marketplace/main/src/assets/ss4.png)

# Resource

    Google font: https://fonts.google.com/
    
    FontAwesome : https://fontawesome.com/
    
    Figma : https://uifreebies.net/figma/Plate_Palate-app-ui-kit-free
    

### Task
- [x] Home page
- [x] Detail page
- [x] Login page
- [x] Register page
- [x] Create item page
- [x] Profile page
- [ ] Payment

# Plate Palate - Decentralized Culinary Platform

Plate Palate is a decentralized platform that revolutionizes the culinary world by enabling chefs to tokenize their recipes as NFTs and host cooking events. Built on the Ethereum blockchain, it provides a secure and transparent marketplace for culinary creations and experiences.

## Features

### Recipe NFT Marketplace
- **Recipe Tokenization**: Convert recipes into unique NFTs with detailed metadata
- **Recipe Categories**: Organize recipes by categories for easy discovery
- **Detailed Recipe Information**:
  - Ingredients list
  - Preparation and cooking times
  - Difficulty level (1-5)
  - Number of servings
  - Categories and tags
- **Recipe Management**:
  - Create and mint recipe NFTs
  - Update recipe details
  - Set and modify prices
  - Toggle sale status
- **Secure Transactions**:
  - Platform fee (2%)
  - Secure payment handling
  - Automatic royalty distribution

### Event Management
- **Cooking Events**:
  - Create and host cooking events
  - Set event details (title, description, price)
  - Manage participant capacity
  - Track allergies and dietary restrictions
- **Event Booking**:
  - Book events with secure payments
  - Manage participant lists
  - Track attendance
- **Event Features**:
  - Maximum participant limits
  - Allergy tracking
  - Event cancellation with automatic refunds
  - Attendance verification

### Chef Profiles
- **Profile Management**:
  - Personal information
  - Bio and specialties
  - Profile image
  - Verification status
- **Reputation System**:
  - Track total recipes
  - Count successful events
  - Monitor total sales
  - Achievement badges
- **Achievement System**:
  - Recipe creation milestones
  - Event hosting achievements
  - Sales milestones
  - Community recognition

### Review System
- **Recipe Reviews**:
  - Rate recipes (1-5 stars)
  - Add detailed comments
  - Track review history
  - Calculate average ratings
- **Review Features**:
  - Verified purchase reviews
  - Review updates and removal
  - Timestamp tracking
  - Review verification

### Security Features
- **Smart Contract Security**:
  - Reentrancy protection
  - Emergency pause functionality
  - Rate limiting
  - Input validation
- **Transaction Security**:
  - Secure fund transfers
  - Automatic refund handling
  - Platform fee management
  - Payment verification

### Platform Management
- **Admin Controls**:
  - Contract address management
  - Emergency pause/unpause
  - Platform fee collection
  - Contract upgrades
- **Rate Limiting**:
  - Recipe creation cooldown
  - Event creation restrictions
  - Spam prevention

## Technical Stack
- **Smart Contracts**: Solidity ^0.8.20
- **Framework**: Hardhat
- **Testing**: Chai, Mocha
- **Security**: OpenZeppelin contracts
- **Frontend**: React.js
- **Web3 Integration**: ethers.js

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MetaMask or other Web3 wallet
- Hardhat

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/plate_palate.git
cd plate_palate
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Compile contracts
```bash
npx hardhat compile
```

5. Run tests
```bash
npx hardhat test
```

6. Deploy contracts
```bash
npx hardhat run scripts/deploy.js --network <network>
```

## Contract Architecture

### RecipeNFT
- ERC721 token for recipe NFTs
- Recipe creation and management
- Marketplace functionality
- Category organization

### EventManager
- Event creation and booking
- Participant management
- Payment handling
- Attendance tracking

### ChefProfile
- Profile management
- Reputation system
- Achievement tracking
- Verification system

### RecipeReview
- Review management
- Rating system
- Review verification
- Average rating calculation

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
Project Link: [https://github.com/yourusername/plate_palate](https://github.com/yourusername/plate_palate)

 
