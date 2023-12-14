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
    async getCollectibleOrdersReport() {
        try {
            const collectibleOrdersSnapshot = await db.collection('collectible_orders').get();
            const collectibleOrders = collectibleOrdersSnapshot.docs.map(doc => doc.data());

            const uniqueUserIds = [...new Set(collectibleOrders.map(order => order.user_id))];

            const usersSnapshot = await db.collection('users').where('uid', 'in', uniqueUserIds).get();
            const users = usersSnapshot.docs.map(doc => doc.data());

            const collectibleOrdersWithUsers = collectibleOrders.map(order => ({
                ...order,
                user: users.find(user => user.uid === order.user_id)
            }));

            const separateItems = collectibleOrdersWithUsers.reduce((acc, order) => {
                order.items.forEach(item => acc.push({...order,items: [item]}));
                return acc;
            }, []);

            return separateItems;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}