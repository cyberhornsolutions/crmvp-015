import {
  collection,
  getDoc,
  getDocs,
  updateDoc,
  where,
  query,
  doc,
  deleteDoc,
  limit,
  setDoc,
  onSnapshot,
  addDoc,
  writeBatch,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";
import { convertTimestamptToDate, getAskValue, getBidValue } from "./helpers";

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
  try {
    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(
      usersRef,
      (snapshot) => {
        const userData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          userData.push({
            id: doc.id,
            ...data,
            createdAt: { ...data.createdAt },
          });
        });
        setState(userData);
      },
      (error) => {
        console.error("Error fetching users:", error);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error(error);
  }
};

export const fetchOrders = (setState, playersList) => {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "in", playersList),
      orderBy("createdTime", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const orders = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const order = {
          id: doc.id,
          ...data,
          createdTime: { ...data.createdTime },
        };
        if (order.closedDate) order.closedDate = { ...data.closedDate };
        orders.push(order);
      });

      setState(orders);
      return unsubscribe;
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
  }
};

export const fetchManagers = (setState) => {
  try {
    const q = query(collection(db, "managers"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const managerData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        managerData.push({
          ...data,
          id: doc.id,
          date: { ...data.date },
        });
      });
      setState(managerData);
    });
    return unsubscribe;
  } catch (error) {
    console.error("Error fetching managers:", error);
  }
};

export const fetchBlockedIps = (setState) => {
  try {
    const q = query(collection(db, "blockedIps"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ipsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        ipsData.push({ ...data, id: doc.id, date: { ...data.date } });
      });
      setState(ipsData);
    });
    return unsubscribe;
  } catch (error) {
    console.error("Error fetching blocked ips:", error);
  }
};

export const fetchTeams = (setState) => {
  try {
    const q = query(collection(db, "teams"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const teamsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        teamsData.push({ ...data, id: doc.id, date: { ...data.date } });
      });
      setState(teamsData);
    });
    return unsubscribe;
  } catch (error) {
    console.error("Error fetching teams:", error);
  }
};

export const addBlockedIp = async (ip) => {
  return await addDoc(collection(db, "blockedIps"), {
    ...ip,
    date: serverTimestamp(),
  });
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
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateManager = async (id, payload) => {
  const docRef = doc(db, "managers", id);
  return await updateDoc(docRef, payload);
};

export const updateBlockedIp = async (id, payload) => {
  const docRef = doc(db, "blockedIps", id);
  return await updateDoc(docRef, payload);
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

export const removeDuplicateSymbol = async (selectedSymbol) => {
  const realSymbol = await getSymbolByName(selectedSymbol.duplicate);
  if (!realSymbol) throw new Error("Symbol not found");
  const duplicates = realSymbol.duplicates.filter(
    (id) => id !== selectedSymbol.id
  );
  await updateSymbol(realSymbol.id, { duplicates });
  await deleteDocument("symbols", selectedSymbol.id);
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

const calculateProfit = (orderData, closedPrice, symbolExists) => {
  let pnl = 0,
    shouldClose = false;
  if (symbolExists && orderData.type === "Buy") {
    /// profit
    if (orderData.tp && symbolExists.price >= parseFloat(orderData.tp)) {
      pnl = (orderData.tp - orderData.symbolValue) * orderData.volume;
      console.log("one pnl=", pnl);
      if (pnl != 0) shouldClose = true;
    }
    // loss
    else if (orderData.sl && orderData.sl >= closedPrice) {
      pnl = (orderData.symbolValue - closedPrice) * orderData.volume;
      console.log("two pnl=", pnl);
      if (pnl != 0) shouldClose = true;
    } else {
      pnl = (closedPrice - orderData.symbolValue) * orderData.volume;
    }
  } else if (symbolExists && orderData.type === "Sell") {
    /// profit
    if (orderData.tp && symbolExists.price <= orderData.tp) {
      pnl = (orderData.symbolValue - orderData.tp) * orderData.volume;
      console.log("one pnl=", pnl);
      if (pnl != 0) shouldClose = true;
    } // loss
    else if (orderData.sl && orderData.sl <= closedPrice) {
      pnl = (orderData.symbolValue - closedPrice) * orderData.volume;
      console.log("two pnl=", pnl);
      if (pnl != 0) shouldClose = true;
    } else {
      pnl = (orderData.symbolValue - closedPrice) * orderData.volume;
    }
  }
  return { pnl, shouldClose };
};

export const updateSymbolAndPriceHistory = async (id, symbol) => {
  try {
    const batch = writeBatch(db);
    const symbolRef = doc(db, "symbols", id);
    const priceHistoryCollectionRef = collection(symbolRef, "priceHistory");
    const dateCollectionDoc = (
      await getDocs(
        query(priceHistoryCollectionRef, orderBy("updatedAt", "desc"), limit(1))
      )
    ).docs.at(0);

    if (!dateCollectionDoc) throw new Error("Date collection not found");
    const hourDataDoc = (
      await getDocs(
        query(
          collection(dateCollectionDoc.ref, "hours"),
          orderBy("updatedAt", "desc"),
          limit(1)
        )
      )
    ).docs.at(0);

    if (!hourDataDoc) throw new Error("Hour collection not found");
    const hourData = hourDataDoc.data()?.data;

    const pendingOrdersQuery = query(
      collection(db, "orders"),
      where("status", "==", "Pending"),
      where("symbolId", "==", id)
    );

    const pendingOrdersDocs = (await getDocs(pendingOrdersQuery)).docs;
    for (let order of pendingOrdersDocs) {
      const orderData = { id: order.id, ...order.data() };
      const { bidSpread, askSpread, bidSpreadUnit, askSpreadUnit, group } =
        symbol.settings;

      let currentPrice =
        orderData.type === "Buy"
          ? getBidValue(+symbol.price, bidSpread, bidSpreadUnit === "$")
          : getAskValue(+symbol.price, askSpread, askSpreadUnit === "$");
      currentPrice =
        group === "currencies"
          ? +parseFloat(currentPrice)?.toFixed(6)
          : +parseFloat(currentPrice)?.toFixed(2);

      let { pnl: profit, shouldClose } = calculateProfit(
        orderData,
        currentPrice,
        symbol
      );

      batch.update(order.ref, {
        currentMarketPrice: +symbol.price,
        currentPrice,
        shouldClose,
      });
    }

    hourData.at(-1).close = +symbol.price;
    batch.update(symbolRef, symbol);
    batch.update(hourDataDoc.ref, {
      data: hourData,
    });
    await batch.commit();
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

export const getColumnsById = (id, setState) => {
  const docRef = doc(collection(db, "columns"), id);
  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) setState(snapshot.data());
    },
    (error) => {
      console.error("Error fetching users:", error);
    }
  );
  return unsubscribe;
};

export const getRecentChangesById = (id, setState) => {
  const q = query(collection(db, "recentChanges"), where("userId", "==", id));
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const recentChanges = [];
      snapshot.forEach((snap) => {
        recentChanges.push({ id: snap.id, ...snap.data() });
      });
      setState(recentChanges);
    },
    (error) => {
      console.error("Error fetching recent changes:", error);
    }
  );
  return unsubscribe;
};

