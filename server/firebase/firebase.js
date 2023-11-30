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
    }
}