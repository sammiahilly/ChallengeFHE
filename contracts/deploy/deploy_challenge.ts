import { ethers, run } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const factory = await ethers.getContractFactory("ChallengeFHE");
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("ChallengeFHE deployed to:", address);

  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Waiting for 5 blocks before Etherscan verify...");
    await contract.deploymentTransaction()?.wait(5);
    try {
      await run("verify:verify", {
        address,
        constructorArguments: [],
      });
      console.log("Verified on Etherscan");
    } catch (e) {
      console.log("Etherscan verify failed:", e);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


