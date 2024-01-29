import {
  collection,
  getDoc,
  getDocs,
  updateDoc,
  where,
  query,
  doc,
  limit,
  setDoc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { convertTimestamptToDate } from "./helpers";

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

export const fetchPlayers = (setState) => {
  const usersRef = collection(db, "users");
  const unsubscribe = onSnapshot(
    usersRef,
    (snapshot) => {
      const userData = [];
      snapshot.forEach((doc) => {
        userData.push({ id: doc.id, ...doc.data() });
      });
      setState(userData);
    },
    (error) => {
      console.error("Error fetching users:", error);
    }
  );
  return () => unsubscribe();
};

export const fetchManagers = (setState, setLoading) => {
  setLoading(true);
  try {
    const q = query(
      collection(db, "managers"),
      where("username", "!=", "admin")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const managerData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        managerData.push({ ...data, id: doc.id });
      });
      setLoading(false);
      setState(managerData);
    });
    return unsubscribe;
  } catch (error) {
    console.error("Error fetching managers:", error);
    setLoading(false);
  }
};

export const fetchTeams = (setState, setLoading) => {
  try {
    const q = query(collection(db, "teams"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const teamsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        teamsData.push({ ...data, id: doc.id });
      });
      setLoading(false);
      setState(teamsData);
    });
    return unsubscribe;
  } catch (error) {
    console.error("Error fetching teams:", error);
    setLoading(false);
  }
};

export const addTeam = async (team) => {
  return await addDoc(collection(db, "teams"), {
    ...team,
    date: serverTimestamp(),
  });
};

export const getManagerByUsername = async (username) => {
  try {
    const q = query(
      collection(db, "managers"),
      where("username", "==", username),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
  } catch (error) {
    console.log(error);
  }
};

export const getManagerByUsernameAndRole = async (username, role) => {
  try {
    const q = query(
      collection(db, "managers"),
      where("username", "==", username),
      where("role", "==", role),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateManager = async (manager) => {
  const docRef = doc(db, "managers", manager.id);
  return await setDoc(docRef, manager);
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

export const updateSymbol = async (id, payload) => {
  try {
    const symbolRef = doc(db, "symbols", id);
    await updateDoc(symbolRef, payload);
    console.log("Symbol is updated successfully");
  } catch (error) {
    console.log(error);
  }
};

export const addNewDepsit = async (newDeposit) => {
  const depositRef = collection(db, "deposits");
  await addDoc(depositRef, {
    ...newDeposit,
    createdAt: serverTimestamp(),
  });
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

export const updateUserById = async (id, payload) => {
  const userDocRef = doc(db, "users", id);
  await updateDoc(userDocRef, payload);
};

export const getAllSymbols = (setState) => {
  const q = query(
    collection(db, "symbols"),
    where("symbol", "in", ["BTCUSDT", "ETHUSDT", "DOGEUSDT"])
  );
  // const symbolsRef = collection(db, "symbols");

  const unsubscribe = onSnapshot(
    // symbolsRef,
    q,
    (snapshot) => {
      const symbols = [];
      snapshot.forEach((doc) => {
        symbols.push({ id: doc.id, ...doc.data() });
      });

      const symbolsData = symbols
        .map((s) => {
          return s.duplicates?.length
            ? [
                s,
                ...s.duplicates.map((m) => ({
                  symbolId: s.id,
                  symbol: m,
                  price: s.price,
                  duplicate: s.symbol,
                  settings: s.settings,
                })),
              ]
            : s;
        })
        .flat();

      setState(symbolsData);
    },
    (error) => {
      console.error("Error fetching data:", error);
    }
  );
  return () => unsubscribe();
};

export const getSymbolByName = async (symbol) => {
  try {
    const q = query(
      collection(db, "symbols"),
      where("symbol", "==", symbol),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
  } catch (error) {
    console.log(error);
  }
};

export const getAllDeposits = (setState) => {
  try {
    const depositsRef = collection(db, "deposits");
    const userDepositsQuery = query(depositsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      userDepositsQuery,
      (snapshot) => {
        const depositsData = [];
        snapshot.forEach((doc) => {
          const docData = doc.data();
          depositsData.push({
            id: doc.id,
            ...docData,
            createdAt: convertTimestamptToDate(docData.createdAt),
          });
        });
        setState(depositsData);
      },
      (error) => {
        console.error("Error fetching data:", error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error:", error);
  }
};
