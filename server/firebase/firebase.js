const axios = require('axios');
const { db } = require("../firebase");

module.exports = {
    async getSeasonTicketSeatsArray (season) {
        //return 'firebase admin working'
        const query = db
            .collection('season_tickets')
            .doc(season)
            .collection('holders')
        const querySnapshot = await query.get();

        let seasonArr = []
        querySnapshot.forEach(doc => {
            const obj = doc.data();

            seasonArr.push(obj.seat_code);

        })
        return seasonArr;
    },
    async getCollectibleOrdersReport(queryParams) {
        try {
            const toDateEndOfDayToTimestamp = new Date(new Date(parseInt(queryParams.to_date))
                                                        .setHours(23, 59, 59, 999))
                                                        .getTime();

            const collectibleOrdersSnapshot = await db.collection('collectible_orders')
                                                    .where('created', '>=', parseInt(queryParams.from_date))
                                                    .where('created', '<=',parseInt(toDateEndOfDayToTimestamp))
                                                    .orderBy('created', 'desc')
                                                    .get();

            if (collectibleOrdersSnapshot.empty) {
                return [];
            } else {
                const collectibleOrders = collectibleOrdersSnapshot.docs.map(doc => doc.data());

                const uniqueUserIds = [...new Set(collectibleOrders.map(order => order.user_id))];

                const usersSnapshot = await db.collection('users').where('uid', 'in', uniqueUserIds).get();
                const users = usersSnapshot.docs.map(doc => doc.data());

                const collectibleOrdersWithUsers = collectibleOrders.map(order => ({
                    ...order,
                    user: users.find(user => user.uid === order.user_id)
                }));

                let collectibleOrdersWithSeparatedItems = collectibleOrdersWithUsers.reduce((acc, order) => {
                    order.items.forEach(item => acc.push({...order,item: item}));
                    return acc;
                }, []);

                if (queryParams.collectible_name && queryParams.collectible_name.toLowerCase() !== 'all') {
                    collectibleOrdersWithSeparatedItems = collectibleOrdersWithSeparatedItems.filter(order =>
                        order.item.name === queryParams.collectible_name
                    );
                }

                return collectibleOrdersWithSeparatedItems;
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}