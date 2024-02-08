const axios = require('axios');
const { db } = require("../firebase");

module.exports = {
    async getSeasonTicketSeatsArray (season) {
        //return 'firebase admin working'
        const query = db
            .collection('seasons')
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
    },

    async getSingleTickets(queryParams) {
        console.log(queryParams.fixture_id)
        try {
            const querySnapshot = await db.collection('fixtures_seats_reserved')
                                                    .where('fixture_id', '==', queryParams.fixture_id)
                                                    .where('payment_status', '==', parseInt(queryParams.status))
                                                    .orderBy('created', 'desc')
                                                    .get();

            if (querySnapshot.empty) {
                return [];
            } else {
                console.log(querySnapshot.size)
                const singleTickets = querySnapshot.docs.map(doc => doc.data());

                const uniqueUserIds = [...new Set(singleTickets.map(ticket => ticket.uid))];

                const usersSnapshot = await db.collection('users').where('uid', 'in', uniqueUserIds).get();
                const users = usersSnapshot.docs.map(doc => doc.data());

                const singleTicketsWithUsers = singleTickets.map(ticket => ({
                    ...ticket,
                    user: users.find(user => user.uid === ticket.uid)
                }));

                /* let singleTicketsWithSeparatedItems = singleTicketsWithUsers.reduce((acc, ticket) => {
                    ticket.items.forEach(item => acc.push({...ticket,item: item}));
                    return acc;
                }, []); */

                /* if (queryParams.collectible_name && queryParams.collectible_name.toLowerCase() !== 'all') {
                    singleTicketsWithSeparatedItems = singleTicketsWithSeparatedItems.filter(ticket =>
                        order.item.name === queryParams.collectible_name
                    );
                } */

                return singleTicketsWithUsers;
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}