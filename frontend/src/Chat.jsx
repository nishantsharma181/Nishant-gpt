import "./chat.css";
import React, { useContext, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat({ onSelectPrompt }) {
    const { newChat, prevChats } = useContext(MyContext);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [prevChats]);

    return (
        <div className="chatContainer">
            {newChat || prevChats.length === 0 ? (
                <div className="welcomeScreen">
                    <h1 className="welcomeTitle">Start a New Chat!</h1>
                    
                    <div className="cardsRow">
                        <div 
                            className="suggestCard" 
                            onClick={() => onSelectPrompt("Drafting ideas for my next project")}
                        >
                            <div className="cardHeader">
                                <span>Drafting ideas</span>
                                <i className="fa-regular fa-lightbulb"></i>
                            </div>
                            <div className="skeletonLines">
                                <div className="skLine full"></div>
                                <div className="skLine half"></div>
                            </div>
                        </div>

                        <div 
                            className="suggestCard activeCard"
                            onClick={() => onSelectPrompt("Brainstorming features for an AI app")}
                        >
                            <div className="cardHeader">
                                <span>Brainstorming features</span>
                                <i className="fa-solid fa-gear"></i>
                            </div>
                            <div className="skeletonLines">
                                <div className="skLine full"></div>
                                <div className="skLine half"></div>
                            </div>
                        </div>

                        <div 
                            className="suggestCard"
                            onClick={() => onSelectPrompt("Analyzing data trends in 2026")}
                        >
                            <div className="cardHeader">
                                <span>Analyzing data</span>
                                <i className="fa-solid fa-chart-simple"></i>
                            </div>
                            <div className="skeletonLines">
                                <div className="skLine full"></div>
                                <div className="skLine half"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="chats">
                    {prevChats?.map((chat, idx) => (
                        <div key={idx} className={chat.role === "user" ? "userDiv" : "gptDiv"}>
                            {chat.role === "user" ? (
                                <p className="userMessage">{chat.content}</p>
                            ) : (
                                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                                    {chat.content}
                                </ReactMarkdown>
                            )}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            )}
        </div>
    );
}

export default Chat;
