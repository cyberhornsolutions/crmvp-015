import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const getData = async (collectionName) => {
  try {
    let result = [];
    const q = collection(db, collectionName);
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.forEach((doc) => {
      result.push(doc.data());
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};
