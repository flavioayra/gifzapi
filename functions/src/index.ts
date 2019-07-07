import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// import { constructor } from 'firebase-admin';

admin.initializeApp();

class Gif {
    url: string;
    id: string;
    constructor(url: string, id: string) {
        this.url = url;
        this.id = id;
    }       
}

export const gifzMood = functions.https.onRequest(async (request, response) => {   
    const imgs: Array<string> = []
    let mood: string = "funny"
    
    if (request.query.mood) {
        mood = request.query.mood
        console.log("Mood: "+ mood)
    } 

    const giphy = require('giphy-api')('dc6zaTOxFJmzC');
    for (let i: number = 0; i < 10; i++) {
        giphy.random(mood).then(function (res: any) {
            console.log(res)
            res['data'] && res['data']['images'] && imgs.push(res['data']['images']['fixed_width'].url)
        });
    }

    const tenor = require("request");
    tenor.get("https://api.tenor.com/v1/random?q="+mood+"&key=LIVDSRZULELA&limit=10&media_filter=minimal&contentfilter=off&anon_id=3a76e56901d740da9e59ffb22b988242", (error: any, resp: any, body: string) => {
        JSON.parse(body).results.forEach((element: any) => {
            element && element.media[0] && element.media[0].tinygif && imgs.push(element.media[0].tinygif.url)
        });

        console.log(imgs)
        response.send(imgs)
    }); 
});

export const fav = functions.https.onRequest(async (request, response) => {   
    const url: string = request.query.url
    
    const db = admin.firestore();
    db.collection('favs').add({
        url: url
    }).then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    }).catch(function(error) {
        console.error("Error adding document: ", error);
    });

    console.log("url: "+ url)    
    response.send();
});

export const favs = functions.https.onRequest(async (request, response) => {   
    const imgs: Array<Gif> = []
    const db = admin.firestore();

    db.collection("favs").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const d = doc.data();
            d && d.url && imgs.push(new Gif(d.url, doc.id));
        });
        console.log(imgs);
        response.send(imgs);
    }).catch(function(error) {
        console.error("Error adding document: ", error);
        response.send();
    });
});

export const unfav = functions.https.onRequest(async (request, response) => {   
    const id: string = request.query.id
    
    const db = admin.firestore();
    db.collection('favs').doc(id).delete().then(function(docRef) {
        console.log("Document delete with ID: ", id);
    }).catch(function(error) {
        console.error("Error deleting document: ", error);
    });

    console.log("id: "+ id)    
    response.send();
});
