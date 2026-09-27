import "./AuthModal.css";
import { useState, useContext } from "react";
import { MyContext } from "./MyContext.jsx";

function AuthModal({ isOpen, onClose }) {
  const { setUser } = useContext(MyContext);
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const endpoint = isSignUp
      ? "http://localhost:8080/api/auth/signup"
      : "http://localhost:8080/api/auth/signin";

    const payload = isSignUp
      ? { name, email, password }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      // Save token & user in localStorage
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authOverlay" onClick={onClose}>
      <div className="authModal" onClick={(e) => e.stopPropagation()}>
        <button className="authCloseBtn" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="authHeader">
          <h2>{isSignUp ? "Create an Account" : "Welcome Back"}</h2>
          <p>{isSignUp ? "Sign up to start chatting" : "Sign in to your Akash GPT account"}</p>
        </div>

        {error && <div className="authError">{error}</div>}

        <form className="authForm" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="inputGroup">
              <label>Name</label>
              <input
                type="text"
                required
                placeholder="Akash Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="inputGroup">
            <label>Email</label>
            <input
              type="email"
              required
              placeholder="akash@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="authSubmitBtn" disabled={loading}>
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="authFooterToggle">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <span onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
            {isSignUp ? "Sign In" : "Sign Up"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
