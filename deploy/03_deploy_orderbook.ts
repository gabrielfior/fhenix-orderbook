
module.exports = async ({
  getNamedAccounts,
  deployments,
}) => {

  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  //const Token1 = await deployments.get('Token1');
  const Token2 = await deployments.get('Token2');

  const orderbook = await deploy("Orderbook", {
    from: deployer,
    args: [Token2.address, Token2.address],
    log: true,
    skipIfAlreadyDeployed: false,
  });

  console.log(`Deployed Orderbook contract at: `, orderbook.address);

}

module.exports.tags = ['Orderbook'];