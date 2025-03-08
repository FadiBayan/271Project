import React, { useState, useEffect } from "react";
import ClubProfile from "./ClubProfile";  
import ClubDescription from "./ClubDescription";  
import Announcements from "./Announcement";  
import EventList from "./EventList";  
import EventSetup from "./EventSetup";  
import "../../static/Cabinet_Page/CabinetPage.css";  // ✅ Ensure styles apply

const CabinetPage = () => {
  const [events, setEvents] = useState([]);
  const [clubDescription, setClubDescription] = useState("Welcome to our club! This is the default description.");

  // ✅ Disable ALL global styles when entering Cabinet Page
  useEffect(() => {
    const globalStylesheets = document.querySelectorAll("link[href*='styles.css']");
    globalStylesheets.forEach((link) => (link.disabled = true));

    return () => {
      // ✅ Re-enable global styles when leaving
      globalStylesheets.forEach((link) => (link.disabled = false));
    };
  }, []);

  // ✅ Function to update club description
  const updateDescription = (newDesc) => {
    setClubDescription(newDesc);
  };

  // ✅ Function to add an event
  const addEvent = (newEvent) => {
    setEvents([...events, newEvent]); // Append new event to the array
  };

  // ✅ Function to delete an event
  const deleteEvent = (index) => {
    setEvents(events.filter((_, i) => i !== index)); // Remove the event at the given index
  };

  return (
    <div className="cabinet-page">
      <h1 className="cabinet-title">Club Management Dashboard</h1>
      
      {/* Club Profile Section */}
      <section className="cabinet-section">
        <ClubProfile />
      </section>

      {/* Club Description Section */}
      <section className="cabinet-section">
        <ClubDescription description={clubDescription} updateDescription={updateDescription} />
      </section>

      {/* Announcements Section */}
      <section className="cabinet-section">
        <Announcements />
      </section>

      {/* ✅ Pass addEvent function to EventSetup */}
      <section className="cabinet-section">
        <EventSetup addEvent={addEvent} />
      </section>

      {/* ✅ Pass events & deleteEvent function to EventList */}
      <section className="cabinet-section">
        <EventList events={events} deleteEvent={deleteEvent} />
      </section>
    </div>
  );
};

export default CabinetPage;
