const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventManager", function () {
  let EventManager;
  let eventManager;
  let owner;
  let chef;
  let participant;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    EventManager = await ethers.getContractFactory("EventManager");
    [owner, chef, participant, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy a new EventManager contract before each test
    eventManager = await EventManager.deploy();
    await eventManager.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await eventManager.owner()).to.equal(owner.address);
    });
  });

  describe("Event Creation", function () {
    const title = "Italian Cooking Class";
    const description = "Learn to make authentic Italian pasta";
    const price = ethers.parseEther("0.1");
    const maxParticipants = 10;
    const eventDate = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    const allergies = ["Gluten", "Dairy"];

    it("Should create a new event with correct details", async function () {
      const tx = await eventManager.connect(chef).createEvent(
        title,
        description,
        price,
        maxParticipants,
        eventDate,
        allergies
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'EventCreated');
      const eventId = event.args[0];

      const eventDetails = await eventManager.getEventDetails(eventId);
      expect(eventDetails.chef).to.equal(chef.address);
      expect(eventDetails.title).to.equal(title);
      expect(eventDetails.description).to.equal(description);
      expect(eventDetails.price).to.equal(price);
      expect(eventDetails.maxParticipants).to.equal(maxParticipants);
      expect(eventDetails.currentParticipants).to.equal(0);
      expect(eventDetails.eventDate).to.equal(eventDate);
      expect(eventDetails.isActive).to.be.true;
      expect(eventDetails.allergies).to.deep.equal(allergies);
    });

    it("Should fail to create event with past date", async function () {
      const pastDate = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago
      await expect(
        eventManager.connect(chef).createEvent(
          title,
          description,
          price,
          maxParticipants,
          pastDate,
          allergies
        )
      ).to.be.revertedWith("Event date must be in the future");
    });

    it("Should fail to create event with zero max participants", async function () {
      await expect(
        eventManager.connect(chef).createEvent(
          title,
          description,
          price,
          0,
          eventDate,
          allergies
        )
      ).to.be.revertedWith("Max participants must be greater than 0");
    });
  });

  describe("Event Booking", function () {
    const title = "Italian Cooking Class";
    const description = "Learn to make authentic Italian pasta";
    const price = ethers.parseEther("0.1");
    const maxParticipants = 10;
    const eventDate = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    const allergies = ["Gluten", "Dairy"];
    let eventId;

    beforeEach(async function () {
      const tx = await eventManager.connect(chef).createEvent(
        title,
        description,
        price,
        maxParticipants,
        eventDate,
        allergies
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'EventCreated');
      eventId = event.args[0];
    });

    it("Should allow booking of event", async function () {
      const participantAllergies = ["Nuts"];
      const tx = await eventManager.connect(participant).bookEvent(
        eventId,
        participantAllergies,
        { value: price }
      );
      await tx.wait();

      const bookingDetails = await eventManager.getBookingDetails(eventId, participant.address);
      expect(bookingDetails.allergies).to.deep.equal(participantAllergies);
      expect(bookingDetails.hasAttended).to.be.false;

      const eventDetails = await eventManager.getEventDetails(eventId);
      expect(eventDetails.currentParticipants).to.equal(1);
    });

    it("Should fail to book event twice", async function () {
      await eventManager.connect(participant).bookEvent(
        eventId,
        allergies,
        { value: price }
      );

      await expect(
        eventManager.connect(participant).bookEvent(
          eventId,
          allergies,
          { value: price }
        )
      ).to.be.revertedWith("Already booked");
    });

    it("Should fail to book with insufficient payment", async function () {
      await expect(
        eventManager.connect(participant).bookEvent(
          eventId,
          allergies,
          { value: ethers.parseEther("0.05") }
        )
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should return excess payment", async function () {
      const excessAmount = ethers.parseEther("0.05");
      const initialBalance = await ethers.provider.getBalance(participant.address);
      
      const tx = await eventManager.connect(participant).bookEvent(
        eventId,
        allergies,
        { value: price.add(excessAmount) }
      );
      const receipt = await tx.wait();
      
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const finalBalance = await ethers.provider.getBalance(participant.address);
      
      expect(finalBalance).to.equal(initialBalance.sub(price).sub(gasUsed));
    });
  });

  describe("Event Cancellation", function () {
    const title = "Italian Cooking Class";
    const description = "Learn to make authentic Italian pasta";
    const price = ethers.parseEther("0.1");
    const maxParticipants = 10;
    const eventDate = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    const allergies = ["Gluten", "Dairy"];
    let eventId;

    beforeEach(async function () {
      const tx = await eventManager.connect(chef).createEvent(
        title,
        description,
        price,
        maxParticipants,
        eventDate,
        allergies
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'EventCreated');
      eventId = event.args[0];
    });

    it("Should allow chef to cancel event", async function () {
      await eventManager.connect(chef).cancelEvent(eventId);
      
      const eventDetails = await eventManager.getEventDetails(eventId);
      expect(eventDetails.isActive).to.be.false;
    });

    it("Should fail to cancel event if not chef", async function () {
      await expect(
        eventManager.connect(participant).cancelEvent(eventId)
      ).to.be.revertedWith("Not the event chef");
    });

    it("Should fail to cancel event after it has started", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");

      await expect(
        eventManager.connect(chef).cancelEvent(eventId)
      ).to.be.revertedWith("Event has already started");
    });

    it("Should refund participants when event is cancelled", async function () {
      // Book event
      await eventManager.connect(participant).bookEvent(
        eventId,
        allergies,
        { value: price }
      );

      const initialBalance = await ethers.provider.getBalance(participant.address);
      
      // Cancel event
      const tx = await eventManager.connect(chef).cancelEvent(eventId);
      const receipt = await tx.wait();
      
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      const finalBalance = await ethers.provider.getBalance(participant.address);
      
      expect(finalBalance).to.equal(initialBalance.add(price).sub(gasUsed));
    });
  });

  describe("Attendance Tracking", function () {
    const title = "Italian Cooking Class";
    const description = "Learn to make authentic Italian pasta";
    const price = ethers.parseEther("0.1");
    const maxParticipants = 10;
    const eventDate = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
    const allergies = ["Gluten", "Dairy"];
    let eventId;

    beforeEach(async function () {
      const tx = await eventManager.connect(chef).createEvent(
        title,
        description,
        price,
        maxParticipants,
        eventDate,
        allergies
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'EventCreated');
      eventId = event.args[0];

      // Book event
      await eventManager.connect(participant).bookEvent(
        eventId,
        allergies,
        { value: price }
      );
    });

    it("Should allow chef to mark attendance", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");

      await eventManager.connect(chef).markAttendance(eventId, participant.address);
      
      const bookingDetails = await eventManager.getBookingDetails(eventId, participant.address);
      expect(bookingDetails.hasAttended).to.be.true;
    });

    it("Should fail to mark attendance if not chef", async function () {
      await expect(
        eventManager.connect(participant).markAttendance(eventId, participant.address)
      ).to.be.revertedWith("Not the event chef");
    });

    it("Should fail to mark attendance before event starts", async function () {
      await expect(
        eventManager.connect(chef).markAttendance(eventId, participant.address)
      ).to.be.revertedWith("Event has not started yet");
    });

    it("Should fail to mark attendance for non-participant", async function () {
      // Fast forward time
      await ethers.provider.send("evm_increaseTime", [86400]);
      await ethers.provider.send("evm_mine");

      await expect(
        eventManager.connect(chef).markAttendance(eventId, addr1.address)
      ).to.be.revertedWith("Participant not found");
    });
  });
}); 