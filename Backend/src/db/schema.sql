-- @block Table to store user accounts
CREATE TABLE Users (

    username VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verificationToken VARCHAR(50),
    CHECK (email LIKE '%@mail.aub.edu')

);

-- @block Table to store club accounts
CREATE TABLE Clubs (

    crn INT PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE DEFAULT NULL

);


-- @block Table to store club accesses by users
CREATE TABLE Club_Accesses (

    crn INT PRIMARY KEY,
    username VARCHAR(50) NOT NULL

);


-- @block Table to store the temporary verification tickets
CREATE TABLE VerificationTokens (

    token VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)

);


-- @block Table to store posts of users and clubs
CREATE TABLE Posts (

    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL, -- Always track the user who posts
    clubCRN INT DEFAULT NULL, -- Only if the post was posted by a club account
    title VARCHAR(255) NOT NULL,
    details TEXT CHECK (CHAR_LENGTH(details) <= 2200),
    imageURL VARCHAR(2048),
    type ENUM('announcement', 'event') NOT NULL,
    capacity INT UNSIGNED DEFAULT NULL, -- Only used if type = 'event'
    event_date DATETIME DEFAULT NULL,   -- Only used if type = 'event'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT NULL,
    INDEX idx_title (title), -- Useful to select posts by title
    INDEX idx_username (username) -- Useful to select posts by username

);




-- @block Create the functions:


CREATE FUNCTION CheckUserExists(username_input VARCHAR(50))
RETURNS INT DETERMINISTIC
BEGIN
    DECLARE user_exists INT;

    SELECT EXISTS(SELECT 1 FROM Users WHERE username = username_input LIMIT 1) INTO user_exists; -- We used SELECT 1 so that we don't have to return the actual column values, we just return 1 for every row that was selected.
    -- then we do LIMIT 1 so that it stops when it finds 1 row. There can be no more than 1 row with the same username.

    RETURN user_exists;
END;

-- @block


CREATE PROCEDURE GetUser(username_input VARCHAR(50))
BEGIN

    SELECT * FROM Users WHERE username = username_input;

END;



-- @block

CREATE PROCEDURE GetClub(crn_input INT)
BEGIN

    SELECT * FROM Clubs WHERE crn = crn_input;

END;

-- @block

CREATE FUNCTION CheckClubExists(crn_input INT)
RETURNS INT DETERMINISTIC
BEGIN
    DECLARE club_exists INT;

    SELECT EXISTS(SELECT 1 FROM Clubs WHERE crn = crn_input LIMIT 1) INTO club_exists;

    RETURN club_exists;

END;


CREATE FUNCTION CheckUserPassHash (username_input VARCHAR(50), password_hash_input VARCHAR(255))
RETURNS INT DETERMINISTIC
BEGIN
    DECLARE user_pass_hash VARCHAR(255);

    SELECT password_hash FROM Users WHERE username = username_input INTO user_pass_hash;

    RETURN IF(user_pass_hash = password_hash_input, 1, 0);

END;


CREATE FUNCTION CheckClubPassHash (crn_input INT, password_hash_input VARCHAR(255))
RETURNS INT DETERMINISTIC
BEGIN
    DECLARE user_pass_hash VARCHAR(255);

    SELECT password_hash FROM Clubs WHERE crn = crn_input INTO user_pass_hash;

    RETURN IF(user_pass_hash = password_hash_input, 1, 0);

END;


CREATE FUNCTION CheckTokenExists (token_input VARCHAR(50))
RETURNS INT DETERMINISTIC
BEGIN
    DECLARE token_exists INT;

    SELECT EXISTS(SELECT 1 FROM VerificationTokens WHERE token = token_input) INTO token_exists;

    RETURN token_exists;
END;


-- @block

CREATE PROCEDURE GetUserFromVerifToken (token_input VARCHAR(50))
BEGIN
    SELECT username FROM VerificationTokens WHERE token = token_input LIMIT 1;
END;

-- @block

-- This function automatically (1) sets the user's verified to true, (2) removes the verification token from the VerificationTokens table
CREATE PROCEDURE VerifyUser (username_input VARCHAR(50))
BEGIN  
    UPDATE Users SET verified = true WHERE username = username_input;
    DELETE FROM VerificationTokens WHERE username = username_input;
END;


CREATE PROCEDURE InsertNewUser (username_input VARCHAR(50), email_input VARCHAR(255), password_hash_input VARCHAR(255), verificationToken_input VARCHAR(50))
BEGIN
    INSERT INTO Users (username, email, password_hash, verificationToken)
    VALUES (username_input, email_input, password_hash_input, verificationToken_input);
END;


CREATE PROCEDURE InsertVerifToken (token_input VARCHAR(50), username_input VARCHAR(50))
BEGIN
    INSERT INTO VerificationTokens (token, username)
    VALUES (token_input, username_input);
END;