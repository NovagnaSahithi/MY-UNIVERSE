import { useEffect, useState } from "react";
import "./App.css";
import Journal from "./Journal";

function App() {
  const [page, setPage] = useState("loading");

  // Registration
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Verification
  const [verificationCode, setVerificationCode] = useState("");

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // General
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // CHECK EXISTING SESSION
  // =========================

  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("universeToken");

      if (!token) {
        setPage("landing");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/me",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setUsername(data.username);
          setEmail(data.email);
          setPage("universe");
        } else {
          localStorage.removeItem("universeToken");
          setPage("landing");
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setPage("landing");
      }
    };

    checkSession();
  }, []);

  const goToPage = (nextPage) => {
    setPage(nextPage);
    setMessage("");
  };

  const isGmail = (value) => {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(value);
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password) {
      setMessage("Please fill in everything ✨");
      return;
    }

    if (!isGmail(email)) {
      setMessage("Please use a valid Gmail address ✉️");
      return;
    }

    if (password.length < 8) {
      setMessage("Your password should be at least 8 characters.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPage("verify");
        setMessage("");
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to your universe 🌌");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VERIFY EMAIL
  // =========================

  const handleVerify = async (e) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      setMessage("Please enter the 6-digit code ✦");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            code: verificationCode,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const loginResponse = await fetch(
          "http://localhost:5000/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email.toLowerCase().trim(),
              password,
            }),
          }
        );

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
          localStorage.setItem(
            "universeToken",
            loginData.token
          );

          setUsername(loginData.username);
          setEmail(loginData.email);
          setPage("universe");
          setMessage("");
        } else {
          setMessage(
            loginData.message ||
              "Verification succeeded, but login failed."
          );
        }
      } else {
        setMessage(data.message || "Verification failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to your universe 🌌");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      setMessage("Please enter your Gmail and password.");
      return;
    }

    if (!isGmail(loginEmail)) {
      setMessage("Please use a valid Gmail address ✉️");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginEmail.toLowerCase().trim(),
            password: loginPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem(
          "universeToken",
          data.token
        );

        setUsername(data.username);
        setEmail(data.email);
        setMessage("");
        setPage("universe");
      } else {
        setMessage(data.message || "Login failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to your universe 🌌");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("universeToken");

    setUsername("");
    setEmail("");
    setLoginEmail("");
    setLoginPassword("");
    setPassword("");

    setPage("landing");
    setMessage("");
  };

  // =========================
  // LOADING SCREEN
  // =========================

  if (page === "loading") {
    return (
      <div className="app">
        <div className="stars"></div>

        <div className="landing-page">
          <div className="landing-content">
            <div className="tiny-star">✦</div>

            <p className="landing-label">
              FINDING YOUR
            </p>

            <h1>
              Little
              <span>Universe</span>
            </h1>

            <p className="landing-subtitle">
              Looking for your little corner of the cosmos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // LANDING PAGE
  // =========================

  if (page === "landing") {
    return (
      <div className="app">
        <div className="stars"></div>

        <div className="landing-page">
          <div className="landing-content">
            <div className="tiny-star">✦</div>

            <p className="landing-label">
              WELCOME TO YOUR
            </p>

            <h1>
              Little
              <span>Universe</span>
            </h1>

            <p className="landing-subtitle">
              A little place for everything that makes
              <br />
              your universe yours.
            </p>

            <div className="landing-buttons">
              <button
                className="primary-button"
                onClick={() => goToPage("register")}
              >
                Create Your Universe
                <span>✦</span>
              </button>

              <button
                className="secondary-button"
                onClick={() => goToPage("login")}
              >
                Enter Your Universe
              </button>
            </div>

            <p className="landing-footer">
              your little corner of the cosmos ♡
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // REGISTER
  // =========================

  if (page === "register") {
    return (
      <div className="app">
        <div className="stars"></div>

        <div className="auth-page">
          <button
            className="back-button"
            onClick={() => goToPage("landing")}
          >
            ← Back
          </button>

          <div className="auth-card">
            <div className="auth-icon">✦</div>

            <p className="auth-label">
              WELCOME TO YOUR
            </p>

            <h1>
              Create Your
              <span>Universe</span>
            </h1>

            <p className="auth-intro">
              Every universe starts with a little something.
            </p>

            <form
              className="auth-form"
              onSubmit={handleRegister}
            >
              <div className="form-group">
                <label>What should we call you?</label>

                <input
                  type="text"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Your Gmail</label>

                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Create a password</label>

                <input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />
              </div>

              <button
                type="submit"
                className="main-button"
                disabled={loading}
              >
                {loading
                  ? "Creating..."
                  : "Begin Your Universe ✦"}
              </button>
            </form>

            {message && (
              <p className="message">{message}</p>
            )}

            <div className="auth-switch">
              Already have a universe?

              <button
                onClick={() => goToPage("login")}
              >
                Enter it →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // VERIFY
  // =========================

  if (page === "verify") {
    return (
      <div className="app">
        <div className="stars"></div>

        <div className="auth-page">
          <button
            className="back-button"
            onClick={() => goToPage("register")}
          >
            ← Back
          </button>

          <div className="auth-card verification-card">
            <div className="mail-icon">✉</div>

            <p className="auth-label">
              ONE LITTLE STEP
            </p>

            <h1>
              Verify Your
              <span>Universe</span>
            </h1>

            <p className="auth-intro">
              We sent a 6-digit verification code to
              <strong>{email}</strong>
            </p>

            <form
              className="auth-form"
              onSubmit={handleVerify}
            >
              <div className="form-group">
                <label>Verification code</label>

                <input
                  className="code-input"
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                />
              </div>

              <button
                type="submit"
                className="main-button"
                disabled={loading}
              >
                {loading
                  ? "Verifying..."
                  : "Verify ✦"}
              </button>
            </form>

            {message && (
              <p className="message">{message}</p>
            )}

            <p className="verification-note">
              Check your inbox and spam folder if you
              don't see it.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // LOGIN
  // =========================

  if (page === "login") {
    return (
      <div className="app">
        <div className="stars"></div>

        <div className="auth-page">
          <button
            className="back-button"
            onClick={() => goToPage("landing")}
          >
            ← Back
          </button>

          <div className="auth-card">
            <div className="auth-icon">☾</div>

            <p className="auth-label">
              WELCOME BACK
            </p>

            <h1>
              Enter Your
              <span>Universe</span>
            </h1>

            <p className="auth-intro">
              Your little universe has been waiting
              for you.
            </p>

            <form
              className="auth-form"
              onSubmit={handleLogin}
            >
              <div className="form-group">
                <label>Your Gmail</label>

                <input
                  type="email"
                  placeholder="yourname@gmail.com"
                  value={loginEmail}
                  onChange={(e) =>
                    setLoginEmail(e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label>Your password</label>

                <input
                  type="password"
                  placeholder="Your password"
                  value={loginPassword}
                  onChange={(e) =>
                    setLoginPassword(e.target.value)
                  }
                />
              </div>

              <button
                type="submit"
                className="main-button"
                disabled={loading}
              >
                {loading
                  ? "Entering..."
                  : "Enter Your Universe ✦"}
              </button>
            </form>

            {message && (
              <p className="message">{message}</p>
            )}

            <div className="auth-switch">
              Don't have a universe yet?

              <button
                onClick={() => goToPage("register")}
              >
                Create one →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // JOURNAL
  // =========================

  if (page === "journal") {
    return (
      <div className="app universe-app">
        <div className="stars"></div>

        <header className="universe-header">
          <div className="logo">
            Little <span>Universe</span>
          </div>

          <button
            className="logout-button"
            onClick={() => goToPage("universe")}
          >
            ← Back to Universe
          </button>
        </header>

        <Journal />
      </div>
    );
  }

  // =========================
  // UNIVERSE HOME
  // =========================

  if (page === "universe") {
    return (
      <div className="app universe-app">
        <div className="stars"></div>

        <header className="universe-header">
          <div className="logo">
            Little <span>Universe</span>
          </div>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Leave Universe
          </button>
        </header>

        <main className="universe-home">
          <div className="welcome-section">
            <p className="welcome-label">
              YOUR UNIVERSE ✦
            </p>

            <h1>
              Welcome home,
              <span>{username}</span>
            </h1>

            <p>
              This is your little corner of the cosmos.
              <br />
              Everything here belongs to you.
            </p>
          </div>

          <div className="universe-grid">

            <button className="universe-card memories-card">
              <span className="card-symbol">♡</span>

              <strong>Memories</strong>

              <small>
                The moments worth keeping.
              </small>
            </button>

            <button
              className="universe-card journal-card"
              onClick={() => goToPage("journal")}
            >
              <span className="card-symbol">✎</span>

              <strong>Journal</strong>

              <small>
                Your thoughts, your words.
              </small>
            </button>

            <button className="universe-card moments-card">
              <span className="card-symbol">✦</span>

              <strong>Moments</strong>

              <small>
                The little things that matter.
              </small>
            </button>

            <button className="universe-card photos-card">
              <span className="card-symbol">◌</span>

              <strong>Photos</strong>

              <small>
                Your universe in pictures.
              </small>
            </button>

          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default App;