export const updateShowColumnsById = async (id, payload) => {
  const columnDocRef = doc(db, "columns", id);
  await setDoc(columnDocRef, payload, { merge: true });
};

export const updateUserById = async (id, payload) => {
  const userDocRef = doc(db, "users", id);
  return await updateDoc(userDocRef, payload);
};

export const getAllSymbols = (setState) => {
  // const q = query(
  //   collection(db, "symbols"),
  //   where("symbol", "in", ["BTCUSDT", "ETHUSDT", "DOGEUSDT"])
  // );
  const symbolsRef = collection(db, "symbols");

  const unsubscribe = onSnapshot(
    symbolsRef,
    // q,
    (snapshot) => {
      const realSymbols = [],
        duplicateSymbols = [];
      snapshot.forEach((doc) => {
        const symbol = { id: doc.id, ...doc.data() };
        symbol.duplicate
          ? duplicateSymbols.push(symbol)
          : realSymbols.push(symbol);
      });

      const symbolsData = realSymbols
        .map((s) => {
          return s.duplicates?.length
            ? [
                s,
                ...s.duplicates.map((d) =>
                  duplicateSymbols.find(({ id }) => id === d)
                ),
              ]
            : s;
        })
        .flat();

      setState(realSymbols);
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
      const symbolDoc = querySnapshot.docs[0];
      return { id: symbolDoc.id, ...symbolDoc.data() };
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

export const addDocument = async (collectionPath, newDoc) =>
  await addDoc(collection(db, collectionPath), newDoc);

export const deleteDocument = async (collectionPath, documentId) => {
  const documentRef = doc(db, collectionPath, documentId);
  await deleteDoc(documentRef);
  console.log(
    `Document with ID ${documentId} deleted successfully from ${collectionPath}`
  );
};

export const getBlockedIPs = async () => {
  try {
    const snapshot = await getDocs(
      query(collection(db, "blockedIps"), where("isBlocked", "==", true))
    );
    const blockedIPs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return blockedIPs;
  } catch (error) {
    console.log("Error while getting blocked ips");
  }
};
