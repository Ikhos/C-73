import * as firebase from 'firebase';
require("@firebase/firestore");

var firebaseConfig = {
    apiKey: "AIzaSyDD4-jYn48g0BYk4cF_HcLqui3yv2bsHLs",
    authDomain: "c-71-38971.firebaseapp.com",
    projectId: "c-71-38971",
    storageBucket: "c-71-38971.appspot.com",
    messagingSenderId: "328472657561",
    appId: "1:328472657561:web:970efff2de5e94ca1a0208"
};

firebase.initializeApp(firebaseConfig);

export default firebase.firestore();