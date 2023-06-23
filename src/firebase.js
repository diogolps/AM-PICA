import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCMMTyysEhhO3pEG1CnzdFw8OXhlEOJ3dc",
  authDomain: "pica-ae74d.firebaseapp.com",
  projectId: "pica-ae74d",
  storageBucket: "pica-ae74d.appspot.com",
  messagingSenderId: "869186891726",
  appId: "1:869186891726:web:c4996d642c54ab62a7859f",
};

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);

// Obtenha as referências para os serviços do Firebase
const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

export { auth, firestore, storage };
export default firebase;
