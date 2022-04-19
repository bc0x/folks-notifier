import prisma from '../lib/prisma';

async function main() {
  await prisma.loanNotification.create({
    data: {
      phone: '+18033788952',
      notifyHealthFactor: 10,
      pair: 'ALGO-USDC',
      appId: 686541542,
      collateralPool: {
        appId: 686498781,
        assetId: 0,
        fAssetId: 686505742,
        frAssetId: 686505743,
        assetDecimals: 6,
      },
      borrowPool: {
        appId: 686500029,
        assetId: 31566704,
        fAssetId: 686508050,
        frAssetId: 686508051,
        assetDecimals: 6,
      },
      linkAddr: 'XMW3WFSMMHV54FAP5ROYPB6LUDBUAKSQBZVI2PIX6OR3NWQWBXKUW7KBGY',
      escrowAddress:
        'JSGE4T47726R53IZGSXL457DH24CGDFZH52WLT4SOCZMYB5IUM7UJ76MWA',
      userAddress: 'VMBD7IS4GAYKWLK74RM3SQNYC2OHLCULOXMMP4Q5HDKW72OID7V6YSOB7A',
      borrowed: 5,
      collateralBalance: 49.955911,
      borrowBalance: 5.000768,
      borrowBalanceLiquidationThreshold: 29.317918,
      healthFactor: 5.86268309187708,
      notifiedAt: null,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect);
