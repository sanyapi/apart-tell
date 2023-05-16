import React, { useEffect } from "react";
import "./crud.scss";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { useState } from "react";

const CRUD = () => {
  const [accommodations, setAccommodations] = useState([]);

  const getAllAccommodations = async () => {
    const accommodationsCollectionRef = collection(db, "accommodations");
    const q = query(
      accommodationsCollectionRef,
      where("progress", "==", 4),
      orderBy("editedAt", "desc"),
    );
    const accommodationsSnapshot = await getDocs(q);
    const accommodationsData = accommodationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAccommodations(accommodationsData);
  };

  useEffect(() => {
    getAllAccommodations();
  }, []);

  // when view is clicked from a specific listing/accommodation, it will show the details of the listing in the console log
  const handleViewClick = (accommodationId) => {
    const accommodation = accommodations.find(
      (item) => item.id === accommodationId
    );
    console.log("View clicked:", accommodation);
  };

  // when delete is clicked from a specific listing/accommodation, it will delete the listing (and its details) in the table and in the firebase
  const handleDeleteClick = async (accommodationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );
    if (confirmed) {
      await deleteDoc(doc(db, "accommodations", accommodationId));
      setAccommodations((prevAccommodations) =>
        prevAccommodations.filter((item) => item.id !== accommodationId)
      );
      console.log("Delete clicked:", accommodationId);
    } else {
      console.log("cancelled");
    }
  };

  const handleUpdateClick = async(accommodationId)=>{
    const currentUser=auth.currentUser;
    const accommodationRef=doc(db, "accommodations", accommodationId);
    await updateDoc(accommodationRef, {
      editedBy: currentUser.uid,
      progress:1,
    });
    console.log("update clicked: ", accommodationId);
    window.location.href="/page1";
  }

  return (
    <>
      <div className="crud-wrapper container">
        <h2 className="directory-text">My Directory</h2>
        <div className="search-add">
          <input type="text" placeholder="Search"></input>
          <button className="search-btn button">
            <a href="/">Search</a>
          </button>
          <button className="add-btn button">
            <a href="/page1"> + Add New Listing</a>
          </button>
        </div>
        <div className="crud-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {accommodations.map((accommodation) => (
                <tr key={accommodation.id}>
                  <td>{accommodation.accName}</td>
                  <td>{accommodation.accAddress}</td>
                  <td>
                    <button
                      onClick={() => handleViewClick(accommodation.id)}
                      className="view-btn"
                    >
                      <a>View</a>
                    </button>
                    <button
                      onClick={() => handleUpdateClick(accommodation.id)}
                      className="edit-btn"
                    >
                      <a>Edit</a>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(accommodation.id)}
                      className="delete-btn"
                    >
                      <a>Delete</a>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CRUD;
