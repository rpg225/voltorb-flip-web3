// scripts/deploy.js

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contract with the account:", deployer.address);

    // Get the ContractFactory for "VoltorbFlp"
    // Make sure the name "VoltorbFlip" matches your contract name exactly

    const VoltorbFlipFactory = await ethers.getContractFactory("VoltorbFlip");
    const voltorbFlip = await VoltorbFlipFactory.deploy();

    // Wait for the deployment to be confirmed on the network
    await voltorbFlip.waitForDeployment();

    // Get the address of the deployed contract
    const contractAddress = voltorbFlip.target;

    console.log("VoltorbFlip contract deployed to:", contractAddress);
}

 main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });