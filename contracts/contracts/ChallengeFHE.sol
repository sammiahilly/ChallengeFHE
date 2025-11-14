// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title ChallengeFHE - FHE-enabled habit-breaking challenge contract
/// @notice Stores minimal indices on-chain and uses FHE to keep sensitive counters private.
contract ChallengeFHE is ZamaEthereumConfig {
    enum ParticipantStatus { Active, Failed, Completed, Withdrawn }

    struct Challenge {
        uint256 challengeId;
        address organizer;
        string challengeCID; // IPFS metadata CID
        uint256 startTime;
        uint256 endTime;
        uint256 daysTotal; // e.g., 30
        uint256 stakeAmount; // in wei; 0 if not required
        address stakeToken; // address(0) = ETH
        bool requireEvidence;
        uint8 verificationMode; // 0: none, 1: whitelist, 2: community
        uint256 rewardPool; // ETH stored in the contract
        bool settled;
    }

    struct ParticipantRecord {
        address participant;
        uint256 joinedAt;
        ParticipantStatus status;
        uint256 stakeLocked; // in wei
        euint32 encryptedSuccessDays; // kept private via FHE
    }

    event ChallengeCreated(uint256 indexed challengeId, address indexed organizer, string challengeCID);
    event JoinedChallenge(uint256 indexed challengeId, address indexed participant);
    event CheckIn(
        uint256 indexed challengeId,
        address indexed participant,
        uint256 dayIndex,
        string reportCID
    );
    event CheckInVerified(
        uint256 indexed challengeId,
        address indexed participant,
        uint256 dayIndex,
        address verifier,
        bool approve
    );
    event ParticipantFailed(uint256 indexed challengeId, address indexed participant, string evidenceCID);
    event ChallengeSettled(uint256 indexed challengeId, uint256 rewardPool, uint256 winnersCount);
    event RewardClaimed(uint256 indexed challengeId, address indexed participant, uint256 amount);

    uint256 public nextChallengeId = 1;

    mapping(uint256 => Challenge) public challenges;
    mapping(uint256 => mapping(address => ParticipantRecord)) public participants; // challengeId => participant => record

    // ----------------------------------------
    // Create & Join
    // ----------------------------------------

    function createChallenge(
        string calldata challengeCID,
        uint256 startTime,
        uint256 endTime,
        uint256 daysTotal,
        uint256 stakeAmount,
        address stakeToken,
        bool requireEvidence,
        uint8 verificationMode
    ) external payable returns (uint256 challengeId) {
        require(bytes(challengeCID).length > 0, "CID required");
        require(endTime > startTime, "Invalid time window");
        require(daysTotal > 0, "daysTotal=0");

        challengeId = nextChallengeId++;

        challenges[challengeId] = Challenge({
            challengeId: challengeId,
            organizer: msg.sender,
            challengeCID: challengeCID,
            startTime: startTime,
            endTime: endTime,
            daysTotal: daysTotal,
            stakeAmount: stakeAmount,
            stakeToken: stakeToken,
            requireEvidence: requireEvidence,
            verificationMode: verificationMode,
            rewardPool: msg.value, // allow organizer to seed reward pool with ETH
            settled: false
        });

        emit ChallengeCreated(challengeId, msg.sender, challengeCID);
    }

    function joinChallenge(uint256 challengeId) external payable {
        Challenge storage c = challenges[challengeId];
        require(c.organizer != address(0), "Challenge not found");
        require(block.timestamp < c.endTime, "Challenge ended");

        ParticipantRecord storage r = participants[challengeId][msg.sender];
        require(r.participant == address(0), "Already joined");

        if (c.stakeAmount > 0) {
            // Only ETH stake for MVP
            require(c.stakeToken == address(0), "ERC20 stake not supported in MVP");
            require(msg.value == c.stakeAmount, "Invalid stake value");
        } else {
            require(msg.value == 0, "No stake required");
        }

        r.participant = msg.sender;
        r.joinedAt = block.timestamp;
        r.status = ParticipantStatus.Active;
        r.stakeLocked = msg.value;

        // Initialize encryptedSuccessDays to encrypted zero, then set view permissions
        // Using explicit FHE.asEuint32(0) avoids operating on an uninitialized euint32
        r.encryptedSuccessDays = FHE.asEuint32(0);
        FHE.allowThis(r.encryptedSuccessDays);
        FHE.allow(r.encryptedSuccessDays, msg.sender);

        emit JoinedChallenge(challengeId, msg.sender);
    }

    // ----------------------------------------
    // Check-in & Verification
    // ----------------------------------------

    /// @notice Perform a daily check-in and increment the encrypted success days by an encrypted input.
    /// @dev Front-end must pass an encrypted value (typically 1) and its proof.
    function checkIn(
        uint256 challengeId,
        string calldata reportCID,
        externalEuint32 encIncrement,
        bytes calldata inputProof
    ) external {
        Challenge storage c = challenges[challengeId];
        require(c.organizer != address(0), "Challenge not found");
        require(block.timestamp >= c.startTime && block.timestamp <= c.endTime, "Not in time window");

        ParticipantRecord storage r = participants[challengeId][msg.sender];
        require(r.participant == msg.sender, "Not joined");
        require(r.status == ParticipantStatus.Active, "Not active");

        // Compute day index (0-based)
        uint256 dayIndex = (block.timestamp - c.startTime) / 1 days;
        require(dayIndex < c.daysTotal, "Out of range");

        // FHE add encrypted increment to encryptedSuccessDays
        euint32 inc = FHE.fromExternal(encIncrement, inputProof);
        r.encryptedSuccessDays = FHE.add(r.encryptedSuccessDays, inc);

        // authorize decryption to contract and user
        FHE.allowThis(r.encryptedSuccessDays);
        FHE.allow(r.encryptedSuccessDays, msg.sender);

        emit CheckIn(challengeId, msg.sender, dayIndex, reportCID);
    }

    function verifyCheckIn(
        uint256 challengeId,
        address participant,
        uint256 dayIndex,
        bool approve,
        string calldata evidenceCID
    ) external {
        // MVP: emit-only, verification policy enforced off-chain or in future versions
        require(challenges[challengeId].organizer != address(0), "Challenge not found");
        emit CheckInVerified(challengeId, participant, dayIndex, msg.sender, approve);
        if (!approve) {
            emit ParticipantFailed(challengeId, participant, evidenceCID);
        }
    }

    // ----------------------------------------
    // Views & Settlement
    // ----------------------------------------

    function getChallenge(uint256 challengeId) external view returns (Challenge memory) {
        return challenges[challengeId];
    }

    function getParticipantRecord(uint256 challengeId, address participant) external view returns (ParticipantRecord memory) {
        return participants[challengeId][participant];
    }

    function getEncryptedSuccessDays(uint256 challengeId, address participant) external view returns (euint32) {
        return participants[challengeId][participant].encryptedSuccessDays;
    }

    function settleChallenge(uint256 challengeId) external {
        Challenge storage c = challenges[challengeId];
        require(c.organizer != address(0), "Challenge not found");
        require(!c.settled, "Already settled");
        require(block.timestamp > c.endTime, "Not ended");

        // MVP: mark settled, distribution logic can be added later
        c.settled = true;
        emit ChallengeSettled(challengeId, c.rewardPool, 0);
    }

    function claimReward(uint256 challengeId) external {
        Challenge storage c = challenges[challengeId];
        require(c.settled, "Not settled");
        // MVP: no reward distribution; emit zero for traceability
        emit RewardClaimed(challengeId, msg.sender, 0);
    }
}


