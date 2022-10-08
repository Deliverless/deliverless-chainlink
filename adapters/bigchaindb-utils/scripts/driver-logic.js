import BigchainDB from "./bigchaindb-orm"

const seed = bip39.mnemonicToSeedSync('candy maple cake sugar pudding cream honey rich smooth crumble sweet treat').slice(0, 32)
const keypair = new bigchaindb.bdbOrm.driver.Ed25519Keypair(seed)

/**
 * Called after an order is placed, given the order object created, it randomly picks a driver that is
 * both online and doesn't already have a pending order assigned.
 * @param {} order 
 */
export const delegateOrder = async (order) => {
    const client = BigchainDB("http://24.150.93.243", true);
    let { address } = order;
    //get all online drivers
    let drivers = await client.getObjectsByMetadata("driver", { online: true }, 0, true);
    //find drivers that are in the same city as the order destination address
    let sameCityDrivers = drivers.filter((d) => {
        return address.formatted.includes(d.city);
    })
    //if there are any drivers nearby, pick from them, otherwise pick from all
    if (sameCityDrivers.length >= 0) drivers = sameCityDrivers;

    let isValidDriver = false
    let allPendingOrders = await client.getObjectsByMetadata("order", { status: 'Pending' }, 0, true);
    do {
        //pick random driver from drivers
        let randomDriver = drivers[Math.floor((Math.random() * drivers.length))]
        //fetch all pending orders, if any contain the selected randomDriver id, the driver already has an order pending and it thereby invalid, loop, try again.
        isValidDriver = !allPendingOrders.some((o) => {
            return o.driverId == randomDriver.id;
        });
    } while (!isValidDriver);
    //assign order to driver
    client.appendToObject("order", order.id, { driverId: randomDriver.id }, keypair, true);
}