
module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
}) => {

  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  const token1 = await deploy("ERC20", {
    from: deployer,
    args: ["token1","token1"],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  console.log(`Deployed token1 contract at: `, token1.address);

}

module.exports.tags = ['Token1'];