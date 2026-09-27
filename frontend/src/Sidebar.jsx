import "./sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
    const { allThreads, setAllThreads, currThreadId, setNewChat, setCurrThreadId, setPrevChats } = useContext(MyContext);

    const getAllThreads = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/thread");
            const res = await response.json();
            setAllThreads(res.map(thread => ({ threadId: thread.threadId, title: thread.title })));
        } catch(err) {
            console.error(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId]);

    const createNewChat = () => {
        setNewChat(true);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try {
            const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`);
            const res = await response.json();
            setPrevChats(res);
            setNewChat(false);
        } catch(err) {
            console.error(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            await fetch(`http://localhost:8080/api/thread/${threadId}`, { method: "DELETE" });
            setAllThreads(prev => prev.filter(t => t.threadId !== threadId));
            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch(err) {
            console.error(err);
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebarTop">
                <i className="fa-regular fa-pen-to-square sidebarIconExpand"></i>
                <div className="brandLogoWrapper">
                    <span className="brandLogoText">AG</span>
                    <span className="brandSub">AkashGpt</span>
                </div>
            </div>

            <button className="newChatBtn" onClick={createNewChat}>
                <i className="fa-regular fa-pen-to-square"></i>
                <span>New Chat</span>
            </button>

            <ul className="history">
                {allThreads?.map((thread, idx) => (
                    <li 
                        key={idx}
                        onClick={() => changeThread(thread.threadId)}
                        className={thread.threadId === currThreadId ? "highlighted" : ""}
                    >
                        <span>{thread.title || "Untitled Chat"}</span>
                        <i 
                            className="fa-solid fa-trash"
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteThread(thread.threadId);
                            }}
                        ></i>
                    </li>
                ))}
            </ul>

            <div className="sign">
                <p>By Akash &hearts;</p>
            </div>
        </aside>
    );
}

export default Sidebar;
