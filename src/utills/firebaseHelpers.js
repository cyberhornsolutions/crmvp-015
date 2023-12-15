import {
  collection,
  getDoc,
  getDocs,
  updateDoc,
  where,
  query,
  doc,
  setDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
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

export const addDuplicateSymbol = async (selectedSymbol, duplicate) => {
  try {
    const symbolDocRef = query(
      collection(db, "symbols"),
      where("symbol", "==", selectedSymbol.symbol)
    );
    const symbolDocSnapshot = await getDocs(symbolDocRef);

    if (!symbolDocSnapshot.empty) {
      const symbolDocRef = symbolDocSnapshot.docs[0].ref;
      const symbolData = symbolDocSnapshot.docs[0].data();
      console.log("symbol data = ", symbolData);
      const duplicates = symbolData.duplicates || [];
      duplicates.push(duplicate);

      // Update the balance in the database directly
      await setDoc(symbolDocRef, { duplicates }, { merge: true });
      console.log("Symbol updated successfully!");
    } else {
      console.error("Symbol does not exist in the database.");
    }
  } catch (error) {
    console.error("Error updating Symbol:", error);
    throw new Error(error.message);
  }
};

export const removeDuplicateSymbol = async (selectedSymbol, duplicate) => {
  try {
    const symbolDocRef = query(
      collection(db, "symbols"),
      where("symbol", "==", selectedSymbol.duplicate)
    );
    const symbolDocSnapshot = await getDocs(symbolDocRef);

    if (!symbolDocSnapshot.empty) {
      const symbolDocRef = symbolDocSnapshot.docs[0].ref;
      const symbolData = symbolDocSnapshot.docs[0].data();
      console.log("symbol data = ", symbolData);
      let duplicates = symbolData.duplicates || [];
      duplicates = duplicates.filter(
        (symbol) => symbol !== selectedSymbol.symbol
      );

      // Update the balance in the database directly
      await setDoc(symbolDocRef, { duplicates }, { merge: true });
      console.log("Symbol updated successfully!");
    } else {
      console.error("Symbol does not exist in the database.");
    }
  } catch (error) {
    console.error("Error updating Symbol:", error);
    throw new Error(error.message);
  }
};

export const addUserNewBalance = async (userId, amount) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      const currentBalanceString = userData.totalBalance || 0;
      const currentBalance = parseFloat(currentBalanceString);
      const updatedBalance = currentBalance + parseFloat(amount);

      // Update the balance in the database directly
      await setDoc(
        userDocRef,
        { totalBalance: updatedBalance },
        { merge: true }
      );

      const depositRef = collection(db, "deposits");

      await addDoc(depositRef, {
        userId: userId,
        amount: parseFloat(amount),
        comment: "Bonus",
        createdAt: serverTimestamp(),
      });

      console.log("Balance updated successfully!");
    } else {
      console.error("User ID does not exist in the database.");
    }
  } catch (error) {
    console.error("Error updating balance:", error);
  }
};

export const getUserById = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnapshot = await getDoc(userDocRef);

    if (userDocSnapshot.exists()) {
      const userData = userDocSnapshot.data();
      const userWithId = { id: userDocSnapshot.id, ...userData }; // Include ID in the returned object

      console.log("User data:", userData);
      return userWithId; // Return the user data or perform operations here
    } else {
      console.error("User ID does not exist in the database.");
      return null; // Or handle as needed if the user doesn't exist
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    return null; // Handle errors
  }
};
