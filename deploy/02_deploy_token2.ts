
module.exports = async ({
  getNamedAccounts,
  deployments,
  getChainId,
  getUnnamedAccounts,
}) => {

  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  const token2 = await deploy("ERC20", {
    from: deployer,
    args: ["token2","token2"],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  console.log(`Deployed token2 contract at: `, token2.address);

}

module.exports.tags = ['Token2'];