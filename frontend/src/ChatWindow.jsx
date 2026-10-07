import "./chatWindow.css";
import Chat from "./Chat.jsx";
import AuthModal from "./AuthModal.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState } from "react";
import { ScaleLoader } from "react-spinners";

function ChatWindow() {
    const {
        user,
        setUser,
        currThreadId,
        setPrevChats,
        setNewChat
    } = useContext(MyContext);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    const API_URL = "https://nishant-gpt.onrender.com";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsOpen(false);
    };

    const getReply = async (customPrompt) => {
        const query = (customPrompt || input).trim();

        if (!query || loading) return;

        setPrevChats((prev) => [
            ...prev,
            {
                role: "user",
                content: query
            }
        ]);

        setInput("");
        setLoading(true);
        setNewChat(false);

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${API_URL}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && {
                        Authorization: `Bearer ${token}`
                    })
                },
                body: JSON.stringify({
                    message: query,
                    threadId: currThreadId
                })
            });

            const res = await response.json();

            if (!response.ok) {
                throw new Error(
                    res.message ||
                    res.error ||
                    "Chat request failed"
                );
            }

            setPrevChats((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        res.reply ||
                        res.message ||
                        "Sorry, I couldn't generate a reply."
                }
            ]);

        } catch (err) {
            console.error("Chat Error:", err);

            setPrevChats((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content:
                        "Something went wrong. Please try again."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatWindow">

            {/* Navbar */}
            <div className="navbar">

                <div className="navTitle">
                    Nishant Gpt
                    <i className="fa-solid fa-chevron-down"></i>
                </div>

                <div className="navRight">

                    <div
                        className="userCapsule"
                        onClick={() =>
                            user
                                ? setIsOpen(!isOpen)
                                : setAuthOpen(true)
                        }
                    >

                        <div className="userIcon">
                            {user ? (
                                user.name
                                    ?.charAt(0)
                                    .toUpperCase()
                            ) : (
                                <i className="fa-solid fa-user"></i>
                            )}
                        </div>

                        <span
                            style={{
                                fontSize: "12.5px",
                                color: "#cbd5e1"
                            }}
                        >
                            {user
                                ? user.name?.split(" ")[0]
                                : "Sign In"}
                        </span>

                        <i className="fa-solid fa-chevron-down"></i>

                    </div>

                    {isOpen && user && (
                        <div className="dropDown">

                            <div className="dropDownItem">
                                <i className="fa-solid fa-gear"></i>
                                Settings
                            </div>

                            <div className="dropDownItem">
                                <i className="fa-solid fa-cloud-arrow-up"></i>
                                Upgrade plan
                            </div>

                            <div
                                className="dropDownItem"
                                onClick={handleLogout}
                            >
                                <i className="fa-solid fa-arrow-right-from-bracket"></i>
                                Log out
                            </div>

                        </div>
                    )}

                </div>

            </div>

            {/* Auth Popup Modal */}
            <AuthModal
                isOpen={authOpen}
                onClose={() => setAuthOpen(false)}
            />

            {/* Preview Box */}
            <div className="floatingPreviewCard">

                <div className="previewTop">

                    <div className="previewMiniLogo">
                        NG
                    </div>

                    <div className="previewLines">
                        <div className="lineLong"></div>
                        <div className="lineShort"></div>
                    </div>

                </div>

                <div
                    className="lineLong"
                    style={{ width: "95%" }}
                ></div>

            </div>

            {/* Chat */}
            <Chat
                onSelectPrompt={(text) => getReply(text)}
            />

            {/* Loading */}
            <ScaleLoader
                color="#60a5fa"
                loading={loading}
            />

            {/* Input */}
            <div className="chatInputWrapper">

                <div className="inputCapsule">

                    <input
                        placeholder="Ask anything"
                        value={input}
                        disabled={loading}
                        onChange={(e) =>
                            setInput(e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                getReply();
                            }
                        }}
                    />

                    <div
                        className="submitBtn"
                        onClick={() => getReply()}
                    >
                        <i className="fa-solid fa-paper-plane"></i>
                    </div>

                </div>

                <p className="infoFootnote">
                    Nishant Gpt can make mistakes. Check important
                    info. See Cookie Preferences.
                </p>

            </div>

        </div>
    );
}

export default ChatWindow;
