// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract EventManager is Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    Counters.Counter private _eventIds;

    struct Event {
        address chef;
        string title;
        string description;
        uint256 price;
        uint256 maxParticipants;
        uint256 currentParticipants;
        uint256 eventDate;
        bool isActive;
        string[] allergies;
        bool isVerified; // Whether the chef is verified
    }

    struct Booking {
        uint256 bookingDate;
        string[] allergies;
        bool hasAttended;
    }

    // Mapping from event ID to Event
    mapping(uint256 => Event) private _events;
    
    // Mapping from event ID to mapping of participant address to Booking
    mapping(uint256 => mapping(address => Booking)) private _bookings;
    
    // Mapping from event ID to array of participant addresses
    mapping(uint256 => address[]) private _participants;

    // Reference to ChefProfile contract
    address public chefProfileContract;

    // Platform fee percentage (2%)
    uint256 public constant PLATFORM_FEE = 200;
    uint256 public constant BASIS_POINTS = 10000;

    // Rate limiting
    mapping(address => uint256) private _lastCreationTime;
    uint256 public constant CREATION_COOLDOWN = 1 days;

    event EventCreated(uint256 indexed eventId, address indexed chef, string title);
    event EventBooked(uint256 indexed eventId, address indexed participant);
    event EventCancelled(uint256 indexed eventId);
    event EventCompleted(uint256 indexed eventId);
    event AllergyAdded(uint256 indexed eventId, string allergy);
    event AllergyRemoved(uint256 indexed eventId, string allergy);

    constructor() Ownable(msg.sender) {}

    function setChefProfileContract(address _chefProfile) public onlyOwner {
        chefProfileContract = _chefProfile;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function createEvent(
        string memory title,
        string memory description,
        uint256 price,
        uint256 maxParticipants,
        uint256 eventDate,
        string[] memory allergies
    ) public nonReentrant whenNotPaused returns (uint256) {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(price > 0, "Price must be greater than 0");
        require(maxParticipants > 0, "Max participants must be greater than 0");
        require(eventDate > block.timestamp, "Event date must be in the future");
        require(block.timestamp >= _lastCreationTime[msg.sender] + CREATION_COOLDOWN, "Creation cooldown not elapsed");

        bool isVerified = false;
        if (chefProfileContract != address(0)) {
            (,,,,,,,,,,isVerified) = IChefProfile(chefProfileContract).getProfile(msg.sender);
        }

        _eventIds.increment();
        uint256 newEventId = _eventIds.current();

        _events[newEventId] = Event({
            chef: msg.sender,
            title: title,
            description: description,
            price: price,
            maxParticipants: maxParticipants,
            currentParticipants: 0,
            eventDate: eventDate,
            isActive: true,
            allergies: allergies,
            isVerified: isVerified
        });

        _lastCreationTime[msg.sender] = block.timestamp;

        // Update chef profile
        if (chefProfileContract != address(0)) {
            IChefProfile(chefProfileContract).addEvent(msg.sender, newEventId);
        }

        emit EventCreated(newEventId, msg.sender, title);
        return newEventId;
    }

    function bookEvent(
        uint256 eventId,
        string[] memory allergies
    ) public payable nonReentrant whenNotPaused {
        Event storage event_ = _events[eventId];
        require(event_.isActive, "Event is not active");
        require(event_.currentParticipants < event_.maxParticipants, "Event is full");
        require(event_.eventDate > block.timestamp, "Event has already started");
        require(msg.value >= event_.price, "Insufficient payment");
        require(_bookings[eventId][msg.sender].bookingDate == 0, "Already booked");

        uint256 platformFeeAmount = (event_.price * PLATFORM_FEE) / BASIS_POINTS;
        uint256 chefAmount = event_.price - platformFeeAmount;

        // Transfer funds
        (bool success1, ) = payable(event_.chef).call{value: chefAmount}("");
        require(success1, "Transfer to chef failed");
        
        (bool success2, ) = payable(owner()).call{value: platformFeeAmount}("");
        require(success2, "Transfer to platform failed");

        // Return excess payment
        if (msg.value > event_.price) {
            (bool success3, ) = payable(msg.sender).call{value: msg.value - event_.price}("");
            require(success3, "Return of excess payment failed");
        }

        _bookings[eventId][msg.sender] = Booking({
            bookingDate: block.timestamp,
            allergies: allergies,
            hasAttended: false
        });

        _participants[eventId].push(msg.sender);
        event_.currentParticipants++;

        emit EventBooked(eventId, msg.sender);
    }

    function cancelEvent(uint256 eventId) public nonReentrant whenNotPaused {
        Event storage event_ = _events[eventId];
        require(event_.chef == msg.sender, "Not the event chef");
        require(event_.isActive, "Event is not active");
        require(event_.eventDate > block.timestamp, "Event has already started");

        event_.isActive = false;

        // Refund all participants
        for (uint256 i = 0; i < _participants[eventId].length; i++) {
            address participant = _participants[eventId][i];
            (bool success, ) = payable(participant).call{value: event_.price}("");
            require(success, "Refund failed");
        }

        emit EventCancelled(eventId);
    }

    function markAttendance(uint256 eventId, address participant) public nonReentrant whenNotPaused {
        Event storage event_ = _events[eventId];
        require(event_.chef == msg.sender, "Not the event chef");
        require(event_.eventDate <= block.timestamp, "Event has not started yet");
        require(_bookings[eventId][participant].bookingDate > 0, "Participant not found");
        require(!_bookings[eventId][participant].hasAttended, "Already marked as attended");

        _bookings[eventId][participant].hasAttended = true;

        // Update chef profile
        if (chefProfileContract != address(0)) {
            IChefProfile(chefProfileContract).recordEventCompletion(msg.sender);
        }

        emit EventCompleted(eventId);
    }

    function getEventDetails(uint256 eventId) public view returns (
        address chef,
        string memory title,
        string memory description,
        uint256 price,
        uint256 maxParticipants,
        uint256 currentParticipants,
        uint256 eventDate,
        bool isActive,
        string[] memory allergies,
        bool isVerified
    ) {
        require(_events[eventId].chef != address(0), "Event does not exist");
        Event storage event_ = _events[eventId];
        return (
            event_.chef,
            event_.title,
            event_.description,
            event_.price,
            event_.maxParticipants,
            event_.currentParticipants,
            event_.eventDate,
            event_.isActive,
            event_.allergies,
            event_.isVerified
        );
    }

    function getBookingDetails(uint256 eventId, address participant) public view returns (
        uint256 bookingDate,
        string[] memory allergies,
        bool hasAttended
    ) {
        require(_bookings[eventId][participant].bookingDate > 0, "Booking not found");
        Booking storage booking = _bookings[eventId][participant];
        return (
            booking.bookingDate,
            booking.allergies,
            booking.hasAttended
        );
    }

    function getParticipants(uint256 eventId) public view returns (address[] memory) {
        return _participants[eventId];
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
    function addEvent(address chef, uint256 eventId) external;
    function recordEventCompletion(address chef) external;
} 