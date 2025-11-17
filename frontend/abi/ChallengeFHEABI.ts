export const ChallengeFHEABI = {
  abi: [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    // Events
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "challengeId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "organizer", "type": "address" },
        { "indexed": false, "internalType": "string", "name": "challengeCID", "type": "string" }
      ],
      "name": "ChallengeCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "challengeId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "participant", "type": "address" }
      ],
      "name": "JoinedChallenge",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "challengeId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "participant", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "dayIndex", "type": "uint256" },
        { "indexed": false, "internalType": "string", "name": "reportCID", "type": "string" }
      ],
      "name": "CheckIn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "challengeId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "participant", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "dayIndex", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "verifier", "type": "address" },
        { "indexed": false, "internalType": "bool", "name": "approve", "type": "bool" }
      ],
      "name": "CheckInVerified",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "challengeId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "participant", "type": "address" },
        { "indexed": false, "internalType": "string", "name": "evidenceCID", "type": "string" }
      ],
      "name": "ParticipantFailed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "challengeId", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "rewardPool", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "winnersCount", "type": "uint256" }
      ],
      "name": "ChallengeSettled",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "uint256", "name": "challengeId", "type": "uint256" },
        { "indexed": true, "internalType": "address", "name": "participant", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "RewardClaimed",
      "type": "event"
    },
    {
      "inputs": [
        { "internalType": "string", "name": "challengeCID", "type": "string" },
        { "internalType": "uint256", "name": "startTime", "type": "uint256" },
        { "internalType": "uint256", "name": "endTime", "type": "uint256" },
        { "internalType": "uint256", "name": "daysTotal", "type": "uint256" },
        { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
        { "internalType": "address", "name": "stakeToken", "type": "address" },
        { "internalType": "bool", "name": "requireEvidence", "type": "bool" },
        { "internalType": "uint8", "name": "verificationMode", "type": "uint8" }
      ],
      "name": "createChallenge",
      "outputs": [{ "internalType": "uint256", "name": "challengeId", "type": "uint256" }],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "challengeId", "type": "uint256" }],
      "name": "getChallenge",
      "outputs": [
        {
          "components": [
            { "internalType": "uint256", "name": "challengeId", "type": "uint256" },
            { "internalType": "address", "name": "organizer", "type": "address" },
            { "internalType": "string", "name": "challengeCID", "type": "string" },
            { "internalType": "uint256", "name": "startTime", "type": "uint256" },
            { "internalType": "uint256", "name": "endTime", "type": "uint256" },
            { "internalType": "uint256", "name": "daysTotal", "type": "uint256" },
            { "internalType": "uint256", "name": "stakeAmount", "type": "uint256" },
            { "internalType": "address", "name": "stakeToken", "type": "address" },
            { "internalType": "bool", "name": "requireEvidence", "type": "bool" },
            { "internalType": "uint8", "name": "verificationMode", "type": "uint8" },
            { "internalType": "uint256", "name": "rewardPool", "type": "uint256" },
            { "internalType": "bool", "name": "settled", "type": "bool" }
          ],
          "internalType": "struct ChallengeFHE.Challenge",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "challengeId", "type": "uint256" },
        { "internalType": "address", "name": "participant", "type": "address" }
      ],
      "name": "getEncryptedSuccessDays",
      "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "challengeId", "type": "uint256" },
        { "internalType": "address", "name": "participant", "type": "address" }
      ],
      "name": "getParticipantRecord",
      "outputs": [
        {
          "components": [
            { "internalType": "address", "name": "participant", "type": "address" },
            { "internalType": "uint256", "name": "joinedAt", "type": "uint256" },
            { "internalType": "uint8", "name": "status", "type": "uint8" },
            { "internalType": "uint256", "name": "stakeLocked", "type": "uint256" },
            { "internalType": "bytes32", "name": "encryptedSuccessDays", "type": "bytes32" }
          ],
          "internalType": "struct ChallengeFHE.ParticipantRecord",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextChallengeId",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "challengeId", "type": "uint256" }],
      "name": "joinChallenge",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "challengeId", "type": "uint256" },
        { "internalType": "string", "name": "reportCID", "type": "string" },
        { "internalType": "bytes32", "name": "encIncrement", "type": "bytes32" },
        { "internalType": "bytes", "name": "inputProof", "type": "bytes" }
      ],
      "name": "checkIn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "uint256", "name": "challengeId", "type": "uint256" },
        { "internalType": "address", "name": "participant", "type": "address" },
        { "internalType": "uint256", "name": "dayIndex", "type": "uint256" },
        { "internalType": "bool", "name": "approve", "type": "bool" },
        { "internalType": "string", "name": "evidenceCID", "type": "string" }
      ],
      "name": "verifyCheckIn",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
} as const;


