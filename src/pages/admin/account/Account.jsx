import React, { useState, useEffect } from 'react';
import './account.scss';
import Header from '../../../components/admin/header/Header';
import Footer from '../../../components/admin/footer/Footer';
import PasswordVisibilityToggle from '../../../components/admin/account/PasswordVisibilityToggle';

// Firebase import section
import { auth, db } from "../../../firebase"
// Firebase SDK to update the personal info fields in the Firestore
import { doc, getDoc, updateDoc } from 'firebase/firestore';
// Firebase SDK to update to a new email
// Firebase SDK to re-authenticate user when changing password
import { updateEmail, reauthenticateWithCredential, updatePassword, EmailAuthProvider } from 'firebase/auth';

const Account = () => {

  async function updateUserInfo(uid, updates) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, updates);
  }

  async function updateUserEmail(user, newEmail) {
    await updateEmail(user, newEmail);
  }

  async function updateUserPassword(user, currentPassword, newPassword) {
    const credential = EmailAuthProvider.credential(
      user.email,
      password.currentConfirmationPassword
    );
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  }

  // User information update states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
  });

  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const uid = user.uid;
          const userRef = doc(db, 'users', uid);
          const userSnapshot = await getDoc(userRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setPersonalInfo({
              firstName: userData.firstName,
              lastName: userData.lastName,
            });
            setEmail(userData.email);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchUserData();
  }, []);


  // New password
  const [password, setPassword] = useState({
    currentConfirmationPassword: '',
    currentPassword: '',
    newPassword: '',
    newConfirmationPassword: '',
  });

  // Error states
  const [personalInfoError, setPersonalInfoError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
          firstName: personalInfo.firstName,
          lastName: personalInfo.lastName,
          // phoneNumber: personalInfo.phoneNumber,
        });
        setPersonalInfoError(null);
        alert('Personal information updated!');
      }
    } catch (err) {
      console.log(err);
      setPersonalInfoError('An error occurred while updating your personal information.');
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        const credential = EmailAuthProvider.credential(user.email, password.currentConfirmationPassword);
        await reauthenticateWithCredential(user, credential);
        await updateEmail(user, email);
  
        // Update the email in Firestore
        const uid = user.uid;
        await updateUserInfo(uid, { email });
  
        setEmailError(null);
        alert('Email address updated!');
      }
    } catch (err) {
      console.log(err);
      if (err.code === "auth/wrong-password") {
        alert("Wrong password. Please try again.");
      }
      setEmailError('An error occurred while updating your email address.');
    }
  };
  

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!passwordMatch) {
        setPasswordError('Passwords do not match');
        return;
      }
      const user = auth.currentUser;
      if (user) {
        const credential = EmailAuthProvider.credential(user.email, password.currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, password.newPassword);
        setPassword({
          currentConfirmationPassword: '',
          currentPassword: '',
          newPassword: '',
          newConfirmationPassword: '',
        });
        setPasswordError(null);
        alert('Password updated!');
      }
    } catch (err) {
        if (err.code === "auth/wrong-password") {
          alert("Wrong password. Please try again.");
        }
        console.log(err);
        setPasswordError('An error occurred while updating your password.');
    }
  };

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmationPassword, setShowConfirmationPassword] = useState(false);
  const [showNewConfirmationPassword, setShowNewConfirmationPassword] = useState(false);

  // Password visibility
  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmationPasswordVisibility = () => {
    setShowConfirmationPassword(!showConfirmationPassword);
  };

  const toggleNewConfirmationPasswordVisibility = () => {
    setShowNewConfirmationPassword(!showNewConfirmationPassword);
  };

  // Check if new passwords match
  const [passwordMatch, setPasswordMatch] = useState(false);

  const handleNewPasswordChange = (e) => {
    setPassword((prevState) => ({
      ...prevState,
      newPassword: e.target.value,
    }));

    setPasswordMatch(password.newConfirmationPassword === e.target.value);
  };

  const handleNewConfirmationPasswordChange = (e) => {
    setPassword((prevState) => ({
      ...prevState,
      newConfirmationPassword: e.target.value,
    }));

    setPasswordMatch(password.newPassword === e.target.value);
  };


  return (
    <>
      <Header />
      <div className="account-wrapper container">

        <div className="account-header">
          <h2>My Account</h2>
        </div>

        <div className="account-section">
          <form onSubmit={handlePersonalInfoSubmit} className="account-form">
            <h3>Personal Information</h3>
            <hr />

            <div className="acc-info-container">

              <div className="name-container">

                <div className="account-info">
                  <label htmlFor="fname">FIRST NAME</label>
                  <input
                    type="text"
                    id='fname'
                    required
                    value={personalInfo.firstName}
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        firstName: e.target.value
                      })
                    }
                  />
                </div>

                <div className="account-info">
                  <label htmlFor="lname">LAST NAME</label>
                  <input
                    type="text"
                    id='lname'
                    value={personalInfo.lastName}
                    required
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        lastName: e.target.value
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="account-save-btn">
              <button type="submit">Save</button>
            </div>
          </form>
          {personalInfoError && <p>{personalInfoError}</p>} {/* Display error message if an error occurred */}

          {/*--end of personal info form-- */}

          <form onSubmit={handleEmailSubmit} className="account-form">
            <h3>E-mail Address</h3>
            <hr />
            <div className="email-info-container">
              <div className="email-info">
                <label htmlFor="email">E-MAIL ADDRESS</label>
                <input
                  type="email"
                  id='email'
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="account-input-field">
                <label htmlFor="confirmationpass">CONFIRM PASSWORD</label>
                <input
                  type={showConfirmationPassword ? "text" : "password"}
                  id="confirmationpass"
                  required
                  value={password.currentConfirmationPassword}
                  onChange={(e) => setPassword({ ...password, currentConfirmationPassword: e.target.value })}
                />
                <PasswordVisibilityToggle onToggle={toggleConfirmationPasswordVisibility} />
              </div>


            </div>
            <div className="account-save-btn">
              <button type="submit">Save</button>
            </div>
          </form>

          {emailError && <p>{emailError}</p>} {/* Display error message if an error occurred */}

          <form onSubmit={handlePasswordSubmit} className="account-form">
            <h3>Password</h3>
            <hr />
            <div className="password-info-container">
              <div className="account-input-field">
                <label htmlFor="currpass">CURRENT PASSWORD</label>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  id="currpass"
                  required
                  value={password.currentPassword}
                  onChange={(e) =>
                    setPassword({
                      ...password,
                      currentPassword: e.target.value,
                    })
                  }
                />
                <PasswordVisibilityToggle onToggle={toggleCurrentPasswordVisibility} />
              </div>

              <div className="account-input-field">
                <label htmlFor="newpass">NEW PASSWORD</label>
                <input
                  type={showNewPassword ? "text" : "password"}
                  id="newpass"
                  required
                  value={password.newPassword}
                  onChange={handleNewPasswordChange}
                />
                <PasswordVisibilityToggle onToggle={toggleNewPasswordVisibility} />
              </div>

              <div className="account-input-field">
                <label htmlFor="confirmnewpass">CONFIRM NEW PASSWORD</label>
                <input
                  type={showNewConfirmationPassword ? "text" : "password"}
                  id="confirmnewpass"
                  value={password.newConfirmationPassword}
                  onChange={handleNewConfirmationPasswordChange}
                  required
                />
                <PasswordVisibilityToggle onToggle={toggleNewConfirmationPasswordVisibility} />
                <div className='password-matching'>
                  {password.newConfirmationPassword && !passwordMatch && (
                    <p>Passwords do not match</p>
                  )}
                </div>
              </div>

            </div>

            <div className="account-save-btn">
              <button type="submit">Save</button>
            </div>
          </form>
          {passwordError && <p>{passwordError}</p>} {/* Display error message if an error occurred */}

        </div>
      </div>

      <Footer />

    </>
  )
}

export default Account;