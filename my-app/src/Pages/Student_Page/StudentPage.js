import React, { useState, useEffect } from "react";
import { FaHome, FaCompass, FaUser, FaSignOutAlt } from "react-icons/fa";
import "../../static/Student_Page/StudentPage.css";  // ✅ Ensure styles apply

const StudentPage = () => {
    const [activeTab, setActiveTab] = useState("foryou");
    const [registeredEvents, setRegisteredEvents] = useState(() => {
        const savedEvents = localStorage.getItem("registeredEvents");
        return savedEvents ? JSON.parse(savedEvents) : [];
    });
    const [showModal, setShowModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [username, setUsername] = useState(
        JSON.parse(localStorage.getItem("userProfile"))?.username || ""
    );
    const [bio, setBio] = useState(
        JSON.parse(localStorage.getItem("userProfile"))?.bio || ""
    );
    const [profileImage, setProfileImage] = useState(
        JSON.parse(localStorage.getItem("userProfile"))?.profileImage || null
    );
    const [profileSaved, setProfileSaved] = useState(false);

    const events = [
        { id: 1, club: "Club A", clubImage: "https://via.placeholder.com/50", from: "City A", to: "City B", time: "30min" },
        { id: 2, club: "Club B", clubImage: "https://via.placeholder.com/50", from: "Town C", to: "Town D", time: "20min" },
        { id: 3, club: "Club C", clubImage: "https://via.placeholder.com/50", from: "Village E", to: "Village F", time: "40min" },
        { id: 4, club: "Club D", clubImage: "https://via.placeholder.com/50", from: "City G", to: "City H", time: "50min" }
    ];

    useEffect(() => {
        localStorage.setItem("registeredEvents", JSON.stringify(registeredEvents));
    }, [registeredEvents]);

    const handleRegisterClick = (event) => {
        if (!registeredEvents.some((regEvent) => regEvent.id === event.id)) {
            setSelectedEvent(event);
            setShowModal(true);
        }
    };

    const confirmRegister = () => {
        if (selectedEvent) {
            setRegisteredEvents((prevEvents) => {
                const updatedEvents = [...prevEvents, selectedEvent];
                localStorage.setItem("registeredEvents", JSON.stringify(updatedEvents));
                return updatedEvents;
            });
            setShowModal(false);
        }
    };

    const confirmLogout = () => {
        setUsername("");
        setBio("");
        setProfileImage(null);
        setRegisteredEvents([]);
        localStorage.removeItem("registeredEvents");
        localStorage.removeItem("userProfile");
        setActiveTab("foryou");
        setShowLogoutModal(false);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setProfileImage(imageUrl);
        }
    };

    const handleSaveProfile = () => {
        if (username || bio || profileImage) {
            const profileData = { username, bio, profileImage };
            localStorage.setItem("userProfile", JSON.stringify(profileData));
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2000);
        }
    };

    return (
        <div className="student-container">
            {/* Sidebar */}
            <div className="sidebar">
                <button className={activeTab === "home" ? "active" : ""} onClick={() => setActiveTab("home")}>
                    <FaHome size={24} />
                </button>
                <button className={activeTab === "foryou" ? "active" : ""} onClick={() => setActiveTab("foryou")}>
                    <FaCompass size={24} />
                </button>
                <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
                    <FaUser size={24} />
                </button>
                <button onClick={() => setShowLogoutModal(true)} className="logout-button">
                    <FaSignOutAlt size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="content">
                {activeTab === "home" && (
                    <div>
                        <h2>📋 Registered Events</h2>
                        {registeredEvents.length === 0 ? (
                            <p>No events registered yet.</p>
                        ) : (
                            <div className="event-grid">
                                {registeredEvents.map((event) => (
                                    <div key={event.id} className="event-card">
                                        <div className="club-header">
                                            <img src={event.clubImage} alt={event.club} className="club-image" />
                                            <h3 className="club-name">{event.club}</h3>
                                        </div>
                                        <div className="event-info">
                                            <p><strong>From:</strong> {event.from}</p>
                                            <p><strong>To:</strong> {event.to}</p>
                                            <p><strong>Time:</strong> {event.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "foryou" && (
                    <div className="event-grid">
                        {events.map((event) => (
                            <div key={event.id} className="event-card">
                                <div className="club-header">
                                    <img src={event.clubImage} alt={event.club} className="club-image" />
                                    <h3 className="club-name">{event.club}</h3>
                                </div>
                                <div className="event-info">
                                    <p><strong>From:</strong> {event.from}</p>
                                    <p><strong>To:</strong> {event.to}</p>
                                    <p><strong>Time:</strong> {event.time}</p>
                                </div>
                                <button className="register-button" onClick={() => handleRegisterClick(event)}>
                                    Register
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === "profile" && (
                    <div className="profile-form">
                        <h2>👤 Set Up Your Profile</h2>
                        <label htmlFor="file-upload" className="upload-photo">
                            {profileImage ? <img src={profileImage} alt="Profile" className="profile-pic" /> : "+ Upload Photo"}
                        </label>
                        <input type="file" id="file-upload" onChange={handleImageUpload} style={{ display: "none" }} />
                        <input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <textarea placeholder="Write a short bio..." value={bio} onChange={(e) => setBio(e.target.value)} />
                        <button className="save-profile-button" onClick={handleSaveProfile}>Save Profile</button>
                        {profileSaved && <p className="success-message">✅ Profile Saved!</p>}
                    </div>
                )}
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Are you sure you want to register?</h3>
                        <button className="confirm-button" onClick={confirmRegister}>Yes</button>
                        <button className="cancel-button" onClick={() => setShowModal(false)}>No</button>
                    </div>
                </div>
            )}

            {showLogoutModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Are you sure you want to log out?</h3>
                        <button className="confirm-button" onClick={confirmLogout}>Yes</button>
                        <button className="cancel-button" onClick={() => setShowLogoutModal(false)}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentPage;
